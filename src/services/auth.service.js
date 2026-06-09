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
  }
};

export default AuthService;