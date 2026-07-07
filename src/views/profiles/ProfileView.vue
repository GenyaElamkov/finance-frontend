<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Реактивные формы
const profileForm = reactive({
  full_name: '',
  email: ''
})

const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

// Статусы процессов
const isProfileLoading = ref(false)
const isPasswordLoading = ref(false)
const isDeleteLoading = ref(false)

// Состояние модального окна удаления
const isDeleteModalOpen = ref(false)
const deleteConfirmationText = ref('')

// Управление всплывающими уведомлениями (тостами/сообщениями)
const statusMessage = ref({ text: '', type: '' }) // type: 'success' | 'error'

const showMessage = (text, type = 'success') => {
  statusMessage.value = { text, type }
  setTimeout(() => {
    statusMessage.value = { text: '', type: '' }
  }, 4000)
}

// Заполняем форму текущими данными пользователя при загрузке страницы
onMounted(() => {
  if (authStore.user) {
    profileForm.full_name = authStore.user.full_name || authStore.user.username || ''
    profileForm.email = authStore.user.email || ''
  }
})

// Форма изменения базового профиля
const handleUpdateProfile = async () => {
  if (!profileForm.full_name.trim() || !profileForm.email.trim()) {
    showMessage('Заполните обязательные поля профиля', 'error')
    return
  }
  
  isProfileLoading.value = true
  try {
    await authStore.updateProfileData({ 
      full_name: profileForm.full_name, 
      email: profileForm.email,
    })
    showMessage('Личные данные успешно обновлены!')
  } catch (error) {
    showMessage('Ошибка при обновлении профиля', 'error')
  } finally {
    isProfileLoading.value = false
  }
}

// Отдельная форма изменения пароля
const handleChangePassword = async () => {
  if (!passwordForm.old_password || !passwordForm.new_password) {
    showMessage('Заполните поля паролей', 'error')
    return
  }

  if (passwordForm.new_password !== passwordForm.confirm_password) {
    showMessage('Новый пароль и подтверждение не совпадают', 'error')
    return
  }

  if (passwordForm.new_password.length < 8 || passwordForm.old_password.length < 8) {
    showMessage('Пароли должны быть не менее 8 символов', 'error')
    return
  }

  isPasswordLoading.value = true
  try {
    await authStore.updateUserPassword({ 
      old_password: passwordForm.old_password,
      password: passwordForm.new_password 
    })
    showMessage('Пароль успешно изменен!')  
    
    passwordForm.old_password = ''
    passwordForm.new_password = ''
    passwordForm.confirm_password = ''
  } catch (error) {
    showMessage('Неверный старый пароль', 'error')
  } finally {
    isPasswordLoading.value = false
  }
}

