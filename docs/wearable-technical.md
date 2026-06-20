# Wearable — Technical Documentation

## Overview
The `wearable.js` module serves as an interface layer for simulated biometric data retrieval. In the context of the larger system, it acts as a data provider that mimics hardware-level sensor readings (Blood Pressure, Heart Rate, and Blood Glucose) for telemetry, dashboard visualization, or testing purposes.

## Architecture
This module acts as a **Data Producer** within the system's telemetry pipeline. 
*   **Role:** Provides a normalized JSON object representing periodic health snapshots.
*   **Upstream Dependencies:** None. It relies solely on the native JavaScript `Date` API.
*   **Downstream Consumers:** Expected to be consumed by state management stores, API service layers, or real-time polling loops that forward data to a backend or UI.

## Design Principles
*   **Deterministic Simulation:** The module follows the **Single Responsibility Principle (SRP)** by focusing exclusively on generating a structured biometric schema.
*   **Statelessness:** The function is pure in its execution; it does not maintain internal state between calls, making it highly testable and predictable.
*   **Loose Coupling:** By exporting a functional interface, it allows for easy substitution (e.g., swapping this simulation logic for a real Bluetooth/WebUSB sensor implementation) without breaking downstream consumers.

## API Reference

### `getWearableData()`
Retrieves a simulated snapshot of the user's current physiological metrics.

*   **Signature:** `() => { bp: number, heartRate: number, sugar: number, date: string }`
*   **Returns:** An object containing:
    *   `bp` (*number*): Simulated systolic blood pressure (range: 100–129).
    *   `heartRate` (*number*): Simulated beats per minute (range: 70–99).
    *   `sugar` (*number*): Simulated glucose levels (range: 90–119).
    *   `date` (*string*): The current date in `YYYY-MM-DD` format.

## Internal Logic
The function follows a linear procedural execution:
1.  **Timestamp Generation:** It captures the current system time via `new Date()`, converts it to an ISO string, and truncates the time component to extract the date (`YYYY-MM-DD`).
2.  **Metric Normalization:** It utilizes `Math.random()` scaled by a factor of 30 to produce a constrained variance for the biometric readings.
3.  **Object Construction:** It packs the computed primitives into a standard payload object for return.

## Data Flow
1.  **Entry:** Function is invoked by the application event loop or a scheduler.
2.  **Transformation:** Raw numeric output from the random number generator is clamped within meaningful medical ranges (e.g., 100-130 for BP).
3.  **Exit:** The function returns a serialized data object that is ready to be consumed by React state hooks, Vue reactivity systems, or JSON serialization middleware.

## Error Handling & Edge Cases
*   **Boundary Conditions:** The metrics are constrained to a static range using fixed offsets (e.g., `+ 100`). This ensures that the generated data never falls into medically impossible ranges (e.g., zero or negative values), preventing UI rendering errors in downstream charts.
*   **Date Formatting:** Uses `toISOString()`, which handles internationalization standard time safely. Since it splits by "T", it is robust against timezone variations that might otherwise cause format inconsistencies.

## Usage Example

### Basic Integration
```javascript
import { getWearableData } from './wearable.js';

const currentStats = getWearableData();
console.log(`Heart Rate detected: ${currentStats.heartRate} bpm`);
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';
import { getWearableData } from './wearable.js';

function useBiometrics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(getWearableData());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return data;
}
```