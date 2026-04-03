# NCR Mobile Networks Signal Map

**Live Demo:** [Signal Map Demo](https://vue-googlemaps-ncr-mobile.pages.dev/)

A Vue 3 application that visualizes mobile network signal strength across Metro Manila (NCR) using an interactive heatmap powered by the Google Maps JavaScript API.

---

## Project Overview

The app renders a heatmap on Google Maps showing research-based signal strength data for the six major Philippine mobile networks:

| Network | Brand Type | Color |
|---------|-----------|-------|
| Globe | Postpaid / Prepaid | Blue |
| Smart | Postpaid / Prepaid | Red |
| DITO | Postpaid / Prepaid | Purple |
| GOMO | Digital sub-brand of Globe | Orange |
| TM (Touch Mobile) | Globe prepaid brand | Green |
| TNT (Talk 'N Text) | Smart prepaid brand | Yellow |

Switch between networks using the toggle bar. The heatmap updates instantly, reflecting each network's distinct coverage pattern across all 17 cities and municipalities of NCR.

---

## Tech Stack

- **Vue 3** — Composition API, `<script setup>`
- **TypeScript** — strict mode
- **Vite** — fast build tooling
- **TailwindCSS v4** — utility-first styling via `@tailwindcss/vite`
- **Google Maps JavaScript API** — custom `OverlayView` canvas heatmap
- **ESLint + Prettier** — code quality and formatting

---

## Project Structure

```
src/
├── components/
│   ├── MapView.vue        # Google Map + custom canvas heatmap overlay
│   ├── NetworkToggle.vue  # Network selector buttons
│   └── Legend.vue         # Signal strength legend overlay
├── composables/
│   ├── useSignals.ts      # Data fetching and network selection state
│   └── useGoogleMaps.ts   # Google Maps script loader (singleton)
├── services/
│   └── api.ts             # Async data service (simulates network latency)
├── data/
│   └── mockSignals.ts     # 1,172 research-based signal data points
├── utils/
│   └── CanvasHeatmapOverlay.ts  # Custom zoom-relative heatmap renderer
└── types/
    └── signal.ts          # TypeScript interfaces and network constants
```

---

## About the Signal Data

The data in `src/data/mockSignals.ts` is **not arbitrarily generated**. While it is served locally (no live API call), the values are derived from real-world research and are intended to accurately reflect known coverage patterns across Metro Manila.

### Sources

Signal strength values and geographic distribution were compiled from:

- **Opensignal** — Philippines Mobile Network Experience Reports (April 2024, October 2024, April 2025)
- **Globe Telecom** official coverage maps and 5G deployment announcements
- **Smart Communications** official coverage maps and network expansion press releases
- **DITO Telecommunity** official coverage pages and CTO statements on indoor penetration
- **TM Tambayan** — confirmed 5G location listings per city
- **CellMapper** — crowdsourced tower location data for Globe, Smart, and DITO in NCR
- **nPerf** — crowdsourced signal quality measurements from Philippine users
- **NTC QoS** — Philippine National Broadband Map (National Telecommunications Commission)
- Philippine tech publications: PinoyTechSaga, NoypiGeeks, Technobaboy, Tech Pilipinas

### What the Data Reflects

**1,172 data points** are distributed across all 17 NCR cities and municipalities, with each point anchored to a specific barangay or district (e.g., BGC High Street, Cubao, Camarin, Napindan). Strength values follow documented real-world patterns:

- **BGC, Makati CBD, and Ortigas** are the strongest zones for all networks, reflecting dense tower infrastructure and confirmed 5G outdoor coverage
- **DITO** has excellent signal in urban business cores but drops sharply in outer NCR — Camarin (northernmost Caloocan), Napindan (near Laguna Lake), and deep Tondo are documented weak zones
- **Smart / TNT** pull ahead of Globe at key 5G nodes: MOA Arena, Cubao-Araneta Coliseum, and the Domestic Airport corridor
- **Globe / TM** maintain broader fringe coverage in outer residential areas where Smart has fewer towers
- **GOMO** and **TM** mirror Globe's infrastructure but apply slight signal penalties in low-density suburban zones, consistent with MVNO and prepaid band-priority behavior documented by Philippine telecom reviewers
- **Camarin** (Caloocan) and **Novaliches outer** (Quezon City) are NCR's weakest zones across all networks — this is reflected in the data
- All strength values include a small randomized variance (seeded, so the map renders identically on every load) to simulate the natural variability seen in real signal measurements

### Accuracy Disclaimer

This data is research-informed, not live-measured. It represents outdoor signal conditions based on published reports and crowdsourced averages. Actual signal strength at any specific location may vary due to building materials, terrain, network congestion, and infrastructure changes made after the referenced sources were published.

The data is suitable for visualization, comparison, and educational purposes. It is not intended to be used as a definitive source for network quality decisions.

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

- Show a clear error card in place of the map explaining exactly what's needed
- Not crash or break any other part of the UI

---

## Heatmap Implementation Note

The Google Maps `HeatmapLayer` (part of the `visualization` library) was deprecated in May 2025. This app uses a custom `CanvasHeatmapOverlay` built on `google.maps.OverlayView` instead. Key properties:

- **Zoom-relative radius** — each data point represents a fixed 1,200 m geographic radius, so the heatmap scales correctly at any zoom level
- **Transparent rendering** — the overlay uses `drawImage` with `globalAlpha` so map labels and road names remain legible beneath the heatmap

---

## Connecting a Real Backend

To replace the local data with a live API, update `src/services/api.ts`:

```ts
export async function fetchSignalsByNetwork(network: Network): Promise<Signal[]> {
  const res = await fetch(`/api/signals?network=${network}`)
  return res.json()
}
```

The expected shape per record matches the OpenCelliD-inspired format:

```json
{
  "id": 1,
  "lat": 14.5995,
  "lng": 120.9842,
  "network": "globe",
  "strength": 0.85
}
```
