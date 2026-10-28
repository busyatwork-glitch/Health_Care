# Carekind — AI powered healthcare platform

Carekind is a full stack healthcare navigation foundation. Patients can hold private AI health information conversations, save summaries, discover doctor and hospital demonstration profiles, and request appointments. Doctors can register, submit a profile for review, manage availability, and respond to appointments. Administrators can review doctors, manage accounts, and moderate reviews.

**This is a development foundation, not a clinical product.** Demo provider records are fictional. AI output is not clinically validated. Do not enter identifiable real patient information until the clinical, privacy, security, legal, and provider review described below has been completed.

## What works and what needs configuration

- Authentication and role authorization are implemented with Argon2id password hashes, short lived JWT access cookies, rotating opaque refresh cookies, origin checks, rate limits, and server-side ownership checks.
- The REST backend uses Supabase-hosted PostgreSQL for accounts, doctor profiles, hospitals, appointments, conversations/messages, summaries, saves, reviews, refresh sessions, availability, and audit entries.
- Gemini responses are requested on the server with a bounded conversation context and validated structured output. A backend emergency detector runs first. Without `GEMINI_API_KEY`, development chat clearly returns an unassessed demo notice; production returns a service configuration error.
- Appointment requests use a unique partial PostgreSQL index for active doctor/time slots. A demo profile’s availability is sample schedule data and requires doctor confirmation.
- Admin bootstrap and demo records are explicit via `npm run seed`, which is disabled in production.
- Payments, live video visits, maps/geolocation, real hospital/doctor feeds, email/password recovery, clinical validation, and external scheduling are not integrated.

## Architecture

```text
client/       React + TypeScript + Vite + Tailwind, React Router, TanStack Query
server/       Express + TypeScript REST API, PostgreSQL persistence, services, middleware
shared/       Zod request and assessment schemas shared by client and server
docs/         API, security, and AI safety notes
```

## Requirements

- Node.js 20.19+ or 22.12+ (Node 24 is supported) and npm 10+
- A Supabase project with PostgreSQL enabled
- A Google Gemini API key to enable live assistant responses

## Install and configure

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env`. In Supabase, create a project and copy its PostgreSQL connection string from **Connect**. Use the **Session pooler** connection for this long-running Express server, then set it as `SUPABASE_DB_URL`. Replace both JWT secrets with independently generated random values of at least 32 characters. Set `CLIENT_URL` to the exact frontend origin; separate multiple allowed origins with commas (for example, `http://localhost:5173,http://192.168.1.109:5173`). Set `APP_TIME_ZONE` to the clinic timezone (defaults to `Asia/Kolkata`; stored dates use UTC). To enable Gemini, set `GEMINI_API_KEY` and, optionally, `GEMINI_MODEL` and `GEMINI_TIMEOUT_MS`. Keep the database URL server-only; never add it to `client/.env` or commit `.env`.

The application uses HTTP-only SameSite=Lax cookies. For HTTPS deployments set `COOKIE_SECURE=true`, configure the trusted proxy, and use an origin matching `CLIENT_URL`. Ensure TLS is enabled between the API, browser, and database. Never put server secrets in `client/` or commit `.env`.

## Database and sample data

Open `server/supabase/schema.sql` and run it in the Supabase Dashboard SQL Editor. Then run:

```powershell
npm run seed
```

The seed is idempotent for its named sample records, creates the initial admin from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, and refuses `NODE_ENV=production`. Set a private development admin password in `.env` before seeding. Eight doctor profiles and three hospitals are fictional, explicitly marked demonstration data. There are no genuine reviews or real provider verification claims.

Development seed admin: `admin@example.test` / `development-only-change-this-password` **only when unchanged in the local development environment**. Change `SEED_ADMIN_PASSWORD` before seeding your environment. The example value is not enabled by the production seed command.

## Development

```powershell
npm run dev
```

Vite serves the client at `http://localhost:5173`; Express serves the API at `http://localhost:4000`. Override the API base with `VITE_API_URL` if client and API are deployed separately. The health endpoint is `GET /api/health`.

## Quality checks

```powershell
npm run typecheck
npm test
npm run lint
npm run build
```

The committed automated tests cover the public landing page, emergency phrase safeguards, unsafe response sanitization, role checks, and API readiness/origin helpers. Supertest HTTP integration tests are available with `RUN_HTTP_INTEGRATION=true` where local socket permissions allow them. The suites do not yet cover database-backed auth isolation, concurrent booking against Supabase, real Gemini behavior, Playwright journeys, accessibility audits, or deployment. No live external service is mocked as production success.

## API and portals

The route index and request/response notes are in [docs/API.md](docs/API.md). All protected routes use the authenticated account identity from the backend session, and admin/doctor actions have server-side role gates. Public doctor search shows approved profiles and completed provider-submitted profiles that are pending review with a clear label; only approved profiles can be booked. Seeded demonstration profiles remain clearly labelled as fictional.

## Production deployment

Build all packages with `npm run build`, then run the server workspace with `npm start`. Serve the client build in `client/dist` from an HTTPS static host/CDN. Configure independent frontend and API origins, a production Supabase PostgreSQL project, secret storage, backups, monitoring, rate limits, and health checks. Confirm the unique active-slot index exists before accepting bookings. Do not deploy onto a free tier without evaluating its data processing, retention, access, reliability, and security.

Before any real patient deployment, commission clinical safety review and validation, penetration/security review, privacy impact and retention/deletion review, applicable Indian DPDP and medical/telemedicine legal review, provider data processing and retention review, operational incident response, and accessibility/usability validation. This repository does not claim HIPAA, DPDP, GDPR, medical certification, or regulatory approval.
