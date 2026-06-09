export const routes = [
  // Маршруты для гостей (Аутентификация)
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue'),
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/auth/RegisterView.vue'),
      },
    ],
  },

  // Защищенные маршруты приложения (Доступны только после логина)
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true }, // Защищаем всю группу маршрутов
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: () => import('@/views/accounts/AccountsView.vue'),
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('@/views/categories/CategoriesView.vue'),
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: () => import('@/views/transactions/TransactionsView.vue'),
      },
    ],
  },

  // Ошибка 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/errors/NotFoundView.vue'),
  },
];