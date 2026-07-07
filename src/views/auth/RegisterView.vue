<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Реактивные переменные для полей регистрации
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')

const handleRegister = async () => {
  errorMessage.value = ''

  // Валидация совпадения паролей на фронтенде
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Пароли не совпадают.'
    return
  }

  try {
    // Отправляем объект userData, который ожидает твоя схема UserCreate на FastAPI
    await authStore.register({
      full_name: username.value,
      email: email.value,
      password: password.value
    })
  } catch (error) {
    if (error.response?.status === 409) {
      errorMessage.value = 'Этот email уже зарегистрирован. Используйте другой.'
    } else if (error.response?.status === 422) {
      errorMessage.value = 'Проверьте правильность email и пароля (мин. 8 символов, буквы и цифры).'
    } else {
      errorMessage.value = 'Не удалось создать аккаунт. Попробуйте позже.'
    }
  }
}
</script>

<template>
  <div class="flex flex-col justify-center min-h-full px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center text-4xl">🌱</div>
      <h2 class="mt-6 text-2xl font-bold tracking-tight text-center text-gray-900">
        Создать новый аккаунт
      </h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
        
        <div 
          v-if="errorMessage" 
          class="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" 
          role="alert"
        >
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium leading-6 text-gray-900">
              Имя пользователя
            </label>
            <div class="mt-2">
              <input
                id="username"
                v-model="username"
                type="text"
                required
                class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Иван Иванович"
              />
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium leading-6 text-gray-900">
              Email адрес
            </label>
            <div class="mt-2">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900">
              Пароль
            </label>
            <div class="mt-2">
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-medium leading-6 text-gray-900">
              Повторите пароль
            </label>
            <div class="mt-2">
              <input
                id="confirm-password"
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
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="authStore.isLoading" class="flex items-center">
                <svg class="w-5 h-5 mr-2 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Регистрация...
              </span>
              <span v-else>Зарегистрироваться</span>
            </button>
          </div>
        </form>

        <p class="mt-10 text-sm text-center text-gray-500">
          Уже есть аккаунт?
          {{ ' ' }}
          <router-link 
            :to="{ name: 'login' }" 
            class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Войти
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>