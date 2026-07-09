<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  // Переходим на предыдущую страницу, если есть история, иначе на главную
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'dashboard' })
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12">
    <div class="text-center max-w-md w-full space-y-6">
      
      <div class="relative flex justify-center mb-2 select-none">
        <div class="absolute -inset-1 rounded-full bg-indigo-50 blur-2xl opacity-70 animate-pulse"></div>
        <svg class="relative w-64 h-auto text-indigo-600 drop-shadow-sm" viewBox="0 0 240 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="200" height="110" rx="12" class="stroke-current" stroke-width="4" fill="white" />
          <line x1="20" y1="100" x2="220" y2="100" class="stroke-gray-200" stroke-width="2" />
          <path d="M100 130L90 150H150L140 130" class="fill-gray-200 stroke-current" stroke-width="4" stroke-linejoin="round" />
          <circle cx="90" cy="60" r="6" class="fill-indigo-600" />
          <circle cx="150" cy="60" r="6" class="fill-indigo-600" />
          <path d="M105 85Q120 75 135 85" class="stroke-indigo-600" stroke-width="4" stroke-linecap="round" />
        </svg>
      </div>

      <div class="space-y-2">
        <h1 class="text-7xl font-black tracking-tight text-gray-900 animate-bounce-short">
          404
        </h1>
        <h2 class="text-2xl font-bold text-gray-800 tracking-tight">
          Страница не найдена
        </h2>
        <p class="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
          Похоже, этой страницы не существует, она была удалена или перенесена по новому адресу. Проверьте URL.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button 
          @click="goBack"
          type="button"
          class="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 active:scale-98 text-gray-700 text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
        >
          <span>←</span>
          <span>Назад</span>
        </button>

        <router-link 
          :to="{ name: 'dashboard' }"
          class="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-semibold rounded-xl transition-all text-center shadow-sm shadow-indigo-100 flex items-center justify-center space-x-2"
        >
          <span>🏠</span>
          <span>На главную</span>
        </router-link>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Анимация для плавного покачивания цифр */
.animate-bounce-short {
  animation: bounceShort 3s ease-in-out infinite;
}

@keyframes bounceShort {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>