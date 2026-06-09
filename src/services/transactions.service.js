import apiClient from './api';

const TransactionsService = {
  // GET /transactions/ - Список транзакций (принимает query-параметры фильтрации)
  async getAll(params = {}) {
    const response = await apiClient.get('/transactions/', { params });
    return response.data;
  },

  // POST /transactions/ - Создать транзакцию
  async create(transactionData) {
    const response = await apiClient.post('/transactions/', transactionData);
    return response.data;
  },

  // PUT /transactions/{id} - Обновить транзакцию
  async update(id, transactionData) {
    const response = await apiClient.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  // DELETE /transactions/{id} - Удалить транзакцию
  async delete(id) {
    const response = await apiClient.delete(`/transactions/${id}`);
    return response.data;
  }
};

export default TransactionsService;