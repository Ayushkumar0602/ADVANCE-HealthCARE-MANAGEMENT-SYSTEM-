# Add stats script — Technical Documentation

## Overview
The `add-stats-script.js` module serves as the primary data ingestion layer for the user's health dashboard. It manages the lifecycle of health data submission—both manual user input and automated synchronization from wearable devices—persisting this data directly to the Firestore database.

## Architecture
This module acts as a controller within the client-side application architecture. It serves as a bridge between the DOM layer (the health statistics form) and the persistent storage layer (Firebase Firestore). 

*   **Dependencies:** `wearable.js` (for external hardware data retrieval) and the Firebase Modular SDK (Auth and Firestore).
*   **Consumers:** The module is directly embedded into the user's health dashboard view, requiring an authenticated session to function.

## Design Principles
*   **Event-Driven Design:** The module leverages `onAuthStateChanged` to ensure operations only execute within a secure, authenticated context, preventing unauthorized write operations.
*   **Separation of Concerns:** While the script handles DOM interaction, it delegates the complexity of external data parsing to `wearable.js`, maintaining a clean interface for data collection.
*   **Defensive UI Updates:** Includes transient state management (`showSuccess`) to provide immediate user feedback without cluttering the persistent view.

## API Reference

### `showSuccess()`
*   **Description:** Triggers a visual confirmation notification.
*   **Logic:** Removes the `hidden` CSS class, applies a fade-in animation, and asynchronously re-hides the element after 3 seconds.

## Internal Logic
1.  **Authentication Guard:** Upon script load, `onAuthStateChanged` evaluates the user's session. If unauthenticated, the user is redirected to `auth.html`.
2.  **Form Ingestion:** Upon `submit` events, the module captures four key fields: `date`, `bp` (blood pressure), `heartRate`, and `sugar`. It explicitly casts numeric values to `Number` types to ensure schema consistency in Firestore.
3.  **Wearable Sync:** Upon clicking the `syncBtn`, the script calls `getWearableData()` to retrieve raw JSON data and pushes it to the sub-collection `users/{uid}/healthStats` without intermediate validation.
4.  **Transaction Feedback:** Successful writes trigger `showSuccess()`, and `form.reset()` is called to clear stale input data.

## Data Flow
1.  **Input:** Raw strings from the DOM inputs or an object returned from `getWearableData()`.
2.  **Transformation:** Fields like `heartRate` and `sugar` are type-casted to `Number` to prevent string-based storage in the database.
3.  **Persistence:** Data is directed to a sub-collection specific to the authenticated user's ID (`doc(db, "users", user.uid)`), ensuring strict multi-tenancy and data isolation.

## Error Handling & Edge Cases
*   **Auth Failure:** Redirects to `auth.html` if no session is detected, effectively halting all downstream operations.
*   **Persistence Errors:** All `addDoc` calls are wrapped in `try/catch` blocks. Failures trigger a native `alert` containing the Firebase error message, ensuring the user is notified if their health data fails to persist.
*   **UI Cleanup:** Uses a `setTimeout` to ensure the success notification is ephemeral, preventing the UI from becoming unresponsive.

## Usage Example

### Triggering Manual Entry
The form logic is bound automatically by the script. To trigger it, ensure your HTML contains:
```html
<form id="statsForm">
  <input id="date" type="date">
  <input id="bp" type="text">
  <input id="heartRate" type="number">
  <input id="sugar" type="number">
  <button type="submit">Submit</button>
</form>
```

### Syncing Wearables
The script expects a global or imported sync action. By interacting with the button defined in the DOM, the module handles the Firebase write operation:
```javascript
// The module already has this listener bound to the syncBtn
syncBtn.addEventListener("click", async () => {
    // Fetches wearable data and sends to user healthStats sub-collection
});
```