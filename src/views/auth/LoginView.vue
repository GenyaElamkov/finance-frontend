<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Реактивные переменные для полей формы
const email = ref('')
const password = ref('')
const errorMessage = ref('')

const handleSubmit = async () => {
  // Сбрасываем ошибку перед новой попыткой
  errorMessage.value = ''

  // Базовая валидация на фронтенде
  if (!email.value || !password.value) {
    errorMessage.value = 'Пожалуйста, заполните все поля.'
    return
  }

  try {
    // Вызываем метод из Pinia стора, который мы написали ранее
    await authStore.login(email.value, password.value)
  } catch (error) {
    // Обработка ошибок от FastAPI бэкенда
    if (error.response && error.response.status === 401) {
      errorMessage.value = 'Неверный email или password.'
    } else if (error.response && error.response.data?.detail) {
      errorMessage.value = error.response.data.detail
    } else {
      errorMessage.value = 'Произошла ошибка при входе. Попробуйте позже.'
    }
  }
}
</script>

<template>
  <div class="flex flex-col justify-center min-h-full px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center text-4xl">💰</div>
      <h2 class="mt-6 text-2xl font-bold tracking-tight text-center text-gray-900">
        Вход в личный кабинет
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

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium leading-6 text-gray-900">
              Email адрес
            </label>
            <div class="mt-2">
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium leading-6 text-gray-900">
                Пароль
              </label>
            </div>
            <div class="mt-2">
              <input
                id="password"
                v-model="password"
                type="password"
                autocomplete="current-password"
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
                Входим...
              </span>
              <span v-else>Войти</span>
            </button>
          </div>
        </form>

        <p class="mt-10 text-sm text-center text-gray-500">
          Еще нет аккаунта?
          {{ ' ' }}
          <router-link 
            :to="{ name: 'register' }" 
            class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Зарегистрироваться
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>