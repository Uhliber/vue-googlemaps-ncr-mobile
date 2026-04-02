<script setup lang="ts">
import { computed } from 'vue'
import MapView from '@/components/MapView.vue'
import NetworkToggle from '@/components/NetworkToggle.vue'
import Legend from '@/components/Legend.vue'
import { useSignals } from '@/composables/useSignals'
import { NETWORK_LABELS } from '@/types/signal'

const { activeNetwork, signals, isLoading, error, selectNetwork } = useSignals('globe')

const signalCount = computed(() => signals.value.length)
</script>

<template>
  <div class="h-screen bg-slate-100 flex flex-col overflow-hidden">
    <!-- Header -->
    <header
      class="bg-white border-b border-slate-200 shadow-sm px-4 md:px-6 py-3 flex items-center justify-between z-10 flex-shrink-0"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0"
        >
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
          </svg>
        </div>
        <div>
          <h1 class="text-sm font-bold text-slate-800 leading-tight">NCR Signal Map</h1>
          <p class="text-xs text-slate-400 hidden sm:block">Metro Manila Mobile Coverage</p>
        </div>
      </div>

      <!-- Status badge -->
      <div class="flex items-center gap-2">
        <div
          class="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-3 py-1"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400',
            ]"
          />
          <span>{{ isLoading ? 'Loading…' : `${signalCount} points` }}</span>
        </div>
      </div>
    </header>

    <!-- Toolbar -->
    <div
      class="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-4 flex-shrink-0 overflow-x-auto"
    >
      <span class="text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap"
        >Network</span
      >
      <NetworkToggle
        :active-network="activeNetwork"
        :is-loading="isLoading"
        @select="selectNetwork"
      />
    </div>

    <!-- Error banner -->
    <Transition name="slide-down">
      <div
        v-if="error"
        class="bg-red-50 border-b border-red-200 px-4 md:px-6 py-2 flex items-center gap-2 flex-shrink-0"
      >
        <svg
          class="w-4 h-4 text-red-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-xs text-red-700 font-medium">{{ error }}</p>
      </div>
    </Transition>

    <!-- Map area -->
    <main class="flex-1 relative overflow-hidden min-h-0">
      <MapView :signals="signals" :is-loading="isLoading" />

      <!-- Legend overlay -->
      <div class="absolute bottom-4 right-4 z-10">
        <Legend />
      </div>

      <!-- Network label overlay -->
      <div class="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <Transition name="pop" mode="out-in">
          <div
            :key="activeNetwork"
            class="bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 shadow-md border border-slate-100 text-sm font-semibold text-slate-700"
          >
            {{ NETWORK_LABELS[activeNetwork] }} Coverage
          </div>
        </Transition>
      </div>
    </main>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.pop-enter-active,
.pop-leave-active {
  transition: all 0.15s ease;
}
.pop-enter-from {
  opacity: 0;
  transform: translateX(-50%) scale(0.92);
}
.pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.92);
}
</style>
