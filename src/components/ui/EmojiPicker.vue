<template>
  <div class="relative inline-block w-full">
    <button
      type="button"
      @click="toggle"
      class="flex items-center text-left"
      :class="buttonClass"
    >
      <span v-if="modelValue" class="text-inherit">{{ modelValue }}</span>
      <span v-else class="text-gray-400">{{ placeholder }}</span>
    </button>

    <!-- Панель выбора -->
    <div
      v-if="isOpen"
      ref="panel"
      class="absolute z-20 mt-1 w-64 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-2"
      style="left: 0; top: 100%;"
    >
      <div v-for="(group, name) in filteredGroups" :key="name">
        <div class="text-xs font-medium text-gray-500 mt-1">{{ name }}</div>
        <div class="grid grid-cols-8 gap-0.5">
          <button
            v-for="emoji in group"
            :key="emoji"
            type="button"
            @click="select(emoji)"
            class="text-xl hover:bg-gray-100 rounded p-0.5 transition-colors"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Выберите иконку' },
  buttonClass: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const search = ref('')
const panel = ref(null)

const emojiGroups = {
  '💰 Финансы': ['💵', '💰', '💳', '🏦', '📈', '📉', '💸', '🧾', '🏷️'],
  '🍔 Еда': ['🍔', '🍕', '🍣', '🥗', '🍩', '☕', '🍷', '🥂', '🧃'],
  '🚗 Транспорт': ['🚗', '🚌', '✈️', '🚢', '🚲', '⛽', '🚦', '🛴', '🚁'],
  '🏠 Дом': ['🏠', '🔑', '🛋️', '🛏️', '🚿', '🧹', '🔧', '🔌', '💡'],
  '💼 Работа': ['💼', '👔', '📋', '📊', '📅', '⌨️', '🖥️', '📞', '📎'],
  '❤️ Здоровье': ['❤️', '💊', '🏥', '🧘', '🥦', '🍎', '💉', '🧪', '🏃'],
  '🎉 Развлечения': ['🎮', '🎬', '🎵', '🎭', '🏀', '⚽', '🎨', '🎪', '🎰'],
  '🛍️ Покупки': ['🛍️', '👗', '👟', '👜', '💍', '🎁', '📦', '🛒']
}

const filteredGroups = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return emojiGroups
  const result = {}
  for (const [group, emojis] of Object.entries(emojiGroups)) {
    const filtered = emojis.filter(e => e.includes(q) || group.includes(q))
    if (filtered.length) result[group] = filtered
  }
  return result
})

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) search.value = ''
}

function select(emoji) {
  emit('update:modelValue', emoji)
  isOpen.value = false
}

function handleClickOutside(e) {
  if (panel.value && !panel.value.contains(e.target) && !e.target.closest('.relative')) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>