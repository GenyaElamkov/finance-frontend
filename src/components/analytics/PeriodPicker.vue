<script setup>
import { computed, ref, watch } from 'vue'
import { PERIOD_PRESETS, getPresetRange, isValidRange } from '@/utils/period'

// v-model: { preset: string, date_from: 'YYYY-MM-DD', date_to: 'YYYY-MM-DD' }
const props = defineProps({
  modelValue: { type: Object, required: true },
})
const emit = defineEmits(['update:modelValue'])

const customOpen = ref(props.modelValue.preset === 'custom')
const customFrom = ref(props.modelValue.date_from)
const customTo = ref(props.modelValue.date_to)

// Если период изменили снаружи, подтягиваем даты в поля ввода
watch(
  () => props.modelValue,
  (value) => {
    customFrom.value = value.date_from
    customTo.value = value.date_to
  },
)

// Режим «Свой период»: открыт блок с датами или уже применен произвольный период
const customMode = computed(() => customOpen.value || props.modelValue.preset === 'custom')
const isPresetActive = (key) => !customMode.value && props.modelValue.preset === key

const rangeIsValid = computed(() => isValidRange(customFrom.value, customTo.value))
const showRangeError = computed(
  () => Boolean(customFrom.value) && Boolean(customTo.value) && customFrom.value > customTo.value,
)

function selectPreset(key) {
  customOpen.value = false
  emit('update:modelValue', { preset: key, ...getPresetRange(key) })
}

function applyCustom() {
  if (!rangeIsValid.value) return
  emit('update:modelValue', {
    preset: 'custom',
    date_from: customFrom.value,
    date_to: customTo.value,
  })
}

const chipClass = (active) =>
  active
    ? 'bg-indigo-600 text-white border-indigo-600'
    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-wrap gap-2">
      <button
        v-for="preset in PERIOD_PRESETS"
        :key="preset.key"
        type="button"
        class="rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors"
        :class="chipClass(isPresetActive(preset.key))"
        @click="selectPreset(preset.key)"
      >
        {{ preset.label }}
      </button>
      <button
        type="button"
        class="rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors"
        :class="chipClass(customMode)"
        @click="customOpen = !customOpen"
      >
        Свой период
      </button>
    </div>

    <div v-if="customOpen" class="grid grid-cols-2 gap-3 sm:flex sm:items-end">
      <label class="block min-w-0">
        <span class="mb-1 block text-xs font-medium text-gray-500">С</span>
        <input
          v-model="customFrom"
          type="date"
          class="h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>
      <label class="block min-w-0">
        <span class="mb-1 block text-xs font-medium text-gray-500">По</span>
        <input
          v-model="customTo"
          type="date"
          class="h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </label>
      <button
        type="button"
        :disabled="!rangeIsValid"
        class="col-span-2 h-10 rounded-lg bg-gray-900 px-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-gray-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        @click="applyCustom"
      >
        Применить
      </button>
    </div>

    <p v-if="showRangeError" class="text-xs text-red-600">
      Дата начала не может быть позже даты окончания
    </p>
  </div>
</template>
