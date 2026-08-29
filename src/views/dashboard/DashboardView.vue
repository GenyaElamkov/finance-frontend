<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAccountsStore } from '@/stores/accounts'
import { useTransactionsStore } from '@/stores/transactions'
import { useCategoriesStore } from '@/stores/categories'

const router = useRouter()
const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()

// При монтировании обновляем все данные с FastAPI
onMounted(() => {
  accountsStore.fetchAccounts()
  transactionsStore.fetchTransactions()
  categoriesStore.fetchCategories()
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

// Расчет общего объема доходов (суммируем только положительные транзакции)
const totalIncome = computed(() => {
  return transactionsStore.listData.items
    .filter(t => t.transaction_type === 'доходы')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

// Расчет общего объема расходов (суммируем отрицательные транзакции)
const totalExpenses = computed(() => {
  return transactionsStore.listData.items
    .filter(t => t.transaction_type === 'расходы')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

// Расчет сводки расходов по категориям (строго за текущий месяц)
const expensesByCategory = computed(() => {
  const map = {}
  
  // Получаем текущий год и месяц (формат: YYYY-MM)
  const now = new Date()
  const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  
  const items = transactionsStore.listData?.items || []

  // Фильтруем: только расходы И только за текущий месяц
  const currentMonthExpenses = items.filter(t => {
    const isExpense = t.transaction_type === 'расходы'
    const isInCurrentMonth = t.transaction_date && t.transaction_date.startsWith(currentYearMonth)
    return isExpense && isInCurrentMonth
  })
  
  // Группируем и суммируем отфильтрованные транзакции
  currentMonthExpenses.forEach(t => {
    const catId = t.category_id || 'none'
    if (!map[catId]) {
      map[catId] = 0
    }
    map[catId] += Number(t.amount)
  })
  
  // Считаем общую сумму расходов именно за ТЕКУЩИЙ месяц для правильного расчета процентов
  const totalCurrentMonthExpenses = Object.values(map).reduce((sum, amt) => sum + amt, 0)
  const total = totalCurrentMonthExpenses || 1 // Защита от деления на 0

  // Превращаем в массив, добавляем метаданные и сортируем по убыванию суммы
  return Object.keys(map).map(catId => {
    const id = catId === 'none' ? null : Number(catId)
    const amount = map[catId]
    return {
      id,
      name: getCategoryName(id),
      icon: getCategoryIcon(id),
      amount,
      percentage: Math.round((amount / total) * 100)
    }
  }).sort((a, b) => b.amount - a.amount)
})

// Вспомогательные хелперы для названий/иконок из кэша Pinia
const getCategoryName = (id) => categoriesStore.items.find(c => c.id === id)?.name || 'Без категории'
const getCategoryIcon = (id) => categoriesStore.items.find(c => c.id === id)?.icon || '📝'
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Финансовый обзор</h1>
      <p class="text-sm text-gray-500 mt-1">Добро пожаловать! Вот актуальное состояние вашего бюджета.</p>
    </div>

    <div v-if="accountsStore.isLoading && transactionsStore.isLoading" class="flex justify-center py-12">
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
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Всего доходов</span>
            <span class="text-xl sm:text-2xl font-bold text-green-600 block mt-1">
              +{{ totalIncome.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) }}
            </span>
          </div>
          <div class="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl">
            📈
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Всего расходов</span>
            <span class="text-xl sm:text-2xl font-bold text-red-600 block mt-1">
              -{{ totalExpenses.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) }}
            </span>
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
          <div class="mb-4">
            <h3 class="font-bold text-gray-900 text-lg">Расходы по категориям</h3>
            <p class="text-xs text-gray-400 mt-0.5">Куда уходят деньги в этом месяце</p>
          </div>

          <div v-if="expensesByCategory.length === 0" class="text-center py-12 text-sm text-gray-400 italic">
            Расходы отсутствуют
          </div>

          <div v-else class="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            <div v-for="cat in expensesByCategory" :key="cat.id" class="space-y-1">
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center space-x-2 truncate">
                  <span>{{ cat.icon }}</span>
                  <span class="text-gray-700 font-medium truncate">{{ cat.name }}</span>
                  <span class="text-xs text-gray-400 font-normal">({{ cat.percentage }}%)</span>
                </div>
                <span class="font-semibold text-gray-900 shrink-0">
                  {{ cat.amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }) }}
                </span>
              </div>
              <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  class="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                  :style="{ width: `${cat.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>