/**
 * Realistic NCR (Metro Manila) mobile signal data.
 *
 * Sources: Opensignal PH Mobile Network Experience Reports (Apr 2024, Oct 2024, Apr 2025),
 * Globe/Smart/DITO official coverage maps, TM Tambayan 5G listings, CellMapper tower data,
 * nPerf crowdsourced coverage, NTC QoS data, PinoyTechSaga, NoypiGeeks, Technobaboy,
 * and Philippine tech community discussions.
 *
 * Sub-brand rules applied:
 *  - TM (Touch Mobile) = Globe infrastructure, −0.03 to −0.08 in suburban fringe zones
 *  - GOMO              = Globe infrastructure (MVNO), −0.02 to −0.06 in low-density zones
 *  - TNT (Talk N Text) = Smart infrastructure, identical signal values to Smart
 *
 * Strength scale: 0.0 (no signal) → 1.0 (maximum)
 */

import type { Signal, Network } from '@/types/signal'

// ---------------------------------------------------------------------------
// Seeded PRNG — deterministic output so the map looks the same on every reload
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(0xdeadbeef)

// ---------------------------------------------------------------------------
// Zone definition — each zone produces `count` points scattered within `spread`
// degrees around the anchor, strength ± variance (clamped 0.05–1.0)
// ---------------------------------------------------------------------------
interface Zone {
  lat: number
  lng: number
  spread: number   // degrees, applied independently to lat & lng
  strength: number // base signal strength
  variance: number // random ± applied to strength
  count: number    // number of points to generate
}

function generateZone(network: Network, idOffset: number, zones: Zone[]): Signal[] {
  const points: Signal[] = []
  let id = idOffset
  for (const z of zones) {
    for (let i = 0; i < z.count; i++) {
      const lat = z.lat + (rng() - 0.5) * z.spread
      const lng = z.lng + (rng() - 0.5) * z.spread
      const raw = z.strength + (rng() - 0.5) * z.variance * 2
      const strength = parseFloat(Math.min(1, Math.max(0.05, raw)).toFixed(2))
      points.push({ id: id++, lat, lng, network, strength })
    }
  }
  return points
}

