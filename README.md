# FuelTrack — Vehicle Management & Fuel Tracking

A frontend-only app for managing vehicles, tracking fuel consumption, documentation, and time-based alerts.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Pages

1. **Login** — Logo and PIN (any 4+ digit PIN to continue; no backend)
2. **Vehicles** — Add multiple vehicles (make, model, plate, year)
3. **Vehicle detail** — Per-vehicle:
   - **Fuel** — Log refuels (date, liters, odometer, price), view history and average km/L and L/100km
   - **Documents** — Add docs (name, type, expiry); highlights when expiring soon or expired
   - **Alerts** — Time-based reminders (service, inspection, insurance, etc.) with due dates

## Tech

- React 18 + Vite 5
- React Router 6
- LocalStorage for vehicles; SessionStorage for PIN (demo only)
