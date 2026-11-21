# Implementation Plan: Button Micro-interactions

**Branch**: `010-button-micro-interactions` | **Date**: 2026-11-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-button-micro-interactions/spec.md`

## Summary

Introduce one shared pressable component in the app that gives every action-triggering tappable element the same press micro-interaction: a quick scale-down plus slight opacity change on press, a smooth spring-back on release, a hover cue on web, smooth transitions between selected/disabled states (a loading button is simply `disabled` while its request is pending), and a no-movement (opacity-only) variant when the OS reduced-motion preference is on. Replace the existing `TouchableOpacity`/`Pressable` usages with it (about 25 files), with intensity chosen by a `size` variant (`button`, `card`, `icon`). Feedback is visual only (no haptics, no sound). Built on the already-installed React Native Reanimated; no new dependencies.

## Technical Context

**Language/Version**: TypeScript 6.0.3

**Primary Dependencies**: Expo SDK 57, React Native 0.86.3, React Native Reanimated 4.5.1 (`useSharedValue`, `useAnimatedStyle`, `withTiming`/`withSpring`, `useReducedMotion`), NativeWind 4, Expo Router (tabs/stack header options)

**Storage**: N/A

**Testing**: `yarn lint` and `yarn build:web` in `app/`; manual verification per [quickstart.md](./quickstart.md) on Android/iOS/web. The app has no unit/widget test suite, so none is added (YAGNI, Principle V).

**Target Platform**: Patient app on Android, iOS and web (react-native-web).

**Project Type**: Expo mobile application with web support.

**Performance Goals**: Press feedback starts within 100 ms (SC-002); animation runs on the UI thread so scrolling and navigation stay fluid (SC-006).

**Constraints**: Visual only (FR-013). Must not change `onPress` semantics, layout, colors or shapes (FR-003). Disabled elements show no press animation (FR-005). Reduced-motion removes scale (FR-008). Default tab bar and navigator-provided header buttons that the app does not customize are not replaced (FR-014). No new dependencies.

**Scale/Scope**: One new shared component + one small constants/hook module; ~25 existing files touched (auth screens, signup steps, appointments, personal journal, profile, surveys, templates, home tab header; the Error/Success bottom sheets only lose an unused import). No server, schema or API changes.

## Constitution Check

### Pre-design Gate

- **I. API-Centric Architecture — PASS**: Presentation-only change in the app; no business rules, persistence or authorization move.
- **II. Role-Based Access Control — PASS**: No screens or endpoints added; access rules unchanged.
- **III. Sensitive Data & Privacy — PASS**: No data is collected, stored or logged.
- **IV. Validated Contracts & Versioned Schema — PASS**: No API contract or schema changes.
- **V. Tested, Typed, Simple Code — PASS**: Strictly typed shared component reusing the installed animation library; verified with lint, web build and a manual checklist. Adding a shared component is justified because it is the only way to satisfy FR-011 (standard adoption) without duplicating logic in 25 files.

**Pre-design gate result: PASS.**

### Post-design Gate

- **I–IV — PASS**: Unchanged by design; see [data-model.md](./data-model.md) (no persisted data) and absence of `contracts/`.
- **V — PASS**: One component (`PressableScale`) with three presets; no extra abstraction layers. User-facing text untouched (still Brazilian Portuguese).

**Post-design gate result: PASS. No complexity exceptions.**

## Project Structure

### Documentation (this feature)

```text
specs/010-button-micro-interactions/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── checklists/
    └── requirements.md
```

No `contracts/` directory: the only new interface is an internal component, described in research.md and data-model.md.

### Source Code (repository root)

```text
app/
└── src/
    ├── shared/
    │   └── components/
    │       └── pressable-scale.tsx        # NEW: shared press micro-interaction
    ├── app/(app)/(authenticated)/(home)/_layout.tsx   # header profile button
    ├── components/                        # Error/Success bottom sheets (unused import cleanup only)
    ├── features/
    │   ├── auth/screens/ (+ signup_steps/)
    │   ├── appointments/ (components + screens)
    │   ├── personal-journal/ (components + screens)
    │   ├── profile/ (components + screens)
    │   └── surveys/ (components + screens)
    └── templates/                         # daily-survey, appointments list, journal card, legal terms
```

**Structure Decision**: Add a single shared component under `app/src/shared/components/` (the existing home for cross-feature code, next to `shared/navigation`) and migrate call sites in place. Presets and the reduced-motion handling live inside the component, following the `useReducedMotion` pattern already used in `shared/navigation/transitions.ts`.
