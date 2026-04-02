import type { Network, Signal } from '@/types/signal'
import { mockSignals } from '@/data/mockSignals'

// Simulates an async API call with realistic delay
function simulateDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchSignalsByNetwork(network: Network): Promise<Signal[]> {
  await simulateDelay(250 + Math.random() * 150)
  return mockSignals.filter((s) => s.network === network)
}

export async function fetchAllSignals(): Promise<Signal[]> {
  await simulateDelay(200)
  return [...mockSignals]
}
