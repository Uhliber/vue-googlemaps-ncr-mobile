<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, shallowRef } from 'vue'
import type { HeatmapPoint } from '@/types/signal'
import { useGoogleMaps } from '@/composables/useGoogleMaps'

const props = defineProps<{
  heatmapPoints: HeatmapPoint[]
  isLoading: boolean
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = shallowRef<google.maps.Map | null>(null)
const heatmapLayer = shallowRef<google.maps.visualization.HeatmapLayer | null>(null)

const { loadGoogleMaps, mapsState, mapsError } = useGoogleMaps()

const NCR_CENTER = { lat: 14.5995, lng: 120.9842 }
const NCR_ZOOM = 12

function initMap() {
  if (!mapContainer.value || !window.google?.maps) return

  mapInstance.value = new window.google.maps.Map(mapContainer.value, {
    center: NCR_CENTER,
    zoom: NCR_ZOOM,
    mapTypeId: 'roadmap',
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
    ],
  })

  heatmapLayer.value = new window.google.maps.visualization.HeatmapLayer({
    data: [],
    map: mapInstance.value,
    radius: 35,
    opacity: 0.75,
    gradient: [
      'rgba(0, 255, 255, 0)',
      'rgba(0, 255, 255, 1)',
      'rgba(0, 191, 255, 1)',
      'rgba(0, 127, 255, 1)',
      'rgba(0, 63, 255, 1)',
      'rgba(0, 255, 0, 1)',
      'rgba(127, 255, 0, 1)',
      'rgba(255, 255, 0, 1)',
      'rgba(255, 127, 0, 1)',
      'rgba(255, 63, 0, 1)',
      'rgba(255, 0, 0, 1)',
    ],
  })
}

function updateHeatmap(points: HeatmapPoint[]) {
  if (!heatmapLayer.value || !window.google?.maps) return
  const data = points.map((p) => ({ location: p.location, weight: p.weight }))
  heatmapLayer.value.setData(data)
}

watch(
  () => props.heatmapPoints,
  (points) => {
    if (mapsState.value === 'ready') updateHeatmap(points)
  },
  { deep: false },
)

onMounted(async () => {
  try {
    await loadGoogleMaps()
    initMap()
    if (props.heatmapPoints.length) updateHeatmap(props.heatmapPoints)
  } catch {
    // error is surfaced via mapsError ref
  }
})

onUnmounted(() => {
  heatmapLayer.value?.setMap(null)
  heatmapLayer.value = null
  mapInstance.value = null
})
</script>

<template>
  <div class="relative w-full h-full">
    <!-- Map container -->
    <div ref="mapContainer" class="w-full h-full rounded-b-2xl overflow-hidden" />

    <!-- Loading overlay -->
    <Transition name="fade">
      <div
        v-if="isLoading && mapsState === 'ready'"
        class="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center rounded-b-2xl"
      >
        <div class="bg-white/95 rounded-xl px-5 py-3 shadow-xl flex items-center gap-3">
          <svg
            class="animate-spin h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span class="text-sm font-semibold text-slate-700">Loading signal data…</span>
        </div>
      </div>
    </Transition>

    <!-- Maps loading state -->
    <div
      v-if="mapsState === 'loading'"
      class="absolute inset-0 bg-slate-100 flex items-center justify-center rounded-b-2xl"
    >
      <div class="flex flex-col items-center gap-3 text-slate-500">
        <svg
          class="animate-spin h-8 w-8 text-blue-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p class="text-sm font-medium">Loading Google Maps…</p>
      </div>
    </div>

    <!-- API Key Error -->
    <div
      v-if="mapsState === 'error'"
      class="absolute inset-0 bg-slate-100 flex items-center justify-center rounded-b-2xl p-6"
    >
      <div
        class="bg-white rounded-2xl shadow-lg border border-red-100 p-6 max-w-md w-full text-center"
      >
        <div class="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <h3 class="text-base font-bold text-slate-800 mb-2">Google Maps API Key Required</h3>
        <p class="text-sm text-slate-500 mb-4 leading-relaxed">{{ mapsError }}</p>
        <div class="bg-slate-50 rounded-lg px-4 py-3 text-left border border-slate-200">
          <p class="text-xs font-mono text-slate-600 font-semibold mb-1">.env</p>
          <code class="text-xs font-mono text-emerald-700"
            >VITE_GOOGLE_MAPS_API_KEY=your_key_here</code
          >
        </div>
        <p class="text-xs text-slate-400 mt-3">
          Get a key at
          <span class="text-blue-500 font-medium">Google Cloud Console → Maps JavaScript API</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
