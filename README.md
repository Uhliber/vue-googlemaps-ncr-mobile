# NCR Mobile Networks Signal Map

**Live Demo:** [NCR Mobile Networks Signal Map Screenshot](https://vue-googlemaps-ncr-mobile.pages.dev/)

A Vue 3 application that visualizes mobile network signal strength across Metro Manila (NCR) using a heatmap powered by the Google Maps JavaScript API.

---

## Project Overview

The app renders a live heatmap on Google Maps showing simulated signal strength data for the six major Philippine mobile networks:

| Network | Color |
|---------|-------|
| Globe   | Blue  |
| Smart   | Red   |
| DITO    | Purple |
| GOMO    | Orange |
| TM (Touch Mobile) | Green |
| TNT (Talk 'N Text) | Yellow |

Switch between networks using the toggle bar. The heatmap updates instantly, pulling data from a local mock service that simulates an OpenCelliD-style REST API.

---

## Tech Stack

- **Vue 3** — Composition API, `<script setup>`
- **TypeScript** — strict mode
- **Vite** — fast build tooling
- **TailwindCSS v4** — utility-first styling via `@tailwindcss/vite`
- **Google Maps JavaScript API** — with `HeatmapLayer` (visualization library)
- **ESLint + Prettier** — code quality and formatting

---

## Project Structure

```
src/
├── components/
│   ├── MapView.vue        # Google Map + HeatmapLayer rendering
│   ├── NetworkToggle.vue  # Network selector buttons
│   └── Legend.vue         # Signal strength legend overlay
├── composables/
│   ├── useSignals.ts      # Data fetching + heatmap point computation
│   └── useGoogleMaps.ts   # Google Maps script loader (singleton)
├── services/
│   └── api.ts             # Mock API (simulates async REST calls)
├── data/
│   └── mockSignals.ts     # 400+ generated data points across NCR
└── types/
    └── signal.ts          # TypeScript interfaces and constants
```

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Google Maps API key

Copy the example env file and fill in your key:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

> **How to get a key:**
> 1. Go to [Google Cloud Console](https://console.cloud.google.com/)
> 2. Create or select a project
> 3. Enable **Maps JavaScript API**
> 4. Under "APIs & Services → Credentials", create an API key
> 5. Restrict it to your domain for production use

> **Required libraries:** The app loads the `visualization` library automatically — no extra configuration needed.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | Run `vue-tsc` type checker |
| `npm run lint` | Run oxlint + ESLint (with auto-fix) |
| `npm run format` | Run Prettier formatter |

---

## Running Without an API Key

If `VITE_GOOGLE_MAPS_API_KEY` is missing or set to `YOUR_API_KEY`, the app will:

- Show a clear error card in place of the map
- Display the exact `.env` snippet needed to fix it
- Not crash or break any other part of the UI

---

## Mock Data

Signal data is generated at startup in `src/data/mockSignals.ts`. It produces ~410 data points distributed across key NCR areas (BGC, Makati, Manila, Quezon City, Caloocan, Pasig, Parañaque, Las Piñas, Valenzuela, Marikina, Malabon) with realistic strength values per network.

To connect a real backend, replace `src/services/api.ts` with actual `fetch` calls against your API.
