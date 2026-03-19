const NOTES_KEY = 'notes_chat_notes'

// Generate a unique ID for notes
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Get all notes from localStorage
function getAllNotes() {
  const data = localStorage.getItem(NOTES_KEY)
  if (!data) return []
  try {
    const notes = JSON.parse(data)
    // Migrate old single categoryId → categoryIds array
    return notes.map(n => {
      if (!n.categoryIds) {
        return { ...n, categoryIds: n.categoryId ? [n.categoryId] : [] }
      }
      return n
    })
  } catch {
    return []
  }
}

// Save notes to localStorage
function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}

export const notesStore = {
  getAll() {
    return getAllNotes()
  },

  add(content, categoryIds = []) {
    const notes = getAllNotes()
    const note = {
      id: generateId(),
      content,
      categoryIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    notes.unshift(note)
    saveNotes(notes)
    return note
  },

  update(id, content, categoryIds = []) {
    const notes = getAllNotes()
    const index = notes.findIndex(n => n.id === id)
    if (index === -1) return null

    notes[index] = {
      ...notes[index],
      content,
      categoryIds,
      updatedAt: new Date().toISOString()
    }
    saveNotes(notes)
    return notes[index]
  },

  delete(id) {
    const notes = getAllNotes()
    const filtered = notes.filter(n => n.id !== id)
    saveNotes(filtered)
    return filtered
  },

  getById(id) {
    const notes = getAllNotes()
    return notes.find(n => n.id === id) || null
  }
}