// ============================================================================
// GLOBE — widest NCR coverage, 98.7 % 5G outdoor (Opensignal Apr 2025)
// ============================================================================
const globeZones: Zone[] = [
  // ── BGC / Taguig (strongest zone in NCR) ──────────────────────────────────
  { lat: 14.5490, lng: 121.0530, spread: 0.012, strength: 0.97, variance: 0.02, count: 8 }, // BGC High Street
  { lat: 14.5389, lng: 121.0557, spread: 0.010, strength: 0.95, variance: 0.02, count: 5 }, // McKinley Hill
  { lat: 14.5565, lng: 121.0478, spread: 0.010, strength: 0.93, variance: 0.02, count: 5 }, // BGC North / Market!
  // ── Makati CBD ────────────────────────────────────────────────────────────
  { lat: 14.5545, lng: 121.0199, spread: 0.008, strength: 0.96, variance: 0.02, count: 7 }, // Ayala Ave core
  { lat: 14.5614, lng: 121.0122, spread: 0.008, strength: 0.95, variance: 0.02, count: 5 }, // Salcedo Village
  { lat: 14.5569, lng: 121.0141, spread: 0.008, strength: 0.95, variance: 0.02, count: 5 }, // Legaspi Village
  { lat: 14.5634, lng: 121.0327, spread: 0.008, strength: 0.93, variance: 0.02, count: 4 }, // Rockwell
  { lat: 14.5631, lng: 121.0303, spread: 0.009, strength: 0.90, variance: 0.03, count: 4 }, // Poblacion
  { lat: 14.5658, lng: 121.0448, spread: 0.009, strength: 0.87, variance: 0.03, count: 3 }, // Guadalupe Nuevo
  { lat: 14.5484, lng: 121.0074, spread: 0.009, strength: 0.86, variance: 0.03, count: 3 }, // Bangkal / Pio del Pilar
  // ── Ortigas / Pasig ───────────────────────────────────────────────────────
  { lat: 14.5858, lng: 121.0600, spread: 0.009, strength: 0.94, variance: 0.02, count: 7 }, // Ortigas Center
  { lat: 14.5729, lng: 121.0577, spread: 0.009, strength: 0.90, variance: 0.03, count: 4 }, // Kapitolyo
  { lat: 14.5844, lng: 121.0533, spread: 0.008, strength: 0.89, variance: 0.03, count: 4 }, // Shaw / Galleria
  { lat: 14.5664, lng: 121.0742, spread: 0.010, strength: 0.84, variance: 0.04, count: 3 }, // Rosario / Bagong Ilog
  { lat: 14.5637, lng: 121.0808, spread: 0.009, strength: 0.81, variance: 0.04, count: 3 }, // Ugong industrial
  // ── Mandaluyong ───────────────────────────────────────────────────────────
  { lat: 14.5837, lng: 121.0552, spread: 0.008, strength: 0.92, variance: 0.02, count: 4 }, // EDSA Shangri-La
  { lat: 14.5931, lng: 121.0382, spread: 0.009, strength: 0.87, variance: 0.03, count: 3 }, // Highway Hills
  { lat: 14.5875, lng: 121.0293, spread: 0.009, strength: 0.87, variance: 0.03, count: 3 }, // Wack-Wack
  // ── Quezon City core ──────────────────────────────────────────────────────
  { lat: 14.6055, lng: 121.0817, spread: 0.009, strength: 0.91, variance: 0.02, count: 6 }, // Eastwood / Libis
  { lat: 14.6195, lng: 121.0488, spread: 0.010, strength: 0.89, variance: 0.02, count: 6 }, // Cubao / Araneta
  { lat: 14.6542, lng: 121.0568, spread: 0.011, strength: 0.87, variance: 0.03, count: 5 }, // Diliman / UP
  { lat: 14.6371, lng: 121.0230, spread: 0.010, strength: 0.88, variance: 0.03, count: 5 }, // Timog / Scout area
  { lat: 14.7011, lng: 121.0470, spread: 0.012, strength: 0.86, variance: 0.03, count: 5 }, // Commonwealth Ave
  { lat: 14.6850, lng: 121.0260, spread: 0.011, strength: 0.82, variance: 0.04, count: 4 }, // Tandang Sora
  { lat: 14.7336, lng: 121.0622, spread: 0.012, strength: 0.83, variance: 0.04, count: 4 }, // Fairview center
  { lat: 14.7262, lng: 121.0387, spread: 0.013, strength: 0.81, variance: 0.04, count: 4 }, // Novaliches Poblacion
  { lat: 14.7541, lng: 121.0614, spread: 0.012, strength: 0.77, variance: 0.05, count: 3 }, // North Fairview deep
  { lat: 14.7480, lng: 121.0289, spread: 0.012, strength: 0.74, variance: 0.05, count: 3 }, // Novaliches outer
  { lat: 14.6889, lng: 121.0921, spread: 0.011, strength: 0.77, variance: 0.04, count: 3 }, // Batasan Hills / Payatas
  // ── Manila City ───────────────────────────────────────────────────────────
  { lat: 14.5764, lng: 120.9800, spread: 0.009, strength: 0.87, variance: 0.03, count: 5 }, // Ermita
  { lat: 14.5664, lng: 120.9884, spread: 0.009, strength: 0.87, variance: 0.03, count: 4 }, // Malate / Roxas Blvd
  { lat: 14.5996, lng: 120.9748, spread: 0.009, strength: 0.84, variance: 0.03, count: 4 }, // Binondo
  { lat: 14.5982, lng: 120.9846, spread: 0.009, strength: 0.84, variance: 0.03, count: 4 }, // Quiapo
  { lat: 14.6069, lng: 120.9897, spread: 0.010, strength: 0.86, variance: 0.03, count: 4 }, // Sampaloc / España
  { lat: 14.5706, lng: 121.0094, spread: 0.009, strength: 0.82, variance: 0.03, count: 3 }, // Sta. Ana
  { lat: 14.6183, lng: 120.9693, spread: 0.010, strength: 0.79, variance: 0.04, count: 4 }, // Tondo center
  { lat: 14.6330, lng: 120.9648, spread: 0.010, strength: 0.71, variance: 0.05, count: 3 }, // Tondo Dagat-Dagatan
  { lat: 14.5893, lng: 120.9743, spread: 0.008, strength: 0.77, variance: 0.04, count: 3 }, // Intramuros
  { lat: 14.5850, lng: 120.9672, spread: 0.008, strength: 0.75, variance: 0.05, count: 2 }, // Port Area
  // ── Pasay ─────────────────────────────────────────────────────────────────
  { lat: 14.5351, lng: 121.0021, spread: 0.009, strength: 0.92, variance: 0.02, count: 5 }, // MOA / SM Mall of Asia
  { lat: 14.5462, lng: 120.9990, spread: 0.009, strength: 0.89, variance: 0.03, count: 4 }, // Roxas Blvd Pasay
  { lat: 14.5256, lng: 121.0129, spread: 0.009, strength: 0.88, variance: 0.03, count: 3 }, // Domestic Airport
  { lat: 14.5233, lng: 121.0003, spread: 0.009, strength: 0.86, variance: 0.03, count: 3 }, // Baclaran
  // ── San Juan ──────────────────────────────────────────────────────────────
  { lat: 14.6005, lng: 121.0379, spread: 0.009, strength: 0.90, variance: 0.02, count: 4 }, // Greenhills
  { lat: 14.6051, lng: 121.0246, spread: 0.009, strength: 0.86, variance: 0.03, count: 3 }, // Pinaglabanan
  // ── Marikina ──────────────────────────────────────────────────────────────
  { lat: 14.6341, lng: 121.0952, spread: 0.010, strength: 0.89, variance: 0.03, count: 4 }, // Calumpang
  { lat: 14.6489, lng: 121.1056, spread: 0.010, strength: 0.87, variance: 0.03, count: 3 }, // Sta. Elena
  { lat: 14.6598, lng: 121.1100, spread: 0.010, strength: 0.86, variance: 0.03, count: 3 }, // Concepcion
  { lat: 14.6684, lng: 121.1015, spread: 0.010, strength: 0.85, variance: 0.03, count: 3 }, // Nangka
  { lat: 14.6775, lng: 121.0908, spread: 0.010, strength: 0.82, variance: 0.04, count: 2 }, // Tumana
  // ── Pateros ───────────────────────────────────────────────────────────────
  { lat: 14.5455, lng: 121.0661, spread: 0.007, strength: 0.89, variance: 0.03, count: 3 }, // Pateros Poblacion
  // ── Parañaque ─────────────────────────────────────────────────────────────
  { lat: 14.5100, lng: 121.0050, spread: 0.009, strength: 0.87, variance: 0.03, count: 4 }, // Tambo / NAIA vicinity
  { lat: 14.4926, lng: 121.0113, spread: 0.010, strength: 0.86, variance: 0.03, count: 4 }, // BF Homes main
  { lat: 14.5002, lng: 121.0138, spread: 0.009, strength: 0.85, variance: 0.03, count: 3 }, // Don Bosco / Sto. Niño
  { lat: 14.4828, lng: 121.0050, spread: 0.010, strength: 0.81, variance: 0.04, count: 3 }, // BF Homes inner
  { lat: 14.4787, lng: 121.0096, spread: 0.009, strength: 0.82, variance: 0.04, count: 2 }, // Moonwalk
  // ── Muntinlupa / Alabang ──────────────────────────────────────────────────
  { lat: 14.4234, lng: 121.0387, spread: 0.010, strength: 0.92, variance: 0.02, count: 5 }, // Alabang / Filinvest
  { lat: 14.4194, lng: 121.0357, spread: 0.009, strength: 0.93, variance: 0.02, count: 4 }, // Alabang Town Center
  { lat: 14.4038, lng: 121.0424, spread: 0.010, strength: 0.86, variance: 0.03, count: 3 }, // Susana Heights
  { lat: 14.4011, lng: 121.0309, spread: 0.010, strength: 0.83, variance: 0.04, count: 3 }, // Tunasan / Poblacion
  // ── Las Piñas ─────────────────────────────────────────────────────────────
  { lat: 14.4559, lng: 121.0001, spread: 0.010, strength: 0.85, variance: 0.03, count: 4 }, // Alabang-Zapote Rd
  { lat: 14.4632, lng: 120.9936, spread: 0.010, strength: 0.83, variance: 0.04, count: 3 }, // Pamplona
  { lat: 14.4682, lng: 120.9900, spread: 0.010, strength: 0.82, variance: 0.04, count: 3 }, // BF International
  { lat: 14.4404, lng: 120.9909, spread: 0.010, strength: 0.80, variance: 0.04, count: 3 }, // Talon
  { lat: 14.4279, lng: 120.9845, spread: 0.011, strength: 0.73, variance: 0.05, count: 2 }, // CAA / Cavite border
  // ── Caloocan ──────────────────────────────────────────────────────────────
  { lat: 14.6578, lng: 120.9838, spread: 0.009, strength: 0.88, variance: 0.03, count: 4 }, // Monumento / EDSA
  { lat: 14.6681, lng: 120.9820, spread: 0.009, strength: 0.85, variance: 0.03, count: 4 }, // Grace Park East
  { lat: 14.6983, lng: 120.9776, spread: 0.010, strength: 0.83, variance: 0.04, count: 3 }, // Sangandaan
  { lat: 14.7518, lng: 121.0300, spread: 0.012, strength: 0.75, variance: 0.05, count: 3 }, // Bagumbong
  { lat: 14.7612, lng: 121.0490, spread: 0.012, strength: 0.71, variance: 0.05, count: 2 }, // Camarin (weakest NCR)
  // ── Valenzuela ────────────────────────────────────────────────────────────
  { lat: 14.7041, lng: 120.9728, spread: 0.010, strength: 0.83, variance: 0.04, count: 4 }, // Malinta / MacArthur
  { lat: 14.7127, lng: 120.9675, spread: 0.010, strength: 0.81, variance: 0.04, count: 3 }, // Karuhatan
  { lat: 14.7050, lng: 120.9569, spread: 0.010, strength: 0.77, variance: 0.05, count: 3 }, // Paso de Blas
  { lat: 14.7354, lng: 120.9665, spread: 0.011, strength: 0.74, variance: 0.05, count: 2 }, // Punturin
  // ── Malabon ───────────────────────────────────────────────────────────────
  { lat: 14.6622, lng: 120.9594, spread: 0.009, strength: 0.81, variance: 0.04, count: 3 }, // Tinajeros
  { lat: 14.6540, lng: 120.9581, spread: 0.009, strength: 0.78, variance: 0.04, count: 3 }, // Catmon
  { lat: 14.6718, lng: 120.9641, spread: 0.009, strength: 0.73, variance: 0.05, count: 2 }, // Longos
  // ── Navotas ───────────────────────────────────────────────────────────────
  { lat: 14.6618, lng: 120.9476, spread: 0.009, strength: 0.81, variance: 0.04, count: 3 }, // Tangos / N. Bay Blvd
  { lat: 14.6706, lng: 120.9444, spread: 0.009, strength: 0.77, variance: 0.04, count: 2 }, // San Roque
  { lat: 14.6489, lng: 120.9387, spread: 0.008, strength: 0.72, variance: 0.05, count: 2 }, // Fish Port
  // ── Taguig fringe ─────────────────────────────────────────────────────────
  { lat: 14.5239, lng: 121.0487, spread: 0.009, strength: 0.81, variance: 0.04, count: 3 }, // Signal Village
  { lat: 14.5086, lng: 121.0531, spread: 0.010, strength: 0.81, variance: 0.04, count: 2 }, // Lower Bicutan
  { lat: 14.4901, lng: 121.0490, spread: 0.010, strength: 0.79, variance: 0.05, count: 2 }, // Ususan
  { lat: 14.4864, lng: 121.0703, spread: 0.010, strength: 0.73, variance: 0.05, count: 2 }, // Napindan
]

