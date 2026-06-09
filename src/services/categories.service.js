import apiClient from "./api";

const CategoriesService = {
    // Get /categories/  - Получить все категории
    async getAll() {
        const response = await apiClient.get("/categories/");
        return response.data;
    },

    // POST /categories/ - Создать категорию (принимает CategoryCreate: name, icon и т.д.)
    async create(categoryData) {
        const response = await apiClient.post("/categories/", categoryData);
        return response.data;
    },
    
    // PUT /categories/{id} - Обновить категорию (CategoryUpdate)
    async update(id, categoryData) {
        const response = await apiClient.put(`/categories/${id}/`, categoryData);
        return response.data;
    },

    // DELETE /categories/{id} - Удалить категорию по id
    async delete(id) {
        const response = await apiClient.delete(`/categories/${id}`);
        return response.data;
    },

};

export default CategoriesService;