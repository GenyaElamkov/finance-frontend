<script setup>
import { computed, ref } from 'vue'
import { formatMoney, formatPercent } from '@/utils/format'
import { colorForIndex } from '@/utils/chart'

const VISIBLE_LIMIT = 8

const props = defineProps({
  // { total, items: [{ category_id, name, icon, total, percentage, children }] }
  report: { type: Object, required: true },
  currency: { type: String, default: 'RUB' },
})

const expandedIds = ref(new Set())
const showAll = ref(false)

const visibleItems = computed(() =>
  showAll.value ? props.report.items : props.report.items.slice(0, VISIBLE_LIMIT),
)
const hiddenCount = computed(() => props.report.items.length - VISIBLE_LIMIT)

function toggle(categoryId) {
  const next = new Set(expandedIds.value)
  if (next.has(categoryId)) next.delete(categoryId)
  else next.add(categoryId)
  expandedIds.value = next
}

const money = (value) => formatMoney(value, props.currency, { maximumFractionDigits: 0 })
</script>

<template>
  <ul class="space-y-4">
    <li v-for="(item, index) in visibleItems" :key="item.category_id" class="space-y-1.5">
      <component
        :is="item.children.length ? 'button' : 'div'"
        :type="item.children.length ? 'button' : undefined"
        :aria-expanded="item.children.length ? expandedIds.has(item.category_id) : undefined"
        class="flex w-full items-start justify-between gap-3 text-left text-sm"
        @click="item.children.length && toggle(item.category_id)"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span>{{ item.icon || '📝' }}</span>
          <span class="truncate font-medium text-gray-700">{{ item.name }}</span>
          <span v-if="item.children.length" class="shrink-0 text-xs text-gray-400">
            {{ expandedIds.has(item.category_id) ? '▾' : '▸' }}
          </span>
        </span>
        <span class="shrink-0 text-right">
          <span class="block font-semibold text-gray-900">{{ money(item.total) }}</span>
          <span class="block text-xs font-normal text-gray-400">{{ formatPercent(item.percentage) }}</span>
        </span>
      </component>

      <div class="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          class="h-full rounded-full transition-all duration-500"
          :style="{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: colorForIndex(index) }"
        ></div>
      </div>

      <ul
        v-if="item.children.length && expandedIds.has(item.category_id)"
        class="ml-3 mt-3 space-y-3 border-l border-gray-100 pl-4"
      >
        <li v-for="child in item.children" :key="child.category_id" class="space-y-1">
          <div class="flex items-start justify-between gap-3 text-sm">
            <span class="flex min-w-0 items-center gap-2">
              <span>{{ child.icon || '📝' }}</span>
              <span class="truncate text-gray-600">{{ child.name }}</span>
            </span>
            <span class="shrink-0 text-right">
              <span class="block font-medium text-gray-800">{{ money(child.total) }}</span>
              <span class="block text-xs text-gray-400">{{ formatPercent(child.percentage) }}</span>
            </span>
          </div>
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              class="h-full rounded-full opacity-70 transition-all duration-500"
              :style="{ width: `${Math.min(child.percentage, 100)}%`, backgroundColor: colorForIndex(index) }"
            ></div>
          </div>
        </li>
      </ul>
    </li>

    <li v-if="hiddenCount > 0">
      <button
        type="button"
        class="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-800"
        @click="showAll = !showAll"
      >
        {{ showAll ? 'Свернуть' : `Показать все (${report.items.length})` }}
      </button>
    </li>
  </ul>
</template>
