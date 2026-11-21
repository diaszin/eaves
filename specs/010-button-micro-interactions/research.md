# Research: Button Micro-interactions

## Decision 1: One shared component wrapping Reanimated

- **Decision**: Create `PressableScale` in `app/src/shared/components/pressable-scale.tsx`: an animated wrapper around React Native `Pressable` driven by Reanimated shared values (`withTiming` on press-in, `withSpring` back on press-out), applied via `useAnimatedStyle`.
- **Rationale**: Reanimated 4.5.1 is already installed and used (`useReducedMotion`, web fade). Animations run on the UI thread, which meets SC-002/SC-006. A single component satisfies FR-011 and keeps FR-007 intensity rules in one place.
- **Alternatives considered**: `TouchableOpacity` `activeOpacity` only (no scale, no hover, no state transitions, fails FR-001 intent); per-file ad-hoc animations (duplicated, inconsistent); a third-party button library (new dependency, restyling risk against FR-003).

## Decision 2: Intensity presets by size (FR-007)

- **Decision**: Three presets: `button` (scale 0.97, opacity 0.9), `card` (scale 0.985, opacity 0.92), `icon` (scale 0.9, opacity 0.85). Press-in about 90 ms, release spring about 150-200 ms. Values are starting points tunable during manual verification.
- **Rationale**: Large surfaces need subtler scale to avoid visible layout shift; small icons need more to be noticed. Scale is a transform, so it never moves neighbouring elements (edge case: small icons).
- **Alternatives considered**: One value for everything (too weak on icons, too strong on cards).

## Decision 3: Reduced motion (FR-008)

- **Decision**: When `useReducedMotion()` is true, skip scale and animate only opacity (to about 0.7), with no spring.
- **Rationale**: Matches the pattern already used for screen transitions; satisfies "never rely on movement alone" and SC-005.
- **Alternatives considered**: Disabling feedback entirely (loses confirmation of touch).

## Decision 4: Disabled and loading states (FR-004, FR-005)

- **Decision**: `disabled` turns off (no separate `loading` prop: a loading button is `disabled` while its request is pending, which is how the screens already work) press animation and the underlying `onPress`; opacity eases to a dimmed value with `withTiming` instead of switching abruptly. Existing `ActivityIndicator` content stays as is; the component only guards re-taps and smooths the dim transition.
- **Rationale**: Existing screens already pass `disabled` and render spinners; we keep their behavior (assumption in spec) and only smooth it.
- **Alternatives considered**: Built-in loading spinner in the component (would change visuals, violates FR-003).

## Decision 5: Selected-state transitions (FR-006)

- **Decision**: Selectors (emotion buttons, hour badge, date chips, survey answers) keep their NativeWind class switch for color but gain a short opacity/scale settle via the shared component; color fade is done with an animated background only where the element already has a distinct selected color (`EmotionButton`, `HourBadge`, date chips in `appointments-create`), using `interpolateColor` on a shared value driven by the `selected` flag.
- **Rationale**: NativeWind classes switch instantly; a small animated overlay/background interpolation is the least invasive way to smooth it without restyling.
- **Alternatives considered**: Leaving selectors instantaneous (fails FR-006).

## Decision 6: Web hover (FR-009)

- **Decision**: Use `Pressable`'s `onHoverIn`/`onHoverOut` (supported by react-native-web) to ease opacity slightly (about 0.95) and set pointer cursor; no-op on native.
- **Rationale**: Native touch has no hover; web needs a cue before click per the edge case.
- **Alternatives considered**: CSS-only hover via NativeWind `hover:` classes (works on web, but would not compose with animated opacity and reduced-motion handling).

## Decision 7: Scroll and long press edge cases

- **Decision**: Rely on `Pressable` semantics: press-out is fired when a scroll gesture takes over or the finger leaves the pressable, resetting the animation without calling `onPress`. Reset values also on unmount/blur is automatic since values are per component instance.
- **Rationale**: Covers drag-out, scroll-cancel and stuck-state edge cases without custom gesture code.

## Decision 8: Scope of replaced elements (FR-001, FR-010, FR-014)

- **Decision**: Migrate all `TouchableOpacity`/`Pressable` usages found in `app/src` (about 25 files): auth screens and signup steps, appointments (create screen, hour badge, employees card, header close), personal journal (card, emotion button, create screen), profile (menu item, edit, change password), surveys (answers button, PHQ header action), templates (daily survey, recent appointments actions, create-journal card, legal terms Android), and the home tab's profile header button via `headerRight`.
- **Not migrated**: the Error/Success bottom sheets (they have no buttons; they only import `TouchableOpacity` unused, which is removed), the default tab bar buttons and navigator back buttons that the app does not customize (FR-014). Inline text `Link` elements embedded in sentences (6 usages: login, signup, forgot/reset password) are plain text links, not buttons; they stay unchanged. This is recorded as an assumption in the spec.
- **Rationale**: Inline links cannot carry a transform, and wrapping them would change text layout (violates FR-003).

## Decision 9: Shared-element card (employees-card)

- **Decision**: `EmployeesCard` keeps its web-only wrapper `View` (view-transition hero) and the existing shared transition tag; only the outer `TouchableOpacity` is replaced with `PressableScale` preset `card`. The web wrapper stays inside the pressable.
- **Rationale**: Feature 008 (web Hero transition) depends on that tree shape; scaling the outer pressable does not alter the wrapped element identity.

## Open Questions

None. All items from Technical Context are resolved.
