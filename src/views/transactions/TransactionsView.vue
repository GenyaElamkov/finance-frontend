<script setup>
import { onMounted, ref, computed, nextTick, onUnmounted } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import { useAccountsStore } from '@/stores/accounts'
import { useCategoriesStore } from '@/stores/categories'

const transactionsStore = useTransactionsStore()
const accountsStore = useAccountsStore()
const categoriesStore = useCategoriesStore()

// Состояние формы создания
const type = ref('расходы') 
const amount = ref('')
const accountId = ref('')
const categoryId = ref('')
const description = ref('')
const transactionDate = ref(new Date().toISOString().slice(0, 10)) 
const formError = ref('')

// Состояние инлайн редактирования
const editingId = ref(null) // ID транзакции, которую сейчас редактируют
const editForm = ref({
  amount: 0,
  account_id: null,
  category_id: null,
  description: '',
  transaction_type: 'расходы',
  transaction_date: ''
})

// Настройка бесконечено пагинации и сортировки
const currentPage = ref(1)
const pageSize = ref(20)
const isDescSort = ref(false)
let observer = null

const hasMore = computed(() => transactionsStore.hasMore())
const isLoading = computed(() => transactionsStore.isLoading)

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

// Методы для работы с пагинацией и сортировкой
const getPaginationParams = () => {
  return {
    page: currentPage.value,
    page_size: pageSize.value,
    date_sort: isDescSort.value
  }
}

const loadInitialTransactions = () => {
  currentPage.value = 1
  transactionsStore.fetchTransactions(getPaginationParams(), false)
}

const loadMoreTransactions = async () => {
  if (isLoading.value || !hasMore.value) return
  currentPage.value++
  await transactionsStore.fetchTransactions(getPaginationParams(), true)
}

const toggleDateSort = () => {
  isDescSort.value = !isDescSort.value,
  loadInitialTransactions()
  nextTick(() => {
    initInfiniteScroll()
  })
}

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

// Вход в режим редактирования строки
const startEdit = (transaction) => {
  // Если мы кликнули на уже редактируемую строку, ничего не делаем
  if (editingId.value === transaction.id) return
  
  editingId.value = transaction.id
  editForm.value = { 
    amount: Math.abs(transaction.amount),
    account_id: transaction.account_id,
    category_id: transaction.category_id,
    description: transaction.description || '',
    transaction_type: transaction.transaction_type,
    transaction_date: transaction.transaction_date
  }
}

// Отмена редактирования
const cancelEdit = () => {
  editingId.value = null
}

