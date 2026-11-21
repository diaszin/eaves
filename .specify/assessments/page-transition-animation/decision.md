# Decision: Smoother screen transitions in the mobile app

- **Slug**: page-transition-animation
- **Decided**: 2026-11-20
- **Verdict**: needs-clarification
- **Artifacts reviewed**: intake.md, research.md, problem.md, concept.md

## Scorecard

| Criterion | Rating | Justification |
|-----------|--------|---------------|
| Problem validity | weak | The "problem" is perceived abruptness inferred from a solution-shaped request; no user complaint, ticket, or data exists (research.md, problem.md). |
| Evidence strength | weak | Technical feasibility is well sourced from the repo and installed types, but demand and motivation rest on assumptions. Expo v57 docs, required by `app/AGENTS.md`, were not consulted. |
| Value vs. inaction | weak | Cost of inaction is low and non-functional; the app works with platform defaults (problem.md). It could rise if this is an academic deliverable, which is unknown. |
| Feasibility / appetite | strong | Option A is small, uses options already in the installed navigator, needs no new dependencies, and is easy to revert (concept.md). |
| Strategic fit | adequate | Consistent with the constitution's YAGNI preference and prior polish work (spec 002), but not tied to any stated project goal or role requirement. |
| Risk posture | adequate | Main risks are known (iOS fallback of `slide_from_right`, auth redirects, web behavior, reduced motion) and are low-impact; none are validated yet. |

## Verdict & Rationale

Needs-clarification. The idea is cheap and low-risk to do (feasibility strong, risk adequate), but a `go` requires adequate evidence of a real problem, and there is none: no known requester, trigger, or user signal, and the problem was inferred from a solution. Given the tiny appetite, this is a quick fix: if the requester confirms a real driver (for example a course or presentation expectation) and the scope questions get answered, the idea can move to `go` with Option A without further research. If no driver exists, killing or deferring it is a legitimate outcome.

## If needs-clarification

- **Blocking questions**:
  - [NEEDS CLARIFICATION: Who requested this and why (user feedback, polish, course requirement)? Is there a deadline or deliverable that depends on it?]
  - [NEEDS CLARIFICATION: Which transitions are in scope: stack pushes, tab switches, auth to authenticated redirect, modals?]
  - [NEEDS CLARIFICATION: Same look on Android and iOS, or platform-native? Must the web build match?]
  - [NEEDS CLARIFICATION: What do Expo v57 docs say about stack and tab transition options and reduced-motion handling (required by `app/AGENTS.md`)?]
- **Revisit stage**: research (consult Expo v57 docs and confirm the driver), then define (update goals and metrics if the driver is confirmed). Shape can be skipped; Option A already stands.