// ============================================================================
// SMART — near-equal to Globe; leads in 5G reach; stronger at key 5G nodes
// ============================================================================
const smartZones: Zone[] = [
  // ── BGC / Taguig (TNT 5G Max launched here) ───────────────────────────────
  { lat: 14.5490, lng: 121.0530, spread: 0.012, strength: 0.96, variance: 0.02, count: 8 },
  { lat: 14.5389, lng: 121.0557, spread: 0.010, strength: 0.94, variance: 0.02, count: 5 },
  { lat: 14.5565, lng: 121.0478, spread: 0.010, strength: 0.94, variance: 0.02, count: 5 },
  // ── Makati CBD ────────────────────────────────────────────────────────────
  { lat: 14.5545, lng: 121.0199, spread: 0.008, strength: 0.95, variance: 0.02, count: 7 },
  { lat: 14.5614, lng: 121.0122, spread: 0.008, strength: 0.94, variance: 0.02, count: 5 },
  { lat: 14.5634, lng: 121.0327, spread: 0.008, strength: 0.92, variance: 0.02, count: 4 },
  { lat: 14.5631, lng: 121.0303, spread: 0.009, strength: 0.89, variance: 0.03, count: 4 },
  { lat: 14.5658, lng: 121.0448, spread: 0.009, strength: 0.86, variance: 0.03, count: 3 },
  // ── Pasay — Smart strongest here (MOA Arena 5G node) ─────────────────────
  { lat: 14.5351, lng: 121.0021, spread: 0.009, strength: 0.94, variance: 0.02, count: 6 }, // MOA
  { lat: 14.5256, lng: 121.0129, spread: 0.009, strength: 0.90, variance: 0.03, count: 4 }, // Domestic Airport
  { lat: 14.5233, lng: 121.0003, spread: 0.009, strength: 0.87, variance: 0.03, count: 3 }, // Baclaran
  { lat: 14.5462, lng: 120.9990, spread: 0.009, strength: 0.88, variance: 0.03, count: 4 }, // Roxas Blvd
  // ── Ortigas / Pasig ───────────────────────────────────────────────────────
  { lat: 14.5858, lng: 121.0600, spread: 0.009, strength: 0.93, variance: 0.02, count: 7 },
  { lat: 14.5729, lng: 121.0577, spread: 0.009, strength: 0.89, variance: 0.03, count: 4 },
  { lat: 14.5844, lng: 121.0533, spread: 0.008, strength: 0.90, variance: 0.03, count: 4 }, // Shaw (Smart slightly stronger)
  { lat: 14.5664, lng: 121.0742, spread: 0.010, strength: 0.83, variance: 0.04, count: 3 },
  { lat: 14.5637, lng: 121.0808, spread: 0.009, strength: 0.79, variance: 0.04, count: 3 },
  // ── Mandaluyong ───────────────────────────────────────────────────────────
  { lat: 14.5837, lng: 121.0552, spread: 0.008, strength: 0.91, variance: 0.02, count: 4 },
  { lat: 14.5825, lng: 121.0538, spread: 0.008, strength: 0.91, variance: 0.02, count: 3 }, // MegaMall
  { lat: 14.5931, lng: 121.0382, spread: 0.009, strength: 0.86, variance: 0.03, count: 3 },
  // ── QC — Cubao has Smart Araneta Coliseum 5G ─────────────────────────────
  { lat: 14.6055, lng: 121.0817, spread: 0.009, strength: 0.90, variance: 0.02, count: 6 }, // Eastwood
  { lat: 14.6195, lng: 121.0488, spread: 0.010, strength: 0.91, variance: 0.02, count: 6 }, // Cubao (Smart stronger)
  { lat: 14.6542, lng: 121.0568, spread: 0.011, strength: 0.86, variance: 0.03, count: 5 }, // Diliman
  { lat: 14.6371, lng: 121.0230, spread: 0.010, strength: 0.87, variance: 0.03, count: 5 }, // Timog / Scout
  { lat: 14.7011, lng: 121.0470, spread: 0.012, strength: 0.85, variance: 0.03, count: 5 }, // Commonwealth
  { lat: 14.6850, lng: 121.0260, spread: 0.011, strength: 0.80, variance: 0.04, count: 4 }, // Tandang Sora
  { lat: 14.7336, lng: 121.0622, spread: 0.012, strength: 0.82, variance: 0.04, count: 4 }, // Fairview
  { lat: 14.7262, lng: 121.0387, spread: 0.013, strength: 0.79, variance: 0.04, count: 4 }, // Novaliches
  { lat: 14.7541, lng: 121.0614, spread: 0.012, strength: 0.75, variance: 0.05, count: 3 }, // North Fairview deep
  { lat: 14.7480, lng: 121.0289, spread: 0.012, strength: 0.71, variance: 0.05, count: 3 }, // Novaliches outer
  { lat: 14.6889, lng: 121.0921, spread: 0.011, strength: 0.75, variance: 0.04, count: 3 }, // Batasan Hills
  // ── Manila City ───────────────────────────────────────────────────────────
  { lat: 14.5764, lng: 120.9800, spread: 0.009, strength: 0.84, variance: 0.03, count: 5 }, // Ermita
  { lat: 14.5664, lng: 120.9884, spread: 0.009, strength: 0.84, variance: 0.03, count: 4 }, // Malate
  { lat: 14.5996, lng: 120.9748, spread: 0.009, strength: 0.82, variance: 0.03, count: 4 }, // Binondo
  { lat: 14.6069, lng: 120.9897, spread: 0.010, strength: 0.84, variance: 0.03, count: 4 }, // Sampaloc
  { lat: 14.5706, lng: 121.0094, spread: 0.009, strength: 0.80, variance: 0.03, count: 3 }, // Sta. Ana
  { lat: 14.6183, lng: 120.9693, spread: 0.010, strength: 0.77, variance: 0.04, count: 4 }, // Tondo
  { lat: 14.6330, lng: 120.9648, spread: 0.010, strength: 0.69, variance: 0.05, count: 3 }, // Tondo deep
  { lat: 14.5893, lng: 120.9743, spread: 0.008, strength: 0.79, variance: 0.04, count: 3 }, // Intramuros
  { lat: 14.5850, lng: 120.9672, spread: 0.008, strength: 0.76, variance: 0.05, count: 2 }, // Port Area
  // ── San Juan ──────────────────────────────────────────────────────────────
  { lat: 14.6005, lng: 121.0379, spread: 0.009, strength: 0.89, variance: 0.02, count: 4 }, // Greenhills
  { lat: 14.6051, lng: 121.0246, spread: 0.009, strength: 0.85, variance: 0.03, count: 3 }, // Pinaglabanan
  // ── Marikina ──────────────────────────────────────────────────────────────
  { lat: 14.6341, lng: 121.0952, spread: 0.010, strength: 0.88, variance: 0.03, count: 4 },
  { lat: 14.6489, lng: 121.1056, spread: 0.010, strength: 0.86, variance: 0.03, count: 3 },
  { lat: 14.6598, lng: 121.1100, spread: 0.010, strength: 0.85, variance: 0.03, count: 3 },
  { lat: 14.6684, lng: 121.1015, spread: 0.010, strength: 0.84, variance: 0.03, count: 3 },
  // ── Pateros ───────────────────────────────────────────────────────────────
  { lat: 14.5455, lng: 121.0661, spread: 0.007, strength: 0.88, variance: 0.03, count: 3 },
  // ── Parañaque ─────────────────────────────────────────────────────────────
  { lat: 14.5100, lng: 121.0050, spread: 0.009, strength: 0.88, variance: 0.03, count: 4 }, // Tambo/NAIA (Smart stronger near airport)
  { lat: 14.4926, lng: 121.0113, spread: 0.010, strength: 0.85, variance: 0.03, count: 4 }, // BF Homes
  { lat: 14.5002, lng: 121.0138, spread: 0.009, strength: 0.84, variance: 0.03, count: 3 },
  { lat: 14.4828, lng: 121.0050, spread: 0.010, strength: 0.79, variance: 0.04, count: 3 }, // BF inner
  // ── Muntinlupa ────────────────────────────────────────────────────────────
  { lat: 14.4234, lng: 121.0387, spread: 0.010, strength: 0.91, variance: 0.02, count: 5 },
  { lat: 14.4194, lng: 121.0357, spread: 0.009, strength: 0.92, variance: 0.02, count: 4 },
  { lat: 14.4038, lng: 121.0424, spread: 0.010, strength: 0.85, variance: 0.03, count: 3 },
  { lat: 14.4011, lng: 121.0309, spread: 0.010, strength: 0.82, variance: 0.04, count: 3 },
  // ── Las Piñas ─────────────────────────────────────────────────────────────
  { lat: 14.4559, lng: 121.0001, spread: 0.010, strength: 0.84, variance: 0.03, count: 4 },
  { lat: 14.4632, lng: 120.9936, spread: 0.010, strength: 0.82, variance: 0.04, count: 3 },
  { lat: 14.4279, lng: 120.9845, spread: 0.011, strength: 0.71, variance: 0.05, count: 2 }, // Cavite border
  // ── Caloocan ──────────────────────────────────────────────────────────────
  { lat: 14.6578, lng: 120.9838, spread: 0.009, strength: 0.87, variance: 0.03, count: 4 }, // Monumento
  { lat: 14.6681, lng: 120.9820, spread: 0.009, strength: 0.84, variance: 0.03, count: 4 }, // Grace Park
  { lat: 14.6983, lng: 120.9776, spread: 0.010, strength: 0.82, variance: 0.04, count: 3 }, // Sangandaan
  { lat: 14.7518, lng: 121.0300, spread: 0.012, strength: 0.73, variance: 0.05, count: 3 }, // Bagumbong
  { lat: 14.7612, lng: 121.0490, spread: 0.012, strength: 0.69, variance: 0.05, count: 2 }, // Camarin
  // ── Valenzuela ────────────────────────────────────────────────────────────
  { lat: 14.7041, lng: 120.9728, spread: 0.010, strength: 0.82, variance: 0.04, count: 4 },
  { lat: 14.7127, lng: 120.9675, spread: 0.010, strength: 0.80, variance: 0.04, count: 3 },
  { lat: 14.7050, lng: 120.9569, spread: 0.010, strength: 0.75, variance: 0.05, count: 3 },
  // ── Malabon / Navotas ─────────────────────────────────────────────────────
  { lat: 14.6622, lng: 120.9594, spread: 0.009, strength: 0.79, variance: 0.04, count: 3 },
  { lat: 14.6540, lng: 120.9581, spread: 0.009, strength: 0.77, variance: 0.04, count: 3 },
  { lat: 14.6618, lng: 120.9476, spread: 0.009, strength: 0.79, variance: 0.04, count: 3 }, // Navotas Tangos
  { lat: 14.6489, lng: 120.9387, spread: 0.008, strength: 0.71, variance: 0.05, count: 2 }, // Fish Port
  // ── Taguig fringe ─────────────────────────────────────────────────────────
  { lat: 14.4901, lng: 121.0490, spread: 0.010, strength: 0.78, variance: 0.05, count: 2 }, // Ususan
  { lat: 14.4864, lng: 121.0703, spread: 0.010, strength: 0.73, variance: 0.05, count: 2 }, // Napindan
]

