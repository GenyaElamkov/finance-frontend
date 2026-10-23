<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useAccountsStore } from '@/stores/accounts'
import { useAnalyticsStore } from '@/stores/analytic'
import PeriodPicker from '@/components/analytics/PeriodPicker.vue'
import SummaryCards from '@/components/analytics/SummaryCards.vue'
import DonutChart from '@/components/analytics/DonutChart.vue'
import CategoryBreakdown from '@/components/analytics/CategoryBreakdown.vue'
import { formatDateRu, formatMoney, formatPercent, pickReportCurrency } from '@/utils/format'
import { buildDonutSegments } from '@/utils/chart'
import { getPresetRange, isValidRange } from '@/utils/period'

const accountsStore = useAccountsStore()
const analyticsStore = useAnalyticsStore()

const period = ref({ preset: 'this_month', ...getPresetRange('this_month') })
const currency = ref('RUB')
const kind = ref('expense') // 'expense' | 'income'
const ready = ref(false) // отчет грузим только после выбора валюты по счетам пользователя

// Валюты, в которых у пользователя есть счета; переключатель показываем, если их больше одной
const currencies = computed(() => [
  ...new Set(accountsStore.items.map((a) => a.currency).filter(Boolean)),
])

function load() {
  if (!ready.value || !isValidRange(period.value.date_from, period.value.date_to)) return
  analyticsStore.fetchSummary({
    date_from: period.value.date_from,
    date_to: period.value.date_to,
    currency: currency.value,
  })
}

onMounted(async () => {
  await accountsStore.fetchAccounts()
  currency.value = pickReportCurrency(accountsStore.items)
  ready.value = true
})

// Один запрос на любое изменение периода, валюты или готовности
watch([period, currency, ready], load)

const summary = computed(() => analyticsStore.summary)
const reportCurrency = computed(() => summary.value?.currency ?? currency.value)

const isEmpty = computed(
  () =>
    summary.value &&
    Number(summary.value.totals.income) === 0 &&
    Number(summary.value.totals.expense) === 0,
)

const report = computed(() => summary.value?.[kind.value] ?? { total: '0', items: [] })
const segments = computed(() => buildDonutSegments(report.value.items))
const kindLabel = computed(() => (kind.value === 'expense' ? 'Расходы' : 'Доходы'))

const periodText = computed(
  () => `${formatDateRu(period.value.date_from)} — ${formatDateRu(period.value.date_to)}`,
)

const kindButtonClass = (active) =>
  active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-gray-900">Аналитика</h1>
        <p class="text-sm text-gray-500">Период: {{ periodText }}</p>
      </div>

      <label v-if="currencies.length > 1" class="block shrink-0">
        <span class="mb-1 block text-xs font-medium text-gray-500">Валюта</span>
        <select
          v-model="currency"
          class="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option v-for="code in currencies" :key="code" :value="code">{{ code }}</option>
        </select>
      </label>
    </div>

    <PeriodPicker v-model="period" />

    <div v-if="analyticsStore.summaryLoading && !summary" class="flex justify-center py-16">
      <div class="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
    </div>

    <div
      v-else-if="analyticsStore.summaryError"
      class="space-y-3 rounded-2xl border border-red-100 bg-red-50 p-6 text-center"
    >
      <p class="text-sm font-medium text-red-700">{{ analyticsStore.summaryError }}</p>
      <button
        type="button"
        class="rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-gray-800 active:scale-95"
        @click="load"
      >
        Повторить
      </button>
    </div>

    <div
      v-else-if="isEmpty"
      class="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm"
    >
      <p class="text-3xl">🗒️</p>
      <p class="mt-3 text-sm font-medium text-gray-700">За выбранный период операций нет</p>
      <p class="mt-1 text-xs text-gray-400">Попробуйте выбрать другой период или валюту</p>
    </div>

    <div
      v-else-if="summary"
      class="space-y-6 transition-opacity"
      :class="{ 'pointer-events-none opacity-60': analyticsStore.summaryLoading }"
    >
      <SummaryCards :summary="summary" />

      <div class="flex items-center justify-between gap-3">
        <h2 class="text-lg font-bold text-gray-900">По категориям</h2>
        <div class="inline-flex rounded-xl bg-gray-100 p-1 text-sm font-medium">
          <button
            type="button"
            class="rounded-lg px-3 py-1 transition-colors"
            :class="kindButtonClass(kind === 'expense')"
            @click="kind = 'expense'"
          >
            Расходы
          </button>
          <button
            type="button"
            class="rounded-lg px-3 py-1 transition-colors"
            :class="kindButtonClass(kind === 'income')"
            @click="kind = 'income'"
          >
            Доходы
          </button>
        </div>
      </div>

      <div
        v-if="report.items.length === 0"
        class="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-400 shadow-sm"
      >
        {{ kind === 'expense' ? 'Расходов' : 'Доходов' }} за период нет
      </div>

      <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="h-fit rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-1">
          <DonutChart
            :segments="segments"
            :center-label="kindLabel"
            :center-value="formatMoney(report.total, reportCurrency, { maximumFractionDigits: 0 })"
          />
          <ul class="mt-5 space-y-2">
            <li v-for="segment in segments" :key="segment.label" class="flex items-center justify-between gap-3 text-sm">
              <span class="flex min-w-0 items-center gap-2">
                <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: segment.color }"></span>
                <span class="truncate text-gray-700">{{ segment.label }}</span>
              </span>
              <span class="shrink-0 text-gray-400">{{ formatPercent(segment.percentage) }}</span>
            </li>
          </ul>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:col-span-2">
          <CategoryBreakdown :report="report" :currency="reportCurrency" />
        </div>
      </div>
    </div>
  </div>
</template>
