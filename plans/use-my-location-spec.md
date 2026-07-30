# Spec: "Use My Location" Button

## Problem Statement

Users currently must manually enter latitude and longitude coordinates to add a weather location. For non-technical users or those unfamiliar with Singapore's coordinate system, this is cumbersome and error-prone. A one-click geolocation button would streamline the workflow and reduce friction.

## Solution

Add a "Use my location" button alongside the existing "Add Location" button in the location sidebar. When clicked, the button:
1. Requests the user's GPS position via the browser's Geolocation API
2. Displays a browser permission dialog (standard, no custom dialog needed)
3. If permission is granted, submits the coordinates to the backend, which automatically resolves the nearest Singapore forecast area
4. Adds the location to the saved list and navigates to it
5. If permission is denied or geolocation fails, displays an inline error message explaining why the feature is unavailable

## User Stories

1. As a user, I want to click a "Use my location" button, so that I can add my current location without manually entering coordinates
2. As a user, I want the browser to show a permission prompt when I click "Use my location", so that I have control over sharing my location
3. As a user, I want my location to be automatically added to the sidebar after granting permission, so that I can immediately see the weather for my area
4. As a user, I want to see the nearest Singapore forecast area label on my newly-added location, so that I understand which named area the forecast covers
5. As a user, I want to see an error message if I deny the location permission, so that I understand why the feature didn't work
6. As a user, I want to see an error message if geolocation times out or is unavailable, so that I understand the feature failed and why
7. As a user, I want the button to show "Locating…" while waiting for the location, so that I know something is happening
8. As a user, I want the button to be disabled while locating, so that I don't accidentally click it multiple times
9. As a user, I want to still be able to manually enter coordinates via the existing "Add Location" form, so that I have a fallback if geolocation doesn't work

## Implementation Decisions

- **Location of feature**: Add button to the existing `AddLocationForm` component, visible in its collapsed state (when `isAdding` is false). No changes to form structure or other components.
- **Permission flow**: Use the browser's native `navigator.geolocation.getCurrentPosition()` API, which handles the permission prompt automatically. No custom permission UI.
- **Coordinate accuracy**: Request high accuracy (`enableHighAccuracy: true`) with a 10-second timeout, balancing precision against user wait time.
- **Error handling**: Map specific geolocation error codes to user-friendly messages:
  - Code 1 (PERMISSION_DENIED) → "Use my location is unavailable — location access was denied."
  - Code 2/3 (POSITION_UNAVAILABLE/TIMEOUT) → "Use my location is not available right now."
  - Backend rejection (out of bounds, duplicate) → pass through the backend error message
- **State management**: Use two new local useState hooks (`isLocating` and `locationError`) in `AddLocationForm`; no changes to the global store, which already handles location creation and list refresh.
- **Nearest-area matching**: Reuse existing backend logic (`nearestAreaName()` in weather.ts), which runs automatically during location creation. No client-side distance calculation needed.
- **Button styling**: Match the existing "Add Location" button style (glass morphism, Tailwind classes), using the `LocationIcon` from the icons component.

## Testing Decisions

**What makes a good test**: A test should verify the user-visible behavior (button works, location appears, errors show) without mocking internal implementation details. Tests should work against the running app in a real browser, not against isolated functions.

**Testing approach**: End-to-end browser tests at the UI seam, using the app as a user would interact with it.

**Modules under test**:
- `frontend/src/components/AddLocationForm.tsx` (the only modified file)
- The integration between the button, geolocation, and the existing location creation flow (no new seams)

**Test scenarios**:
1. **Happy path**: Click "Use my location" → allow permission → new location appears in sidebar with forecast area label
2. **Permission denied**: Click "Use my location" → deny permission → error message appears saying access was denied
3. **Geolocation unavailable**: Click "Use my location" on a system without geolocation support → error message appears
4. **Manual form still works**: "Add Location" form still functions with manual lat/lng input (regression test)
5. **Button state**: Button shows "Locating…" while waiting; is disabled during the request

**Prior art**: The existing codebase has no automated browser tests. Manual testing via `npm run dev` and browser inspection is the current practice. These scenarios should be verified manually before considering the feature complete.

## Out of Scope

- Replacing the manual lat/lng form with a searchable area dropdown (that's Feature Task #3 in the README)
- Storing or persisting geolocation preferences
- Requesting continuous location updates or background tracking
- Support for non-Singapore coordinates (backend already rejects out-of-bounds; feature inherits that constraint)
- Custom permission dialogs or prompts (use the browser's native UI)
- HTTPS enforcement (the feature works on `http://weather-starter.localhost` as documented in the README)

## Further Notes

- The feature is frontend-only; no backend changes are required because the nearest-area matching logic already exists and runs automatically.
- The button is always visible and functional; users can click it at any time, and it works independently of the manual form state.
- Error messages are intentionally brief and user-friendly, matching the tone of existing error messages in the app.