// ============================================================================
// DITO — strongest in urban core; dramatically drops off in suburban/outer NCR
// ============================================================================
const ditoZones: Zone[] = [
  // ── Showcase zones (DITO's best) ─────────────────────────────────────────
  { lat: 14.5490, lng: 121.0530, spread: 0.012, strength: 0.92, variance: 0.03, count: 7 }, // BGC High Street
  { lat: 14.5389, lng: 121.0557, spread: 0.010, strength: 0.89, variance: 0.03, count: 4 }, // McKinley Hill
  { lat: 14.5545, lng: 121.0199, spread: 0.008, strength: 0.91, variance: 0.03, count: 6 }, // Makati CBD Ayala
  { lat: 14.5614, lng: 121.0122, spread: 0.008, strength: 0.90, variance: 0.03, count: 4 }, // Salcedo
  { lat: 14.5634, lng: 121.0327, spread: 0.008, strength: 0.87, variance: 0.03, count: 4 }, // Rockwell
  { lat: 14.5858, lng: 121.0600, spread: 0.009, strength: 0.87, variance: 0.03, count: 6 }, // Ortigas Center
  { lat: 14.6055, lng: 121.0817, spread: 0.009, strength: 0.84, variance: 0.03, count: 5 }, // Eastwood
  { lat: 14.6195, lng: 121.0488, spread: 0.010, strength: 0.79, variance: 0.04, count: 5 }, // Cubao
  { lat: 14.6542, lng: 121.0568, spread: 0.011, strength: 0.81, variance: 0.04, count: 5 }, // Diliman / UP
  { lat: 14.7011, lng: 121.0470, spread: 0.012, strength: 0.79, variance: 0.04, count: 5 }, // Commonwealth
  { lat: 14.5351, lng: 121.0021, spread: 0.009, strength: 0.81, variance: 0.03, count: 5 }, // MOA
  { lat: 14.4234, lng: 121.0387, spread: 0.010, strength: 0.84, variance: 0.03, count: 4 }, // Alabang / Filinvest
  { lat: 14.4194, lng: 121.0357, spread: 0.009, strength: 0.86, variance: 0.03, count: 4 }, // Alabang Town Center
  // ── Mid-ring commercial zones ─────────────────────────────────────────────
  { lat: 14.5729, lng: 121.0577, spread: 0.009, strength: 0.81, variance: 0.04, count: 4 }, // Kapitolyo
  { lat: 14.5837, lng: 121.0552, spread: 0.008, strength: 0.84, variance: 0.04, count: 3 }, // EDSA Shangri-La
  { lat: 14.6005, lng: 121.0379, spread: 0.009, strength: 0.81, variance: 0.04, count: 3 }, // Greenhills
  { lat: 14.5462, lng: 120.9990, spread: 0.009, strength: 0.77, variance: 0.04, count: 3 }, // Roxas Blvd Pasay
  { lat: 14.5256, lng: 121.0129, spread: 0.009, strength: 0.79, variance: 0.04, count: 3 }, // Domestic Airport
  { lat: 14.6371, lng: 121.0230, spread: 0.010, strength: 0.77, variance: 0.04, count: 4 }, // Timog / Scout
  { lat: 14.6578, lng: 120.9838, spread: 0.009, strength: 0.71, variance: 0.04, count: 3 }, // Monumento
  { lat: 14.6341, lng: 121.0952, spread: 0.010, strength: 0.77, variance: 0.04, count: 3 }, // Marikina Calumpang
  { lat: 14.6489, lng: 121.1056, spread: 0.010, strength: 0.74, variance: 0.04, count: 3 }, // Sta. Elena Marikina
  { lat: 14.5100, lng: 121.0050, spread: 0.009, strength: 0.77, variance: 0.04, count: 3 }, // Tambo / NAIA
  { lat: 14.4926, lng: 121.0113, spread: 0.010, strength: 0.74, variance: 0.04, count: 3 }, // BF Homes
  { lat: 14.4559, lng: 121.0001, spread: 0.010, strength: 0.71, variance: 0.05, count: 3 }, // Las Piñas Alabang-Zapote
  { lat: 14.5764, lng: 120.9800, spread: 0.009, strength: 0.71, variance: 0.04, count: 3 }, // Ermita
  { lat: 14.5996, lng: 120.9748, spread: 0.009, strength: 0.67, variance: 0.04, count: 3 }, // Binondo
  { lat: 14.6069, lng: 120.9897, spread: 0.010, strength: 0.69, variance: 0.04, count: 3 }, // Sampaloc
  { lat: 14.6850, lng: 121.0260, spread: 0.011, strength: 0.67, variance: 0.05, count: 3 }, // Tandang Sora
  { lat: 14.7336, lng: 121.0622, spread: 0.012, strength: 0.69, variance: 0.05, count: 3 }, // Fairview center
  { lat: 14.5455, lng: 121.0661, spread: 0.007, strength: 0.77, variance: 0.04, count: 2 }, // Pateros
  { lat: 14.6681, lng: 120.9820, spread: 0.009, strength: 0.67, variance: 0.05, count: 3 }, // Grace Park
  { lat: 14.7041, lng: 120.9728, spread: 0.010, strength: 0.64, variance: 0.05, count: 3 }, // Valenzuela Malinta
  { lat: 14.6622, lng: 120.9594, spread: 0.009, strength: 0.61, variance: 0.05, count: 2 }, // Malabon Tinajeros
  { lat: 14.6618, lng: 120.9476, spread: 0.009, strength: 0.59, variance: 0.05, count: 2 }, // Navotas Tangos
  { lat: 14.5631, lng: 121.0303, spread: 0.009, strength: 0.82, variance: 0.04, count: 3 }, // Makati Poblacion
  // ── Weak / sparse zones (DITO drops hard here) ───────────────────────────
  { lat: 14.6183, lng: 120.9693, spread: 0.010, strength: 0.59, variance: 0.06, count: 3 }, // Tondo
  { lat: 14.6330, lng: 120.9648, spread: 0.010, strength: 0.44, variance: 0.06, count: 2 }, // Tondo deep
  { lat: 14.5893, lng: 120.9743, spread: 0.008, strength: 0.54, variance: 0.06, count: 2 }, // Intramuros
  { lat: 14.5850, lng: 120.9672, spread: 0.008, strength: 0.38, variance: 0.07, count: 2 }, // Port Area (near dead)
  { lat: 14.7262, lng: 121.0387, spread: 0.013, strength: 0.59, variance: 0.06, count: 3 }, // Novaliches center
  { lat: 14.7541, lng: 121.0614, spread: 0.012, strength: 0.53, variance: 0.07, count: 2 }, // North Fairview deep
  { lat: 14.7480, lng: 121.0289, spread: 0.012, strength: 0.41, variance: 0.07, count: 2 }, // Novaliches outer
  { lat: 14.7518, lng: 121.0300, spread: 0.012, strength: 0.47, variance: 0.07, count: 2 }, // Bagumbong
  { lat: 14.7612, lng: 121.0490, spread: 0.012, strength: 0.29, variance: 0.08, count: 2 }, // Camarin (near dead for DITO)
  { lat: 14.7050, lng: 120.9569, spread: 0.010, strength: 0.51, variance: 0.07, count: 2 }, // Paso de Blas
  { lat: 14.6718, lng: 120.9641, spread: 0.009, strength: 0.44, variance: 0.07, count: 2 }, // Malabon Longos
  { lat: 14.6489, lng: 120.9387, spread: 0.008, strength: 0.40, variance: 0.07, count: 2 }, // Navotas Fish Port
  { lat: 14.4901, lng: 121.0490, spread: 0.010, strength: 0.53, variance: 0.07, count: 2 }, // Ususan Taguig
  { lat: 14.4864, lng: 121.0703, spread: 0.010, strength: 0.43, variance: 0.07, count: 2 }, // Napindan
  { lat: 14.4279, lng: 120.9845, spread: 0.011, strength: 0.36, variance: 0.08, count: 2 }, // Las Piñas Cavite border
  { lat: 14.6983, lng: 120.9776, spread: 0.010, strength: 0.63, variance: 0.06, count: 2 }, // Caloocan Sangandaan
]

