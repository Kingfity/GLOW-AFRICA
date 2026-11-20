import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  BoundedRateLimiter,
  buildSecurityHeaders,
  containsEmbeddedScriptSignature,
  inspectPayloadForThreats,
  isAllowedMutationOrigin,
  isBlockedScannerPath,
  verifyImageMagicBytes,
} from './security.ts';

test('Firewall blocks automated exploit and scanner paths including traversal and config probes', () => {
  assert.equal(isBlockedScannerPath('/.env'), true);
  assert.equal(isBlockedScannerPath('/.git/config'), true);
  assert.equal(isBlockedScannerPath('/wp-login.php'), true);
  assert.equal(isBlockedScannerPath('/firebase-applet-config.json'), true);
  assert.equal(isBlockedScannerPath('/api/%2e%2e/etc/passwd'), true);
  assert.equal(isBlockedScannerPath('/api/public-data'), false);
  assert.equal(isBlockedScannerPath('/special-needs-families'), false);
});

test('Payload firewall detects XSS, prototype pollution, SQLi probes, and excessive nesting', () => {
  assert.equal(inspectPayloadForThreats({ name: 'Grace Wanjiku', note: 'Safe message' }).safe, true);
  assert.equal(
    inspectPayloadForThreats({ note: '<script>alert(1)</script>' }).safe,
    false
  );
  assert.equal(
    inspectPayloadForThreats({ link: 'javascript:document.cookie' }).safe,
    false
  );
  assert.equal(
    inspectPayloadForThreats(JSON.parse('{"__proto__": {"polluted": true}}')).safe,
    false
  );
  assert.equal(
    inspectPayloadForThreats({ q: '1 UNION SELECT password FROM users' }).safe,
    false
  );
  assert.equal(
    inspectPayloadForThreats({
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ',
    }).safe,
    true
  );
});

test('Anti-malware binary inspector verifies PNG/JPG/WEBP magic bytes and rejects polyglot scripts', () => {
  const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const validJpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const validWebp = Buffer.from('RIFF\x24\x00\x00\x00WEBPVP8 ', 'latin1');
  const fakeHtmlAsPng = Buffer.from('<html><script>evil()</script></html>', 'utf8');
  const polyglotPng = Buffer.concat([validPng, Buffer.from('<?php system($_GET["c"]); ?>', 'utf8')]);

  assert.equal(verifyImageMagicBytes(validPng, 'png'), true);
  assert.equal(verifyImageMagicBytes(validJpg, 'jpg'), true);
  assert.equal(verifyImageMagicBytes(validWebp, 'webp'), true);
  assert.equal(verifyImageMagicBytes(fakeHtmlAsPng, 'png'), false);
  assert.equal(verifyImageMagicBytes(validJpg, 'png'), false);
  assert.equal(containsEmbeddedScriptSignature(validPng), false);
  assert.equal(containsEmbeddedScriptSignature(polyglotPng), true);
});

test('CSRF firewall validates mutation origins against server host and APP_URL', () => {
  assert.equal(isAllowedMutationOrigin(undefined, 'hisandhers.vercel.app'), true);
  assert.equal(
    isAllowedMutationOrigin('https://hisandhers.vercel.app', 'hisandhers.vercel.app'),
    true
  );
  assert.equal(
    isAllowedMutationOrigin('https://evil-attacker.example', 'hisandhers.vercel.app'),
    false
  );
  assert.equal(
    isAllowedMutationOrigin('http://localhost:3000', 'localhost:3000'),
    true
  );
});

test('Bounded rate limiter enforces window thresholds and resets cleanly on demand', () => {
  const limiter = new BoundedRateLimiter();
  const now = 1_000_000;
  assert.equal(limiter.check('1.2.3.4', 2, 60_000, now), true);
  assert.equal(limiter.check('1.2.3.4', 2, 60_000, now + 10), true);
  assert.equal(limiter.check('1.2.3.4', 2, 60_000, now + 20), false);
  limiter.reset('1.2.3.4');
  assert.equal(limiter.check('1.2.3.4', 2, 60_000, now + 30), true);
});

