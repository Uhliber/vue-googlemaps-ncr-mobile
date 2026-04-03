import type { Network, Signal } from '@/types/signal'
import { mockSignals } from '@/data/mockSignals'
import { loadNetworkSignals, CELLDB_NETWORKS } from '@/services/cellDatabase'
import { clusterSignals } from '@/utils/clusterSignals'

export type DataSource = 'live' | 'research'

export interface SignalResult {
  /** Clustered live tower data. Empty for sub-brand networks. */
  live: Signal[]
  /** Research-based mock signals. Always populated. */
  research: Signal[]
  /** 'live' when OpenCelliD data loaded successfully, 'research' otherwise. */
  source: DataSource
}

/**
 * Load signal data for a network.
 *
 * For Globe, Smart, and DITO: loads from the pre-processed local tower
 * database (public/ncr-towers.json) and spatially clusters nearby towers
 * before returning. Research-based mock data is always returned alongside it.
 *
 * For sub-brands (TM, GOMO, TNT): live is empty; only research data is
 * returned.
 */
export async function fetchSignalsByNetwork(network: Network): Promise<SignalResult> {
  let live: Signal[] = []

  if (CELLDB_NETWORKS.has(network)) {
    try {
      const raw = await loadNetworkSignals(network)
      live = clusterSignals(raw)
    } catch {
      // File missing or parse error — live stays empty.
    }
  }

  const research = mockSignals.filter((s) => s.network === network)
  const source: DataSource = live.length > 0 ? 'live' : 'research'

  return { live, research, source }
}
