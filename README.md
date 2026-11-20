# His & Hers Circle of Hope

Community-based care platform established in 2025 in Ruiru, Kiambu County, connecting neighbours, families, elders living alone, mothers and guardians raising children with special needs, mental health & trauma support, rehabilitation pathways, children's homes, and institutional philanthropic partners across all 47 Kenyan counties.

## Local Development

```bash
npm install
npm run dev
```

App runs on `http://localhost:3000`.

## GitHub Secret Alert Resolution & Security Hardening

If GitHub Secret Scanning flagged `firebase-applet-config.json` from an earlier push:

1. **Restrict or Rotate the Flagged Google/Firebase Key** in [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials):
   - Under **Application restrictions**, select **Websites** and allow only your production domains (`https://your-app.vercel.app/*`, custom domain, and `http://localhost:3000/*` for dev).
   - Under **API restrictions**, restrict the key strictly to required Firebase client APIs (`Identity Toolkit API`, `Token Service API`, `Cloud Firestore API`, `Firebase Installations API`).
   - Optionally rotate the key in Cloud Console, update Vercel `VITE_FIREBASE_API_KEY`, and mark the GitHub Security alert as resolved.
2. **`firebase-applet-config.json` is now gitignored**: Never commit real `.env` files or `firebase-applet-config.json` (use `firebase-applet-config.example.json` and `.env.example` as templates).
3. **Built-In Application Firewall & Anti-Malware Defenses** (`server/security.ts`):
   - **HTTP Firewall & CSP Headers**: Strict Content-Security-Policy, `X-Content-Type-Options: nosniff`, `Permissions-Policy`, `Cross-Origin-Opener-Policy: same-origin-allow-popups`, `Strict-Transport-Security`, and `no-store`/`no-referrer` on `/gbv*` & `/recovery*`.
   - **Scanner & Injection Defense**: Blocks vulnerability scanner paths (`/.env`, `/.git`, `/wp-admin`, traversal `../`), prototype pollution (`__proto__`, `constructor`), XSS/SQLi/shell injection patterns, and cross-origin CSRF mutations.
   - **Anti-Malware Upload Verification**: Validates true binary magic bytes (`PNG`/`JPG`/`WEBP`) and rejects polyglot `<script`/`<?php` signatures before writing or processing uploads.
   - **Brute-Force Lockout & Fail-Closed Auth**: Enforces 5-attempt/15-min IP lockout on `/api/admin/login`, timing-safe SHA-256 comparison, `SameSite=Strict` `HttpOnly` signed cookies, and fails closed in production if `ADMIN_SECRET` or `ADMIN_PASSWORD` is unset.

## Vercel Launch Checklist

1. Import repository in Vercel (`npm run build`, output directory `dist`).
2. Add Environment Variables in Vercel Project Settings:
   - `GEMINI_API_KEY` (billing-enabled Gemini API key for Care Guide AI, Search/Maps Grounding, and Video Story Animation)
   - `VITE_GOOGLE_MAPS_API_KEY` (HTTP-referrer-restricted Google Maps JavaScript API key)
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_FIRESTORE_DATABASE_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `ADMIN_SECRET` (64+ random hex characters), `ADMIN_EMAIL`, `ADMIN_PASSWORD` (strong passphrase)
   - `APP_URL` (your production `https://...` URL for CSRF origin allowlisting)
3. In Firebase Console → **Authentication → Settings → Authorized domains**, add your deployed `*.vercel.app` or custom domain so Google Sign-In works in production.
4. Keep deployed `firestore.rules` active (`npx eslint firestore.rules`) and consider enabling **Firebase App Check** in Firebase Console.
