import apiClient from "./api";

const AnalyticsService = {
    // GET /analytics/summary-income-expense - итоги, сравнение с предыдущим периодом
    // и дерево категорий за период. params: { date_from, date_to, currency }
    async getSummary(params) {
        const response = await apiClient.get("/analytics/summary-income-expense", { params });
        return response.data;
    }
};

export default AnalyticsService;
