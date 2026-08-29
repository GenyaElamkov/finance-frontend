import apiClient from './api';

const TransfersService = {
  // GET /transfers/ - Список переводов между своими счетами (пагинация: page, page_size)
  async getAll(params = {}) {
    const response = await apiClient.get('/transfers/', { params });
    return response.data;
  },

  // POST /transfers/ - Создать перевод между своими счетами
  async create(transferData) {
    const response = await apiClient.post('/transfers/', transferData);
    return response.data;
  },

  // DELETE /transfers/{id} - Удалить перевод (возврат баланса)
  async delete(id) {
    const response = await apiClient.delete(`/transfers/${id}`, {
      params: { transfer_id: id },
    });
    return response.data;
  },
};

export default TransfersService;
