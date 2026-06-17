<script setup>
import { onMounted, ref, computed, nextTick, onUnmounted, watch } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import { useAccountsStore } from '@/stores/accounts'
import { useCategoriesStore } from '@/stores/categories'

const transactionsStore = useTransactionsStore()
const accountsStore = useAccountsStore()
const categoriesStore = useCategoriesStore()

// Состояние формы
const type = ref('расходы') 
const amount = ref('')
const accountId = ref('')
const categoryId = ref('')
const description = ref('')
const transactionDate = ref(new Date().toISOString().slice(0, 10)) 
const formError = ref('')

// НАСТРОЙКИ БЕСКОНЕЧНОЙ ПАГИНАЦИИ
const currentPage = ref(1)
const pageSize = ref(20)
let observer = null

// Проверяем, есть ли ещё данные
const hasMore = computed(() => transactionsStore.hasMore())

// Состояние загрузки
const isLoading = computed(() => transactionsStore.isLoading)

// Получение названий
const getAccountName = (id) => accountsStore.items.find(a => a.id === id)?.name || `Счет #${id}`
const getCategoryName = (id) => categoriesStore.items.find(c => c.id === id)?.name || 'Без категории'
const getCategoryIcon = (id) => categoriesStore.items.find(c => c.id === id)?.icon || '📝'

onMounted(() => {
  loadInitialTransactions()
  accountsStore.fetchAccounts()
  categoriesStore.fetchCategories()
  initInfiniteScroll()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

// Сборка параметров
const getPaginationParams = () => {
  return {
    page: currentPage.value,
    page_size: pageSize.value
  }
}

// Первая загрузка
const loadInitialTransactions = () => {
  currentPage.value = 1
  transactionsStore.fetchTransactions(getPaginationParams(), false)
}

// Загрузка следующей страницы
const loadMoreTransactions = async () => {
  if (isLoading.value || !hasMore.value) return
  
  currentPage.value++
  await transactionsStore.fetchTransactions(getPaginationParams(), true)
}

// Настройка Intersection Observer
const initInfiniteScroll = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value && !isLoading.value) {
      loadMoreTransactions()
    }
  }, {
    root: null,
    rootMargin: '200px',
    threshold: 0.1
  })

  nextTick(() => {
    const trigger = document.getElementById('infinite-scroll-trigger')
    if (trigger) observer.observe(trigger)
  })
}

// Создание транзакции
const handleCreateTransaction = async () => {
  formError.value = ''
  
  if (!amount.value || Number(amount.value) <= 0) {
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
    const finalAmount = Math.abs(Number(amount.value))

    await transactionsStore.addTransaction({
      amount: finalAmount,
      account_id: Number(accountId.value),
      category_id: Number(categoryId.value),
      description: description.value.trim(),
      transaction_type: type.value,
      transaction_date: transactionDate.value
    })

    // Очистка формы
    amount.value = ''
    categoryId.value = ''
    description.value = ''
    transactionDate.value = new Date().toISOString().slice(0, 10)
    
    // Сброс на первую страницу
    loadInitialTransactions()
    
    // Перенастройка observer после обновления DOM
    nextTick(() => {
      initInfiniteScroll()
    })
  } catch (err) {
    formError.value = 'Ошибка создания транзакции. Проверьте остаток на счете.'
  }
}

// Удаление транзакции
const handleDelete = async (id) => {
  if (confirm('Удалить эту операцию? Баланс счета будет пересчитан.')) {
    try {
      await transactionsStore.removeTransaction(id)
    } catch (err) {
      alert('Не удалось удалить транзакцию.')
    }
  }
}

// Форматирование суммы
const formatAmount = (amount, type) => {
  const sign = type === 'расходы' ? '-' : '+'
  return `${sign}${Math.abs(amount).toLocaleString('ru-RU', { 
    style: 'currency', 
    currency: 'RUB' 
  })}`
}
</script>

