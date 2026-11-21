# Data Model: Button Micro-interactions

No persisted data, API payloads or database changes. The feature only introduces in-memory presentation state for one component.

## Entity: Action element (interaction state)

Per-instance, transient, never stored or sent anywhere.

| State | Meaning | Visual response |
|-------|---------|-----------------|
| `idle` | Not touched | Scale 1, opacity 1 |
| `hovered` (web only) | Pointer over element | Opacity eases to about 0.95 |
| `pressed` | Finger/pointer down | Scale and opacity per preset; no scale under reduced motion |
| `disabled` / `loading` | Not accepting input | Dimmed opacity eased in; no press animation; `onPress` not fired |
| `selected` | Chosen option in a selector | Background/opacity transitions smoothly from unselected |

Transitions: `idle → hovered → idle`; `idle|hovered → pressed → idle` (release or cancel by drag-out/scroll); `any → disabled|loading → idle` when the existing disabled condition clears.

Rules: `pressed` is entered only when not disabled (FR-005); leaving `pressed` by cancel never triggers `onPress` (US1 scenario 3).

## Entity: Interaction preset

Static configuration, defined in code.

| Preset | Used for | Pressed scale | Pressed opacity |
|--------|----------|---------------|-----------------|
| `button` | Primary/secondary buttons, menu rows, selectors | 0.97 | 0.9 |
| `card` | Appointment, professional and journal cards | 0.985 | 0.92 |
| `icon` | Header icons, small round buttons | 0.9 | 0.85 |

Reduced-motion variant for every preset: scale fixed at 1, pressed opacity about 0.7.