// ============================================================================
// GOMO — Globe MVNO, same towers; −0.02 to −0.06 in low-density fringe zones
// ============================================================================
const gomoZones: Zone[] = [
  { lat: 14.5490, lng: 121.0530, spread: 0.012, strength: 0.96, variance: 0.02, count: 7 }, // BGC (mirrors Globe)
  { lat: 14.5389, lng: 121.0557, spread: 0.010, strength: 0.94, variance: 0.02, count: 4 },
  { lat: 14.5545, lng: 121.0199, spread: 0.008, strength: 0.95, variance: 0.02, count: 6 }, // Makati CBD
  { lat: 14.5614, lng: 121.0122, spread: 0.008, strength: 0.94, variance: 0.02, count: 4 },
  { lat: 14.5634, lng: 121.0327, spread: 0.008, strength: 0.92, variance: 0.02, count: 4 }, // Rockwell
  { lat: 14.5858, lng: 121.0600, spread: 0.009, strength: 0.93, variance: 0.02, count: 6 }, // Ortigas
  { lat: 14.6055, lng: 121.0817, spread: 0.009, strength: 0.90, variance: 0.02, count: 5 }, // Eastwood
  { lat: 14.6195, lng: 121.0488, spread: 0.010, strength: 0.88, variance: 0.02, count: 5 }, // Cubao
  { lat: 14.6542, lng: 121.0568, spread: 0.011, strength: 0.86, variance: 0.03, count: 4 }, // Diliman
  { lat: 14.6371, lng: 121.0230, spread: 0.010, strength: 0.87, variance: 0.03, count: 4 }, // Timog
  { lat: 14.5351, lng: 121.0021, spread: 0.009, strength: 0.91, variance: 0.02, count: 5 }, // MOA
  { lat: 14.4234, lng: 121.0387, spread: 0.010, strength: 0.91, variance: 0.02, count: 4 }, // Alabang
  { lat: 14.5837, lng: 121.0552, spread: 0.008, strength: 0.91, variance: 0.02, count: 3 }, // EDSA Shangri-La
  { lat: 14.5729, lng: 121.0577, spread: 0.009, strength: 0.89, variance: 0.03, count: 3 }, // Kapitolyo
  { lat: 14.6005, lng: 121.0379, spread: 0.009, strength: 0.89, variance: 0.02, count: 3 }, // Greenhills
  { lat: 14.5764, lng: 120.9800, spread: 0.009, strength: 0.86, variance: 0.03, count: 4 }, // Ermita
  { lat: 14.6069, lng: 120.9897, spread: 0.010, strength: 0.85, variance: 0.03, count: 3 }, // Sampaloc
  { lat: 14.5996, lng: 120.9748, spread: 0.009, strength: 0.83, variance: 0.03, count: 3 }, // Binondo
  { lat: 14.6183, lng: 120.9693, spread: 0.010, strength: 0.77, variance: 0.04, count: 3 }, // Tondo
  { lat: 14.5455, lng: 121.0661, spread: 0.007, strength: 0.88, variance: 0.03, count: 2 }, // Pateros
  { lat: 14.6341, lng: 121.0952, spread: 0.010, strength: 0.88, variance: 0.03, count: 3 }, // Marikina Calumpang
  { lat: 14.6578, lng: 120.9838, spread: 0.009, strength: 0.87, variance: 0.03, count: 3 }, // Monumento
  { lat: 14.6681, lng: 120.9820, spread: 0.009, strength: 0.84, variance: 0.03, count: 3 }, // Grace Park
  { lat: 14.5100, lng: 121.0050, spread: 0.009, strength: 0.86, variance: 0.03, count: 3 }, // Tambo/NAIA
  { lat: 14.4926, lng: 121.0113, spread: 0.010, strength: 0.85, variance: 0.03, count: 3 }, // BF Homes
  { lat: 14.4559, lng: 121.0001, spread: 0.010, strength: 0.83, variance: 0.03, count: 3 }, // Las Piñas
  { lat: 14.7011, lng: 121.0470, spread: 0.012, strength: 0.83, variance: 0.04, count: 4 }, // Commonwealth
  { lat: 14.7336, lng: 121.0622, spread: 0.012, strength: 0.80, variance: 0.04, count: 3 }, // Fairview
  { lat: 14.7041, lng: 120.9728, spread: 0.010, strength: 0.80, variance: 0.04, count: 3 }, // Valenzuela Malinta
  { lat: 14.6622, lng: 120.9594, spread: 0.009, strength: 0.78, variance: 0.04, count: 2 }, // Malabon
  { lat: 14.6618, lng: 120.9476, spread: 0.009, strength: 0.78, variance: 0.04, count: 2 }, // Navotas
  // Fringe — GOMO −0.05 vs Globe
  { lat: 14.7050, lng: 120.9569, spread: 0.010, strength: 0.72, variance: 0.05, count: 2 }, // Paso de Blas
  { lat: 14.7518, lng: 121.0300, spread: 0.012, strength: 0.70, variance: 0.05, count: 2 }, // Bagumbong
  { lat: 14.7612, lng: 121.0490, spread: 0.012, strength: 0.65, variance: 0.06, count: 2 }, // Camarin
  { lat: 14.4279, lng: 120.9845, spread: 0.011, strength: 0.68, variance: 0.05, count: 2 }, // Las Piñas Cavite border
  { lat: 14.4864, lng: 121.0703, spread: 0.010, strength: 0.68, variance: 0.05, count: 2 }, // Napindan
]

