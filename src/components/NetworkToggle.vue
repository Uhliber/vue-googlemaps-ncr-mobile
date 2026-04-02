<script setup lang="ts">
import type { Network } from '@/types/signal'
import { NETWORKS, NETWORK_LABELS } from '@/types/signal'

const { activeNetwork, isLoading } = defineProps<{
  activeNetwork: Network
  isLoading: boolean
}>()

const emit = defineEmits<{
  select: [network: Network]
}>()

const networkMeta: Record<Network, { dot: string; active: string; hover: string }> = {
  globe: {
    dot: 'bg-blue-500',
    active: 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-1',
    hover: 'hover:bg-blue-50 hover:text-blue-700',
  },
  smart: {
    dot: 'bg-red-500',
    active: 'bg-red-600 text-white ring-2 ring-red-400 ring-offset-1',
    hover: 'hover:bg-red-50 hover:text-red-700',
  },
  dito: {
    dot: 'bg-purple-500',
    active: 'bg-purple-600 text-white ring-2 ring-purple-400 ring-offset-1',
    hover: 'hover:bg-purple-50 hover:text-purple-700',
  },
  gomo: {
    dot: 'bg-orange-500',
    active: 'bg-orange-500 text-white ring-2 ring-orange-400 ring-offset-1',
    hover: 'hover:bg-orange-50 hover:text-orange-700',
  },
  tm: {
    dot: 'bg-emerald-500',
    active: 'bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-1',
    hover: 'hover:bg-emerald-50 hover:text-emerald-700',
  },
  tnt: {
    dot: 'bg-yellow-500',
    active: 'bg-yellow-500 text-white ring-2 ring-yellow-400 ring-offset-1',
    hover: 'hover:bg-yellow-50 hover:text-yellow-700',
  },
}
</script>

<template>
  <div class="flex items-center gap-2 flex-wrap">
    <button
      v-for="network in NETWORKS"
      :key="network"
      :disabled="isLoading"
      :aria-pressed="activeNetwork === network"
      :aria-label="`Show ${NETWORK_LABELS[network]} signal coverage`"
      :class="[
        'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 cursor-pointer select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        activeNetwork === network
          ? networkMeta[network].active
          : [
              'bg-white text-slate-600 border border-slate-200 shadow-sm',
              networkMeta[network].hover,
            ],
      ]"
      @click="emit('select', network)"
    >
      <span
        :class="[
          'w-2 h-2 rounded-full flex-shrink-0',
          networkMeta[network].dot,
          activeNetwork === network ? 'opacity-90' : 'opacity-70',
        ]"
      />
      {{ NETWORK_LABELS[network] }}
    </button>
  </div>
</template>
