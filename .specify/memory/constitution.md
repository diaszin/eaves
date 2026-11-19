<!--
Sync Impact Report (temporary; remove before commit)
- Version change: (unfilled template) → 1.0.0
- Modified principles: none renamed (all five principles newly defined from template slots)
- Added sections: Core Principles I–V, Stack & Security Constraints, Development Workflow & Quality Gates, Governance
- Removed sections: none
- Deferred items: none. RATIFICATION_DATE set to the first repository commit (2026-09-16).
-->
# Eaves Constitution

## Core Principles

### I. API-Centric Architecture
All business rules, persistence and authorization MUST live in the NestJS API (`server/`). The mobile
app (`app/`) and the backoffice platform (`platform/`) MUST be thin clients that talk to the API
over HTTP with a Bearer JWT and MUST NOT access the database directly. Each API domain
(appointments, auth, personal-journal, survey, schedules, etc.) MUST be its own module with
controller, service, DTOs and entities.
Rationale: two clients share one source of truth, so rules cannot diverge between them.

### II. Role-Based Access Control (NON-NEGOTIABLE)
Every API endpoint MUST enforce authentication and authorization by role (`coordinator`,
`professor`, `lobby`, `trainee`, `patient`) on the server. Client-side route hiding is a UX
convenience only and MUST NOT be the sole control. The `patient` role MUST NOT access the
backoffice. Any new endpoint or screen MUST state which roles may use it.
Rationale: the system handles mental-health data of students.

### III. Sensitive Data & Privacy
PHQ-9 results, journal entries and appointment notes MUST be exposed only to roles authorized to
see them. Passwords MUST be hashed (bcrypt); secrets and `.env` files MUST NOT be committed;
logs and error responses MUST NOT leak personal or clinical data. Features that collect new
personal data MUST be consistent with the consent term (TCLE) shown in the app.
Rationale: privacy for the student population is the project's core ethical obligation.

### IV. Validated Contracts & Versioned Schema
All API inputs MUST be validated with DTOs (`class-validator`) and documented in Swagger. Every
database schema change MUST ship as a TypeORM migration; manual or auto-synchronized schema
changes MUST NOT be used outside local experiments. Breaking API changes MUST be coordinated with
both clients in the same change set.
Rationale: reproducible databases and stable contracts across three deployable components.

### V. Tested, Typed, Simple Code
All code MUST be TypeScript with strict typing enforced by the project's tooling. Server business
logic (services, policies) MUST have Vitest unit tests, and endpoints whose behavior changes MUST
be covered by unit or e2e tests. Prefer the simplest solution that satisfies the spec (YAGNI);
added complexity MUST be justified in the plan. Client code MUST follow each app's existing
structure (`app/src/features/*`, `platform/src/features/*` with the Three-Pane layout).
Rationale: a small academic team needs code that is easy to read, change and verify.

## Stack & Security Constraints

- Server: NestJS, TypeORM, PostgreSQL, Passport/JWT, Yarn 1.22.22; lint with `oxlint`.
- App: React Native with Expo, Expo Router and NativeWind; MUST consult the Expo docs for the
  version in use (see `app/AGENTS.md`) before writing code.
- Platform: React, Vite and Tailwind CSS following the Three-Pane Application Layout.
- Local and production environments MUST run via Docker Compose (`docker-compose.yml`,
  `docker-compose.prod.yml`); CORS origins MUST be restricted through `ALLOWED_ORIGINS`.
- User-facing text MUST be in Brazilian Portuguese.

## Development Workflow & Quality Gates

- Work follows Spec Kit: specify → plan → tasks → implement, on a feature branch; `main` is
  the deployable branch (CI deploys via `.github/workflows`).
- Before merging, the server MUST pass `yarn lint` and `yarn test`, and affected clients MUST
  build and lint without errors.
- Commits MUST use conventional-style messages (`feat`, `fix`, `refactor`, `docs`, etc.).
- Plans MUST include a Constitution Check against Principles I–V.
- Demo or seed data MUST be created only via `server/scripts/seed-demo.mjs`, never in migrations.

## Governance

This constitution supersedes other practices. Amendments MUST be made through
`/speckit-constitution`, documented with rationale and, when they affect existing code, a
migration plan. Versioning follows semantic versioning: MAJOR for removed or redefined
principles, MINOR for new or materially expanded principles or sections, PATCH for
clarifications. Every plan and pull request review MUST verify compliance, and any deviation
MUST be recorded and justified in the plan's complexity tracking.

**Version**: 1.0.0 | **Ratified**: 2026-09-16 | **Last Amended**: 2026-11-18
