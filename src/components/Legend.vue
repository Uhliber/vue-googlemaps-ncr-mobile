<script setup lang="ts">
const legendItems = [
  { label: 'Weak', color: 'from-cyan-500 to-cyan-400', range: '0 – 0.33' },
  { label: 'Moderate', color: 'from-lime-400 to-yellow-400', range: '0.34 – 0.66' },
  { label: 'Strong', color: 'from-orange-400 to-red-500', range: '0.67 – 1.0' },
]
</script>

<template>
  <div
    class="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-3 min-w-[180px]"
  >
    <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Signal Strength</p>

    <!-- Gradient bar -->
    <div
      class="h-2.5 rounded-full bg-gradient-to-r from-cyan-400 via-lime-400 via-yellow-400 to-red-500 mb-3 shadow-inner"
    />

    <div class="flex flex-col gap-1.5">
      <div v-for="item in legendItems" :key="item.label" class="flex items-center gap-2">
        <div :class="['w-3 h-3 rounded-full bg-gradient-to-r flex-shrink-0', item.color]" />
        <span class="text-xs font-medium text-slate-700">{{ item.label }}</span>
        <span class="text-xs text-slate-400 ml-auto">{{ item.range }}</span>
      </div>
    </div>
  </div>
</template>
