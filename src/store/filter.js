import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFilterStore = defineStore('filter', () => {
  const categories = ref([])
  const searchQuery = ref('')

  const toggleCategory = (id) => {
    const idx = categories.value.indexOf(id)
    if (idx === -1) {
      categories.value.push(id)
    } else {
      categories.value.splice(idx, 1)
    }
  }

  return {
    categories,
    searchQuery,
    toggleCategory,
  }
})