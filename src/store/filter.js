import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFilterStore = defineStore('filter', () => {
  const category = ref(null)
  const isFilterOpen = ref(false)
  const searchQuery = ref('')

  return {
    category,
    isFilterOpen,
    searchQuery, // campo di ricerca
  }
})