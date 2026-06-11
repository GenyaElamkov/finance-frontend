<script setup>
import { onMounted, ref, computed } from 'vue'
import { useCategoriesStore } from '@/stores/categories'

const categoriesStore = useCategoriesStore()

// Состояние формы создания
const name = ref('')
const icon = ref('')
const parentId = ref(null)
const formError = ref('')

// Состояние редактирования (храним ID категории, которую сейчас редактируют)
const editingId = ref(null)
const editName = ref('')
const editIcon = ref('')
const editParentId = ref(null)

onMounted(() => {
  categoriesStore.fetchCategories()
})

// Отфильтрованный список только корневых категорий (у которых нет родителя)
const rootCategories = computed(() => {
  return categoriesStore.items.filter(cat => !cat.parent_id)
})

// Функция для поиска подкатегорий конкретной родительской категории
const getSubcategories = (parentCategoryId) => {
  return categoriesStore.items.filter(cat => cat.parent_id === parentCategoryId)
}

// Включение режима редактирования и заполнение буферных переменных
const startEdit = (category) => {
  editingId.value = category.id
  editName.value = category.name
  editIcon.value = category.icon || '🏷️'
  editParentId.value = category.parent_id
}

// Сброс режима редактирования
const cancelEdit = () => {
  editingId.value = null
  editName.value = ''
  editIcon.value = ''
  editParentId.value = null
}

const handleCreateCategory = async () => {
  formError.value = ''
  if (!name.value.trim()) {
    formError.value = 'Название категории не может быть пустым'
    return
  }

  try {
    await categoriesStore.addCategory({
      name: name.value.trim(),
      icon: icon.value.trim() || '🏷️',
      parent_id: parentId.value ? Number(parentId.value) : null
    })
    
    name.value = ''
    icon.value = ''
    parentId.value = null
  } catch (err) {
    formError.value = 'Ошибка при создании категории. Возможно, такое имя уже есть.'
  }
}

const handleUpdateCategory = async (categoryId) => {
  if (!editName.value.trim()) {
    alert('Название не может быть пустым')
    return
  }

  try {
    // Вызываем метод стора (убедись, что в вашем сторе есть updateCategory или аналогичный метод)
    await categoriesStore.updateCategory(categoryId, {
      name: editName.value.trim(),
      icon: editIcon.value.trim(),
      parent_id: editParentId.value ? Number(editParentId.value) : null
    })
    
    // Выходим из режима редактирования при успехе
    editingId.value = null
  } catch (err) {
    alert('Не удалось обновить категорию.')
  }
}

const hasSubcategories = (categoryId) => {
  return categoriesStore.items.some(cat => cat.parent_id === categoryId)
}

const handleDeleteCategory = async (id) => {
  const category = categoriesStore.items.find(cat => cat.id === id)
  if (!category) return

  if (hasSubcategories(id)) {
    alert('Невозможно удалить категорию: у нее есть подкатегории. Сначала удалите или переназначьте их.')
    return
  }

  if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
    try {
      await categoriesStore.removeCategory(id)
    } catch (err) {
      alert('Не удалось удалить категорию.')
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Категории</h1>
      <p class="text-sm text-gray-500 mt-1">Управляйте древовидной структурой категорий расходов и доходов</p>
    </div>

    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">🏷️ Создать категорию / Подкатегорию</h2>
      
      <div v-if="formError" class="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg">
        {{ formError }}
      </div>

      <form @submit.prevent="handleCreateCategory" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Название</label>
          <input 
            v-model="name"
            type="text" 
            placeholder="Продукты, Кафе, Зарплата"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Иконка (Эмодзи)</label>
          <input 
            v-model="icon"
            type="text" 
            placeholder="Например: 🍏, 🚗, 💵"
            class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />  
        </div>

        <div class="md:col-span-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Родительская категория</label>
          <div class="relative">
            <select 
              v-model="parentId"
              class="w-full rounded-lg border-gray-300 ring-1 ring-gray-200 py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none appearance-none bg-white pr-8"
            >
              <option :value="null">Основная (нет родителя)</option>
              <option 
                v-for="category in rootCategories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.icon || '🏷️' }} {{ category.name }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>            
          </div>
        </div>

        <button 
          type="submit"
          :disabled="categoriesStore.isLoading"
          class="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          Добавить
        </button>
      </form>
    </div>

    <div v-if="categoriesStore.isLoading && categoriesStore.items.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else>
      <div v-if="categoriesStore.items.length === 0" class="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
        У вас пока нет категорий. Создайте первую!
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="category in rootCategories" 
          :key="category.id"
          class="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md group transition-shadow relative"
        >
          <div>
            <div class="flex items-center justify-between">
              
              <div v-if="editingId === category.id" class="flex items-center space-x-2 w-full mr-2">
                <input v-model="editIcon" type="text" class="w-12 border rounded p-1 text-center text-sm" />
                <input v-model="editName" type="text" class="flex-1 border rounded p-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                <button @click="handleUpdateCategory(category.id)" class="text-green-600 hover:text-green-700 text-sm font-bold p-1">✔️</button>
                <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600 text-sm font-bold p-1">❌</button>
              </div>

              <div v-else @click="startEdit(category)" class="flex items-center space-x-3 truncate cursor-pointer title-edit-zone w-full" title="Кликните для редактирования">
                <span class="text-2xl">{{ category.icon || '🏷️' }}</span>
                <span class="font-bold text-gray-900 truncate text-base sm:text-lg group-hover:text-indigo-600 transition-colors">
                  {{ category.name }}
                </span>
                <span class="text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
              </div>

              <button 
                v-if="editingId !== category.id"
                @click="handleDeleteCategory(category.id)"
                class="text-gray-400 hover:text-red-500 p-1 rounded transition-colors md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Удалить категорию"
              >
                🗑️
              </button>
            </div>

            <div class="mt-4 pt-3 border-t border-gray-50 pb-2">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                Подкатегории:
              </span>
              
              <div v-if="getSubcategories(category.id).length > 0" class="flex flex-wrap gap-2">
                <div 
                  v-for="sub in getSubcategories(category.id)" 
                  :key="sub.id"
                  class="inline-flex items-center space-x-1 pl-2 pr-1.5 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 group/sub transition-colors"
                >
                  <div v-if="editingId === sub.id" class="flex items-center space-x-1">
                    <input v-model="editIcon" type="text" class="w-8 border rounded px-0.5 py-2.5 text-center text-[10px]" />
                    <input v-model="editName" type="text" class="w-20 border rounded px-1 py-2.5 text-[10px] focus:outline-none" />
                    <button @click="handleUpdateCategory(sub.id)" class="text-green-600 text-[10px]">✔️</button>
                    <button @click="cancelEdit" class="text-gray-400 text-[10px]">❌</button>
                  </div>

                  <div v-else @click.stop="startEdit(sub)" class="flex items-center space-x-1 cursor-pointer" title="Кликните для изменения подкатегории">
                    <span>{{ sub.icon || '🏷️' }}</span>
                    <span class="truncate max-w-[200px] hover:text-indigo-600">{{ sub.name }}</span>
                    <button 
                      @click.stop="handleDeleteCategory(sub.id)"
                      class="text-gray-400 hover:text-red-600 font-bold px-1 rounded ml-1"
                      title="Удалить подкатегорию"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="text-xs text-gray-400 italic">
                Нет вложенных подкатегорий
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>