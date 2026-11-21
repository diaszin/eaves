# Data Model: Home Appointment Cascade

## Scope

This feature adds no persisted or API data. It consumes the existing `Appointment` records returned by the appointment service and changes only how eligible cards first appear.

## Existing Entity

### Appointment

Defined in `app/src/features/appointments/services/appointment.type.ts`.

| Field | Type | Use in this feature |
|---|---|---|
| `id` | `number` | Stable identity for list keys and one-time entrance eligibility |
| `initialDate` | `Date` | Existing card content; unchanged |
| `endDate` | `Date` | Existing card content and cancellation eligibility; unchanged |
| `status` | `AppointmentStatus \| undefined` | Existing card content; unchanged |
| `professional` | `AppointmentProfile` | Existing professional details shown on the card; unchanged |

`AppointmentStatus` remains `"scheduled" | "cancelled"`. No validation, state transition, ordering, or relationship changes are introduced.

## Ephemeral Presentation State

The list may keep an in-memory set of appointment IDs that were visible when the first non-empty result was presented during the current home-page visit. Only those IDs are eligible for the entrance animation. The set is discarded when that page visit ends; it is not written to storage or sent to the API.

Reduced-motion preference controls presentation only. When enabled, eligible cards render in their final state without a staggered entrance. Appointment content and cancellation state remain independent of animation state.
