/**
 * Loader for the pre-processed OpenCelliD tower database (public/ncr-towers.json).
 *
 * The JSON is fetched once and cached in memory for the session. Subsequent
 * calls for any network are instant — no network requests after first load.
 *
 * Data source: OpenCelliD · MCC 515 · Philippines
 * Regenerate with: node scripts/process-towers.mjs
 */

import type { Network, Signal } from '@/types/signal'

// Each row is a compact [lat, lng, strength] triple.
type TowerRow = [number, number, number]

interface TowerDatabase {
  generated: string
  source: string
  globe: TowerRow[]
  smart: TowerRow[]
  dito: TowerRow[]
}

type DbNetwork = keyof Pick<TowerDatabase, 'globe' | 'smart' | 'dito'>

export const CELLDB_NETWORKS: ReadonlySet<Network> = new Set(['globe', 'smart', 'dito'])

let _db: TowerDatabase | null = null
let _loadPromise: Promise<TowerDatabase> | null = null

async function getDatabase(): Promise<TowerDatabase> {
  if (_db) return _db
  if (_loadPromise) return _loadPromise

  _loadPromise = fetch('/ncr-towers.json')
    .then((res) => {
      if (!res.ok) throw new Error(`ncr-towers.json not found (${res.status})`)
      return res.json() as Promise<TowerDatabase>
    })
    .then((data) => {
      _db = data
      return data
    })

  return _loadPromise
}

/** Load all signals for a network from the local tower database. */
export async function loadNetworkSignals(network: Network): Promise<Signal[]> {
  const db = await getDatabase()
  const rows = db[network as DbNetwork]
  if (!rows) throw new Error(`No tower data for network "${network}"`)

  return rows.map((row, i) => ({
    id: 800_000 + i,
    lat: row[0],
    lng: row[1],
    network,
    strength: row[2],
  }))
}

/** Returns database metadata once the database has been loaded, null before. */
export function getCellDatabaseMeta(): { generated: string; source: string } | null {
  if (!_db) return null
  return { generated: _db.generated, source: _db.source }
}
