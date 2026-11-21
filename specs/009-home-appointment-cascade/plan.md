# Implementation Plan: Home Appointment Cascade

**Branch**: `009-home-appointment-cascade` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-home-appointment-cascade/spec.md`

## Summary

Add a one-time fade-and-subtle-rise cascade to the appointment cards visible on the first screen of the home page. Use the app's existing React Native Reanimated dependency and its reduced-motion pattern. Keep below-the-fold cards static, and preserve appointment data, order, cancellation behavior, loading, and empty states.

## Technical Context

**Language/Version**: TypeScript 6.0.3

**Primary Dependencies**: Expo SDK 57, React Native 0.86.3, React Native Reanimated 4.5.1, Expo Router, TanStack Query (existing appointment query)

**Storage**: N/A; appointment data continues to come from the existing appointment service.

**Testing**: `yarn lint` and `yarn build:web`; focused visual verification in the supported app runtime. No existing app unit/widget test suite was found for this template.

**Target Platform**: Patient app on Android, iOS, and web.

**Project Type**: Expo mobile application with web support.

**Performance Goals**: Animate the initially visible cards in no more than 1.5 seconds after appointment data is available; keep scrolling and card actions responsive.

**Constraints**: Animate only rows visible in the first viewport on each home-page opening. Do not animate rows below the fold, replay for existing rows after a refresh or scroll, add dependencies, or change API/data behavior. Reduced-motion preference disables displacement and stagger delay.

**Scale/Scope**: One existing home-page appointment-list template and the cards rendered by it; no server, schema, or public-interface changes.

## Constitution Check

### Pre-design Gate

- **I. API-Centric Architecture — PASS**: This is presentation-only work in the app. No business rules, persistence, or authorization move to the client.
- **II. Role-Based Access Control — PASS**: No endpoint or screen access is added; the existing patient-facing home page and access rules remain unchanged.
- **III. Sensitive Data & Privacy — PASS**: No new personal data is collected, persisted, logged, or exposed.
- **IV. Validated Contracts & Versioned Schema — PASS**: No API contract or database schema changes are required.
- **V. Tested, Typed, Simple Code — PASS**: Reuse the installed animation dependency and existing app conventions; retain typed appointment records and validate the affected app with its lint and build commands.

**Pre-design gate result: PASS.**

### Post-design Gate

- **I. API-Centric Architecture — PASS**: Appointment retrieval, ordering, and cancellation remain in their current service/query flow.
- **II. Role-Based Access Control — PASS**: Existing patient access is unchanged.
- **III. Sensitive Data & Privacy — PASS**: The animation changes only presentation and adds no data handling.
- **IV. Validated Contracts & Versioned Schema — PASS**: No contracts, migrations, or server changes.
- **V. Tested, Typed, Simple Code — PASS**: The design uses Reanimated 4.5.1 already present in the app, preserves the existing appointment type, and has targeted lint/build and visual verification.

**Post-design gate result: PASS. No constitution violations or complexity exceptions.**

## Project Structure

### Documentation (this feature)

```text
specs/009-home-appointment-cascade/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── checklists/
    └── requirements.md
```

No `contracts/` directory is needed: the feature changes no external or public interface.

### Source Code (repository root)

```text
app/
└── src/
    └── templates/
        └── get-recently-appointments.tsx  # Home-page list and appointment cards
```

**Structure Decision**: Keep the behavior in the existing home appointment-list template. Use a stable appointment ID to track the first-viewport rows for the current page visit; avoid adding a new feature module, server endpoint, dependency, or persisted model.
