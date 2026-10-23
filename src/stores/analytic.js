import { defineStore } from 'pinia';
import { ref } from 'vue';
import AnalyticsService from '@/services/analytics.service';
import { getPresetRange } from '@/utils/period';

/**
 * Достает понятное сообщение из ошибки запроса.
 * Для 422 FastAPI присылает detail списком - берем первое сообщение.
 */
function extractErrorMessage(err, fallback) {
    const detail = err?.response?.data?.detail;
    if (Array.isArray(detail) && detail[0]?.msg) {
        return detail[0].msg.replace(/^Value error, /, '');
    }
    if (typeof detail === 'string') return detail;
    return fallback;
}

export const useAnalyticsStore = defineStore('analytics', () => {
    const categorySummary = ref([]); // Сводка расходов по категориям за текущий месяц (старый эндпоинт)
    const isLoading = ref(false); // Флаг загрузки
    const error = ref(null);

    // Отчет для страницы «Аналитика» (выбранный пользователем период)
    const summary = ref(null);
    const summaryLoading = ref(false);
    const summaryError = ref(null);
    let summaryRequestId = 0; // защита от гонки: учитываем только ответ на последний запрос

    // Итоги текущего месяца для дашборда (хранятся отдельно, чтобы не смешиваться с периодом на странице аналитики)
    const monthSummary = ref(null);
    const monthSummaryLoading = ref(false);
    const monthSummaryError = ref(null);

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

    /**
     * Загружает отчет за произвольный период
     * @param {{ date_from: string, date_to: string, currency: string }} params
     */
    async function fetchSummary(params) {
        const requestId = ++summaryRequestId;
        summaryLoading.value = true;
        summaryError.value = null;
        try {
            const data = await AnalyticsService.getSummary(params);
            if (requestId !== summaryRequestId) return;
            summary.value = data;
        } catch (err) {
            if (requestId !== summaryRequestId) return;
            summary.value = null;
            summaryError.value = extractErrorMessage(err, 'Не удалось загрузить аналитику');
            console.error(err);
        } finally {
            if (requestId === summaryRequestId) summaryLoading.value = false;
        }
    }

    /**
     * Загружает итоги текущего месяца (с 1-го числа по сегодня) для дашборда
     * @param {string} currency - валюта отчета
     */
    async function fetchMonthSummary(currency = 'RUB') {
        monthSummaryLoading.value = true;
        monthSummaryError.value = null;
        try {
            const { date_from, date_to } = getPresetRange('this_month');
            monthSummary.value = await AnalyticsService.getSummary({ date_from, date_to, currency });
        } catch (err) {
            monthSummary.value = null;
            monthSummaryError.value = 'Не удалось загрузить итоги за месяц';
            console.error(err);
        } finally {
            monthSummaryLoading.value = false;
        }
    }

    return {
        categorySummary,
        isLoading,
        error,
        fetchMonthlySummaryByCategory,
        summary,
        summaryLoading,
        summaryError,
        fetchSummary,
        monthSummary,
        monthSummaryLoading,
        monthSummaryError,
        fetchMonthSummary
    };
});
