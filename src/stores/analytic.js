import { defineStore } from 'pinia';
import { ref } from 'vue';
import AnalyticsService from '@/services/analytics.service';

export const useAnalyticsStore = defineStore('analytics', () => {
    const categorySummary = ref([]); // Сводка расходов по категориям за текущий месяц
    const isLoading = ref(false); // Флаг загрузки
    const error = ref(null);

    /**
     * Загружает с бэкенда сводку расходов по категориям за текущий месяц
     */
    async function fetchMonthlySummaryByCategory() {
        isLoading.value = true;
        error.value = null;
        try {
            const data = await AnalyticsService.getMonthlySummaryByCategory();
            categorySummary.value = Array.isArray(data?.items) ? data.items : [];
        } catch (err) {
            error.value = 'Не удалось загрузить сводку расходов по категориям';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    return {
        categorySummary,
        isLoading,
        error,
        fetchMonthlySummaryByCategory
    };
});