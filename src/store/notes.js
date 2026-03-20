import { defineStore } from 'pinia'
import useLocalStorage from '../composables/localStorage'
const NOTES_KEY = 'notes_chat_notes'

export const useNotesStore = defineStore('notes', () => {
  // ref
  const notes = useLocalStorage(NOTES_KEY, [])

  // Generate a unique ID for notes
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
  }

  // Get all notes from localStorage
  function getAllNotes() {
    try {
      // Migrate old single categoryId → categoryIds array
      return notes.value.map(n => {
        if (!n.categoryIds) {
          return { ...n, categoryIds: n.categoryId ? [n.categoryId] : [] }
        }
        return n
      })
    } catch {
      return []
    }
  }

  function add(content, categoryIds = []) {
    const note = {
      id: generateId(),
      content,
      categoryIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    //notes.unshift(note)
    notes.value.push(note)
    return note
  }

  function update(id, content, categoryIds = []) {
    const index = notes.value.findIndex(n => n.id === id)
    if (index === -1) return null

    notes.value[index] = {
      ...notes.value[index],
      content,
      categoryIds,
      updatedAt: new Date().toISOString()
    }
    return notes.value[index]
  }

  function deleteNote(id) {
    const filtered = notes.value.filter(n => n.id !== id)
    notes.value = filtered
    return filtered
  }

  function getById(id) {
    return notes.value.find(n => n.id === id) || null
  }

  // 
  return {
    getAll: getAllNotes,
    getById,
    add,
    update,
    delete: deleteNote,
  }
})