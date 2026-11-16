import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type { AdminUserSession } from '../src/shared/types.ts';

const COOKIE_NAME = 'hisandhers_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getSecret(): string {
  return (
    process.env.ADMIN_SECRET ||
    process.env.GLOW_ADMIN_SECRET ||
    'his-and-hers-dev-session-secret-key'
  );
}

export function getAdminCredentials(): { email: string; password: string; name: string; role: 'admin' } {
  return {
    email: (process.env.ADMIN_EMAIL || process.env.GLOW_ADMIN_EMAIL || 'admin@hisandhers.org')
      .trim()
      .toLowerCase(),
    password: process.env.ADMIN_PASSWORD || process.env.GLOW_ADMIN_PASSWORD || 'HisAndHersAdmin!2026',
    name: 'HIS AND HERS Stewardship Admin',
    role: 'admin',
  };
}

export function verifyCredentials(email: string, password: string): AdminUserSession | null {
  const configured = getAdminCredentials();
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== configured.email) return null;

  const expectedHash = crypto.createHash('sha256').update(configured.password).digest();
  const providedHash = crypto.createHash('sha256').update(password).digest();
  if (!crypto.timingSafeEqual(expectedHash, providedHash)) return null;

  return {
    email: configured.email,
    name: configured.name,
    role: configured.role,
  };
}

export function signSessionToken(user: AdminUserSession): string {
  const payload = {
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token: string): AdminUserSession | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');
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
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    result[key] = val;
  }
  return result;
}

export function getSessionFromRequest(req: Request): AdminUserSession | null {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifySessionToken(token);
}

export function setSessionCookie(res: Response, user: AdminUserSession): void {
  const token = signSessionToken(user);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/' });
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
