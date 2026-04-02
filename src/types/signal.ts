export type Network = 'globe' | 'smart' | 'dito' | 'gomo' | 'tm' | 'tnt'

export interface Signal {
  id: number
  lat: number
  lng: number
  network: Network
  strength: number
}

export const NETWORK_LABELS: Record<Network, string> = {
  globe: 'Globe',
  smart: 'Smart',
  dito: 'DITO',
  gomo: 'GOMO',
  tm: 'TM',
  tnt: 'TNT',
}

export const NETWORK_COLORS: Record<Network, string> = {
  globe: 'bg-blue-600',
  smart: 'bg-red-600',
  dito: 'bg-purple-600',
  gomo: 'bg-orange-500',
  tm: 'bg-green-600',
  tnt: 'bg-yellow-500',
}

export const NETWORK_ACTIVE_COLORS: Record<Network, string> = {
  globe: 'bg-blue-500 ring-blue-400',
  smart: 'bg-red-500 ring-red-400',
  dito: 'bg-purple-500 ring-purple-400',
  gomo: 'bg-orange-500 ring-orange-400',
  tm: 'bg-green-500 ring-green-400',
  tnt: 'bg-yellow-500 ring-yellow-400',
}

export const NETWORKS: Network[] = ['globe', 'smart', 'dito', 'gomo', 'tm', 'tnt']
