# Security notes

## Authentication and authorization

- Argon2id hashes passwords. JWT access cookies live 15 minutes; opaque random refresh cookies are stored as SHA-256 hashes, rotated on renewal, and expire after seven days.
- Cookies are HTTP-only and SameSite=Lax, Secure in production or when `COOKIE_SECURE=true`. Browser state-changing requests require the configured `Origin`; CORS is allowlisted.
- Backend middleware checks the current account, suspension state, role, and resource ownership. Do not treat hidden UI controls as authorization.
- Authentication and AI routes use rate limits. Request bodies have a 32 KB cap. Helmet security headers are enabled.

## Sensitive data

Symptoms, conversations, appointment reasons, and summaries are sensitive. Do not log request bodies, tokens, passwords, AI prompts/responses, or provider keys. The current application does not implement field-level encryption, external key management, configurable retention schedules, or a formal compliance program. Use TLS in transit, encrypted managed storage/backups, least-privilege database credentials, strong secret rotation, audit review, and tested incident response before real use.

When Gemini is configured, the backend sends conversation turns to Google. Assess the current provider terms, data processing, retention, region, and privacy implications before using real patient information. A free-tier configuration must not receive identifiable real patient health content.

## Deployment precautions

- Keep `.env` out of source control; use independent random JWT secrets and managed secret storage.
- Set exact HTTPS frontend origins in `CLIENT_URL` (comma-separated when needed), `COOKIE_SECURE=true`, and correct trusted proxy configuration. Do not use wildcard credentialed CORS.
- The demo seed refuses production. Never rely on sample accounts or credentials in a deployment.
- Use a Supabase PostgreSQL project with restricted database credentials, encrypted backups, monitoring, and access auditing. Apply `server/supabase/schema.sql` and confirm its unique active-slot index exists before accepting bookings.
- Review dependencies, container/runtime hardening, file upload policies (no upload route currently exists), password recovery, abuse monitoring, session revocation, and incident procedures.
- Complete independent application security and applicable legal/privacy review. No HIPAA, DPDP, GDPR, or other compliance status is claimed.
