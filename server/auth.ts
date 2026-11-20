import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type { AdminUserSession } from '../src/shared/types.ts';
import { generateEphemeralSecret } from './security.ts';

const COOKIE_NAME = 'hisandhers_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const EPHEMERAL_DEV_SECRET = generateEphemeralSecret();

export function isProductionDeployment(): boolean {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
}

function getSecret(): string | null {
  const configured = (process.env.ADMIN_SECRET || process.env.GLOW_ADMIN_SECRET || '').trim();
  if (configured.length >= 16) return configured;
  if (isProductionDeployment()) return null;
  return EPHEMERAL_DEV_SECRET;
}

export function isAdminAuthConfigured(): boolean {
  const secret = getSecret();
  const password = (process.env.ADMIN_PASSWORD || process.env.GLOW_ADMIN_PASSWORD || '').trim();
  if (isProductionDeployment()) {
    return Boolean(secret && password.length >= 10);
  }
  return Boolean(secret && password.length >= 6);
}

export function getAdminCredentials(): {
  email: string;
  password: string;
  name: string;
  role: 'admin';
} | null {
  const password = (process.env.ADMIN_PASSWORD || process.env.GLOW_ADMIN_PASSWORD || '').trim();
  if (!password) return null;

  return {
    email: (process.env.ADMIN_EMAIL || process.env.GLOW_ADMIN_EMAIL || 'admin@hisandhers.org')
      .trim()
      .toLowerCase(),
    password,
    name: 'His & Hers Circle of Hope Stewardship Admin',
    role: 'admin',
  };
}

export function verifyCredentials(email: string, password: string): AdminUserSession | null {
  const configured = getAdminCredentials();
  if (!configured || !getSecret()) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const expectedEmailHash = crypto.createHash('sha256').update(configured.email).digest();
  const providedEmailHash = crypto.createHash('sha256').update(normalizedEmail).digest();

  const expectedPassHash = crypto.createHash('sha256').update(configured.password).digest();
  const providedPassHash = crypto.createHash('sha256').update(password).digest();

  const emailOk = crypto.timingSafeEqual(expectedEmailHash, providedEmailHash);
  const passOk = crypto.timingSafeEqual(expectedPassHash, providedPassHash);
  if (!emailOk || !passOk) return null;

  return {
    email: configured.email,
    name: configured.name,
    role: configured.role,
  };
}

export function signSessionToken(user: AdminUserSession): string {
  const secret = getSecret();
  if (!secret) {
    throw new Error('ADMIN_SECRET is not configured.');
  }
  const payload = {
    jti: crypto.randomBytes(16).toString('hex'),
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): AdminUserSession | null {
  const secret = getSecret();
  if (!secret || !token || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  if (!encoded || !sig) return null;

  const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      email: string;
      name: string;
      role: 'admin' | 'editor';
      exp: number;
    };
    if (!decoded.exp || decoded.exp < Date.now()) return null;
    return { email: decoded.email, name: decoded.name, role: decoded.role };
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  const result: Record<string, string> = {};
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    try {
      const val = decodeURIComponent(part.slice(idx + 1).trim());
      result[key] = val;
    } catch {
      // Ignore malformed percent-encoding
    }
  }
  return result;
}

export function getSessionFromRequest(req: Request): AdminUserSession | null {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifySessionToken(token);
}

export function setSessionCookie(req: Request, res: Response, user: AdminUserSession): void {
  const token = signSessionToken(user);
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https' || isProductionDeployment();
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isSecure,
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
}

export function clearSessionCookie(req: Request, res: Response): void {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https' || isProductionDeployment();
  res.clearCookie(COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: isSecure,
  });
}

export interface AuthenticatedRequest extends Request {
  adminUser?: AdminUserSession;
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = getSessionFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required to access this administrative resource.' });
    return;
  }
  req.adminUser = user;
  next();
}
