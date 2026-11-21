# Idea Research: Animation when navigating between pages (mobile app only)

- **Slug**: page-transition-animation
- **Created**: 2026-11-20
- **Evidence confidence (overall)**: medium (strong on technical feasibility from the repo and installed libraries; no evidence on user demand; no external sources fetched)

> Scope per research input: **app only** (`app/`, Expo). The web `platform/` is out of scope. This resolves the "target surface" unknown from intake. [source: user input `somente para o app`]

## Users & Demand

- No user requests, tickets, interviews, or usage data exist in the repo or `.specify/` for navigation animation. — [source: search of `specs/`, `.specify/bugs/`, `.specify/assessments/`] (confidence: medium; absence of evidence in repo only)
- Demand is therefore a stated want from the requester only; origin and motivation remain unknown. — [ASSUMPTION] (confidence: low)
- The app's users are patients (students) using mental-health features (journal, PHQ-9, appointments). Whether they perceive current transitions as lacking is unknown. — [source: `.specify/memory/constitution.md`] (confidence: medium on audience; low on need)

## Prior Art

- **Internal, animation precedent**: spec `002-success-lottie-animation` replaced a static check icon with a Lottie animation in `SuccesssBottomSheet.tsx`, showing the team already invests in motion polish. — [source: `specs/002-success-lottie-animation/spec.md`] (confidence: high)
- **Internal, related bug**: `.specify/bugs/lottie-dotlottie-missing` and `export-dynamic-import-fail` show animation-related dependencies have caused build/export problems before (details not reviewed). — [source: `.specify/bugs/` directory listing] (confidence: low; titles only)
- **Current navigation setup**:
  - Root `Stack` in `app/src/app/_layout.tsx` with only `headerShown: false` — no `animation` option set.
  - `(auth)` Stack: `headerShown: false`, `contentStyle` background `#FBF0FF` — no `animation`.
  - `(authenticated)` Stack: `headerShown: false` — no `animation`.
  - `(home)` uses `Tabs` with no `animation` option on any tab screen.
  — [source: `app/src/app/_layout.tsx`, `(auth)/_layout.tsx`, `(app)/(authenticated)/_layout.tsx`, `(home)/_layout.tsx`] (confidence: high)
  So navigation currently uses platform defaults everywhere.
- **Library capabilities already installed** (read from installed type definitions):
  - Native stack (via expo-router) supports a per-screen `animation` option: `default`, `fade`, `fade_from_bottom`, `flip` (iOS modal only), `simple_push`, `slide_from_bottom`, `slide_from_right` (Android only; iOS uses default), and others. — [source: `app/node_modules/expo-router/build/react-navigation/native-stack/types.d.ts`] (confidence: high)
  - Bottom tabs support `animation: 'none' | 'fade' | 'shift'` (default `none`) plus `transitionSpec` (timing/spring). — [source: `app/node_modules/expo-router/build/react-navigation/bottom-tabs/types.d.ts`] (confidence: high)
  - `react-native-reanimated` 4.5.1, `react-native-worklets` 0.10.1, `react-native-screens` and `react-native-gesture-handler` are already dependencies. — [source: `app/package.json`] (confidence: high)
  - Only existing animation code in `src/`: `SuccesssBottomSheet.tsx` and `motivational-text.tsx` match animation-related search terms. — [source: grep of `app/src`] (confidence: medium)

## Market & Context

- Users currently see OS-default push/pop and instant tab switching (tab `animation` defaults to `none`). The cost of doing nothing is a less polished feel, not a functional gap. — [source: library types above; ASSUMPTION on perceived impact] (confidence: medium)
- Slide/fade transitions are the common convention in mobile apps. — [ASSUMPTION; no external source fetched] (confidence: low)

## Data & Constraints

- **Platform differences**: `slide_from_right` is Android-only and falls back to the default on iOS; `flip` is iOS-modal-only. A uniform look across platforms needs care. — [source: expo-router native-stack types] (confidence: high)
- **Web target**: the app is also built for web (`build:web`, `react-native-web`, `expo export --platform web`). Native-stack `animation` behavior on web is not verified here. — [source: `app/package.json` scripts] (confidence: medium; web behavior unverified)
- **Expo version rules**: `app/AGENTS.md` and the constitution require consulting the versioned Expo v57 docs before coding. Those docs were not fetched in this research (no fetch performed). — [source: `app/AGENTS.md`, constitution] (confidence: high that the rule exists)
- **Accessibility**: respecting reduced-motion settings is a typical requirement; whether the chosen mechanism honors it is unverified. — [ASSUMPTION] (confidence: low)
- **Stack constraints**: user-facing text must be pt-BR (not directly relevant here); client code must follow existing structure and prefer the simplest solution (YAGNI). — [source: constitution Principle V] (confidence: high)
- No performance metrics, device targets, or crash data are available. — [NEEDS CLARIFICATION]

## Evidence Against the Idea

- No evidence of user demand; no complaint or request is recorded anywhere in the repo. — [source: repo search] (confidence: medium)
- Platform defaults already animate push/pop on native; the gain may be marginal, especially on iOS where `slide_from_right` is ignored. — [source: native-stack types] (confidence: medium)
- Added motion can hurt perceived speed and users with motion sensitivity; the audience includes a mental-health population where calm UX matters. — [ASSUMPTION] (confidence: low)
- Animation-related dependencies have caused build/export bugs before in this project (`.specify/bugs/lottie-dotlottie-missing`, `export-dynamic-import-fail`). Risk is lower if only built-in navigator options are used, but this is unverified. — [source: `.specify/bugs/` titles] (confidence: low)
- Opportunity cost against core backlog work, e.g. recent specs 003–006 are all functional features. — [source: `specs/` listing] (confidence: low)

## Gaps & Open Questions

- [NEEDS CLARIFICATION: Who requested this and why (polish, course requirement, user feedback)?]
- [NEEDS CLARIFICATION: Which transitions count — stack pushes only, tab switches, auth to authenticated redirect, modals/bottom sheets?]
- [NEEDS CLARIFICATION: Same animation on Android and iOS, or platform-native defaults?]
- [NEEDS CLARIFICATION: Does the web build of the app need to behave the same way?]
- [NEEDS CLARIFICATION: Expo v57 docs for expo-router transitions not yet consulted (required by `app/AGENTS.md`).]
- [NEEDS CLARIFICATION: Reduced-motion/accessibility expectations.]
- [NEEDS CLARIFICATION: Is a full custom transition (e.g. via Reanimated) wanted, or are built-in navigator animation options enough?]

## Sources

- Local repository files cited above (no URLs fetched; no URL Trust Policy branch applied).
- Installed library type definitions under `app/node_modules/expo-router/build/react-navigation/`.
