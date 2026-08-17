import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routers';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Глобальный перехватчик маршрутов
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Проверяем, если у нас есть токен, но профиль пользователя еще не загружен
  if (authStore.accessToken && !authStore.user) {
    try {
      await authStore.fetchCurrentUser();
    } catch (e) {
      console.error("Не удалось загрузить профиль при инициализации страницы");
    }
  }

  const isUserAuthenticated = authStore.isAuthenticated;

  // Если маршрут требует авторизации, а пользователь НЕ авторизован
  if (to.meta.requiresAuth && !isUserAuthenticated) {
    next({ name: 'login' });
  } 
  // Если пользователь авторизован, но пытается зайти на Login/Register
  else if ((to.name === 'login' || to.name === 'register') && isUserAuthenticated) {
    next({ name: 'dashboard' });
  } 
  // 4. В остальных случаях разрешаем переход
  else {
    next();
  }
});

export default router;