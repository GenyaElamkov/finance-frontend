<script setup>
  import { ref } from 'vue'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()

  const email = ref('')
  const statusMessage = ref({ text: '', type: '' }) // 'success' | 'error'

  const handleForgotPassword = async () => {
    statusMessage.value = { text: '', type: '' }

    if (!email.value) {
      statusMessage.value = { text: 'Пожалуйста, введите ваш Email.', type: 'error' }
      return
    }

    try {
      const data = await authStore.forgotPassword(email.value)
      statusMessage.value = { 
        text: data.message || 'Инструкции по сбросу пароля отправлены на вашу почту.', 
        type: 'success' 
      }
      email.value = ''
    } catch (error) {
      statusMessage.value = { 
        text: error.response?.data?.detail || 'Произошла ошибка. Попробуйте позже.', 
        type: 'error' 
      }
    }
  }
</script>

<template>
  <div class="flex flex-col justify-center min-h-full px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center text-4xl">🔑</div>
      <h2 class="mt-6 text-2xl font-bold tracking-tight text-center text-gray-900">
        Восстановление доступа
      </h2>
      <p class="mt-2 text-sm text-center text-gray-500">
        Введите ваш email, и мы отправим вам ссылку для сброса старого пароля.
      </p>
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

        <form @submit.prevent="handleForgotPassword" class="space-y-6">
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
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              <span v-if="authStore.isLoading">Отправка...</span>
              <span v-else>Отправить ссылку</span>
            </button>
          </div>
        </form>

        <p class="mt-6 text-sm text-center text-gray-500">
          Вспомнили пароль?
          {{ ' ' }}
          <router-link :to="{ name: 'login' }" class="font-semibold text-indigo-600 hover:text-indigo-500">
            Вернуться ко входу
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>