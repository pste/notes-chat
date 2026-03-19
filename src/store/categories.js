const CATEGORIES_KEY = 'notes_chat_categories'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

function getAllCategories() {
  const data = localStorage.getItem(CATEGORIES_KEY)
  if (!data) return []
  try { return JSON.parse(data) } catch { return [] }
}

function saveCategories(cats) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats))
}

export const CATEGORY_COLORS = [
  '#ef5350', '#ec407a', '#ab47bc', '#5c6bc0',
  '#42a5f5', '#26c6da', '#26a69a', '#66bb6a',
  '#ffa726', '#ffca28', '#8d6e63', '#78909c',
]

export const categoriesStore = {
  getAll: getAllCategories,

  add(name, color) {
    const cats = getAllCategories()
    const cat = { id: generateId(), name, color }
    cats.push(cat)
    saveCategories(cats)
    return cat
  },

  delete(id) {
    saveCategories(getAllCategories().filter(c => c.id !== id))
  },

  getById(id) {
    return getAllCategories().find(c => c.id === id) || null
  }
}
