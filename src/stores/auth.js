import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import AuthService from '@/services/auth.service'
import router from '@/routers'

export const useAuthStore = defineStore('auth', () => {
  // Состояние
  const user = ref(null)
  const accessToken = ref(localStorage.getItem('access_token') || null)
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)
  const isLoading = ref(false)

  // Вычисляемые свойства
  const isAuthenticated = computed(() => !!accessToken.value)

  /**
   * Логин пользователя
   */
  async function login(email, password) {
    isLoading.value = true
    try {
      const data = await AuthService.login(email, password)

      // Сохраняем токены в состояние и localStorage
      accessToken.value = data.access_token
      refreshToken.value = data.refresh_token
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)

      // Сразу после успешного входа запрашиваем профиль пользователя
      await fetchCurrentUser()

      // Перенаправляем пользователя на главную страницу (Dashboard)
      router.push({ name: 'dashboard' })
    } catch (error) {
      console.error('Login error:', error)
      throw error // Пробрасываем ошибку наружу, чтобы обработать её в форме (показать alert)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Регистрация пользователя
   */
  async function register(userData) {
    isLoading.value = true
    try {
      await AuthService.register(userData)
      // После успешной регистрации автоматически логиним пользователя
      await login(userData.email, userData.password)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Получение данных профиля
   */
  async function fetchCurrentUser() {
    if (!accessToken.value) return
    try {
      const userData = await AuthService.getCurrentUser()
      user.value = userData
    } catch (error) {
      // Если /users/me упал (например токен невалиден), делаем logout
      logout()
    }
  }

  /**
   * Выход из системы
   */
  function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    // Перенаправляем на страницу входа
    router.push({ name: 'login' })
  }
  /**
   * Обновление имени и email
   */
  async function updateProfileData(payload) {
    try {
      // Отправляем изменения на бэкенд через сервис
      const updatedUser = await AuthService.updateProfile(payload)
      
      // Перезаписываем текущего пользователя в стейте, 
      // чтобы изменения сразу отобразились по всему интерфейсу (в сайдбаре)
      user.value = updatedUser
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  /**
   * Смена пароля
   */
  async function updateUserPassword(payload) {
    try {
      // Отправляем старый и новый пароль на бэкенд
      await AuthService.changePassword(payload)
    } catch (error) {
      console.error('Change password error:', error)
      throw error
    }
  }

  /**
   * Удаление аккаунта
   * 
   */ 
  async function deleteAccount() {
    try {
      await AuthService.deleteUser(user.value.id)
      logout()
    } catch (error) {
      console.error('Delete account error:', error)
      throw error
    }
  }
  /**
   * Восстановление пароля
   */
  async function forgotPassword(email) {
  isLoading.value = true
    try {
      return await AuthService.forgotPassword(email)
    } catch (error) {
      console.error('Forgot password error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * Reset Password
   */
  async function resetPassword(token, password) {
    isLoading.value = true
    try {
      return await AuthService.resetPassword(token, password)
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated,
    login,
    register,
    fetchCurrentUser,
    logout,
    updateProfileData,
    updateUserPassword,
    deleteAccount,
    forgotPassword,
    resetPassword,
  }
})