test('Security headers enforce CSP, nosniff, and strict isolation on privacy routes', () => {
  const pubHeaders = buildSecurityHeaders({ isHttps: true, isPrivacyIsolated: false });
  assert.equal(pubHeaders['X-Content-Type-Options'], 'nosniff');
  assert.ok(pubHeaders['Content-Security-Policy'].includes("object-src 'none'"));
  assert.ok(pubHeaders['Strict-Transport-Security'].includes('max-age=31536000'));
  assert.equal(pubHeaders['Referrer-Policy'], 'strict-origin-when-cross-origin');

  const privHeaders = buildSecurityHeaders({ isHttps: false, isPrivacyIsolated: true });
  assert.equal(privHeaders['Referrer-Policy'], 'no-referrer');
  assert.ok(privHeaders['Cache-Control'].includes('no-store'));
});

test('Deployment preflight verifies zero leaked secrets, hardened Vercel edge CSP, and refuge-only Google Maps scope', () => {
  const root = process.cwd();
  const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
  assert.ok(gitignore.includes('firebase-applet-config.json'));
  assert.ok(gitignore.includes('.env'));

  const vercelJson = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const globalHeaders = vercelJson.headers?.[0]?.headers || [];
  const headerKeys = new Set(globalHeaders.map((h: { key: string }) => h.key));
  assert.ok(headerKeys.has('Content-Security-Policy'));
  assert.ok(headerKeys.has('X-Content-Type-Options'));
  assert.ok(headerKeys.has('Strict-Transport-Security'));
  const gbvRule = vercelJson.headers?.find((h: { source: string }) => h.source === '/gbv(.*)');
  assert.ok(gbvRule);

  // Verify Google Maps SDK is restricted solely to RefugeMapsLocator (rendered on FindMyHomePage)
  const walkFiles = (dir: string): string[] => {
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walkFiles(full));
      else if (/\.(ts|tsx|html|json)$/.test(entry.name)) out.push(full);
    }
    return out;
  };

  const scannedFiles = [
    ...walkFiles(path.join(root, 'src')),
    ...walkFiles(path.join(root, 'server')),
    path.join(root, 'index.html'),
  ];

  const mapsSdkUsers: string[] = [];
  const forbiddenDefault = ['HisAndHers', 'Admin'].join('');
  for (const file of scannedFiles) {
    if (file.endsWith('.test.ts')) continue;
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(/AIza[0-9A-Za-z_-]{20,}/.test(content), false, `Potential leaked Google API key in ${file}`);
    assert.equal(content.includes(forbiddenDefault), false, `Hardcoded admin credential found in ${file}`);
    if (content.includes('@vis.gl/react-google-maps')) {
      mapsSdkUsers.push(path.relative(root, file));
    }
  }

  assert.deepEqual(mapsSdkUsers, [path.join('src', 'components', 'RefugeMapsLocator.tsx')]);
  const homeVisits = fs.readFileSync(path.join(root, 'src', 'pages', 'HomeVisitsPage.tsx'), 'utf8');
  const rehabPage = fs.readFileSync(path.join(root, 'src', 'pages', 'RehabilitationPage.tsx'), 'utf8');
  const gbvPage = fs.readFileSync(path.join(root, 'src', 'pages', 'GbvSafePage.tsx'), 'utf8');
  const findMyHome = fs.readFileSync(path.join(root, 'src', 'pages', 'FindMyHomePage.tsx'), 'utf8');
  assert.equal(homeVisits.includes('RefugeMapsLocator'), false);
  assert.equal(rehabPage.includes('RefugeMapsLocator'), false);
  assert.equal(gbvPage.includes('RefugeMapsLocator'), false);
  assert.equal(findMyHome.includes('RefugeMapsLocator'), true);
});

