import { defineStore } from 'pinia';
import { ref } from 'vue';
import AccountsService from '@/services/accounts.service';

export const useAccountsStore = defineStore('accounts', () => {
    const items = ref([]); // Список счетов
    const isLoading = ref(false); // Флаг загрузки
    const error = ref(null); // Ошибка

    async function fetchAccounts() {
        // Получаем список счетов с бэкенда
        isLoading.value = true;
        error.value = null;
        try {
            const data = await AccountsService.getAll();
            items.value = Array.isArray(data) ? data : [];
        } catch (err) {
            error.value = 'Не удалось загрузить список счетов';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    async function addAccount(accountData) {
        // Создаем новый счет
        isLoading.value = true;
        try {
            const newAccount = await AccountsService.create(accountData);
            items.value.push(newAccount); // Добавляем новый счет в список
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    async function removeAccount(id) {
        // Удаляем счет по id
        try {
            await AccountsService.delete(id);
            items.value = items.value.filter(acc => acc.id !== id);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }
    
    return {
        items,
        isLoading,
        error,
        fetchAccounts,
        addAccount,
        removeAccount
    };
});
