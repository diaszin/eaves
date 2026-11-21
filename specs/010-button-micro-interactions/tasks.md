---

description: "Task list for button micro-interactions"
---

# Tasks: Button Micro-interactions

**Input**: Design documents from `/specs/010-button-micro-interactions/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested. The app has no unit/widget test suite; verification is `yarn lint`, `yarn build:web` and the manual scenarios in [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story. All paths are relative to the repository root; app code lives in `app/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story the task belongs to (US1-US4)

## Phase 1: Setup

- [ ] T001 Read the Expo SDK 57 docs relevant to `Pressable`, Reanimated 4 and react-native-web hover (per `app/AGENTS.md`) and note any API differences before coding.
- [X] T002 Capture the inventory of action elements to migrate: run `grep -rnE "TouchableOpacity|<Pressable" app/src --include=*.tsx` and record the list (about 25 files, see plan.md Source Code) at the top of the PR description or a scratch note for use in Phase 3-5.

---

## Phase 2: Foundational (blocking)

**Purpose**: The shared component every story depends on.

- [X] T003 Create `app/src/shared/components/pressable-scale.tsx`: a typed wrapper around React Native `Pressable` with a `size` prop (`button` | `card` | `icon`) using the preset scale/opacity values from [data-model.md](./data-model.md) (Interaction preset: `button`, `card`, `icon`), animated with Reanimated (`withTiming` ~90 ms on press-in, `withSpring` on release) through `useSharedValue`/`useAnimatedStyle`. It MUST forward all `Pressable` props (`onPress`, `disabled`, `className`, `accessibility*`, `style`, `children`), keep `onPress` semantics unchanged, and reset on press-out/cancel without calling `onPress` (drag-out, scroll).
- [X] T004 In `app/src/shared/components/pressable-scale.tsx`, make the component usable with NativeWind `className` (use `cssInterop`/`styled` pattern already used in the app, or pass `className` through to the animated `Pressable`) and confirm it renders identically to the previous `TouchableOpacity` at rest (FR-003).

**Checkpoint**: `PressableScale` compiles and is ready to be adopted (FR-011).

---

## Phase 3: User Story 1 - Press feedback on main buttons (Priority: P1) MVP

**Goal**: Every main action button reacts instantly to press and releases smoothly, with unchanged behavior.

**Independent Test**: Quickstart scenario 1 on login, signup, create appointment, journal, edit profile, change password and PHQ.

- [X] T005 [P] [US1] Replace `TouchableOpacity` with `PressableScale` (`size="button"`) for action buttons in `app/src/features/auth/screens/login.tsx` (login submit, Microsoft button, terms button).
- [X] T006 [P] [US1] Same replacement in `app/src/features/auth/screens/forgot-password.tsx` and `app/src/features/auth/screens/reset-password.tsx` (submit buttons only; leave inline text `Link`s unchanged, per research.md Decision 8).
- [X] T007 [P] [US1] In `app/src/features/auth/screens/signup.tsx` only remove the unused `TouchableOpacity` and `Pressable` imports (it has no action buttons; the inline `Link` stays unchanged). Apply the same replacement in `app/src/features/auth/screens/signup_steps/auth_step_screen.tsx`, `app/src/features/auth/screens/signup_steps/communication_step_screen.tsx` and `app/src/features/auth/screens/signup_steps/personal_step_screen.tsx` (next/back/submit buttons).
- [X] T008 [P] [US1] Same replacement in `app/src/features/profile/screens/edit-profile.tsx`, `app/src/features/profile/screens/change-password.tsx` and `app/src/features/profile/screens/profile-menu.tsx` (save, change and logout buttons).
- [X] T009 [P] [US1] Same replacement in `app/src/features/personal-journal/screens/personal-journal-create.tsx` and `app/src/features/appointments/screens/appointments-create.tsx` (submit/confirm buttons and header close button as `size="icon"`; the date chips are handled in US3).
- [X] T010 [P] [US1] Same replacement in `app/src/features/surveys/screens/phq.tsx` (header action and submit buttons) and `app/src/templates/legal_terms/legal_terms.android.tsx` (accept/back button).
- [X] T011 [P] [US1] In `app/src/components/ErrorBottomSheet.tsx` and `app/src/components/SuccesssBottomSheet.tsx`, remove the unused `TouchableOpacity` import (these sheets have no action buttons today; if any button is added later it must use `PressableScale`).
- [X] T012 [US1] Run `yarn lint` and `yarn build:web` in `app/`; fix any type or lint errors introduced in T003-T011.

**Checkpoint**: Main buttons give press feedback; flows behave as before (SC-003).

---

## Phase 4: User Story 2 - Button state feedback (Priority: P2)

**Goal**: Disabled and loading states change smoothly and block repeated taps.

**Independent Test**: Quickstart scenario 2 (submit login and watch the button; tap a disabled button).

- [X] T013 [US2] In `app/src/shared/components/pressable-scale.tsx` (no separate `loading` prop; a loading button is `disabled` while pending), animate opacity with `withTiming` when `disabled` changes (dimmed value when disabled, back to 1 when cleared), suppress the press animation while disabled, and ensure `onPress` is not invoked while disabled (FR-004, FR-005).
- [X] T014 [P] [US2] Verify that submit buttons with loading state (`login.tsx`, `forgot-password.tsx`, `reset-password.tsx`, `edit-profile.tsx`, `change-password.tsx`, `personal-journal-create.tsx`, `appointments-create.tsx`, `phq.tsx` under `app/src/features/`) pass their pending flag to `disabled` so repeated taps are blocked; add `disabled={isPending}` where missing without changing the existing spinner visuals.
- [ ] T015 [US2] Run `yarn lint` in `app/` and execute quickstart scenario 2 manually.

