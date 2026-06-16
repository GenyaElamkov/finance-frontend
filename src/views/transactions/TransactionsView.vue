<script setup>
import { onMounted, ref } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import { useAccountsStore } from '@/stores/accounts'
import { useCategoriesStore } from '@/stores/categories'

const transactionsStore = useTransactionsStore()
const accountsStore = useAccountsStore()
const categoriesStore = useCategoriesStore()

// Состояние формы новой транзакции
const type = ref('расходы') // 'expense' или 'income'
const amount = ref('')
const accountId = ref('')
const categoryId = ref('')
const description = ref('')
const transactionDate = ref(new Date().toISOString().slice(0, 10)) // по умолчанию сегодня
const formError = ref('')

onMounted(() => {
  transactionsStore.fetchTransactions()
  accountsStore.fetchAccounts()
  categoriesStore.fetchCategories()
})

const handleCreateTransaction = async () => {
  formError.value = ''
  
  if (!amount.value || amount.value <= 0) {
    formError.value = 'Сумма должна быть больше нуля'
    return
  }
  if (!accountId.value) {
    formError.value = 'Выберите счет для проведения операции'
    return
  }

  if (!categoryId.value) {
    formError.value = 'Выберите категорию для проведения операции'
    return
  }

  try {
    // Вычисляем знак суммы: расходы сохраняем со знаком минус (или передаем тип, если бэкенд строго его требует)
    // const finalAmount = type.value === 'расходы' ? -Math.abs(amount.value) : Math.abs(amount.value)
    const finalAmount = Math.abs(Number(amount.value))

    await transactionsStore.addTransaction({
      amount: finalAmount,
      account_id: Number(accountId.value),
      category_id: categoryId.value ? Number(categoryId.value) : null,
      description: description.value.trim(),
      transaction_type: type.value,
      transaction_date: transactionDate.value
    })

    // Очистка формы
    amount.value = ''
    categoryId.value = ''
    description.value = ''
    transactionDate.value = new Date().toISOString().slice(0, 10)
  } catch (err) {
    formError.value = 'Ошибка создания транзакции. Проверьте остаток на счете.'
  }
}

const handleDelete = async (id) => {
  if (confirm('Удалить эту операцию? Баланс счета будет пересчитан.')) {
    try {
      await transactionsStore.removeTransaction(id)
    } catch (err) {
      alert('Не удалось удалить транзакцию.')
    }
  }
}

// Вспомогательные методы для поиска названий по ID в кэше Pinia
const getAccountName = (id) => accountsStore.items.find(a => a.id === id)?.name || `Счет #${id}`
const getCategoryName = (id) => categoriesStore.items.find(c => c.id === id)?.name || 'Без категории  '
const getCategoryIcon = (id) => categoriesStore.items.find(c => c.id === id)?.icon || '📝'
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Транзакции</h1>
      <p class="text-sm text-gray-500 mt-1">Журнал доходов и расходов. Все изменения мгновенно влияют на баланс счетов.</p>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">➕ Новая операция</h2>
        <div class="inline-flex rounded-lg bg-gray-100 p-0.5">
          <button 
            @click="type = 'расходы'"
            type="button"
            :class="[type === 'расходы' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900', 'px-3 py-1 text-xs font-medium rounded-md transition-all']"
          >
            📉 Расход
          </button>
          <button 
            @click="type = 'доходы'"
            type="button"
            :class="[type === 'доходы' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-900', 'px-3 py-1 text-xs font-medium rounded-md transition-all']"
          >
            📈 Доход
          </button>
        </div>
      </div>

      <div v-if="formError" class="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">
        {{ formError }}
      </div>

      <form @submit.prevent="handleCreateTransaction" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div class="flex-1 w-full">
          <label class="block text-sm font-medium text-gray-700 mb-1">Сумма</label>
          <input 
            v-model.number="amount"
            type="number" 
            step="0.01"
            placeholder="0.00"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div class="flex-1 w-full">
          <label class="block text-sm font-medium text-gray-700 mb-1">Счет списания/зачисления</label>
          <div class="relative">
            <select 
              v-model="accountId"
              class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white pr-8"
              required
            >
              <option value="" disabled>Выберите кошелек</option>
              <option v-for="acc in accountsStore.items" :key="acc.id" :value="acc.id">
                {{ acc.name }} ({{ acc.balance }} ₽)
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
            </div> 
          </div>
        </div>

        <div class="flex-1 w-full">
          <label class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
          <div class="relative">
            <select 
              v-model="categoryId"
              class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white pr-8"
            >
              <option value="" disabled>Выберите категорию</option>
              <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">
                {{ cat.parent_id ? '— ' : '' }}{{ cat.icon || '🏷️' }} {{ cat.name }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div> 
          </div>
        </div>

        <div class="flex-1 w-full">
          <label class="block text-sm font-medium text-gray-700 mb-1">Дата транзакции</label>
          <input 
            v-model="transactionDate"
            type="date" 
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div class="flex-1 w-full">
          <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
          <input 
            v-model="description"
            type="text" 
            placeholder="Например: Покупка продуктов в пост"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <button 
          type="submit"
          :disabled="transactionsStore.isLoading"
          class="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          Провести
        </button>
      </form>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="transactionsStore.isLoading && transactionsStore.listData.items.length === 0" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <div v-else>
        <div v-if="transactionsStore.listData.items.length === 0" class="text-center py-12 text-gray-500">
          У вас еще нет ни одной операции. Проведите первую транзакцию выше!
        </div>

        <div v-else>
          <div class="hidden sm:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead class="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th class="px-6 py-4">Категория</th>
                  <th class="px-6 py-4">Счет</th>
                  <th class="px-6 py-4">Комментарий</th>
                  <th class="px-6 py-4">Дата</th>
                  <th class="px-6 py-4 text-right">Сумма</th>
                  <th class="px-6 py-4 text-center">Действия</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 text-gray-700">
                <tr v-for="t in transactionsStore.listData.items" :key="t.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap font-medium flex items-center space-x-2">
                    <span>{{ getCategoryIcon(t.category_id) }}</span>
                    <span>{{ getCategoryName(t.category_id) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                    💳 {{ getAccountName(t.account_id) }}
                  </td>
                  <td class="px-6 py-4 max-w-xs truncate text-gray-400">
                    {{ t.description || '—' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                    {{ t.transaction_date }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right font-bold text-base">
                    <span :class="t.transaction_type === 'расходы' ? 'text-red-600': 'text-green-600'">
                      {{ t.transaction_type === 'расходы' ? '-' : '+' }}{{ Math.abs(t.amount).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <button @click="handleDelete(t.id)" class="text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded">
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="block sm:hidden divide-y divide-gray-100">
            <div 
              v-for="t in transactionsStore.listData.items" 
              :key="t.id" 
              class="p-4 flex flex-col space-y-2 hover:bg-gray-50"
            >
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2 font-medium text-gray-900">
                  <span>{{ getCategoryIcon(t.category_id) }}</span>
                  <span>{{ getCategoryName(t.category_id) }}</span>
                </div>
                <span class="font-bold text-lg" :class="t.amount >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ t.amount >= 0 ? '+' : '' }}{{ t.amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' }) }}
                </span>
              </div>
              
              <div class="flex justify-between items-center text-xs text-gray-500">
                <div>
                  <span class="mr-3">💳 {{ getAccountName(t.account_id) }}</span>
                  <p v-if="t.description" class="text-gray-400 mt-1 italic">«{{ t.description }}»</p>
                </div>
                <button @click="handleDelete(t.id)" class="text-red-400 active:text-red-600 p-2 text-sm">
                  Удалить
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>