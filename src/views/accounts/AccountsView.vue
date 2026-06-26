<script setup>
import { onMounted, ref } from 'vue'
import { useAccountsStore } from '@/stores/accounts'

const accountsStore = useAccountsStore()

// Состояние формы нового счета
const name = ref('')
const accountType = ref('карта')
const currency = ref('RUB')
const balance = ref(0)
const formError = ref('')

// Состояние редактирования счета
const editingId = ref(null)
const editName = ref('')
const editType = ref('')
const editCurrency = ref('')
const editBalance = ref(0)

// Загружаем счета при монтировании компонента
onMounted(() => {
  accountsStore.fetchAccounts()
})

// Включение режима редактирования
const startEdit = (account) => {
  editingId.value = account.id
  editName.value = account.name
  editType.value = account.type
  editCurrency.value = account.currency
  editBalance.value = account.initial_balance
}

// Сброс режима редактирования
const cancelEdit = () => {
  editingId.value = null
  editName.value = ''
  editType.value = ''
  editCurrency.value = ''
  editBalance.value = 0
}

// Добавление нового счета
const handleCreateAccount = async () => {
  formError.value = ''
  if (!name.value.trim()) {
    formError.value = 'Введите название счета'
    return
  }

  try {
    await accountsStore.addAccount({
      name: name.value.trim(),
      account_type: accountType.value,
      currency: currency.value,
      initial_balance: balance.value
    })

    // Очищаем форму при успехе
    name.value = ''
    accountType.value = 'карта'
    currency.value = 'RUB'
    balance.value = 0
  } catch (err) {
    formError.value = 'Ошибка при создании счета. Проверьте данные.'
  }
}

const handleUpdateAccount = async (id) => {
  if (!editName.value.trim()) {
    alert('Название счета не может быть пустым')
    return
  }

  try {
    // Вызываем метод обновления в Pinia сторе
    await accountsStore.updateAccount(id, {
      name: editName.value.trim(),
      account_type: editType.value,
      currency: editCurrency.value,
      initial_balance: editBalance.value, // Передаем измененный баланс
    })
    editingId.value = null // Выходим из режима редактирования
  } catch (err) {
    alert('Не удалось обновить счет.')
  }
}

const handleDeleteAccount = async (id) => {
  if (confirm('Вы уверены, что хотите удалить этот счет?')) {
    try {
      await accountsStore.removeAccount(id)
    } catch (err) {
      alert('Не удалось удалить счет. Возможно, к нему привязаны транзакции.')
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Мои счета</h1>
        <p class="text-sm text-gray-500 mt-1">Управляйте вашими кошельками, банковскими картами и балансами</p>
      </div>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">💳 Добавить новый счет</h2>
      
      <div v-if="formError" class="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">
        {{ formError }}
      </div>

      <form @submit.prevent="handleCreateAccount" class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1 w-full">
          <label class="block text-sm font-medium text-gray-700 mb-1">Название счета</label>
          <input 
            v-model="name"
            type="text" 
            placeholder="Например, Карта Сбер или Наличные"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>
        
        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Тип счета</label>
          <div class="relative">
            <select 
              v-model="accountType"
              class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white pr-8"
            >
              <option value="карта">Карта</option>
              <option value="наличные">Наличные</option>
              <option value="экономия">Экономия</option>
              <option value="кредит">Кредит</option>
              <option value="депозит">Депозит</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
          <div class="relative">
            <select 
              v-model="currency"
              class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white pr-8"
            >
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div class="w-full md:w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Начальный баланс</label>
          <input 
            v-model.number="balance"
            type="number" 
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <button 
          type="submit"
          :disabled="accountsStore.isLoading"
          class="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          Создать
        </button>
      </form>
    </div>

    <div v-if="accountsStore.isLoading && accountsStore.items.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="accountsStore.error" class="p-4 text-red-700 bg-red-50 rounded-xl text-center">
      {{ accountsStore.error }}
    </div>

    <div v-else>
      <div v-if="accountsStore.items.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
        У вас пока нет созданных счетов. Добавьте первый счет выше!
      </div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="account in accountsStore.items" 
          :key="account.id"
          class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div class="absolute top-0 left-0 right-0 h-1.5 "></div>
          
          <div v-if="editingId === account.id" class="space-y-4 w-full">
            <div class="flex items-center justify-between border-b pb-2 mb-2">
              <span class="text-xs font-bold text-gray-400 uppercase">Редактирование</span>
              <div class="flex space-x-2">
                <button @click="handleUpdateAccount(account.id)" class="text-green-600 hover:text-green-700 text-sm font-bold">✔️</button>
                <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600 text-sm font-bold">❌</button>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-medium text-gray-500 mb-0.5">Название</label>
              <input v-model="editName" type="text" class="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:indigo-500" />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-medium text-gray-500 mb-0.5">Тип</label>
                <select v-model="editType" class="w-full border rounded px-2 py-1 text-sm bg-white">
                  <option value="карта">Карта</option>
                  <option value="наличные">Наличные</option>
                  <option value="экономия">Экономия</option>
                  <option value="кредит">Кредит</option>
                  <option value="депозит">Депозит</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-medium text-gray-500 mb-0.5">Валюта</label>
                <select v-model="editCurrency" class="w-full border rounded px-2 py-1 text-sm bg-white">
                  <option value="RUB">RUB</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-medium text-gray-500 mb-0.5">Баланс (коррекция)</label>
                <input 
                  v-model.number="editBalance" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  class="w-full border rounded px-2 py-1 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <template v-else>
            <div class="flex justify-between items-start mb-4">
              <div @click="startEdit(account)" class="cursor-pointer group/title flex-1" title="Кликните для редактирования счета">
                <h3 class="font-bold text-gray-900 text-lg truncate max-w-[280px] group-hover/title:text-indigo-600 transition-colors">
                  {{ account.name }} <span class="text-sm font-normal text-gray-400">({{ account.currency }})</span>
                   <span class="text-[10px] ml-1.5 opacity-0 group-hover/title:opacity-100 transition-opacity">✏️</span>
                </h3>
                <span class="text-sm text-gray-500 capitalize flex items-center">
                  {{ account.type }}
                </span>
              </div>
              
              <button 
                @click="handleDeleteAccount(account.id)"
                class="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors md:opacity-0 group-hover:opacity-100"
                title="Удалить счет"
              >
                🗑️
              </button>
            </div>

            <div class="mt-4">
              <span class="text-xs text-gray-400 block uppercase font-semibold tracking-wider">Текущий баланс</span>
              <span 
                class="text-2xl font-black tracking-tight"
                :class="account.balance >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ account.balance.toLocaleString('ru-RU', { style: 'currency', currency: account.currency || 'RUB' }) }}
              </span>
            </div>
          </template>
          
        </div>
      </div> 
    </div>
  </div>
</template>