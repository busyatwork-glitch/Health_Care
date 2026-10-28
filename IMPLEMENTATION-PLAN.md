# Implementation plan

## Workspace findings

- The workspace contains no application files and no project-specific `AGENTS.md`.
- Node.js 24 and npm 11 are available. No configured Supabase database URL or Gemini/JWT environment variables were found during inspection.
- Build the application as a React/Vite client and modular Express API backed by Supabase PostgreSQL. The database and Gemini integrations will be real when configured; local demo mode must be labelled and must never claim a live AI result.

## Delivery sequence

1. Create the monorepo, strict TypeScript configs, environment validation, shared schemas, lint/format scripts, and design tokens.
2. Implement API middleware, authentication/session renewal, role checks, data models, safe seed command, and health endpoint.
3. Implement patient conversations with emergency safety overrides and Gemini structured output, doctor/hospital discovery, saves, summaries, appointments with atomic slot uniqueness, reviews, and role-specific workflows.
4. Build responsive public, patient, doctor, and admin interfaces with routed pages and accessible forms.
5. Document routes, security, AI safety, setup, demo limitations, and deployment requirements.
6. Install dependencies where network access permits; run type checks, tests, and production builds. Report any services that cannot be started or verified in this environment.

## Integration and deployment requirements

- Supabase Postgres connection URL, strong JWT secrets, and Gemini API key/model must be configured for persistent production operation and live AI, respectively.
- Demo profiles and hospitals are fictional sample data and never represent verified providers. Seed execution is explicit and refuses production mode.
- Real patient deployment requires clinical, legal, privacy, provider-contract, security, and operational review; this project makes no compliance or clinical-validation claim.
