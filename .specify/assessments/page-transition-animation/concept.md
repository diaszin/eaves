# Concept: Smoother screen transitions in the mobile app

- **Slug**: page-transition-animation
- **Created**: 2026-11-20
- **Recommended option**: A — Built-in navigator transition settings

## Options

### Option A — Built-in navigator transition settings
- **Sketch**: Use the transition options the navigators already offer (per-screen stack animation, tab cross-fade or shift) so screen pushes and tab switches get a consistent, subtle transition. The user sees a gentle slide or fade between screens and a soft transition between tabs. No new visual components.
- **Appetite**: small (days, likely less)
- **Trade-offs**:
  - Wins: no new dependencies, low build risk, follows platform conventions, easy to revert, and the options are present in the installed library types (research.md).
  - Sacrifices: limited customization. `slide_from_right` is Android-only and falls back to the default on iOS, so the iOS look may barely change. Web behavior is unverified.
- **Rabbit holes**:
  - Platform differences between Android and iOS.
  - Auth to authenticated redirects (a `Redirect` may bypass or glitch the animation).
  - Expo v57 docs have not been checked and may change option names or behavior.

### Option B — Custom transitions with Reanimated
- **Sketch**: Build bespoke enter/exit motion (shared elements, custom easing, per-screen choreography) using the already installed animation libraries, so the look is identical on both platforms and can be branded.
- **Appetite**: medium (weeks)
- **Trade-offs**:
  - Wins: full control and a uniform cross-platform feel.
  - Sacrifices: much more code to maintain and test, risk of jank on low-end devices, and it conflicts with the project's YAGNI principle. Prior animation-related build bugs raise the risk (research.md).
- **Rabbit holes**: gesture/back-swipe interplay, interaction with native screens, reduced-motion handling, and keeping the web build working.

### Option C — Do nothing
- **Sketch**: Keep platform defaults. Revisit if user feedback or a course requirement shows a real need.
- **Appetite**: none
- **Trade-offs**:
  - Wins: zero cost or risk; time goes to functional features.
  - Sacrifices: the requester's request goes unmet and the polish gap stays. Cost of inaction is low (problem.md).
- **Rabbit holes**: none.

## Recommendation

Option A. The problem is low-severity and unevidenced, so it should get the smallest effort that can meet the stated goals (continuous, calm, no slowdown). Option A does that with no new dependencies and is easily reversible. Option B is not justified without evidence of need. Option C is the fallback if the open questions show the request has no real driver.

## Out of Scope (for the recommended option)

- The web `platform/` backoffice.
- Changes to routes, navigation structure, or screen content.
- In-screen animations (bottom sheets, success animations, component effects).
- Custom or shared-element transitions.
- Any server/API change.

## Assumptions to Validate

- The tab and stack animation options work as documented in Expo v57 (docs not yet consulted, as `app/AGENTS.md` requires).
- A single setting yields an acceptable look on both Android and iOS despite `slide_from_right` being Android-only.
- Auth redirects and the app's web build are not broken by the settings.
- Reduced-motion preferences are honored, or the team accepts that they may not be.
- The requester's expectation is "smoother and subtle" and not "distinctive or branded" motion.
