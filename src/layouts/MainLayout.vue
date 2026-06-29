<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Управление мобильной шторкой
const isMobileMenuOpen = ref(false)

const navigationItems = [
  { name: 'Обзор', viewName: 'dashboard', icon: '📊' },
  { name: 'Мои счета', viewName: 'accounts', icon: '💳' },
  { name: 'Категории', viewName: 'categories', icon: '🏷️' },
  { name: 'Транзакции', viewName: 'transactions', icon: '📝' },
  { name: 'Аналитика', viewName: 'analytics', icon: '📈' },
]

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col md:flex-row w-full overflow-x-hidden">
    
    <header class="md:hidden w-full flex items-center justify-between bg-white px-4 py-3.5 border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <router-link :to="{ name: 'dashboard' }" class="flex items-center space-x-2 active:opacity-80">
        <span class="text-2xl">🪙</span>
        <span class="font-black text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">FinTrack</span>
      </router-link>
      
      <button 
        @click="isMobileMenuOpen = true"
        class="p-2 rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus:outline-none transition-colors"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </header>

    <aside class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 left-0 bg-white border-r border-gray-200 p-5 justify-between z-20">
      <div class="space-y-6">
        <router-link :to="{ name: 'dashboard' }" class="flex items-center space-x-3 px-2 hover:opacity-90 transition-opacity">
          <span class="text-3xl">🪙</span>
          <span class="font-black text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
            FinTrack
          </span>
        </router-link>

        <nav class="space-y-1">
          <router-link
            v-for="item in navigationItems"
            :key="item.viewName"
            :to="{ name: item.viewName }"
            class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            :class="route.name === item.viewName 
              ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm' 
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
          >
            <span class="text-lg">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </div>

      <div class="space-y-3.5">
        <div v-if="authStore.user" class="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
          <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm uppercase shrink-0">
            {{ authStore.user?.username?.charAt(0) || 'U' }}
          </div>
          <div class="truncate">
            <span class="text-xs text-gray-400 block">Вы вошли как</span>
            <span class="text-sm font-semibold text-gray-800 block truncate">{{ authStore.user?.full_name || authStore.user?.email }}</span>
          </div>
        </div>

        <button 
          @click="handleLogout"
          class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
        >
          <span>🚪</span>
          <span>Выйти из аккаунта</span>
        </button>
      </div>
    </aside>

    <div v-if="isMobileMenuOpen" class="md:hidden fixed inset-0 z-50 flex">
      <div @click="isMobileMenuOpen = false" class="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm transition-opacity"></div>

      <div class="relative flex flex-col w-full max-w-xs bg-white pt-5 pb-4 px-4 justify-between shadow-2xl h-full animate-slide-in">
        <div class="space-y-6">
          <div class="flex items-center justify-between px-2">
            <span class="font-black text-lg text-gray-900">Навигация</span>
            <button @click="isMobileMenuOpen = false" class="text-gray-400 hover:text-gray-600 p-2 text-xl font-bold">
              ✕
            </button>
          </div>

          <nav class="space-y-1">
            <router-link
              v-for="item in navigationItems"
              :key="item.viewName"
              :to="{ name: item.viewName }"
              @click="isMobileMenuOpen = false"
              class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              :class="route.name === item.viewName 
                ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                : 'text-gray-500 hover:bg-gray-50'"
            >
              <span class="text-lg">{{ item.icon }}</span>
              <span>{{ item.name }}</span>
            </router-link>
          </nav>
        </div>

        <div class="space-y-3 border-t border-gray-100 pt-4">
          <div v-if="authStore.user" class="flex items-center space-x-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100 mx-1">
            <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-sm uppercase shrink-0">
              {{ authStore.user?.username?.charAt(0) || 'U' }}
            </div>
            <div class="truncate">
              <span class="text-[10px] text-gray-400 block">Аккаунт</span>
              <span class="text-sm font-semibold text-gray-800 block truncate">{{ authStore.user?.full_name || authStore.user?.email }}</span>
            </div>
          </div>

          <button 
            @click="handleLogout"
            class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all w-full text-left"
          >
            <span>🚪</span>
            <span>Выйти из аккаунта</span>
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 min-w-0 md:pl-64 flex flex-col">
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <router-view /> 
      </main>
    </div>

  </div>
</template>

<style scoped>
.animate-slide-in {
  animation: slideRight 0.2s ease-out forwards;
}
@keyframes slideRight {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
</style>