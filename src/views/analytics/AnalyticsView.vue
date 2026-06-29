<script setup>
  import { ref } from 'vue'

  // Интерактивная пасхалка для пользователя
  const clicks = ref(0)
  const speedProgress = ref(15)
  const statusMessage = ref('Наш единственный разработчик вовсю крутит алгоритмы... ☕')

  const boostDevelopment = () => {
    clicks.value++
    
    if (speedProgress.value < 100) {
      speedProgress.value += 5
    }

    if (clicks.value === 5) {
      statusMessage.value = 'Ого! Скорость кодинга увеличилась в 2 раза! 🚀'
    } else if (clicks.value === 12) {
      statusMessage.value = 'Сервер начинает плавиться от ваших кликов! 🔥'
    } else if (clicks.value >= 20) {
      statusMessage.value = 'ИИ подключен к разработке! Вы великолепны! 🧠✨'
      speedProgress.value = 99 // Оставим 1% для интриги
    }
  }
</script>

<template>
  <div class="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
    
    <div class="relative mb-6">
      <span class="text-6xl block animate-bounce">📊</span>
      <span class="text-3xl absolute -right-2 -bottom-2 animate-spin duration-3000">⚙️</span>
    </div>

    <h1 class="text-3xl font-black text-gray-950 tracking-tight sm:text-4xl">
      Раздел «Аналитика» на прокачке
    </h1>
    
    <p class="mt-3 text-base text-gray-500 max-w-md mx-auto leading-relaxed">
      Мы уже завезли сюда вагоны математики, графиков и ИИ, чтобы ваши доходы всегда побеждали расходы. Осталось навести финальный лоск!
    </p>

    <div class="mt-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-sm w-full space-y-4">
      <div class="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
        <span>Статус сборки</span>
        <span>{{ speedProgress }}%</span>
      </div>
      
      <div class="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5 border border-gray-50">
        <div 
          class="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
          :style="{ width: `${speedProgress}%` }"
        ></div>
      </div>

      <p class="text-xs text-indigo-600 font-medium min-h-[32px] flex items-center justify-center px-2">
        {{ statusMessage }}
      </p>

      <button 
        @click="boostDevelopment"
        type="button"
        class="w-full bg-gray-900 text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-sm"
      >
        {{ clicks >= 20 ? 'Разработка на максимуме!' : '🚀 Ускорить разработку' }}
      </button>
    </div>

    <p class="mt-8 text-xs text-gray-400">
      Ориентировочное время релиза: совсем скоро. Не переключайтесь! 😉
    </p>

  </div>
</template>

<style scoped>
/* Кастомная медленная анимация вращения шестеренки */
.duration-3000 {
  animation-duration: 3s;
}
</style>