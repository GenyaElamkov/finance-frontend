import axios from 'axios';

// Создаем экземпляр Axios с базовым URL бэкенда
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор ЗАПРОСА: добавляет Access Token в заголовки
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор ОТВЕТА: перехватывает 401 ошибку и обновляет токен
apiClient.interceptors.response.use(
  (response) => response, // Если всё ок, просто возвращаем ответ
  async (error) => {
    const originalRequest = error.config;

    // Проверяем, что ошибка 401 и мы еще не пытались обновить токен в этом запросе
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Делаем запрос на обновление access-токена
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-access-token`, {
          refresh_token: refreshToken
        });

        // Возвращаем dict с новыми токенами
        const newAccessToken = response.data.access_token;
        
        // Сохраняем новый токен
        localStorage.setItem('access_token', newAccessToken);

        // Обновляем заголовки в упавшем запросе и повторяем его
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Если refresh-токен тоже протух или произошла ошибка
        console.error('Refresh token expired or invalid', refreshError);
        
        // Очищаем локальное хранилище
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Редирект на страницу логина
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;