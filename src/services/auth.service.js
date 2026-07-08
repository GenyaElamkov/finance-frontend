import apiClient from './api';

const AuthService = {
  /**
   * Регистрация нового пользователя
   * @param {Object} userData - { email, password, username, ... }
   */
  async register(userData) {
    // Ручка auth.py: @router.post("/register")
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Аутентификация пользователя (Логин)
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    // Ручка auth.py: @router.post("/token")
    // FastAPI ожидает OAuth2PasswordRequestForm (username и password)
    const formData = new URLSearchParams();
    formData.append('username', email); // В OAuth2 поле username используется для email/логина
    formData.append('password', password);

    const response = await apiClient.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    // вернет dict: { access_token: "...", refresh_token: "...", token_type: "bearer" }
    return response.data;
  },

  /**
   * Получение данных текущего авторизованного профиля
   */
  async getCurrentUser() {
    // Ручка из users.py: @router.get("/me")
    const res = await apiClient.get('/users/me');
    return res.data;
  },

  /**
   * Обновление данных профиля
   * @param {Object} payload - Данные для обновления профиля
   */
  async updateProfile(payload) {
    const response = await apiClient.patch('/users/me', payload)
    return response.data
  },

  /**
   * Смена пароля
   * @param {Object} payload - Данные для смены пароля
   * @returns 
   */
  async changePassword(payload) {
    const response = await apiClient.patch('/users/change-password', payload)
    return response.data
  },

  /**
   * Удаление пользователя
   * @param {*} userId    
   */
  async deleteUser(userId) {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, password) {
    const response = await apiClient.post('/auth/reset-password', { token, password: password });
    return response.data;
  },

};

export default AuthService;