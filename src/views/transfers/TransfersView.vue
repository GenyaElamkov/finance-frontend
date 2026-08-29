<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAccountsStore } from '@/stores/accounts'
import { useTransfersStore } from '@/stores/transfers'

defineProps({
  // Показывать ли кнопку "Отмена" (нужна в модалке, не нужна во встроенной форме)
  showCancelButton: {
    type: Boolean,
    default: false
  },
  submitLabel: {
    type: String,
    default: '🔄 Выполнить перевод'
  }
})

const emit = defineEmits(['success', 'cancel'])

const accountsStore = useAccountsStore()
const transfersStore = useTransfersStore()

// Поля формы
const fromAccountId = ref('')
const toAccountId = ref('')
const amount = ref('')
const description = ref('')
const transferDate = ref(new Date().toISOString().slice(0, 10))
const formError = ref('')
const isSubmitting = ref(false)

onMounted(() => {
  if (accountsStore.items.length === 0) {
    accountsStore.fetchAccounts()
  }
})

const fromAccount = computed(() =>
  accountsStore.items.find(a => a.id === Number(fromAccountId.value)) || null
)

// Счет зачисления: нельзя выбрать тот же счет, и (пока) только та же валюта,
// т.к. бэкенд запрещает переводы между счетами с разной валютой
const availableToAccounts = computed(() =>
  accountsStore.items.filter(a => {
    if (a.id === Number(fromAccountId.value)) return false
    if (fromAccount.value && a.currency !== fromAccount.value.currency) return false
    return true
  })
)

const hasEnoughAccounts = computed(() => accountsStore.items.length >= 2)

const formatBalance = (acc) => {
  if (!acc) return ''
  return Number(acc.balance).toLocaleString('ru-RU', {
    style: 'currency',
    currency: acc.currency || 'RUB'
  })
}

// Если сменили счет списания и счет зачисления стал недоступен - сбрасываем его
const handleFromAccountChange = () => {
  if (toAccountId.value && !availableToAccounts.value.some(a => a.id === Number(toAccountId.value))) {
    toAccountId.value = ''
  }
}

// Превращаем технические сообщения бэкенда в понятные пользователю
const mapErrorDetail = (detail) => {
  const map = {
    'Insufficient funds': 'Недостаточно средств на счете списания',
    'Currency mismatch': 'Перевод возможен только между счетами с одинаковой валютой',
    'You cannot send money between the same accounts.': 'Нельзя переводить на тот же самый счет',
    'Account not found': 'Один из счетов не найден',
  }
  return map[detail] || null
}

const resetForm = () => {
  fromAccountId.value = ''
  toAccountId.value = ''
  amount.value = ''
  description.value = ''
  transferDate.value = new Date().toISOString().slice(0, 10)
}

const handleSubmit = async () => {
  formError.value = ''

  if (!fromAccountId.value) {
    formError.value = 'Выберите счет списания'
    return
  }
  if (!toAccountId.value) {
    formError.value = 'Выберите счет зачисления'
    return
  }
  if (fromAccountId.value === toAccountId.value) {
    formError.value = 'Нельзя переводить на тот же самый счет'
    return
  }
  if (!amount.value || Number(amount.value) <= 0) {
    formError.value = 'Сумма должна быть больше нуля'
    return
  }
  if (fromAccount.value && Number(amount.value) > Number(fromAccount.value.balance)) {
    formError.value = `Недостаточно средств. Доступно: ${formatBalance(fromAccount.value)}`
    return
  }

  isSubmitting.value = true
  try {
    const created = await transfersStore.addTransfer({
      from_account_id: Number(fromAccountId.value),
      to_account_id: Number(toAccountId.value),
      amount: Number(amount.value),
      description: description.value.trim() || null,
      transfer_date: transferDate.value
    })

    resetForm()
    emit('success', created)
  } catch (err) {
    const detail = err.response?.data?.detail
    formError.value = mapErrorDetail(detail) || 'Не удалось выполнить перевод. Проверьте данные и остаток на счете.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="!hasEnoughAccounts" class="p-4 text-sm text-amber-800 bg-amber-50 rounded-lg border border-amber-100">
      Для перевода нужно как минимум два счета. Сначала добавьте еще один счет на странице «Мои счета».
    </div>

    <template v-else>
      <div v-if="formError" class="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">
        {{ formError }}
      </div>

      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Откуда</label>
          <select
            v-model="fromAccountId"
            @change="handleFromAccountChange"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white"
            required
          >
            <option value="" disabled>Счет списания</option>
            <option v-for="acc in accountsStore.items" :key="acc.id" :value="acc.id">
              {{ acc.name }} — {{ formatBalance(acc) }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Куда</label>
          <select
            v-model="toAccountId"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white"
            required
          >
            <option value="" disabled>Счет зачисления</option>
            <option v-for="acc in availableToAccounts" :key="acc.id" :value="acc.id">
              {{ acc.name }} — {{ formatBalance(acc) }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Сумма</label>
          <input
            v-model.number="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Дата</label>
          <input
            v-model="transferDate"
            type="date"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-1.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
          <input
            v-model="description"
            type="text"
            placeholder="Например: Отложил на отпуск"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div :class="showCancelButton ? 'flex gap-3 lg:col-span-5' : 'lg:col-span-5'">
          <button
            v-if="showCancelButton"
            type="button"
            @click="emit('cancel')"
            class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            :class="showCancelButton ? 'flex-1' : 'w-full'"
            class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ isSubmitting ? 'Выполняем перевод...' : submitLabel }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>
