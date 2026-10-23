<script setup>
import { computed } from 'vue'
import { formatPercent } from '@/utils/format'

const props = defineProps({
  // Изменение в процентах; null - сравнивать не с чем (в прошлом периоде было 0)
  value: { type: Number, default: null },
  // Рост - это хорошо (доходы) или плохо (расходы)
  positiveIsGood: { type: Boolean, default: true },
  label: { type: String, default: '' },
})

const tone = computed(() => {
  if (props.value === null || props.value === 0) return 'text-gray-600 bg-gray-100'
  const isGood = (props.value > 0) === props.positiveIsGood
  return isGood ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
})

const arrow = computed(() => {
  if (props.value > 0) return '▲'
  if (props.value < 0) return '▼'
  return '•'
})
</script>

<template>
  <p v-if="value !== null" class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs">
    <span class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold" :class="tone">
      {{ arrow }} {{ formatPercent(Math.abs(value)) }}
    </span>
    <span v-if="label" class="leading-snug text-gray-400">{{ label }}</span>
  </p>
</template>
