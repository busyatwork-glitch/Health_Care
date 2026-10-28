# REST API

Base path: `/api`. JSON responses use `{ error }` for errors and route-specific data for success. Cookie-authenticated mutations require the configured browser `Origin`.

## Authentication

- `POST /auth/register` — patient registration; doctor registration requires `specialty` and `registrationNumber`. Passwords require 12–128 characters.
- `POST /auth/login` — email and password; sets access and refresh cookies.
- `POST /auth/logout` — revoke the current refresh session and clear cookies.
- `POST /auth/refresh` — rotate the refresh token and issue a new access cookie.
- `GET /auth/me` — authenticated account and doctor verification state.
- `PATCH /auth/account` — update the signed-in user's name or phone.
- `DELETE /auth/account` — delete the signed-in account and associated private records; active appointments are cancelled first.

## AI and conversations (patient)

- `POST /ai/chat` — `{ message, conversationId? }`; stores accepted user message and, on success, assistant answer and structured assessment. `demo: true` means no model assessment was generated.
- `GET /conversations?search=&page=` — owned conversation titles, most recent first.
- `GET /conversations/:id` — owned conversation and up to 300 messages.
- `PATCH /conversations/:id` — `{ title }`.
- `DELETE /conversations/:id` — remove owned conversation and messages.
- `GET /activity` — patient-owned activity summaries for conversations, saved health summaries, appointments, and reviews; not a clinical record.
- `POST /health-summaries`, `GET /health-summaries`, `DELETE /health-summaries/:id` — save, list, and delete informational summaries.

## Discovery

- `GET /doctors?q=&specialty=&city=&sort=&page=` and `GET /doctors/:id` — approved profiles only; sort accepts `fee`, otherwise experience. Listings include review aggregates from actual review records.
- `GET /doctors/:id/availability?from=` — sample slots based on doctor schedule, active bookings, and blocked dates. The doctor must confirm a request.
- `GET /doctors/:id/reviews` — actual non-moderated review records.
- `GET /hospitals?q=&city=&specialty=&page=` and `GET /hospitals/:id` — seeded demo locations only.
- `GET /saved/doctors`, `POST /saved/doctors/:id`, `DELETE /saved/doctors/:id` — patient bookmarks. Substitute `hospitals` for hospital bookmarks.

## Appointments, doctor portal, reviews

- `POST /appointments` — patient request with doctor, ISO start time, consultation type, and reason. Enforced by server schedule checks and unique active doctor/time index.
- `GET /appointments`, `GET /appointments/:id`, `PATCH /appointments/:id/cancel` — account scoped appointment operations.
- `POST /reviews` — rating/review for an owned completed appointment, one review per appointment.
- `GET /doctor/profile`, `PATCH /doctor/profile`, `PUT /doctor/availability` — doctor self-service; availability accepts weekdays, hour range, slot length, and blocked dates.
- `PATCH /doctor/appointments/:id/status` — allowed status transitions only: pending to confirmed/rejected; confirmed to completed/no-show.

## Admin

- `GET /admin/doctors?status=pending`, `PATCH /admin/doctors/:id/verification` — verification queue and decision.
- `GET /admin/users`, `PATCH /admin/users/:id/suspension` — account listing and suspension.
- `GET /admin/appointments`, `GET /admin/reviews`, `PATCH /admin/reviews/:id/moderation` — restricted operational views and review moderation. Decisions write audit entries.

All route params and bodies are validated; route-specific validation is enforced with Zod. Lists are capped and paginated where implemented. Cursor pagination, rescheduling, public specialty CRUD, advanced moderation tooling, and full audit log search remain future work.
