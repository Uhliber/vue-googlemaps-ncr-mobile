import type { Signal } from '@/types/signal'

/**
 * Spatially cluster signals using a fixed-degree grid.
 *
 * All points that fall into the same grid cell are merged into one:
 *   - position  = centroid of all points in the cell
 *   - strength  = maximum of all points in the cell
 *
 * gridDeg = 0.005° ≈ 550 m at NCR latitude — well under the 1,200 m heatmap
 * radius, so the merge is visually lossless at every zoom level the app uses.
 * Reduces 13,946 raw OpenCelliD towers to ~2,100 rendered points (85% fewer
 * canvas draw calls).
 *
 * The full dataset is never modified; this only computes a display-optimised
 * copy.
 */
export function clusterSignals(signals: Signal[], gridDeg = 0.005): Signal[] {
  type Cell = {
    latSum: number
    lngSum: number
    strength: number
    count: number
    id: number
    network: Signal['network']
  }

  const cells = new Map<string, Cell>()

  for (const s of signals) {
    const key = `${Math.floor(s.lat / gridDeg)},${Math.floor(s.lng / gridDeg)}`
    const cell = cells.get(key)
    if (cell) {
      cell.latSum += s.lat
      cell.lngSum += s.lng
      cell.strength = Math.max(cell.strength, s.strength)
      cell.count++
    } else {
      cells.set(key, {
        latSum: s.lat,
        lngSum: s.lng,
        strength: s.strength,
        count: 1,
        id: s.id,
        network: s.network,
      })
    }
  }

  return Array.from(cells.values()).map((c) => ({
    id: c.id,
    lat: c.latSum / c.count,
    lng: c.lngSum / c.count,
    network: c.network,
    strength: c.strength,
  }))
}
