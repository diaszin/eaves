# Research: Home Appointment Cascade

**Date**: 2026-11-20

## Decisions

### Reuse React Native Reanimated 4.5.1

- **Decision**: Implement the card entrance with the Reanimated version already installed in `app/`; do not add an animation dependency.
- **Rationale**: The app already uses Reanimated for screen transitions, reduced-motion handling, and an animated professional card. Expo SDK 57 recommends Reanimated 4.5.1 and documents Android, iOS, and web support.
- **Alternatives considered**: React Native's core `Animated` API or an additional animation package. Neither is needed, and either would add a second pattern or dependency.

### Use a one-shot entering builder for initially visible cards

- **Decision**: Use Reanimated's `FadeInDown` entering builder with a 250 ms duration, a 70 ms index-based delay, and a 10-point initial vertical offset. Gate the builder to cards visible when the first non-empty list is shown and track eligibility by appointment ID for that page visit.
- **Rationale**: The builder expresses the required fade and upward movement declaratively, supports timing, delay, and custom initial values, and is memoized per row. The project lint rejects direct shared-value mutation from component effects, so the entering builder avoids introducing that lint error. Stable IDs and a one-time visibility snapshot prevent scrolling or query refreshes from replaying the entrance.
- **Alternatives considered**: Direct shared-value updates with `withDelay`/`withTiming` in an effect are rejected by the project's React Compiler lint. Animating every rendered/virtualized row could affect rows below the fold and extend the cascade. Replaying whenever a row mounts would make scrolling produce unexpected motion.

### Respect reduced motion without stagger or displacement

- **Decision**: Use the existing `useReducedMotion` approach; when enabled, render the same cards at their final visual state without the animated offset or delay.
- **Rationale**: The app already uses this hook for navigation transitions. Reanimated documents synchronous access to the reduced-motion preference on Android, iOS, and web.
- **Alternatives considered**: Adding a custom accessibility-preference subscription would duplicate the app's existing pattern and is unnecessary for this one-time entrance.

## Applicable Guidance

- Expo SDK 57 documents Reanimated 4.5.1 as the recommended version and lists Android, iOS, and web as supported platforms: [Expo SDK 57 Reanimated reference](https://docs.expo.dev/versions/v57.0.0/sdk/reanimated/).
- Reanimated 4.x documents `FadeInUp`, timing and delay modifiers, initial values, and recommends defining animation builders outside components or memoizing them: [Entering and exiting animations](https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations/).
- Reanimated documents `useReducedMotion` and notes that its returned value reflects the preference when the app starts; changing the system preference does not itself rerender components: [useReducedMotion](https://docs.swmansion.com/react-native-reanimated/docs/device/useReducedMotion/).

No unresolved technology or integration questions remain for planning.