// ============================================================================
// TM (Touch Mobile) — Globe prepaid brand, same infra; −0.03 to −0.08 fringe
// ============================================================================
const tmZones: Zone[] = [
  { lat: 14.5490, lng: 121.0530, spread: 0.012, strength: 0.95, variance: 0.02, count: 6 }, // BGC
  { lat: 14.5545, lng: 121.0199, spread: 0.008, strength: 0.94, variance: 0.02, count: 5 }, // Makati CBD
  { lat: 14.5634, lng: 121.0327, spread: 0.008, strength: 0.91, variance: 0.02, count: 4 }, // Rockwell
  { lat: 14.5858, lng: 121.0600, spread: 0.009, strength: 0.92, variance: 0.02, count: 5 }, // Ortigas
  { lat: 14.6055, lng: 121.0817, spread: 0.009, strength: 0.89, variance: 0.02, count: 5 }, // Eastwood
  { lat: 14.6195, lng: 121.0488, spread: 0.010, strength: 0.87, variance: 0.03, count: 5 }, // Cubao
  { lat: 14.6542, lng: 121.0568, spread: 0.011, strength: 0.85, variance: 0.03, count: 4 }, // Diliman
  { lat: 14.6371, lng: 121.0230, spread: 0.010, strength: 0.86, variance: 0.03, count: 4 }, // Timog
  { lat: 14.5351, lng: 121.0021, spread: 0.009, strength: 0.90, variance: 0.02, count: 5 }, // MOA
  { lat: 14.5256, lng: 121.0129, spread: 0.009, strength: 0.87, variance: 0.03, count: 3 }, // Domestic Airport
  { lat: 14.4234, lng: 121.0387, spread: 0.010, strength: 0.90, variance: 0.02, count: 4 }, // Alabang
  { lat: 14.5837, lng: 121.0552, spread: 0.008, strength: 0.90, variance: 0.02, count: 3 }, // EDSA Shangri-La
  { lat: 14.6005, lng: 121.0379, spread: 0.009, strength: 0.88, variance: 0.03, count: 3 }, // Greenhills
  { lat: 14.5764, lng: 120.9800, spread: 0.009, strength: 0.85, variance: 0.03, count: 4 }, // Ermita
  { lat: 14.5664, lng: 120.9884, spread: 0.009, strength: 0.85, variance: 0.03, count: 3 }, // Malate
  { lat: 14.6069, lng: 120.9897, spread: 0.010, strength: 0.84, variance: 0.03, count: 4 }, // Sampaloc
  { lat: 14.5996, lng: 120.9748, spread: 0.009, strength: 0.82, variance: 0.03, count: 3 }, // Binondo
  { lat: 14.5706, lng: 121.0094, spread: 0.009, strength: 0.80, variance: 0.03, count: 3 }, // Sta. Ana
  { lat: 14.6183, lng: 120.9693, spread: 0.010, strength: 0.76, variance: 0.04, count: 4 }, // Tondo
  { lat: 14.6578, lng: 120.9838, spread: 0.009, strength: 0.86, variance: 0.03, count: 4 }, // Monumento (TM 5G confirmed)
  { lat: 14.6681, lng: 120.9820, spread: 0.009, strength: 0.83, variance: 0.03, count: 4 }, // Grace Park
  { lat: 14.6983, lng: 120.9776, spread: 0.010, strength: 0.81, variance: 0.04, count: 3 }, // Sangandaan
  { lat: 14.6341, lng: 121.0952, spread: 0.010, strength: 0.87, variance: 0.03, count: 3 }, // Marikina Calumpang
  { lat: 14.6489, lng: 121.1056, spread: 0.010, strength: 0.85, variance: 0.03, count: 3 }, // Marikina Sta. Elena
  { lat: 14.5455, lng: 121.0661, spread: 0.007, strength: 0.87, variance: 0.03, count: 2 }, // Pateros
  { lat: 14.5100, lng: 121.0050, spread: 0.009, strength: 0.85, variance: 0.03, count: 3 }, // Tambo
  { lat: 14.4926, lng: 121.0113, spread: 0.010, strength: 0.84, variance: 0.03, count: 3 }, // BF Homes
  { lat: 14.4559, lng: 121.0001, spread: 0.010, strength: 0.84, variance: 0.03, count: 3 }, // Las Piñas (TM 5G confirmed)
  { lat: 14.4632, lng: 120.9936, spread: 0.010, strength: 0.81, variance: 0.04, count: 3 }, // Pamplona
  { lat: 14.7041, lng: 120.9728, spread: 0.010, strength: 0.81, variance: 0.04, count: 4 }, // Valenzuela (TM 5G confirmed)
  { lat: 14.7127, lng: 120.9675, spread: 0.010, strength: 0.79, variance: 0.04, count: 3 },
  { lat: 14.6622, lng: 120.9594, spread: 0.009, strength: 0.79, variance: 0.04, count: 3 }, // Malabon (TM 5G confirmed)
  { lat: 14.6618, lng: 120.9476, spread: 0.009, strength: 0.79, variance: 0.04, count: 3 }, // Navotas (TM 5G confirmed)
  { lat: 14.7011, lng: 121.0470, spread: 0.012, strength: 0.82, variance: 0.04, count: 4 }, // Commonwealth
  { lat: 14.7336, lng: 121.0622, spread: 0.012, strength: 0.79, variance: 0.04, count: 3 }, // Fairview
  // Fringe — TM penalty applied
  { lat: 14.7050, lng: 120.9569, spread: 0.010, strength: 0.71, variance: 0.05, count: 3 }, // Paso de Blas
  { lat: 14.7518, lng: 121.0300, spread: 0.012, strength: 0.69, variance: 0.05, count: 2 }, // Bagumbong
  { lat: 14.7612, lng: 121.0490, spread: 0.012, strength: 0.64, variance: 0.06, count: 2 }, // Camarin
  { lat: 14.4279, lng: 120.9845, spread: 0.011, strength: 0.67, variance: 0.05, count: 2 }, // Las Piñas Cavite border
  { lat: 14.6718, lng: 120.9641, spread: 0.009, strength: 0.70, variance: 0.05, count: 2 }, // Malabon Longos
  { lat: 14.4864, lng: 121.0703, spread: 0.010, strength: 0.67, variance: 0.05, count: 2 }, // Napindan
]

