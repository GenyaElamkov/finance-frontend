<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const statusMessage = ref({ text: '', type: '' })

onMounted(() => {
  // Вытаскиваем токен
  if (route.query.token) {
    token.value = route.query.token
  } else {
    statusMessage.value = { 
      text: 'Токен сброса пароля отсутствует или невалиден. Запросите ссылку повторно.', 
      type: 'error' 
    }
  }
})

const handleResetPassword = async () => {
  statusMessage.value = { text: '', type: '' }

  if (!password.value || !confirmPassword.value) {
    statusMessage.value = { text: 'Заполните все поля формы.', type: 'error' }
    return
  }

  if (password.value !== confirmPassword.value) {
    statusMessage.value = { text: 'Пароли не совпадают.', type: 'error' }
    return
  }

  if (password.value.length < 8) {
    statusMessage.value = { text: 'Новый пароль должен быть не менее 8 символов.', type: 'error' }
    return
  }

  try {
    const data = await authStore.resetPassword(token.value, password.value)
    statusMessage.value = { text: data.message || 'Пароль успешно изменен!', type: 'success' }
    
    // Перенаправляем пользователя на логин через 2 секунды после успеха
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 2500)
  } catch (error) {
    statusMessage.value = { 
      text: error.response?.data?.detail || 'Срок действия ссылки истек или токен поврежден.', 
      type: 'error' 
    }
  }
}
</script>

<template>
  <div class="flex flex-col justify-center min-h-full px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center text-4xl">🔐</div>
      <h2 class="mt-6 text-2xl font-bold tracking-tight text-center text-gray-900">
        Установка нового пароля
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10 border border-gray-100">
        
        <div 
          v-if="statusMessage.text" 
          class="p-3 mb-4 text-sm rounded-lg border font-medium" 
          :class="statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'"
        >
          {{ statusMessage.text }}
        </div>

        <form v-if="token && statusMessage.type !== 'success'" @submit.prevent="handleResetPassword" class="space-y-6">
          <div>
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900">
              Новый пароль
            </label>
            <div class="mt-2">
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Минимум 8 символов"
              />
            </div>
          </div>

          <div>
            <label for="confirm_password" class="block text-sm font-medium leading-6 text-gray-900">
              Подтвердите новый пароль
            </label>
            <div class="mt-2">
              <input
                id="confirm_password"
                v-model="confirmPassword"
                type="password"
                required
                class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="flex w-full justify-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              <span v-if="authStore.isLoading">Сохранение...</span>
              <span v-else>Обновить пароль</span>
            </button>
          </div>
        </form>

        <div v-if="!token" class="text-center pt-2">
          <router-link :to="{ name: 'forgot-password' }" class="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Запросить новую ссылку восстановления
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>