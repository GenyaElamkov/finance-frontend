import { defineStore } from 'pinia';
import { ref } from 'vue';
import TransfersService from '@/services/transfers.service';
import { useAccountsStore } from './accounts';

export const useTransfersStore = defineStore('transfers', () => {
  const listData = ref({
    items: [],
    total: 0,
    page: 1,
    page_size: 20,
  });
  const isLoading = ref(false);
  const error = ref(null);

  /**
   * Загрузка переводов с поддержкой пагинации
   * @param {Object} filters - Параметры пагинации (page, page_size)
   * @param {boolean} append - Добавить к существующему списку или заменить
   */
  async function fetchTransfers(filters = {}, append = false) {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await TransfersService.getAll(filters);

      const items = data.items || data || [];
      const total = data.total ?? items.length;
      const page = data.page || filters.page || 1;
      const page_size = data.page_size || filters.page_size || 20;

      if (append) {
        listData.value.items = [...listData.value.items, ...items];
      } else {
        listData.value.items = items;
      }

      listData.value.total = total;
      listData.value.page = page;
      listData.value.page_size = page_size;

      return data;
    } catch (err) {
      error.value = 'Не удалось загрузить историю переводов';
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Создание перевода между своими счетами
   */
  async function addTransfer(transferData) {
    isLoading.value = true;
    try {
      const newTransfer = await TransfersService.create(transferData);

      // Добавляем в начало списка (свежие переводы сверху)
      listData.value.items.unshift(newTransfer);
      listData.value.total++;

      // Обновляем балансы обоих счетов в сторе счетов
      const accountsStore = useAccountsStore();
      await accountsStore.fetchAccounts();

      return newTransfer;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Удаление перевода (возврат баланса на оба счета)
   */
  async function removeTransfer(id) {
    try {
      await TransfersService.delete(id);

      listData.value.items = listData.value.items.filter((t) => t.id !== id);
      listData.value.total--;

      const accountsStore = useAccountsStore();
      await accountsStore.fetchAccounts();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  /**
   * Сброс списка переводов
   */
  function clearTransfers() {
    listData.value = {
      items: [],
      total: 0,
      page: 1,
      page_size: 20,
    };
    error.value = null;
  }

  /**
   * Проверка, можно ли загрузить еще переводы
   */
  function hasMore() {
    return listData.value.items.length < listData.value.total;
  }

  return {
    listData,
    isLoading,
    error,
    fetchTransfers,
    addTransfer,
    removeTransfer,
    clearTransfers,
    hasMore,
  };
});
