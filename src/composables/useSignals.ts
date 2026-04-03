import { ref, computed, watch } from 'vue'
import type { Network, Signal } from '@/types/signal'
import { fetchSignalsByNetwork, type DataSource } from '@/services/api'

export function useSignals(initialNetwork: Network = 'globe') {
  const activeNetwork = ref<Network>(initialNetwork)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const dataSource = ref<DataSource | null>(null)

  // Live (OpenCelliD) and research (mock) stored separately so the toggle
  // can add/remove research without re-fetching.
  const liveSignals = ref<Signal[]>([])
  const researchSignals = ref<Signal[]>([])

  // When true: heatmap shows live + research. When false: live only.
  // For sub-brand networks that have no live data, research always shows
  // regardless of this flag (otherwise the map would be blank).
  const showResearch = ref(true)

  const signals = computed<Signal[]>(() => {
    const hasLive = liveSignals.value.length > 0
    if (!hasLive || showResearch.value) {
      return [...liveSignals.value, ...researchSignals.value]
    }
    return liveSignals.value
  })

  async function loadSignals(network: Network) {
    isLoading.value = true
    error.value = null
    liveSignals.value = []
    researchSignals.value = []
    dataSource.value = null
    try {
      const result = await fetchSignalsByNetwork(network)
      liveSignals.value = result.live
      researchSignals.value = result.research
      dataSource.value = result.source
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load signal data'
    } finally {
      isLoading.value = false
    }
  }

  function selectNetwork(network: Network) {
    activeNetwork.value = network
  }

  watch(activeNetwork, (network) => loadSignals(network), { immediate: true })

  return {
    activeNetwork,
    signals,
    liveSignals,
    researchSignals,
    showResearch,
    isLoading,
    error,
    dataSource,
    selectNetwork,
  }
}
