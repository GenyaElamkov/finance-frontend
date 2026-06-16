<script setup>
import { onMounted, computed } from 'vue'
import { useAccountsStore } from '@/stores/accounts'
import { useTransactionsStore } from '@/stores/transactions'
import { useCategoriesStore } from '@/stores/categories'

const accountsStore = useAccountsStore()
const transactionsStore = useTransactionsStore()
const categoriesStore = useCategoriesStore()

// При монтировании обновляем все данные с FastAPI
onMounted(() => {
  accountsStore.fetchAccounts()
  transactionsStore.fetchTransactions()
  categoriesStore.fetchCategories()
})

// 1. Расчет общей суммы на всех счетах
const totalBalance = computed(() => {
  return accountsStore.items.reduce((sum, account) => sum + Number(account.balance), 0)
})

// 2. Расчет общего объема доходов (суммируем только положительные транзакции)
const totalIncome = computed(() => {
  return transactionsStore.listData.items
    .filter(t => t.transaction_type === 'доходы')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

// 3. Расчет общего объема расходов (суммируем отрицательные транзакции)
const totalExpenses = computed(() => {
  return transactionsStore.listData.items
    .filter(t => t.transaction_type === 'расходы')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

// 4. Получение списка последних 5 транзакций для вывода в быструю таблицу
const recentTransactions = computed(() => {
  return transactionsStore.listData.items.slice(0, 5)
})

// Вспомогательные хелперы для названий/иконок из кэша Pinia
const getAccountName = (id) => accountsStore.items.find(a => a.id === id)?.name || `Счет #${id}`
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

    <div v-else class="space-y-8">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div class="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-sm border border-indigo-500 relative overflow-hidden">
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
        
        <div class="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
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
                  <span class="font-medium text-sm text-gray-900 block truncate">{{ acc.name }} ({{ acc.currency}})</span>
                </div>
                <span class="font-bold text-sm" :class="acc.balance >= 0 ? 'text-gray-900' : 'text-red-600'">
                  {{ acc.balance.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-gray-900 text-lg">Последние операции</h3>
            <router-link :to="{ name: 'transactions' }" class="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
              Весь журнал &rarr;
            </router-link>
          </div>

          <div v-if="recentTransactions.length === 0" class="text-center py-12 text-sm text-gray-400 italic">
            Вы еще не проводили операций.
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div 
              v-for="t in recentTransactions" 
              :key="t.id"
              class="py-3 flex items-center justify-between text-sm hover:bg-gray-50 transition-colors px-1 rounded-lg"
            >
              <div class="flex items-center space-x-3 truncate">
                <div class="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
                  {{ getCategoryIcon(t.category_id) }}
                </div>
                <div class="truncate">
                  <span class="font-semibold text-gray-900 block truncate">{{ getCategoryName(t.category_id) }}</span>
                  <span class="text-xs text-gray-400">💳 {{ getAccountName(t.account_id) }}</span>
                </div>
              </div>

              <div class="text-right">
                <span class="font-bold text-base block" :class="t.transaction_type === 'доходы' ? 'text-green-600' : 'text-red-600'">
                  {{ t.transaction_type === 'доходы' ? '+' : '- ' }}{{ t.amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) }}
                </span>
                <span class="text-[10px] text-gray-400 truncate max-w-[120px] block italic">
                  {{ t.description || 'Без описания' }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>