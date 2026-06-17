import { defineStore } from 'pinia';
import { ref } from 'vue';
import TransactionsService from '@/services/transactions.service';
import { useAccountsStore } from './accounts';

export const useTransactionsStore = defineStore('transactions', () => {
  const listData = ref({ 
    items: [], 
    total: 0,
    page: 1,
    page_size: 10
  });
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * Загрузка транзакций с поддержкой пагинации
   * @param {Object} filters - Параметры фильтрации и пагинации
   * @param {boolean} append - Добавить к существующему списку или заменить
   */
  async function fetchTransactions(filters = {}, append = false) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const data = await TransactionsService.getAll(filters);
      
      // Проверяем, что пришло от бэкенда
      const items = data.items || data || [];
      const total = data.total || items.length;
      const page = data.page || filters.page || 1;
      const page_size = data.page_size || filters.page_size || 10;
      
      if (append) {
        // Склеиваем списки для бесконечной пагинации
        listData.value.items = [...listData.value.items, ...items];
      } else {
        // Полная замена списка
        listData.value.items = items;
      }
      
      listData.value.total = total;
      listData.value.page = page;
      listData.value.page_size = page_size;
      
      return data;
    } catch (err) {
      error.value = 'Не удалось загрузить журнал транзакций';
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Добавление новой транзакции
   */
  async function addTransaction(transactionData) {
    isLoading.value = true;
    try {
      const newTransaction = await TransactionsService.create(transactionData);
      
      // Добавляем в начало списка (свежие транзакции сверху)
      listData.value.items.unshift(newTransaction);
      listData.value.total++;
      
      // Обновляем балансы в сторе счетов
      const accountsStore = useAccountsStore();
      await accountsStore.fetchAccounts();
      
      return newTransaction;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Удаление транзакции
   */
  async function removeTransaction(id) {
    try {
      await TransactionsService.delete(id);
      
      // Удаляем из списка
      listData.value.items = listData.value.items.filter(t => t.id !== id);
      listData.value.total--;
      
      // Обновляем счета, так как баланс изменился
      const accountsStore = useAccountsStore();
      await accountsStore.fetchAccounts();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Обновление транзакции
   */
  async function updateTransaction(id, updateData) {
    isLoading.value = true;
    try {
      const updated = await TransactionsService.update(id, updateData);
      
      // Обновляем элемент в списке
      const index = listData.value.items.findIndex(t => t.id === id);
      if (index !== -1) {
        listData.value.items[index] = updated;
      }
      
      // Обновляем счета
      const accountsStore = useAccountsStore();
      await accountsStore.fetchAccounts();
      
      return updated;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Сброс списка транзакций
   */
  function clearTransactions() {
    listData.value = { 
      items: [], 
      total: 0,
      page: 1,
      page_size: 10
    };
    error.value = null;
  }

  /**
   * Проверка, можно ли загрузить еще транзакции
   */
  function hasMore() {
    return listData.value.items.length < listData.value.total;
  }

  return {
    listData,
    isLoading,
    error,
    fetchTransactions,
    addTransaction,
    removeTransaction,
    updateTransaction,
    clearTransactions,
    hasMore
  };
});