<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Транзакции</h1>
      <p class="text-sm text-gray-500 mt-1">
        Журнал доходов и расходов. Все изменения мгновенно влияют на баланс счетов.
      </p>
    </div>

    <!-- Форма создания -->
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">➕ Новая операция</h2>
        <div class="inline-flex rounded-lg bg-gray-100 p-0.5">
          <button 
            @click="type = 'расходы'"
            type="button"
            :class="[
              type === 'расходы' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900',
              'px-3 py-1 text-xs font-medium rounded-md transition-all'
            ]"
          >
            📉 Расход
          </button>
          <button 
            @click="type = 'доходы'"
            type="button"
            :class="[
              type === 'доходы' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-900',
              'px-3 py-1 text-xs font-medium rounded-md transition-all'
            ]"
          >
            📈 Доход
          </button>
        </div>
      </div>

      <div v-if="formError" class="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">
        {{ formError }}
      </div>

      <form @submit.prevent="handleCreateTransaction" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
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

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Счет</label>
          <select 
            v-model="accountId"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white"
            required
          >
            <option value="" disabled>Выберите кошелек</option>
            <option v-for="acc in accountsStore.items" :key="acc.id" :value="acc.id">
              {{ acc.name }} ({{ acc.balance }} ₽)
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
          <select 
            v-model="categoryId"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white"
            required
          >
            <option value="" disabled>Выберите категорию</option>
            <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">
              {{ cat.parent_id ? '— ' : '' }}{{ cat.icon || '🏷️' }} {{ cat.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Дата</label>
          <input 
            v-model="transactionDate"
            type="date" 
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
          <input 
            v-model="description"
            type="text" 
            placeholder="Например: Покупка продуктов"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 lg:col-span-5"
        >
          Провести операцию
        </button>
      </form>
    </div>

    <!-- Список транзакций -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Загрузка -->
      <div v-if="isLoading && transactionsStore.listData.items.length === 0" 
           class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Пустой список -->
      <div v-else-if="transactionsStore.listData.items.length === 0" 
           class="text-center py-12 text-gray-500">
        У вас еще нет ни одной операции. Проведите первую транзакцию выше!
      </div>

      <!-- Список с пагинацией -->
      <div v-else>
        <!-- Десктопная версия -->
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
              <tr v-for="t in transactionsStore.listData.items" 
                  :key="t.id" 
                  class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap font-medium">
                  <span>{{ getCategoryIcon(t.category_id) }}</span>
                  <span class="ml-2">{{ getCategoryName(t.category_id) }}</span>
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
                <td class="px-6 py-4 whitespace-nowrap text-right font-bold">
                  <span :class="t.transaction_type === 'расходы' ? 'text-red-600' : 'text-green-600'">
                    {{ formatAmount(t.amount, t.transaction_type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <button @click="handleDelete(t.id)" 
                          class="text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Мобильная версия -->
        <div class="block sm:hidden divide-y divide-gray-100">
          <div v-for="t in transactionsStore.listData.items" 
               :key="t.id" 
               class="p-4 flex flex-col space-y-2 hover:bg-gray-50">
            <div class="flex justify-between items-center">
              <div class="flex items-center space-x-2 font-medium text-gray-900">
                <span>{{ getCategoryIcon(t.category_id) }}</span>
                <span>{{ getCategoryName(t.category_id) }}</span>
              </div>
              <span class="font-bold text-lg" 
                    :class="t.transaction_type === 'расходы' ? 'text-red-600' : 'text-green-600'">
                {{ formatAmount(t.amount, t.transaction_type) }}
              </span>
            </div>
            <div class="flex justify-between items-center text-xs text-gray-500">
              <div>
                <span class="mr-3">💳 {{ getAccountName(t.account_id) }}</span>
                <span class="text-gray-400">{{ t.transaction_date }}</span>
                <p v-if="t.description" class="text-gray-400 mt-1 italic">«{{ t.description }}»</p>
              </div>
              <button @click="handleDelete(t.id)" 
                      class="text-red-400 active:text-red-600 p-2 text-sm">
                Удалить
              </button>
            </div>
          </div>
        </div>
      
        <!-- Триггер бесконечной прокрутки -->
        <div id="infinite-scroll-trigger" 
             class="w-full py-6 flex justify-center items-center bg-gray-50 border-t border-gray-100">
          <div v-if="isLoading" class="flex items-center space-x-2 text-sm text-gray-500">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span>Загрузка следующих операций...</span>
          </div>
          <div v-else-if="!hasMore && transactionsStore.listData.items.length > 0" 
               class="text-xs text-gray-400 italic">
            ✨ Вы просмотрели весь журнал операций ({{ transactionsStore.listData.total }})
          </div>
          <div v-else-if="!isLoading" class="text-xs text-gray-400">
            ↓ Прокрутите для загрузки следующих операций
          </div>
        </div>
      </div>
    </div>
  </div>
</template>