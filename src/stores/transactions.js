import { defineStore } from 'pinia';
import { ref } from 'vue';
import TransactionsService from '@/services/transactions.service';
import { useAccountsStore } from './accounts';

export const useTransactionsStore = defineStore('transactions', () => {
  const listData = ref({ items: [], total: 0 });
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchTransactions(filters = {}) {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await TransactionsService.getAll(filters);
      // Если бэкенд возвращает сразу массив, обернем его, если схему TransactionList — сохраняем как есть
      listData.value = data.items ? data : { items: data, total: data.length };
    } catch (err) {
      error.value = 'Не удалось загрузить журнал транзакций';
      console.error(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function addTransaction(transactionData) {
    isLoading.value = true;
    try {
      const newTransaction = await TransactionsService.create(transactionData);
      listData.value.items.unshift(newTransaction);
      listData.value.total++;
      
      // Обновляем балансы в сторе счетов!
      const accountsStore = useAccountsStore();
      accountsStore.fetchAccounts();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function removeTransaction(id) {
    try {
      await TransactionsService.delete(id);
      listData.value.items = listData.value.items.filter(t => t.id !== id);
      listData.value.total--;
      
      // Обновляем счета, так как баланс изменился после удаления операции
      const accountsStore = useAccountsStore();
      accountsStore.fetchAccounts();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  return {
    listData,
    isLoading,
    error,
    fetchTransactions,
    addTransaction,
    removeTransaction
  };
});