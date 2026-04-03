# NCR Mobile Networks Signal Map

**Live Demo:** [Signal Map Demo](https://vue-googlemaps-ncr-mobile.pages.dev/)

A Vue 3 application that visualizes mobile network signal coverage across Metro Manila (NCR) using an interactive heatmap powered by the Google Maps JavaScript API.

---

## Project Overview

The app renders a heatmap on Google Maps showing cell tower coverage for the six major Philippine mobile networks:

| Network | Brand Type |
|---------|-----------|
| Globe | Postpaid / Prepaid |
| Smart | Postpaid / Prepaid |
| DITO | Postpaid / Prepaid |
| GOMO | Digital sub-brand of Globe |
| TM (Touch Mobile) | Globe prepaid brand |
| TNT (Talk 'N Text) | Smart prepaid brand |

Switch between networks using the toggle bar. Toggle the **Research overlay** to layer in or remove the supplemental research-based dataset on top of the live tower data.

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
│   ├── MapView.vue          # Google Map + custom canvas heatmap overlay
│   ├── NetworkToggle.vue    # Network selector buttons
│   └── Legend.vue           # Signal strength legend overlay
├── composables/
│   ├── useSignals.ts        # Data loading, network state, overlay toggle
│   └── useGoogleMaps.ts     # Google Maps script loader (singleton)
├── services/
│   ├── api.ts               # Loads + clusters live and research signals
│   └── cellDatabase.ts      # Fetches and caches public/ncr-towers.json
├── data/
│   └── mockSignals.ts       # Research-based fallback dataset (~1,172 points)
├── utils/
│   ├── CanvasHeatmapOverlay.ts  # Custom zoom-relative heatmap renderer
│   └── clusterSignals.ts        # Spatial clustering for render performance
├── types/
│   └── signal.ts            # TypeScript interfaces and network constants
public/
├── ncr-towers.json          # Pre-processed OpenCelliD tower data (generated)
└── 515.csv.gz               # Raw OpenCelliD dump for MCC 515 (Philippines)
scripts/
└── process-towers.mjs       # One-time data processing script
```

---

## About the Data

The app uses two complementary datasets. Together they form the heatmap; they can also be viewed independently using the **Research overlay** toggle.

### 1. OpenCelliD Tower Database (primary)

The primary data source for Globe, Smart, and DITO is the [OpenCelliD](https://opencellid.org) crowd-sourced cell tower database — the world's largest open database of cell tower locations.

- **File:** `public/515.csv.gz` — full Philippines dump (MCC 515)
- **Processed output:** `public/ncr-towers.json` — filtered to NCR, ~13,946 towers before clustering
- **Current snapshot:** April 2026
- **Coverage:** Globe (MNC 2), Smart (MNC 3 + 5), DITO (MNC 66)

Signal strength is not stored in the offline dump (the `averageSignal` column is always 0 in bulk exports — the OpenCelliD API computes it live from submissions). Instead, strength is proxied from the tower's radio technology, which is a direct measure of coverage generation:

| Radio | Strength value |
|-------|---------------|
| NR (5G) | 0.90 |
| LTE (4G) | 0.75 |
| UMTS (3G) | 0.55 |
| GSM (2G) | 0.40 |

The heatmap intensity in any area reflects **tower density** — how many towers were reported in that cell. Dense urban cores naturally show as hotter zones.

#### Reliability

OpenCelliD data is crowd-sourced from Android devices running apps that record tower observations (cell ID, location, radio type). Data quality varies by area:

- **City centers and major roads** — high coverage, frequent updates, reliable
- **Residential mid-density areas** — moderate coverage, broadly accurate
- **Low-density outer NCR** (northern Caloocan, far Quezon City, Taguig fringe) — sparse submissions; some towers may be missing or outdated

The database reflects towers that were *observed and reported*, not necessarily every tower that exists. A gap on the map may mean no tower, or simply no one recorded that tower.

### 2. Research-Based Overlay (supplemental)

For Globe, Smart, and DITO, a supplemental dataset (`src/data/mockSignals.ts`) derived from publicly available research adds approximately 270–300 extra points per network to fill in known patterns that OpenCelliD under-represents.

Sources for this dataset:

- **Opensignal** — Philippines Mobile Network Experience Reports (2024–2025)
- **Globe / Smart / DITO** official coverage maps and 5G deployment announcements
- **CellMapper** — crowdsourced tower location references
- **nPerf** — crowdsourced signal quality measurements from Philippine users
- **NTC QoS** — Philippine National Broadband Map
- Philippine tech publications: PinoyTechSaga, NoypiGeeks, Tech Pilipinas

For GOMO, TM, and TNT — sub-brands that share tower infrastructure with their parent networks but have no separate MNC codes in the OpenCelliD database — this research dataset is the **only** data source.

### Data Integrity and Disclaimers

- **Tower data is a snapshot.** The OpenCelliD dump was downloaded in April 2026. New towers built after this date, or towers decommissioned since, will not be reflected until the data is refreshed.
- **Signal strength values are approximations.** Proxying strength from radio type (NR/LTE/UMTS/GSM) gives a coarse but meaningful estimate of coverage quality. Actual signal at a specific location depends on building materials, distance to tower, antenna orientation, congestion, and terrain — none of which are captured here.
- **Sub-brand coverage is inferred.** GOMO, TM, and TNT share their parent's physical towers. Their data is research-informed, not sourced from a tower database.
- **Outdoor coverage only.** All data reflects outdoor conditions. Indoor penetration varies significantly by building construction and floor level.
- **Not for network quality decisions.** This app is intended for visualization, comparison, and educational purposes. Do not use it as the basis for choosing a network provider or reporting coverage to regulators.

---

## Rebuilding the Tower Data

When a newer OpenCelliD dump is available, follow these steps to refresh `ncr-towers.json`:

**1. Download a new Philippines dump from OpenCelliD**

Log in at [opencellid.org](https://opencellid.org), go to **Downloads**, and download the file for **MCC 515** (Philippines). Save it as `public/515.csv.gz`, replacing the existing file.

**2. Run the processing script**

```bash
npm run build:data
```

This reads `public/515.csv.gz`, filters to the NCR bounding box and the relevant MNCs, assigns signal strength from radio type, and overwrites `public/ncr-towers.json`.

The script prints a summary on completion:

```
✓ Processed 38,195 rows → kept 13,946 NCR towers
  Globe: 7,536
  Smart: 5,721
  DITO:  689
  Output: .../public/ncr-towers.json (320 KB)
```

**3. Update the badge label in `src/App.vue`**

Find this line and update the month/year to match the new dump date:

```html
{{ dataSource === 'live' ? 'OpenCelliD · Apr 2026' : 'Research-based' }}
```

**4. Rebuild and redeploy**

```bash
npm run build
```

Commit `public/ncr-towers.json` along with any changed source files.

> `public/515.csv.gz` does not need to be committed — it is large and can always be re-downloaded. Consider adding it to `.gitignore` if repository size is a concern.

---

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Google Maps API key

```bash
cp .env.example .env
```

Edit `.env`:

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
| `npm run build:data` | Regenerate `public/ncr-towers.json` from `public/515.csv.gz` |
| `npm run type-check` | Run `vue-tsc` type checker |
| `npm run lint` | Run oxlint + ESLint (with auto-fix) |
| `npm run format` | Run Prettier formatter |

---

## Heatmap Implementation Note

The Google Maps `HeatmapLayer` (part of the `visualization` library) was deprecated in May 2025. This app uses a custom `CanvasHeatmapOverlay` built on `google.maps.OverlayView` instead. Key properties:

- **Zoom-relative radius** — each data point represents a fixed 1,200 m geographic radius, so the heatmap scales correctly at any zoom level
- **Transparent rendering** — the overlay uses `drawImage` with `globalAlpha` so map labels and road names remain legible beneath the heatmap
- **Spatial clustering** — nearby towers are merged into single representative points before rendering (0.005° grid, ≈550 m), reducing canvas draw calls by ~85% with no visible quality loss

---

## Running Without an API Key

If `VITE_GOOGLE_MAPS_API_KEY` is missing or set to `YOUR_API_KEY`, the app will show a clear error card in place of the map — no crash, no silent failure.
