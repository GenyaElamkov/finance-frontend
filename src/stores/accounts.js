import { defineStore } from 'pinia';
import { ref } from 'vue';
import AccountsService from '@/services/accounts.service';

export const useAccountsStore = defineStore('accounts', () => {
    const items = ref([]); // Список счетов
    const isLoading = ref(false); // Флаг загрузки
    const error = ref(null);

    /**
     * Загружает список счетов с бэкенда и обновляет состояние магазина
     */
    async function fetchAccounts() {
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

    /**
     * Добавляет новый счет
     * @param {accountData} - данные нового счета для создания 
     */
    async function addAccount(accountData) {
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

    /**
     * Обновляет существующий счет
     * @param {id} - ID счета для обновления
     * @param {accountData} - данные для обновления счета
     */
    async function updateAccount(id, accountData) {
        isLoading.value = true;
        try {
            const updatedAccount = await AccountsService.update(id, accountData);
            const index = items.value.findIndex(acc => acc.id === id);
            if (index !== -1) {
                items.value[index] = updatedAccount;
            }
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Удаляет счет
     * @param {id} - ID счета для удаления
     */
    async function removeAccount(id) {
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
        updateAccount,
        removeAccount
    };
});
