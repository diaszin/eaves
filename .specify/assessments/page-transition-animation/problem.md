# Problem Definition: Navigation feels abrupt in the mobile app

- **Slug**: page-transition-animation
- **Created**: 2026-11-20
- **Inputs used**: intake.md, research.md

## Problem Statement

When moving between screens in the Eaves mobile app (`app/`), the transitions rely entirely on platform defaults, and tab switches have no transition at all. The requester wants navigation to feel more fluid and polished, but the underlying user need is not yet evidenced. (The idea arrived as a solution, "animation"; the implied problem is perceived abruptness or lack of polish in screen changes.)

## Affected Users & Stakeholders

- **Users**: Patients (students) using the mobile app for journal, PHQ-9 surveys, appointments and profile. They experience every screen change, so any lack of continuity or polish affects them. — [source: research.md; constitution roles]
- **Stakeholders**:
  - Requester / team — [NEEDS CLARIFICATION: who asked and why]; likely decides priority.
  - Course evaluators or project owners — [NEEDS CLARIFICATION: is this an academic deliverable?]
  - Developers — carry the maintenance and build-risk cost (past animation-related build bugs, per research.md).

## Goals

- Screen-to-screen navigation in the app feels continuous and intentional rather than abrupt. (Outcome stated qualitatively; see Open Questions.)
- The experience remains calm and unobtrusive for a mental-health audience. — [ASSUMPTION, from research.md]
- Navigation does not feel slower or less responsive than today.

## Non-Goals

- The web `platform/` backoffice (explicitly excluded by the requester). — [source: research.md scope]
- Changes to navigation structure, routes, or screen content.
- Animations inside screens (bottom sheets, success animations, per-component effects) unless later brought in scope.
- Any server/API change.

## Success Metrics

- Qualitative: the requester and a small sample of users judge transitions as smoother than before (baseline: platform defaults, no tab transition). — label: qualitative
- No regression in perceived responsiveness; navigation latency not noticeably worse (baseline: unknown, not measured). — [NEEDS CLARIFICATION: any measurable threshold, e.g. frame drops]
- No new build/export failures on supported targets (baseline: currently builds; prior animation-related bugs exist). — measurable pass/fail
- Respects the device reduced-motion setting. — [ASSUMPTION: required; confirm]

## Cost of Inaction

Low and non-functional. The app keeps working with OS-default push/pop and instant tab switches. The cost is a less polished feel, with no recorded user complaints or functional blockers. If this is an academic or presentation deliverable, the cost could be higher. — [source: research.md; ASSUMPTION on impact]

## Open Questions

- [NEEDS CLARIFICATION: Who requested this and what triggered it (user feedback, polish, course requirement)?]
- [NEEDS CLARIFICATION: Which transitions are in scope: stack pushes, tab switches, auth to authenticated redirect, modals?]
- [NEEDS CLARIFICATION: Same look on Android and iOS, or platform-native behavior?]
- [NEEDS CLARIFICATION: Must the web build of the app behave the same?]
- [NEEDS CLARIFICATION: Reduced-motion and accessibility expectations.]
- [NEEDS CLARIFICATION: How will "smoother" be judged, and by whom?]
- [NEEDS CLARIFICATION: Expo v57 docs (required by `app/AGENTS.md`) not yet consulted.]
