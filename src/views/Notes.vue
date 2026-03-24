<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useNotesStore } from '../store/notes'
import { useFilterStore } from '../store/filter'
import { useCategoriesStore } from '../store/categories'

import EmojiPicker from '../components/EmojiPicker.vue'
import Note from '../components/Note.vue'
import Header from '../components/Header.vue'

const categoriesStore = useCategoriesStore()
const filterStore = useFilterStore()
const notesStore = useNotesStore()

const notesContainerRef = ref(null)
const writeNoteRef = ref(null)
const noteRefs = ref({})
const notes = ref([])
const writingNote = ref({ content: '', categoryIds: [] })

const isEmojiKeyboardOpen = ref(false)
const editingNoteId = ref(null)

// computed
const filteredNotes = computed(() => {
  let all = notes.value
  if (filterStore.categories.length) {
    all = all.filter(n => filterStore.categories.some(c => n.categoryIds?.includes(c)))
  }
  const q = filterStore.searchQuery.trim().toLowerCase()
  if (!q) return all
  return all.filter(n => n.content.toLowerCase().includes(q))
})

const getCategoriesForNote = (note) => {
  if (!note.categoryIds?.length) return []
  return note.categoryIds.map(id => categoriesStore.categories.find(c => c.id === id)).filter(Boolean)
}

// events
const handleClickOutside = (event) => {
  if (isEmojiKeyboardOpen.value) {
    if (!event.target.closest('.emoji-keyboard') && !event.target.closest('.emoji-btn')) {
      isEmojiKeyboardOpen.value = false
    }
  }
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadNotes()
})

const loadNotes = () => {
  notes.value = notesStore.getAll()
  nextTick(() => {
    if (notesContainerRef.value) {
      notesContainerRef.value.scrollTop = notesContainerRef.value.scrollHeight
    }
  })
}

// triggered from emoji dialog
function insertEmoji(selected) {
  const emoji = selected.emoji

  if (editingNoteId.value && noteRefs.value[editingNoteId.value]) {
    noteRefs.value[editingNoteId.value].insertEmoji(emoji)
    return
  }

  const textarea = writeNoteRef.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value

    textarea.value = value.substring(0, start) + emoji + value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }
}


// save new note
const sendNote = () => {
  const content = writingNote.value.content.trim()
  const categoryIds = writingNote.value.categoryIds || []
  if (!content) return
  notesStore.add(content, categoryIds)
  clearNote()
  loadNotes()
}

// clear new note input
const clearNote = () => {
  writingNote.value = { content: '', categoryIds: [] }
}

// start inline edit
const editNote = (id) => {
  editingNoteId.value = id
}

// save inline edit
const handleSaveNote = ({ id, content, categoryIds }) => {
  notesStore.update(id, content, categoryIds)
  editingNoteId.value = null
  loadNotes()
}

// cancel inline edit
const handleCancelEdit = () => {
  editingNoteId.value = null
}

// delete note
const deleteNote = (id) => {
  if (confirm('Are you sure you want to delete this note?')) {
    notesStore.delete(id)
    loadNotes()
  }
}

// toggle category on current note being written
const toggleNoteCategory = (catId) => {
  const ids = writingNote.value.categoryIds
  const idx = ids.indexOf(catId)
  if (idx === -1) {
    ids.push(catId)
  } else {
    ids.splice(idx, 1)
  }
}

</script>

<template>
  <div class="notes-app">
    <!-- Header with filter -->
    <Header></Header>

    <!-- Notes list (chat-style) -->
    <div class="notes-container" ref="notesContainerRef">
      <div v-if="filteredNotes.length === 0" class="empty-state">
        <p class="empty-message">
          {{ filterStore.searchQuery ? 'No notes match your search.' : filterStore.categories.length ? 'No notes in the selected categories.' : 'No notes yet. Start the conversation!' }}
        </p>
      </div>

      <div v-for="note in filteredNotes" :key="note.id" class="note-bubble">
        <Note
            :ref="el => { if (el) noteRefs[note.id] = el; else delete noteRefs[note.id] }"
            :id="note.id"
            :content="note.content"
            :created-at="new Date(note.createdAt)"
            :is-editing="note.id === editingNoteId"
            :categories="getCategoriesForNote(note)"
            :all-categories="categoriesStore.categories"
            @delete-note="deleteNote"
            @edit-note="editNote"
            @save-note="handleSaveNote"
            @cancel-edit="handleCancelEdit"
            @open-emoji-picker="isEmojiKeyboardOpen = true"
        />
      </div>
    </div>

    <!-- Emoji Keyboard - floating at bottom -->
    <EmojiPicker
      :isKeyboardOpen="isEmojiKeyboardOpen"
      @update:isKeyboardOpen="isEmojiKeyboardOpen = $event"
      @select-emoji="insertEmoji"
    />

    <!-- Input area -->
    <div class="input-area">
      <!-- Category selector -->
      <div v-if="categoriesStore.categories.length > 0" class="category-selector">
        <button
          v-for="cat in categoriesStore.categories"
          :key="cat.id"
          class="chip"
          :class="{ 'chip-active': writingNote.categoryIds.includes(cat.id) }"
          :style="{ '--chip-color': cat.color }"
          @click="toggleNoteCategory(cat.id)"
        >
          <span class="chip-dot"></span>
          {{ cat.name }}
        </button>
      </div>

      <div class="input-row">
        <div class="note-input-wrapper">
          <textarea
              ref="writeNoteRef"
              v-model="writingNote.content"
              placeholder="(Press Ctrl+Enter to send)"
              class="note-input"
              :rows="1"
              @keydown.meta.enter="sendNote"
              @keydown.ctrl.enter="sendNote"
              @keydown.esc="clearNote"
          ></textarea>
          <button
              v-if="writingNote.content.trim()"
              @click="clearNote"
              class="clear-btn"
              title="Clear note"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="input-actions">
          <button
            @click="isEmojiKeyboardOpen = !isEmojiKeyboardOpen"
            class="emoji-btn"
            title="Add emoji"
          >
            😊
          </button>
          <button @click="sendNote" class="send-btn" :disabled="!writingNote.content.trim()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== LAYOUT ===== */
