<script setup>
import { computed } from 'vue'

const props = defineProps({
  // [{ label, value, color }]
  segments: { type: Array, required: true },
  centerLabel: { type: String, default: '' },
  centerValue: { type: String, default: '' },
  size: { type: Number, default: 176 },
})

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const arcs = computed(() => {
  const sum = props.segments.reduce((acc, s) => acc + s.value, 0)
  if (sum <= 0) return []
  let offset = 0
  return props.segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const length = (s.value / sum) * CIRCUMFERENCE
      const arc = { ...s, length, offset }
      offset += length
      return arc
    })
})

const ariaLabel = computed(() =>
  props.segments.map((s) => s.label).join(', ') || 'Нет данных',
)
</script>

<template>
  <div class="relative mx-auto" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90" role="img" :aria-label="ariaLabel">
      <circle cx="50" cy="50" :r="RADIUS" fill="none" stroke="#f3f4f6" stroke-width="14" />
      <circle
        v-for="arc in arcs"
        :key="arc.label"
        cx="50"
        cy="50"
        :r="RADIUS"
        fill="none"
        :stroke="arc.color"
        stroke-width="14"
        :stroke-dasharray="`${arc.length} ${CIRCUMFERENCE - arc.length}`"
        :stroke-dashoffset="-arc.offset"
      >
        <title>{{ arc.label }}</title>
      </circle>
    </svg>
    <div class="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <span class="text-[11px] font-medium uppercase tracking-wider text-gray-400">{{ centerLabel }}</span>
      <span class="mt-0.5 text-sm font-bold leading-tight text-gray-900">{{ centerValue }}</span>
    </div>
  </div>
</template>
