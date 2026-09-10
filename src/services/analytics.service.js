import apiClient from "./api";

const AnalyticsService = {
    // GET /analytics/monthly-summary-by-category - сводка расходов по категориям за текущий месяц
    async getMonthlySummaryByCategory() {
        const response = await apiClient.get("/analytics/monthly-summary-by-category");
        return response.data;
    }
};

export default AnalyticsService;