.notes-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background-color: #d4dce8;
  font-size: 16px;
  -webkit-tap-highlight-color: transparent;
}

.dark .notes-app {
  background-color: #1a1a2e;
}





/* ===== NOTES LIST ===== */
.notes-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #888;
  font-style: italic;
}

.empty-message {
  margin: 0;
  font-size: 1rem;
  text-align: center;
  padding: 0 1rem;
}

.note-bubble {
  width: 100%;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ===== INPUT AREA ===== */
.input-area {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 0.75rem 1rem;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
  background-color: #eef1f6;
  border-top: 1px solid #c2cad6;
  gap: 0.5rem;
}

.dark .input-area {
  background-color: #0f3460;
  border-top-color: #16213e;
}

/* ===== CATEGORY SELECTOR ===== */
.category-selector {
  display: flex;
  gap: 0.35rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.category-selector::-webkit-scrollbar {
  display: none;
}

/* ===== INPUT ROW ===== */
.input-row {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.note-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.note-input {
  width: 100%;
  height: 48px;
  padding: 0.7rem 2.5rem 0.7rem 1rem;
  overflow-y: hidden;
  border: 1px solid #c2cad6;
  border-radius: 24px;
  resize: none;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background-color: #ffffff;
  color: #333;
}

.note-input:focus {
  outline: none;
  border-color: #4caf50;
}

.dark .note-input {
  background-color: #16213e;
  border-color: #1a1a2e;
  color: #eaeaea;
}

.dark .note-input::placeholder {
  color: #555;
}

.dark .note-input:focus {
  border-color: #4caf50;
}

.clear-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  color: #888;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  background-color: #fcd8db;
  color: #d32f2f;
}

.dark .clear-btn {
  color: #888;
}

.dark .clear-btn:hover {
  background-color: rgba(211, 47, 47, 0.15);
}

.input-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.emoji-btn {
  width: 48px;
  height: 48px;
  min-width: 48px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  color: #555;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.emoji-btn:hover {
  background-color: #dde3eb;
}

.emoji-btn:focus-visible,
.send-btn:focus-visible {
  outline: 2px solid #4caf50;
  outline-offset: 2px;
}

.dark .emoji-btn {
  color: #eaeaea;
}

.dark .emoji-btn:hover {
  background-color: #16213e;
}

.send-btn {
  width: 48px;
  height: 48px;
  min-width: 48px;
  padding: 0;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background-color: #45a049;
  transform: scale(1.05);
}

.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* ===== DESKTOP (≥1024px) ===== */
@media (min-width: 1024px) {
  .notes-container {
    padding: 1.5rem calc(50% - 380px);
  }

  .input-area {
    padding: 1rem calc(50% - 380px);
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  }


}

/* ===== LANDSCAPE MOBILE (altezza ridotta) ===== */
@media (max-height: 480px) and (orientation: landscape) {
  .input-area {
    padding-top: 0.35rem;
    padding-bottom: calc(0.35rem + env(safe-area-inset-bottom, 0px));
    gap: 0.25rem;
  }

  .notes-container {
    gap: 0.4rem;
  }
}

/* ===== TABLET (768px–1023px) ===== */
@media (min-width: 768px) and (max-width: 1023px) {
  .notes-container {
    padding: 1.25rem 2rem;
  }

  .input-area {
    padding: 1rem 2rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  }


}

/* ===== MOBILE (≤767px) ===== */
@media (max-width: 767px) {
  .notes-container {
    padding: 0.75rem;
    gap: 0.6rem;
  }

  .input-area {
    padding: 0.6rem 0.75rem;
    padding-bottom: calc(0.6rem + env(safe-area-inset-bottom, 0px));
  }

  .input-row {
    gap: 0.35rem;
  }

  .emoji-btn,
  .send-btn {
    width: 44px;
    height: 44px;
    min-width: 44px;
  }

  /* Prevent iOS zoom on input focus */
  .note-input,
  .search-inline-input {
    font-size: 16px;
  }
}
</style>