// Сохранение отредактированной строки
const handleUpdateTransaction = async (id) => {
  if (!editForm.value.amount || Number(editForm.value.amount) <= 0) {
    alert('Сумма должна быть больше нуля')
    return
  }
  
  try {
    await transactionsStore.updateTransaction(id, {
      amount: Math.abs(Number(editForm.value.amount)),
      account_id: Number(editForm.value.account_id),
      category_id: editForm.value.category_id ? Number(editForm.value.category_id) : null,
      description: editForm.value.description.trim(),
      transaction_type: editForm.value.transaction_type,
      transaction_date: editForm.value.transaction_date
    })
    editingId.value = null
    // Обновляем счета, так как баланс мог измениться
    accountsStore.fetchAccounts()
  } catch (err) {
    alert('Ошибка при обновлении транзакции.')
  }
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

  try {
    const finalAmount = Math.abs(Number(amount.value))

    await transactionsStore.addTransaction({
      amount: finalAmount,
      account_id: Number(accountId.value),
      category_id: categoryId.value ? Number(categoryId.value) : null,
      description: description.value.trim(),
      transaction_type: type.value,
      transaction_date: transactionDate.value
    })

    amount.value = ''
    categoryId.value = ''
    description.value = ''
    transactionDate.value = new Date().toISOString().slice(0, 10)
    
    loadInitialTransactions()
    
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

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const [year, month, day] = dateString.split('-')
  return `${day}.${month}.${year}`
}

</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Транзакции</h1>
      <p class="text-sm text-gray-500 mt-1">
        Журнал доходов и расходов. Все изменения мгновенно влияют на баланс счетов.
      </p>
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
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Сумма</label>
          <input v-model.number="amount" type="number" step="0.01" placeholder="0.00" class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" required />
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
          <input v-model="transactionDate" type="date" class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-1.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
          <input v-model="description" type="text" placeholder="Например: Покупка продуктов" class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>

        <button type="submit" :disabled="isLoading" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 lg:col-span-5">
          Провести операцию
        </button>
      </form>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      
      <div class="block sm:hidden p-4 bg-gray-50 border-b border-gray-100 text-right">
        <button @click="toggleDateSort" class="text-xs font-medium focus:outline-none">
          Сортировка по дате: {{ isDescSort ? '⬇️ Сначала старые' : '⬆️ Сначала новые' }}
        </button>
      </div>
      
      <div v-if="isLoading && transactionsStore.listData.items.length === 0" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <div v-else-if="transactionsStore.listData.items.length === 0" class="text-center py-12 text-gray-500">
        У вас еще нет ни одной операции.
      </div>

      <div v-else>
        <div class="hidden sm:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead class="bg-gray-50 text-gray-500 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th class="px-4 py-4">Категория</th>
                <th class="px-4 py-4">Счет</th>
                <th class="px-4 py-4">Комментарий</th>

                <th class="px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none" @click="toggleDateSort">
                  <div class="flex items-center space-x-1">
                    <span>Дата</span>
                    <span class="text-indigo-600 font-bold text-sm">{{ isDescSort ? '⇣' : '⇡' }}</span>
                  </div>
                </th>

                <th class="px-4 py-4 text-right">Тип / Сумма</th>
                <th class="px-4 py-4 text-center">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-gray-700默认">
              <tr 
                v-for="t in transactionsStore.listData.items" 
                :key="t.id" 
                @click="startEdit(t)"
                :class="[editingId === t.id ? 'bg-indigo-50/50' : 'hover:bg-gray-50 cursor-pointer', 'transition-colors']"
              >
                <td class="px-4 py-3 whitespace-nowrap font-medium">
                  <div v-if="editingId === t.id" @click.stop>
                    <select v-model="editForm.category_id" class="rounded border-gray-300 py-1 px-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                      <option :value="null">Без категории</option>
                      <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">
                        {{ cat.icon || '🏷️' }} {{ cat.name }}
                      </option>
                    </select>
                  </div>
                  <div v-else class="flex items-center space-x-2">
                    <span>{{ getCategoryIcon(t.category_id) }}</span>
                    <span>{{ getCategoryName(t.category_id) }}</span>
                  </div>
                </td>

                <td class="px-4 py-3 whitespace-nowrap text-gray-500">
                  <div v-if="editingId === t.id" @click.stop>
                    <select v-model="editForm.account_id" class="rounded border-gray-300 py-1 px-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                      <option v-for="acc in accountsStore.items" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
                    </select>
                  </div>
                  <span v-else>💳 {{ getAccountName(t.account_id) }}</span>
                </td>

                <td class="px-4 py-3 max-w-xs truncate text-gray-400">
                  <div v-if="editingId === t.id" @click.stop>
                    <input v-model="editForm.description" type="text" class="w-full rounded border-gray-300 py-1 px-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <span v-else>{{ t.description || '—' }}</span>
                </td>

                <td class="px-4 py-3 whitespace-nowrap text-gray-500">
                  <div v-if="editingId === t.id" @click.stop>
                    <input v-model="editForm.transaction_date" type="date" class="rounded border-gray-300 py-1 px-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <span v-else>{{ formatDate(t.transaction_date) }}</span>
                </td>

                <td class="px-4 py-3 whitespace-nowrap text-right font-bold">
                  <div v-if="editingId === t.id" @click.stop class="flex items-center justify-end space-x-2">
                    <select v-model="editForm.transaction_type" class="rounded border-gray-300 py-1 px-1.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                      <option value="расходы">📉 Расход</option>
                      <option value="доходы">📈 Доход</option>
                    </select>
                    <input v-model.number="editForm.amount" type="number" step="0.01" class="w-24 rounded border-gray-300 py-1 px-2 text-sm text-right focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
                  </div>
                  <span v-else :class="t.transaction_type === 'расходы' ? 'text-red-600' : 'text-green-600'">
                    {{ formatAmount(t.amount, t.transaction_type) }}
                  </span>
                </td>

                <td class="px-4 py-3 whitespace-nowrap text-center" @click.stop>
                  <div v-if="editingId === t.id" class="flex items-center justify-center space-x-2">
                    <button @click="handleUpdateTransaction(t.id)" class="text-xs text-white px-2 py-1 rounded">
                      ✔️
                    </button>
                    <button @click="cancelEdit" class="text-xs text-gray-700 px-2 py-1 rounded">
                      ❌
                    </button>
                  </div>
                  <div v-else>
                    <button @click="handleDelete(t.id)" class="text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="block sm:hidden divide-y divide-gray-100">
          <div 
            v-for="t in transactionsStore.listData.items" 
            :key="t.id" 
            @click="startEdit(t)"
            :class="[editingId === t.id ? 'bg-indigo-50/50 p-4' : 'p-4 hover:bg-gray-50', 'flex flex-col space-y-2']"
          >
            <div v-if="editingId === t.id" @click.stop class="space-y-3">
              <div class="grid grid-cols-2 gap-2">
                <select v-model="editForm.transaction_type" class="w-full text-xs rounded border-gray-300 p-2 bg-white">
                  <option value="расходы">📉 Расход</option>
                  <option value="доходы">📈 Доход</option>
                </select>
                <input v-model.number="editForm.amount" type="number" step="0.01" class="w-full text-sm rounded border-gray-300 p-2 text-right font-bold" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <select v-model="editForm.account_id" class="w-full text-xs rounded border-gray-300 p-2 bg-white">
                  <option v-for="acc in accountsStore.items" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
                </select>
                <select v-model="editForm.category_id" class="w-full text-xs rounded border-gray-300 p-2 bg-white">
                  <option :value="null">Без категории</option>
                  <option v-for="cat in categoriesStore.items" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <input v-model="editForm.description" type="text" placeholder="Комментарий" class="w-full text-xs rounded border-gray-300 p-2" />
              <input v-model="editForm.transaction_date" type="date" class="w-full text-xs rounded border-gray-300 p-2" />
              <div class="flex space-x-2 pt-1">
                <button @click="handleUpdateTransaction(t.id)" class="w-1/2 bg-green-600 text-white text-xs py-2 rounded font-medium">Сохранить</button>
                <button @click="cancelEdit" class="w-1/2 bg-gray-200 text-gray-700 text-xs py-2 rounded font-medium">Отмена</button>
              </div>
            </div>

            <template v-else>
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2 font-medium text-gray-900">
                  <span>{{ getCategoryIcon(t.category_id) }}</span>
                  <span>{{ getCategoryName(t.category_id) }}</span>
                </div>
                <span class="font-bold text-lg" :class="t.transaction_type === 'расходы' ? 'text-red-600' : 'text-green-600'">
                  {{ formatAmount(t.amount, t.transaction_type) }}
                </span>
              </div>
              <div class="flex justify-between items-center text-xs text-gray-500">
                <div>
                  <span class="mr-3">💳 {{ getAccountName(t.account_id) }}</span>
                  <span class="text-gray-400">{{ formatDate(t.transaction_date) }}</span>
                  <p v-if="t.description" class="text-gray-400 mt-1 italic">«{{ t.description }}»</p>
                </div>
                <button @click.stop="handleDelete(t.id)" class="text-red-400 active:text-red-600 p-2 text-sm">
                  🗑️
                </button>
              </div>
            </template>
          </div>
        </div>
      
        <div id="infinite-scroll-trigger" class="w-full py-6 flex justify-center items-center bg-gray-50 border-t border-gray-100">
          <div v-if="isLoading" class="flex items-center space-x-2 text-sm text-gray-500">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span>Загрузка следующих операций...</span>
          </div>
          <div v-else-if="!hasMore && transactionsStore.listData.items.length > 0" class="text-xs text-gray-400 italic">
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