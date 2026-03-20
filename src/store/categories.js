import { defineStore } from 'pinia'
import useLocalStorage from '../composables/localStorage'
const CATEGORIES_KEY = 'notes_chat_categories'

export const useCategoriesStore = defineStore('categories', () => {

  // ref
  const categories = useLocalStorage(CATEGORIES_KEY, [])

  // methods
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  // constant export
  const CATEGORY_COLORS = [
    '#ef5350', '#ec407a', '#ab47bc', '#5c6bc0',
    '#42a5f5', '#26c6da', '#26a69a', '#66bb6a',
    '#ffa726', '#ffca28', '#8d6e63', '#78909c',
  ]

  // exporting the store
  return {
    CATEGORY_COLORS,

    categories: categories,

    add(name, color) {
      const cat = { 
        id: generateId(), 
        name, 
        color 
      }
      categories.value.push(cat)
      return cat
    },

    delete(id) {
      categories.value = categories.value.filter(c => c.id !== id)
    },

    getById(id) {
      return categories.value.find(c => c.id === id) || null
    }
  }
})