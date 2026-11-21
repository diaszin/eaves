# Quickstart: Validate Button Micro-interactions

## Prerequisites

- Node and Yarn set up for `app/` (`yarn install` already run).
- An Android emulator/device or iOS simulator, plus a browser for the web build.
- Backend reachable per the app's existing `.env`, with a demo patient account.

## Automated checks (from `app/`)

```bash
yarn lint
yarn build:web
```

Expected: both finish with no errors. Confirm no remaining direct `TouchableOpacity`/`Pressable` usages for action elements:

```bash
grep -rnE "TouchableOpacity|<Pressable" src --include=*.tsx
```

Expected: only the shared component itself (and intentionally excluded elements listed in research.md Decision 8).

## Manual scenarios

Run on Android or iOS (`yarn android` / `yarn ios`) and on web (`yarn web`).

1. **Press feedback (US1)**: On login, signup, create appointment, journal, edit profile and change password screens, press and hold each action button. Expect a quick scale-down and slight dim; on release a smooth return and the same action as before. Drag the finger off a button before releasing: it resets and the action does not fire.
2. **States (US2)**: Submit login with valid data and watch the button during the request: it stays dimmed, shows its existing spinner, and a second tap does nothing. Tap a disabled button: no animation, no action.
3. **Tappable items (US3)**: Press profile menu rows, appointment/professional/journal cards, emotion buttons, hour badges, date chips, survey answers and the header profile icon. Expect the same style, subtler on cards and stronger on icons. Select an emotion/hour/answer: selected color eases in.
4. **Reduced motion (US4)**: Enable "reduce motion" in the OS (or browser/OS setting on web) and repeat step 1. Expect no scale, only a subtle opacity change.
5. **Web hover**: In the browser, hover buttons: pointer cursor and slight opacity change before clicking.
6. **Edge cases**: Tap rapidly several times, hold a long press, scroll a list starting on a card, and navigate away mid-press: no stuck pressed state and no double submission.
7. **No regressions**: Complete login, signup, schedule an appointment, cancel one, write a journal entry, answer the survey, edit profile; each ends as before. Screen transitions (features 007/008) and the home cascade (009) behave unchanged.

## Pass criteria

All scenarios above behave as described, with response starting visibly instant (under 100 ms) and no visible scroll or navigation stutter.
