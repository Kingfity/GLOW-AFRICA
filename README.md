# GLOW Church Africa — Digital Platform

An institutional, human-centred web platform and Stewardship Content Management System (CMS) for **GLOW Church Africa**, an interdenominational prayer and worship movement demonstrating God's love through spiritual fellowship, compassionate service, and community outreach since 2024.

**Developed by:** Aurel Tech Ventures

## Key Features

- **Editorial Public Website**: Multi-page architecture covering Home, About Us, Prayer & Worship, Our Impact (with individual documented initiative pages), Events & Gatherings (with dedicated event views and RSVPs), Get Involved, Contact Us, and Privacy Policy.
- **Confidential Prayer Request Handling**: Dedicated prayer submission flow supporting anonymous submission, explicit consent, spam honeypot + rate-limiting protection, and private storage never exposed on public endpoints.
- **Role-Based Stewardship CMS (`/admin`)**: Signed HTTP-only session authentication allowing authorised administrators to review private prayer requests, manage volunteer enquiries and contact messages, add/delete events, publish impact stories with photograph uploads, publish homepage announcements, and update contact details.

## Configuration

See `.env.example` for configurable environment variables:

- `GLOW_ADMIN_SECRET`: Secret key used to sign administrator session cookies.
- `GLOW_ADMIN_EMAIL`: Administrator email address for `/admin` login.
- `GLOW_ADMIN_PASSWORD`: Administrator password for `/admin` login.

## Scripts

- `npm run dev` — Starts the Express + Vite full-stack server on port 3000.
- `npm run build` — Builds the production client bundle into `dist/`.
- `npm run lint` — Runs TypeScript type checking (`tsc --noEmit`).
- `npx tsx --test src/utils/validation.test.ts` — Runs unit tests for validation and filtering logic.
