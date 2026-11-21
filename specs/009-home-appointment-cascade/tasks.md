# Tasks: Home Appointment Cascade

**Input**: Design documents from `/specs/009-home-appointment-cascade/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test tasks are included because the feature specification does not request TDD and the app has no existing component-test harness for this template. Manual scenarios are covered by `quickstart.md`.

**Organization**: Tasks are grouped by user story so the entrance effect and its lifecycle behavior can be implemented and checked incrementally.

## Phase 1: Setup

**Purpose**: No project initialization is needed; the Expo app and Reanimated dependency are already configured.

No tasks.

---

## Phase 2: Foundational

**Purpose**: No shared infrastructure blocks this UI-only feature.

No tasks.

---

## Phase 3: User Story 1 - Entrada sequencial dos agendamentos (Priority: P1) — MVP

**Goal**: Animate only the appointment cards visible on the first screen with a top-to-bottom fade and slight upward movement, respecting reduced motion and preserving existing content.

**Independent Test**: With multiple appointments, verify that first-screen cards enter in order and within 1.5 seconds, while below-the-fold cards stay static. Also check one appointment, the empty state, and reduced motion.

### Implementation for User Story 1

- [X] T001 [US1] Capture the IDs of only the initially visible appointments once the first non-empty list is shown in `app/src/templates/get-recently-appointments.tsx`; use `Appointment.id` as defined in `specs/009-home-appointment-cascade/data-model.md#appointment`, and preserve `Appointment.initialDate`, `Appointment.endDate`, `Appointment.status`, and `Appointment.professional` as defined in that same table.
- [X] T002 [US1] Add a one-shot Reanimated fade-and-subtle-up entrance with a consistent index-based stagger to eligible cards in `app/src/templates/get-recently-appointments.tsx`; skip displacement and stagger when reduced motion is enabled, keep non-eligible cards in their final state, and keep the total visible-card entrance within 1.5 seconds.

**Checkpoint**: The first viewport animates in order, and empty, single-item, reduced-motion, and below-the-fold cases remain correct.

---

## Phase 4: User Story 2 - Uso contínuo da lista (Priority: P2)

**Goal**: Keep scrolling and appointment actions available during the entrance; do not replay for existing cards after refresh or scroll, but run a new sequence when the home page is opened again.

**Independent Test**: Use a card action while the entrance runs, refresh appointment data, scroll through the list, then leave and reopen the home page. Existing rows must not replay within the same visit, and the new visit must run the sequence once.

### Implementation for User Story 2

- [X] T003 [US2] Preserve stable list keys and existing appointment-card interaction state while applying the entrance in `app/src/templates/get-recently-appointments.tsx`; ensure a query refresh or scroll does not restart an already presented card, and a new home-page visit creates a fresh one-time entrance.

**Checkpoint**: The list remains usable during animation and its entrance lifecycle matches one run per home-page visit.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validate the app build and feature scenarios without changing unrelated behavior.

- [X] T004 [P] Run `yarn lint` from `app/` using the script in `app/package.json`; resolve only diagnostics introduced by this feature.
- [X] T005 [P] Run `yarn build:web` from `app/` using the script in `app/package.json`; resolve only failures introduced by this feature.
- [ ] T006 Verify the manual scenarios in `specs/009-home-appointment-cascade/quickstart.md` on an available native runtime and web, including reduced motion, refresh, scrolling, and card actions.

### Validation Record

- `yarn lint` was run. It reports two existing errors: the `Date.now()` purity diagnostic in the existing appointment status calculation and synchronous `setState` in `app/src/components/ErrorBottomSheet.tsx`. The cascade adds no lint diagnostics.
- `yarn tsc --noEmit` and `yarn build:web` passed; the web export generated 63 routes.
- T006 remains pending because the visual scenarios were not exercised on a native runtime or web session.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tasks; the app and animation dependency already exist.
- **Foundational (Phase 2)**: No tasks; no shared infrastructure is required.
- **User Stories (Phases 3–4)**: T001 → T002 → T003. The initial visible-row snapshot is required before the entrance can be applied; lifecycle and interaction verification builds on that implementation.
- **Polish (Phase 5)**: T004 and T005 can run in parallel after implementation; T006 follows both.

### User Story Dependencies

- **User Story 1 (P1)**: Starts immediately; no dependency on another story.
- **User Story 2 (P2)**: Depends on the entrance behavior from User Story 1 so its refresh, scroll, and interaction guarantees can be verified against the actual animation.

### Parallel Opportunities

- **User Story 1**: No parallel implementation tasks; T001 and T002 modify the same list and must be completed in order.
- **User Story 2**: No parallel implementation tasks; T003 depends on the state and animation introduced by User Story 1.
- **Polish**: T004 and T005 are independent validation commands and can run in parallel.

---

## Parallel Example: User Story 1

There are no parallel implementation tasks in User Story 1 because both tasks modify `app/src/templates/get-recently-appointments.tsx`. Complete T001 before T002.

## Parallel Example: User Story 2

There are no parallel implementation tasks in User Story 2. Start T003 after T001 and T002.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 and T002 to establish initial-viewport eligibility and the cascade.
2. Independently validate the P1 scenarios: order, duration, empty/single appointment, below-the-fold behavior, and reduced motion.
3. Continue to T003 for refresh, scrolling, and interaction lifecycle guarantees before considering the feature complete.

### Incremental Delivery

1. Deliver User Story 1 as the visual MVP.
2. Add User Story 2 lifecycle and usability guarantees.
3. Run T004 and T005, then complete the quickstart checks in T006.
