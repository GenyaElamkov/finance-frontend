import { defineStore } from 'pinia'
import { ref } from 'vue'
import CategoriesService from '@/services/categories.service'

export const useCategoriesStore = defineStore('categories', () => {
    const items = ref([]); // Список категорий
    const isLoading = ref(false); // Флаг загрузки
    const error = ref(null);
    
    /**
     * Загрузка всех категорий из API
     */
    async function fetchCategories() {
        isLoading.value = true;
        error.value = null;

        try {
            const data = await CategoriesService.getAll();
            items.value = Array.isArray(data) ? data : [];
        } catch (err) {
            error.value = 'Не удалось загрузить категории';
            console.error(err);
        } finally {
            isLoading.value = false;
        }
    }

    /** 
     * Добавление новой категории
     * @param {categoryData} - данные новой категории (например, { name: 'Новая категория' })
    */
    async function addCategory(categoryData) {
        isLoading.value = true;
        try {
            const newCategory = await CategoriesService.create(categoryData);
            items.value.push(newCategory);
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }
    /**
     * Обновление категории по ID
     * @param {id} id категории, которую нужно обновить
     * @param {categoryData} новые данные категории (например, { name: 'Новая категория' })
     */
    async function updateCategory(id, categoryData) {
        isLoading.value = true;
        try {
            const updatedCategory = await CategoriesService.update(id, categoryData);
            const index = items.value.findIndex(cat => cat.id === id);
            if (index !== -1) {
                items.value[index] = updatedCategory;
            }
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Удаление категории по ID
     * @param {id} - ID категории, которую нужно удалить
     */
    async function removeCategory(id) {
        isLoading.value = true;
        try {
            await CategoriesService.delete(id);
            items.value = items.value.filter(cat => cat.id !== id);
        } catch (err) {
            console.error(err);
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    return {
        items,
        isLoading,
        error,
        fetchCategories,
        addCategory,
        updateCategory,
        removeCategory
    }
})