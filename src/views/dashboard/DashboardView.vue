<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import { useAnalyticsStore } from '@/stores/analytic'
import ChangeBadge from '@/components/analytics/ChangeBadge.vue'
import { formatMoney, formatPercent, pickReportCurrency } from '@/utils/format'
import { previousPeriodLabel } from '@/utils/period'

const router = useRouter()
const accountsStore = useAccountsStore()
const analyticsStore = useAnalyticsStore()

// Итоги месяца грузим после счетов,
// чтобы выбрать валюту отчета (RUB, если есть рублевый счет)
onMounted(async () => {
  await accountsStore.fetchAccounts()
  analyticsStore.fetchMonthSummary(pickReportCurrency(accountsStore.items))
})

// Метод для быстрого перехода к журналу с выбранным типом операции
const navigateToTransactions = (type) => {
  router.push({ 
    name: 'transactions', 
    query: { type: type } 
  })
}

// Расчет общей суммы на всех счетах
const totalBalance = computed(() => {
  return accountsStore.items.reduce((sum, account) => sum + Number(account.balance), 0)
})

// Итоги текущего месяца (с 1-го числа по сегодня) из /analytics/summary-income-expense
const monthSummary = computed(() => analyticsStore.monthSummary)
const reportCurrency = computed(() => monthSummary.value?.currency ?? 'RUB')

const incomeText = computed(() =>
  monthSummary.value ? `+${formatMoney(monthSummary.value.totals.income, reportCurrency.value)}` : '—',
)
const expenseText = computed(() =>
  monthSummary.value ? `-${formatMoney(monthSummary.value.totals.expense, reportCurrency.value)}` : '—',
)
const comparisonLabel = computed(() =>
  monthSummary.value
    ? previousPeriodLabel(monthSummary.value.previous_period.type, monthSummary.value.period.days)
    : '',
)

// Расходы по категориям верхнего уровня (сумма включает вложенные категории)
const expensesByCategory = computed(() => {
  return (monthSummary.value?.expense.items ?? []).map(item => ({
    id: item.category_id,
    name: item.name,
    icon: item.icon || '📝',
    amount: Number(item.total),
    percentage: item.percentage
  }))
})
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Финансовый обзор</h1>
      <p class="text-sm text-gray-500 mt-1">Добро пожаловать! Вот актуальное состояние вашего бюджета.</p>
    </div>

    <div v-if="accountsStore.isLoading && accountsStore.items.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else class="space-y-6 sm:space-y-8">
      
      <div class="grid grid-cols-2 gap-4 sm:hidden">
        <button 
          @click="navigateToTransactions('расходы')"
          type="button"
          class="flex flex-col items-center justify-center p-4 bg-red-50 active:bg-red-100 border border-red-200 rounded-2xl transition-colors active:scale-98"
        >
          <span class="text-2xl mb-1">📉</span>
          <span class="text-sm font-bold text-red-700">Расход</span>
        </button>

        <button 
          @click="navigateToTransactions('доходы')"
          type="button"
          class="flex flex-col items-center justify-center p-4 bg-green-50 active:bg-green-100 border border-green-200 rounded-2xl transition-colors active:scale-98"
        >
          <span class="text-2xl mb-1">📈</span>
          <span class="text-sm font-bold text-green-700">Доход</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5"> <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-sm border border-indigo-500 relative overflow-hidden">
          <div class="absolute right-3 bottom-1 text-7xl opacity-10 pointer-events-none">💰</div>
          <span class="text-xs font-medium text-indigo-200 uppercase tracking-wider block">Общий баланс</span>
          <span class="text-2xl sm:text-3xl font-black block mt-2 tracking-tight">
            {{ totalBalance.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) }}
          </span>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Доходы за месяц</span>
            <span class="text-xl sm:text-2xl font-bold text-green-600 block mt-1">
              {{ incomeText }}
            </span>
            <ChangeBadge
              v-if="monthSummary"
              :value="monthSummary.previous_period.income_change_pct"
              :positive-is-good="true"
              :label="comparisonLabel"
            />
          </div>
          <div class="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl">
            📈
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Расходы за месяц</span>
            <span class="text-xl sm:text-2xl font-bold text-red-600 block mt-1">
              {{ expenseText }}
            </span>
            <ChangeBadge
              v-if="monthSummary"
              :value="monthSummary.previous_period.expense_change_pct"
              :positive-is-good="false"
              :label="comparisonLabel"
            />
          </div>
          <div class="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-xl">
            📉
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-900 text-lg">Мои кошельки</h3>
            <router-link :to="{ name: 'accounts' }" class="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              Все счета &rarr;
            </router-link>
          </div>

          <div v-if="accountsStore.items.length === 0" class="text-center py-6 text-sm text-gray-400 italic">
            Нет активных счетов
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="acc in accountsStore.items.slice(0, 4)" 
              :key="acc.id"
              class="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div class="truncate max-w-[140px]">
                <span class="font-medium text-sm text-gray-900 block truncate">{{ acc.name }}</span>
              </div>
              <span class="font-bold text-sm" :class="acc.balance >= 0 ? 'text-gray-900' : 'text-red-600'">
                {{ acc.balance.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) }}
              </span>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-gray-900 text-lg">Расходы по категориям</h3>
              <p class="text-xs text-gray-400 mt-0.5">Куда уходят деньги в этом месяце</p>
            </div>
            <router-link :to="{ name: 'analytics' }" class="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors shrink-0">
              Подробнее &rarr;
            </router-link>
          </div>

          <div v-if="analyticsStore.monthSummaryLoading && !monthSummary" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>

          <div v-else-if="analyticsStore.monthSummaryError" class="text-center py-12 text-sm text-red-600">
            {{ analyticsStore.monthSummaryError }}
          </div>

          <div v-else-if="expensesByCategory.length === 0" class="text-center py-12 text-sm text-gray-400 italic">
            Расходы отсутствуют
          </div>

          <div v-else class="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            <div v-for="cat in expensesByCategory" :key="cat.id" class="space-y-1">
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center space-x-2 truncate">
                  <span>{{ cat.icon }}</span>
                  <span class="text-gray-700 font-medium truncate">{{ cat.name }}</span>
                  <span class="text-xs text-gray-400 font-normal">({{ formatPercent(cat.percentage) }})</span>
                </div>
                <span class="font-semibold text-gray-900 shrink-0">
                  {{ formatMoney(cat.amount, reportCurrency, { maximumFractionDigits: 0 }) }}
                </span>
              </div>
              <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  class="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  :style="{ width: `${Math.min(cat.percentage, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>