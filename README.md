# HIS AND HERS — Community Care, Mental Health & Safe Refuge Platform

An institutional, human-centred web platform and Stewardship Content Management System (CMS) for **HIS AND HERS**, a community-based organization making the world better by touching lives through confidential mental health counselling, safe refuge for survivors of gender-based violence and child abuse, prayer fellowship, and organised community home visits.

**Developed by:** Aurel Tech Ventures

## Key Features

- **Mental Health & Counselling Space (`/counselling`)**: Confidential request intake to speak with a counsellor or lighten burdens anonymously, with support area selection, contact preference, urgency level, and crisis guidance.
- **Find My Home · Safe Refuge (`/find-my-home`)**: Dedicated safeguarding intake for people fleeing gender-based violence and child abuse, featuring a Quick Exit safety control, safe-contact instructions, and safety planning guidance.
- **Organize a Home Visit (`/home-visits`)**: Structured coordination portal for individuals, fellowships, schools, and partner groups interested in community service visits.
- **Prayer & Worship (`/prayer-worship`), Our Impact (`/impact`), Events (`/events`), Get Involved (`/get-involved`), & Contact (`/contact`)**.
- **Role-Based Stewardship CMS (`/admin`)**: Signed HTTP-only session authentication allowing authorised coordinators to review confidential counselling requests, safe-refuge alerts, prayer requests, home visit bookings, volunteer enquiries, contact messages, and manage events, impact stories, announcements, and site settings.

## Configuration

See `.env.example` for environment variables:

- `ADMIN_SECRET`: Signing secret for administrator session cookies.
- `ADMIN_EMAIL`: Administrator email address for `/admin` login.
- `ADMIN_PASSWORD`: Administrator password for `/admin` login.

## Scripts

- `npm run dev` — Starts the Express + Vite full-stack server on port 3000.
- `npm run build` — Builds the production client bundle into `dist/`.
- `npm run lint` — Runs TypeScript type checking (`tsc --noEmit`).
- `npx tsx --test src/utils/validation.test.ts` — Runs unit tests for validation and filtering logic.
