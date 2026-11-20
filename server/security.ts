import crypto from 'node:crypto';

const SCANNER_BLOCK_PATTERNS: RegExp[] = [
  /\/\.env/i,
  /\/\.git/i,
  /\/\.aws/i,
  /\/\.ssh/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/wp-content/i,
  /\/xmlrpc\.php/i,
  /\/phpmyadmin/i,
  /\/cgi-bin/i,
  /\/actuator/i,
  /\/etc\/passwd/i,
  /\/firebase-applet-config\.json$/i,
  /\.\.[/\\]/,
  /%2e%2e/i,
  /\0|%00/,
];

const THREAT_STRING_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: 'script-tag-xss', regex: /<\s*script\b[^>]*>/i },
  { label: 'javascript-uri', regex: /\bjavascript\s*:/i },
  { label: 'vbscript-uri', regex: /\bvbscript\s*:/i },
  { label: 'inline-event-handler', regex: /\bon(?:error|load|click|mouseover|focus|submit)\s*=/i },
  { label: 'svg-onload-xss', regex: /<\s*svg\b[^>]*\bon\w+\s*=/i },
  { label: 'iframe-injection', regex: /<\s*iframe\b/i },
  { label: 'php-tag-injection', regex: /<\?(?:php|=)/i },
  { label: 'sql-union-probe', regex: /\bunion\s+(?:all\s+)?select\b/i },
  { label: 'sql-sleep-probe', regex: /\b(?:waitfor\s+delay|pg_sleep|benchmark)\s*\(/i },
  { label: 'shell-subcommand', regex: /\$\(\s*(?:rm|curl|wget|bash|sh|nc|python)\b/i },
];

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function isBlockedScannerPath(rawPath: string): boolean {
  if (!rawPath || typeof rawPath !== 'string') return false;
  const decoded = (() => {
    try {
      return decodeURIComponent(rawPath);
    } catch {
      return rawPath;
    }
  })();
  return SCANNER_BLOCK_PATTERNS.some((rx) => rx.test(rawPath) || rx.test(decoded));
}

export function inspectPayloadForThreats(
  value: unknown,
  options?: { maxDepth?: number; skipImageBase64?: boolean }
): { safe: boolean; reason?: string } {
  const maxDepth = options?.maxDepth ?? 8;
  const skipImageBase64 = options?.skipImageBase64 ?? true;

  function walk(node: unknown, depth: number, keyName?: string): { safe: boolean; reason?: string } {
    if (depth > maxDepth) {
      return { safe: false, reason: 'excessive-nesting-depth' };
    }

    if (typeof node === 'string') {
      // Base64 image data URLs are verified separately by binary magic-byte inspection
      if (
        skipImageBase64 &&
        (keyName === 'dataUrl' || keyName === 'imageDataUrl') &&
        /^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/i.test(node)
      ) {
        return { safe: true };
      }

      for (const rule of THREAT_STRING_PATTERNS) {
        if (rule.regex.test(node)) {
          return { safe: false, reason: rule.label };
        }
      }
      return { safe: true };
    }

    if (Array.isArray(node)) {
      if (node.length > 250) {
        return { safe: false, reason: 'excessive-array-length' };
      }
      for (const item of node) {
        const res = walk(item, depth + 1);
        if (!res.safe) return res;
      }
      return { safe: true };
    }

    if (node && typeof node === 'object') {
      const entries = Object.entries(node as Record<string, unknown>);
      if (entries.length > 120) {
        return { safe: false, reason: 'excessive-key-count' };
      }
      for (const [k, v] of entries) {
        if (FORBIDDEN_KEYS.has(k)) {
          return { safe: false, reason: `forbidden-key:${k}` };
        }
        const res = walk(v, depth + 1, k);
        if (!res.safe) return res;
      }
    }

    return { safe: true };
  }

  return walk(value, 0);
}

export function verifyImageMagicBytes(
  buffer: Buffer,
  declaredExt: 'png' | 'jpg' | 'jpeg' | 'webp'
): boolean {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return false;

  if (declaredExt === 'png') {
    const pngSig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return pngSig.every((byte, idx) => buffer[idx] === byte);
  }

  if (declaredExt === 'jpg' || declaredExt === 'jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (declaredExt === 'webp') {
    const riff = buffer.subarray(0, 4).toString('ascii');
    const webp = buffer.subarray(8, 12).toString('ascii');
    return riff === 'RIFF' && webp === 'WEBP';
  }

  return false;
}

export function containsEmbeddedScriptSignature(buffer: Buffer): boolean {
  if (!Buffer.isBuffer(buffer)) return true;
  // Scan ASCII/UTF-8 representation for polyglot HTML/PHP script smuggling inside image chunks
  const sample = buffer.toString('latin1').toLowerCase();
  return (
    sample.includes('<script') ||
    sample.includes('<?php') ||
    sample.includes('<svg') ||
    sample.includes('javascript:')
  );
}

export function isAllowedMutationOrigin(
  originHeader: string | undefined,
  hostHeader: string | undefined,
  configuredAppUrl?: string
): boolean {
  // Server-to-server / curl / same-origin non-CORS requests without Origin are allowed unless browser sends foreign Origin
  if (!originHeader) return true;

  let originHost = '';
  try {
    originHost = new URL(originHeader).host.toLowerCase();
  } catch {
    return false;
  }

  const allowedHosts = new Set<string>();
  if (hostHeader) {
    allowedHosts.add(hostHeader.toLowerCase());
  }
  if (configuredAppUrl) {
    try {
      allowedHosts.add(new URL(configuredAppUrl).host.toLowerCase());
    } catch {
      // Ignore malformed env APP_URL
    }
  }
  if (process.env.VERCEL_URL) {
    allowedHosts.add(process.env.VERCEL_URL.toLowerCase());
  }

  if (allowedHosts.has(originHost)) return true;

  // Permit local dev hosts only when explicitly running on localhost/127.0.0.1
  if (
    hostHeader &&
    (hostHeader.startsWith('localhost:') || hostHeader.startsWith('127.0.0.1:')) &&
    (originHost.startsWith('localhost:') || originHost.startsWith('127.0.0.1:'))
  ) {
    return true;
  }

  return false;
}

const MAX_BUCKETS = 10_000;

export class BoundedRateLimiter {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  check(key: string, maxRequests: number, windowMs: number, now = Date.now()): boolean {
    if (this.buckets.size >= MAX_BUCKETS) {
      for (const [k, v] of this.buckets) {
        if (v.resetAt < now) this.buckets.delete(k);
      }
      if (this.buckets.size >= MAX_BUCKETS) {
        // Evict oldest key if saturated
        const firstKey = this.buckets.keys().next().value;
        if (firstKey) this.buckets.delete(firstKey);
      }
    }

    const entry = this.buckets.get(key);
    if (!entry || entry.resetAt < now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (entry.count >= maxRequests) return false;
    entry.count += 1;
    return true;
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }
}

export function buildSecurityHeaders(options: {
  isHttps: boolean;
  isPrivacyIsolated: boolean;
}): Record<string, string> {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://maps.googleapis.com https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://maps.gstatic.com https://maps.googleapis.com https://*.ggpht.com https://*.googleusercontent.com",
    "media-src 'self' data: blob:",
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://maps.googleapis.com",
    "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
    "frame-ancestors 'self' https://aistudio.google.com https://*.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(options.isHttps ? ['upgrade-insecure-requests'] : []),
  ];

  const headers: Record<string, string> = {
    'Content-Security-Policy': cspDirectives.join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Permissions-Policy': 'camera=(), microphone=(), usb=(), payment=(), geolocation=(self)',
    'Referrer-Policy': options.isPrivacyIsolated
      ? 'no-referrer'
      : 'strict-origin-when-cross-origin',
  };

  if (options.isHttps) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }

  if (options.isPrivacyIsolated) {
    headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, private';
    headers['Pragma'] = 'no-cache';
    headers['Expires'] = '0';
  }

  return headers;
}

export function generateEphemeralSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}