**Checkpoint**: States are smooth and double submission is not possible.

---

## Phase 5: User Story 3 - Tappable items, cards and selectors (Priority: P3)

**Goal**: Cards, menu rows, selectors and icons share the same feedback, proportional to their size, with smooth selected-state changes.

**Independent Test**: Quickstart scenario 3.

- [X] T016 [P] [US3] Replace `TouchableOpacity` with `PressableScale` (`size="card"`) in `app/src/features/personal-journal/components/personal-journal-card.tsx`, `app/src/templates/personal-journal-create-card.tsx` and `app/src/templates/get-recently-appointments.tsx` (card and action buttons).
- [X] T017 [US3] In `app/src/features/appointments/components/employees-card.tsx`, replace the outer `TouchableOpacity` with `PressableScale` (`size="card"`), keeping the web-only wrapper `View` and the shared transition tag untouched (research.md Decision 9); verify the Hero transition from feature 008 still works on web.
- [X] T018 [P] [US3] Replace with `PressableScale` (`size="button"`) in `app/src/features/profile/components/profile-menu-item.tsx` and `app/src/templates/daily-survey.tsx`.
- [X] T019 [P] [US3] Replace with `PressableScale` in `app/src/features/surveys/components/answers-button.component.tsx`, `app/src/features/personal-journal/components/emotion-button.tsx` and `app/src/features/appointments/components/hour-badge.tsx`, and add a smooth selected/unselected background transition driven by the existing `active`/selected prop (research.md Decision 5, FR-006).
- [X] T020 [P] [US3] In `app/src/features/appointments/screens/appointments-create.tsx`, replace the date-chip `Pressable` with `PressableScale` and apply the same smooth selected-state transition.
- [X] T021 [P] [US3] In `app/src/app/(app)/(authenticated)/(home)/_layout.tsx`, replace the header profile `TouchableOpacity` with `PressableScale` (`size="icon"`); leave the default tab bar buttons untouched (FR-014).
- [ ] T022 [US3] Run `yarn lint` and `yarn build:web`, then execute quickstart scenario 3.

**Checkpoint**: Every tappable action element in the inventory from T002 uses `PressableScale` (SC-001).

---

## Phase 6: User Story 4 - Accessibility and web hover (Priority: P3)

**Goal**: Reduced motion removes scale; web gets hover feedback.

**Independent Test**: Quickstart scenarios 4 and 5.

- [X] T023 [US4] In `app/src/shared/components/pressable-scale.tsx`, use `useReducedMotion()` from `react-native-reanimated` (same pattern as `app/src/shared/navigation/transitions.ts`) to fix scale at 1 and use an opacity-only pressed value (about 0.7) with no spring (FR-008, SC-005; see data-model.md reduced-motion variant).
- [X] T024 [US4] In `app/src/shared/components/pressable-scale.tsx`, add web hover feedback using `onHoverIn`/`onHoverOut` (slight opacity ease, pointer cursor), no-op on native (FR-009); preserve any `onHoverIn`/`onHoverOut` passed by callers.
- [ ] T025 [US4] Run `yarn build:web` and execute quickstart scenarios 4 and 5.

**Checkpoint**: Accessibility and web behavior verified.

---

## Phase 7: Polish & Cross-Cutting

- [X] T026 Re-run the inventory grep from T002; confirm the only remaining `TouchableOpacity`/`Pressable` usages are inside `pressable-scale.tsx` or intentionally excluded (FR-010, FR-014).
- [ ] T027 Tune preset values (scale, durations) on a real Android/iOS device so feedback is noticeable but subtle; update [data-model.md](./data-model.md) and [research.md](./research.md) if values change.
- [ ] T028 Execute the full [quickstart.md](./quickstart.md) (scenarios 1-7), including regression checks for screen transitions (007/008) and the home cascade (009), and the edge cases (rapid taps, long press, scroll start, navigate mid-press).
- [ ] T029 Final `yarn lint` and `yarn build:web` in `app/` with no errors.

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 (blocking) → Phases 3-6 → Phase 7.
- US1 (P1) depends only on Phase 2. US2 depends on Phase 2 and touches the same component file as US4 (T013, T023, T024 are sequential in `pressable-scale.tsx`). US3 depends on Phase 2; T019/T020 touch files also edited in US1 (`appointments-create.tsx`), so run T009 before T020.
- Within a phase, [P] tasks touch different files and can run in parallel.

### Parallel example (US1)

T005, T006, T007, T008, T009, T010 and T011 edit disjoint files and can be done together after T004.

## Implementation Strategy

- **MVP**: Phases 1-3 (shared component + main buttons). Stop and validate with quickstart scenario 1.
- **Incremental**: add US2 (states), then US3 (cards/selectors/icons), then US4 (reduced motion, hover); run lint/build at each checkpoint.
- Note: reduced motion (US4) is small and low risk; if shipping US1 alone, do T023 with it so no release lacks the accessibility fallback.