// Функция окончательного деактивирования / удаления аккаунта
const handleDeleteAccount = async () => {
  if (deleteConfirmationText.value !== 'УДАЛИТЬ') {
    return
  }

  isDeleteLoading.value = true
  try {
    await authStore.deleteAccount()
    isDeleteModalOpen.value = false
  } catch (error) {
    showMessage('Не удалось удалить аккаунт. Попробуйте позже.', 'error')
  } finally {
    isDeleteLoading.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto pb-12">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Настройки профиля</h1>
      <p class="text-sm text-gray-500 mt-1">Управление личными данными и параметрами безопасности аккаунта.</p>
    </div>

    <transition name="fade">
      <div 
        v-if="statusMessage.text" 
        class="p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all"
        :class="statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'"
      >
        <div class="flex items-center space-x-2 text-sm font-medium">
          <span>{{ statusMessage.type === 'success' ? '✅' : '❌' }}</span>
          <span>{{ statusMessage.text }}</span>
        </div>
        <button @click="statusMessage.text = ''" class="text-gray-400 hover:text-gray-600 font-bold px-2">✕</button>
      </div>
    </transition>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center space-x-3 mb-5">
            <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg">
              👤
            </div>
            <div>
              <h2 class="font-bold text-gray-900 text-base">Личные данные</h2>
              <p class="text-xs text-gray-400">Общие сведения вашего аккаунта</p>
            </div>
          </div>

          <form @submit.prevent="handleUpdateProfile" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Ваше имя / Никнейм</label>
              <input 
                v-model="profileForm.full_name"
                type="text" 
                placeholder="Иван Иванов"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 font-medium"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Электронная почта (Email)</label>
              <input 
                v-model="profileForm.email"
                type="email" 
                placeholder="example@fintrack.ru"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800 font-medium"
              />
            </div>
          </form>
        </div>

        <div class="pt-6 mt-6 border-t border-gray-50">
          <button 
            @click="handleUpdateProfile"
            type="button"
            :disabled="isProfileLoading"
            class="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-sm shadow-indigo-100 disabled:opacity-50"
          >
            {{ isProfileLoading ? 'Сохранение...' : 'Сохранить профиль' }}
          </button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center space-x-3 mb-5">
            <div class="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-lg">
              🔒
            </div>
            <div>
              <h2 class="font-bold text-gray-900 text-base">Безопасность</h2>
              <p class="text-xs text-gray-400">Обновление пароля доступа</p>
            </div>
          </div>

          <form @submit.prevent="handleChangePassword" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Текущий пароль</label>
              <input 
                v-model="passwordForm.old_password"
                type="password" 
                placeholder="••••••••"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Новый пароль</label>
              <input 
                v-model="passwordForm.new_password"
                type="password" 
                placeholder="Минимум 8 символов"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Подтвердите новый пароль</label>
              <input 
                v-model="passwordForm.confirm_password"
                type="password" 
                placeholder="••••••••"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
              />
            </div>
          </form>
        </div>

        <div class="pt-6 mt-6 border-t border-gray-50">
          <button 
            @click="handleChangePassword"
            type="button"
            :disabled="isPasswordLoading"
            class="w-full bg-gray-900 hover:bg-gray-800 active:scale-98 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {{ isPasswordLoading ? 'Обновление...' : 'Обновить пароль' }}
          </button>
        </div>
      </div>

    </div>

    <div class="bg-white p-6 rounded-2xl border border-red-100 bg-red-50/20 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-start space-x-3">
          <div class="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-lg shrink-0">
            ⚠️
          </div>
          <div>
            <h2 class="font-bold text-gray-900 text-base">Опасная зона</h2>
            <p class="text-sm text-gray-500 mt-0.5">Удаление или деактивация вашего аккаунта. Это действие нельзя отменить, все ваши транзакции и счета будут удалены навсегда.</p>
          </div>
        </div>
        <button 
          @click="isDeleteModalOpen = true"
          type="button"
          class="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-98 text-white text-sm font-bold rounded-xl transition-all shadow-sm shrink-0"
        >
          Удалить аккаунт
        </button>
      </div>
    </div>

    <div v-if="isDeleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div @click="isDeleteModalOpen = false" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"></div>
      
      <div class="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4 animate-modal-in">
        <div class="text-center space-y-2">
          <span class="text-4xl">🚨</span>
          <h3 class="text-xl font-bold text-gray-900">Вы абсолютно уверены?</h3>
          <p class="text-sm text-gray-500">
            Это приведет к безвозвратному удалению профиля. Для подтверждения введите слово <span class="font-bold text-red-600 select-none">УДАЛИТЬ</span> ниже:
          </p>
        </div>

        <div>
          <input 
            v-model="deleteConfirmationText"
            type="text" 
            placeholder="Введите слово заглавными буквами"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all text-center font-bold tracking-wider text-gray-800"
          />
        </div>

        <div class="flex space-x-3 pt-2">
          <button 
            @click="isDeleteModalOpen = false"
            type="button"
            class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors"
          >
            Отмена
          </button>
          <button 
            @click="handleDeleteAccount"
            type="button"
            :disabled="deleteConfirmationText !== 'УДАЛИТЬ' || isDeleteLoading"
            class="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold text-sm rounded-xl transition-colors disabled:cursor-not-allowed"
          >
            {{ isDeleteLoading ? 'Удаление...' : 'Да, удалить' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Анимация плавного появления модалки */
.animate-modal-in {
  animation: modalScale 0.2s ease-out forwards;
}
@keyframes modalScale {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>