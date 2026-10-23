<script setup>
import { computed } from 'vue'
import ChangeBadge from './ChangeBadge.vue'
import { formatMoney, formatPercent } from '@/utils/format'
import { previousPeriodLabel } from '@/utils/period'

const props = defineProps({
  // Ответ GET /analytics/summary-income-expense
  summary: { type: Object, required: true },
})

const currency = computed(() => props.summary.currency)
const totals = computed(() => props.summary.totals)
const previous = computed(() => props.summary.previous_period)
const comparisonLabel = computed(() =>
  previousPeriodLabel(previous.value.type, props.summary.period.days),
)

const balanceNumber = computed(() => Number(totals.value.balance))
const savingsRate = computed(() => totals.value.savings_rate)

const savingsTone = computed(() => {
  if (savingsRate.value === null) return 'text-gray-400'
  return savingsRate.value < 0 ? 'text-red-600' : 'text-green-600'
})

const money = (value) => formatMoney(value, currency.value, { maximumFractionDigits: 0 })

// На телефоне карточки идут по две в ряд, поэтому тексты компактнее
const cardClass = 'rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5'
const labelClass = 'block text-[10px] font-semibold uppercase tracking-wider text-gray-400 sm:text-xs'
const valueClass = 'mt-1 block break-words text-base font-bold leading-tight sm:text-2xl'
const hintClass = 'mt-2 text-[11px] leading-snug text-gray-400 sm:text-xs'
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
    <div :class="cardClass">
      <span :class="labelClass">Доходы</span>
      <span :class="[valueClass, 'text-green-600']">+{{ money(totals.income) }}</span>
      <ChangeBadge
        :value="previous.income_change_pct"
        :positive-is-good="true"
        :label="comparisonLabel"
      />
    </div>

    <div :class="cardClass">
      <span :class="labelClass">Расходы</span>
      <span :class="[valueClass, 'text-red-600']">−{{ money(totals.expense) }}</span>
      <ChangeBadge
        :value="previous.expense_change_pct"
        :positive-is-good="false"
        :label="comparisonLabel"
      />
    </div>

    <div :class="cardClass">
      <span :class="labelClass">Баланс периода</span>
      <span :class="[valueClass, balanceNumber < 0 ? 'text-red-600' : 'text-gray-900']">
        {{ money(totals.balance) }}
      </span>
      <p :class="hintClass">Доходы минус расходы</p>
    </div>

    <div :class="cardClass">
      <span :class="labelClass">Норма сбережений</span>
      <span :class="[valueClass, savingsTone]">{{ formatPercent(savingsRate) }}</span>
      <p :class="hintClass">
        {{ savingsRate === null ? 'Нет доходов за период' : 'Доля дохода, которую удалось отложить' }}
      </p>
    </div>
  </div>
</template>
