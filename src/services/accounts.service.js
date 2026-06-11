import apiClient from "./api";

const AccountsService = {
    // Get /accounts/  - список счетов
    async getAll() {
        const response = await apiClient.get("/accounts/");
        return response.data;
    },
    // POST /accounts/ - Создать счет (принимает AccountCreate: name, initial_balance и т.д.)
    async create(accountData) {
        const response = await apiClient.post("/accounts/", accountData);
        return response.data;
    },
    // PUT /accounts/{id} - Обновить счет (AccountUpdate)
    async update(id, accountData) {
        const response = await apiClient.put(`/accounts/${id}/`, accountData);
        return response.data;
    },
    // DELETE /accounts/{id} - Удалить счет
    async delete(id) {
        const response = await apiClient.delete(`/accounts/${id}/`);
        return response.data;
    }
};

export default AccountsService;