# Quickstart: Home Appointment Cascade

## Prerequisites

- Install the existing `app/` dependencies from `app/yarn.lock`.
- Use the project's normal development environment and API connection.
- Have a patient test account with multiple appointments, including enough items to extend below the first screen. Also verify the empty and single-appointment states when available.

## Automated Checks

From `app/`:

```powershell
yarn lint
yarn build:web
```

Expected: lint completes without errors and Expo exports the web app successfully.

## Visual Verification

Run the app using the normal development runtime (`yarn start`) and check on an available native device/simulator and web:

1. Open the home page with several appointments. Confirm only the cards visible in the first viewport fade in while moving slightly upward, in top-to-bottom order.
2. Confirm the visible cards finish entering within 1.5 seconds after the list is available.
3. Scroll below the first viewport. Confirm those cards appear normally and do not animate.
4. Scroll during the entrance and use an available card action. Confirm scrolling and the action remain responsive.
5. Refresh the appointment data without leaving the page. Confirm already displayed cards do not replay the entrance.
6. Leave and reopen the home page. Confirm the first-viewport sequence runs once for that new visit.
7. With the device's reduced-motion preference enabled before launching the app, confirm cards appear without vertical movement or stagger delay.
8. Check the no-appointments and one-appointment states. Confirm the existing empty state is unchanged and the single card has no wait for subsequent items.

The animation does not require test data changes, service/API changes, or a new test dependency.
