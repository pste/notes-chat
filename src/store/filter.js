import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFilterStore = defineStore('filter', () => {
  const category = ref(null)
  const searchQuery = ref('')

  return {
    category,
    searchQuery,
  }
})