// ============================================================================
// TNT (Talk 'N Text) — Smart prepaid brand, identical tower access to Smart
// ============================================================================
const tntZones: Zone[] = [
  { lat: 14.5490, lng: 121.0530, spread: 0.012, strength: 0.96, variance: 0.02, count: 7 }, // BGC (TNT 5G Max)
  { lat: 14.5389, lng: 121.0557, spread: 0.010, strength: 0.94, variance: 0.02, count: 4 },
  { lat: 14.5545, lng: 121.0199, spread: 0.008, strength: 0.95, variance: 0.02, count: 6 }, // Makati CBD
  { lat: 14.5634, lng: 121.0327, spread: 0.008, strength: 0.92, variance: 0.02, count: 4 }, // Rockwell
  { lat: 14.5631, lng: 121.0303, spread: 0.009, strength: 0.89, variance: 0.03, count: 3 }, // Poblacion
  { lat: 14.5858, lng: 121.0600, spread: 0.009, strength: 0.93, variance: 0.02, count: 6 }, // Ortigas
  { lat: 14.5844, lng: 121.0533, spread: 0.008, strength: 0.90, variance: 0.03, count: 4 }, // Shaw / Galleria
  { lat: 14.6055, lng: 121.0817, spread: 0.009, strength: 0.90, variance: 0.02, count: 5 }, // Eastwood
  { lat: 14.6195, lng: 121.0488, spread: 0.010, strength: 0.91, variance: 0.02, count: 6 }, // Cubao (Smart/TNT stronger)
  { lat: 14.6542, lng: 121.0568, spread: 0.011, strength: 0.86, variance: 0.03, count: 4 }, // Diliman
  { lat: 14.6371, lng: 121.0230, spread: 0.010, strength: 0.87, variance: 0.03, count: 4 }, // Timog
  { lat: 14.7011, lng: 121.0470, spread: 0.012, strength: 0.85, variance: 0.03, count: 4 }, // Commonwealth
  { lat: 14.5351, lng: 121.0021, spread: 0.009, strength: 0.94, variance: 0.02, count: 6 }, // MOA (Smart/TNT strongest)
  { lat: 14.5256, lng: 121.0129, spread: 0.009, strength: 0.90, variance: 0.03, count: 4 }, // Domestic Airport
  { lat: 14.5233, lng: 121.0003, spread: 0.009, strength: 0.87, variance: 0.03, count: 3 }, // Baclaran
  { lat: 14.5462, lng: 120.9990, spread: 0.009, strength: 0.88, variance: 0.03, count: 3 }, // Roxas Blvd
  { lat: 14.4234, lng: 121.0387, spread: 0.010, strength: 0.91, variance: 0.02, count: 5 }, // Alabang
  { lat: 14.4194, lng: 121.0357, spread: 0.009, strength: 0.92, variance: 0.02, count: 4 }, // Alabang TC
  { lat: 14.5837, lng: 121.0552, spread: 0.008, strength: 0.91, variance: 0.02, count: 3 }, // EDSA Shangri-La
  { lat: 14.5825, lng: 121.0538, spread: 0.008, strength: 0.91, variance: 0.02, count: 3 }, // MegaMall
  { lat: 14.6005, lng: 121.0379, spread: 0.009, strength: 0.89, variance: 0.02, count: 3 }, // Greenhills
  { lat: 14.5764, lng: 120.9800, spread: 0.009, strength: 0.84, variance: 0.03, count: 4 }, // Ermita
  { lat: 14.5664, lng: 120.9884, spread: 0.009, strength: 0.84, variance: 0.03, count: 3 }, // Malate
  { lat: 14.5996, lng: 120.9748, spread: 0.009, strength: 0.82, variance: 0.03, count: 3 }, // Binondo
  { lat: 14.6069, lng: 120.9897, spread: 0.010, strength: 0.84, variance: 0.03, count: 4 }, // Sampaloc
  { lat: 14.6183, lng: 120.9693, spread: 0.010, strength: 0.77, variance: 0.04, count: 4 }, // Tondo
  { lat: 14.6330, lng: 120.9648, spread: 0.010, strength: 0.69, variance: 0.05, count: 2 }, // Tondo deep
  { lat: 14.5893, lng: 120.9743, spread: 0.008, strength: 0.79, variance: 0.04, count: 2 }, // Intramuros
  { lat: 14.5850, lng: 120.9672, spread: 0.008, strength: 0.76, variance: 0.05, count: 2 }, // Port Area
  { lat: 14.6578, lng: 120.9838, spread: 0.009, strength: 0.87, variance: 0.03, count: 4 }, // Monumento
  { lat: 14.6681, lng: 120.9820, spread: 0.009, strength: 0.84, variance: 0.03, count: 4 }, // Grace Park
  { lat: 14.6983, lng: 120.9776, spread: 0.010, strength: 0.82, variance: 0.04, count: 3 }, // Sangandaan
  { lat: 14.7518, lng: 121.0300, spread: 0.012, strength: 0.73, variance: 0.05, count: 3 }, // Bagumbong
  { lat: 14.7612, lng: 121.0490, spread: 0.012, strength: 0.69, variance: 0.05, count: 2 }, // Camarin
  { lat: 14.6341, lng: 121.0952, spread: 0.010, strength: 0.88, variance: 0.03, count: 3 }, // Marikina Calumpang
  { lat: 14.6489, lng: 121.1056, spread: 0.010, strength: 0.86, variance: 0.03, count: 3 }, // Marikina Sta. Elena
  { lat: 14.5455, lng: 121.0661, spread: 0.007, strength: 0.88, variance: 0.03, count: 2 }, // Pateros
  { lat: 14.5100, lng: 121.0050, spread: 0.009, strength: 0.88, variance: 0.03, count: 3 }, // Tambo
  { lat: 14.4926, lng: 121.0113, spread: 0.010, strength: 0.85, variance: 0.03, count: 3 }, // BF Homes
  { lat: 14.4559, lng: 121.0001, spread: 0.010, strength: 0.84, variance: 0.03, count: 3 }, // Las Piñas
  { lat: 14.7041, lng: 120.9728, spread: 0.010, strength: 0.82, variance: 0.04, count: 4 }, // Valenzuela
  { lat: 14.7127, lng: 120.9675, spread: 0.010, strength: 0.80, variance: 0.04, count: 3 },
  { lat: 14.6622, lng: 120.9594, spread: 0.009, strength: 0.79, variance: 0.04, count: 3 }, // Malabon
  { lat: 14.6618, lng: 120.9476, spread: 0.009, strength: 0.79, variance: 0.04, count: 3 }, // Navotas
  { lat: 14.7336, lng: 121.0622, spread: 0.012, strength: 0.82, variance: 0.04, count: 3 }, // Fairview
  { lat: 14.4864, lng: 121.0703, spread: 0.010, strength: 0.73, variance: 0.05, count: 2 }, // Napindan
  { lat: 14.4901, lng: 121.0490, spread: 0.010, strength: 0.78, variance: 0.05, count: 2 }, // Ususan
]

// ============================================================================
// Export
// ============================================================================
export const mockSignals: Signal[] = [
  ...generateZone('globe', 1, globeZones),
  ...generateZone('smart', 2001, smartZones),
  ...generateZone('dito', 4001, ditoZones),
  ...generateZone('gomo', 6001, gomoZones),
  ...generateZone('tm', 7001, tmZones),
  ...generateZone('tnt', 8001, tntZones),
]
