import { ref, watch } from 'vue'
import type { Network, Signal } from '@/types/signal'
import { fetchSignalsByNetwork } from '@/services/api'

export function useSignals(initialNetwork: Network = 'globe') {
  const activeNetwork = ref<Network>(initialNetwork)
  const signals = ref<Signal[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function loadSignals(network: Network) {
    isLoading.value = true
    error.value = null
    try {
      signals.value = await fetchSignalsByNetwork(network)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load signal data'
      signals.value = []
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
    isLoading,
    error,
    selectNetwork,
  }
}
