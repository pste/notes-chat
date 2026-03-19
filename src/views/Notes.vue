<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { notesStore } from '../store/notes'
import { categoriesStore } from '../store/categories'

import EmojiPicker from '../components/EmojiPicker.vue'
import Note from '../components/Note.vue'
import CategoryBar from '../components/CategoryBar.vue'

const notesContainerRef = ref(null)
const writeNoteRef = ref(null)
const notes = ref([])
const categories = ref([])
const writingNote = ref({ content: '', categoryId: null })

const isEmojiKeyboardOpen = ref(false)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const searchQuery = ref('')
const isSearchOpen = ref(false)
const searchInputRef = ref(null)
const activeFilter = ref(null)

// computed
const filteredNotes = computed(() => {
  let all = [...notes.value].reverse()
  if (activeFilter.value) {
    all = all.filter(n => n.categoryId === activeFilter.value)
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return all
  return all.filter(n => n.content.toLowerCase().includes(q))
})

const reversedNotes = computed(() => filteredNotes.value)

const getCategoryForNote = (note) => {
  if (!note.categoryId) return null
  return categories.value.find(c => c.id === note.categoryId) || null
}

// events
const handleClickOutside = (event) => {
  if (!isEmojiKeyboardOpen.value) return
  if (event.target.closest('.emoji-keyboard') || event.target.closest('.emoji-btn')) {
    return
  }
  isEmojiKeyboardOpen.value = false
}

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  loadNotes()
  loadCategories()
})

const loadNotes = () => {
  notes.value = notesStore.getAll()
  nextTick(() => {
    if (notesContainerRef.value) {
      notesContainerRef.value.scrollTop = notesContainerRef.value.scrollHeight
    }
  })
}

const loadCategories = () => {
  categories.value = categoriesStore.getAll()
}

// triggered from emoji dialog
function insertEmoji(selected) {
  const textarea = writeNoteRef.value
  const emoji = selected.emoji

  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value

    textarea.value = value.substring(0, start) + emoji + value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

// search
const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
  if (isSearchOpen.value) {
    nextTick(() => searchInputRef.value?.focus())
  } else {
    searchQuery.value = ''
  }
}

// dark mode handler
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// save note
const sendNote = () => {
  const id = writingNote.value?.id
  const content = writingNote.value.content.trim()
  const categoryId = writingNote.value.categoryId || null
  if (!content) return
  if (id) {
    notesStore.update(id, content, categoryId)
  } else {
    notesStore.add(content, categoryId)
  }
  clearNote()
  loadNotes()
}

// clear note
const clearNote = () => {
  writingNote.value = { content: '', categoryId: null }
}

// edit note
const editNote = (id) => {
  const note = notesStore.getById(id)
  writingNote.value = { ...note }
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
  writingNote.value.categoryId = writingNote.value.categoryId === catId ? null : catId
}

// category management
const addCategory = ({ name, color }) => {
  categoriesStore.add(name, color)
  loadCategories()
}

const deleteCategory = (id) => {
  if (activeFilter.value === id) activeFilter.value = null
  categoriesStore.delete(id)
  loadCategories()
}
</script>

<template>
  <div class="notes-app">
    <!-- Header -->
    <div class="notes-header">
      <div class="header-top">
        <span class="notes-title">Notes</span>
        <div class="header-btns">
          <button @click="toggleSearch" class="theme-btn" :class="{ active: isSearchOpen }" title="Search notes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <button @click="toggleDarkMode" class="theme-btn" :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
            <svg v-if="isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div v-if="isSearchOpen" class="search-row">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            class="search-input"
            placeholder="Search notes..."
            @keydown.esc="toggleSearch"
          />
          <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <span v-if="searchQuery" class="search-count">{{ filteredNotes.length }} result{{ filteredNotes.length !== 1 ? 's' : '' }}</span>
      </div>
    </div>

    <!-- Category filter bar -->
    <CategoryBar
      :categories="categories"
      :active-filter="activeFilter"
      @update:active-filter="activeFilter = $event"
      @add-category="addCategory"
      @delete-category="deleteCategory"
    />

    <!-- Notes list (chat-style) -->
    <div class="notes-container" ref="notesContainerRef">
      <div v-if="reversedNotes.length === 0" class="empty-state">
        <p class="empty-message">{{ searchQuery ? 'No notes match your search.' : activeFilter ? 'No notes in this category.' : 'No notes yet. Start the conversation!' }}</p>
      </div>

      <div v-for="note in reversedNotes" :key="note.id" class="note-bubble">
        <Note
            :id="note.id"
            :content="note.content"
            :created-at="new Date(note.createdAt)"
            :isEdited="note.id === writingNote.id"
            :category="getCategoryForNote(note)"
            @delete-note="deleteNote"
            @edit-note="editNote"
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
      <div v-if="writingNote.id" class="edit-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        <span>Editing note</span>
        <button class="cancel-edit-btn" @click="clearNote" title="Cancel edit (Esc)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Cancel
        </button>
      </div>

      <!-- Category selector -->
      <div v-if="categories.length > 0" class="category-selector">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="cat-select-chip"
          :class="{ 'cat-select-active': writingNote.categoryId === cat.id }"
          :style="{ '--chip-color': cat.color }"
          @click="toggleNoteCategory(cat.id)"
        >
          <span class="cat-chip-dot"></span>
          {{ cat.name }}
        </button>
      </div>

      <div class="input-row">
        <div class="note-input-wrapper">
          <textarea
              ref="writeNoteRef"
              v-model="writingNote.content"
              placeholder="Type a note... (Press Ctrl+Enter to send)"
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
          <!-- emoji -->
          <button
            @click="isEmojiKeyboardOpen = !isEmojiKeyboardOpen"
            class="emoji-btn"
            title="Add emoji"
          >
            😊
          </button>
          <!-- save note -->
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

/* ===== HEADER ===== */
.notes-header {
  display: flex;
  flex-direction: column;
  padding: 0.6rem 1rem;
  background-color: #eef1f6;
  border-bottom: 1px solid #c2cad6;
  flex-shrink: 0;
  gap: 0.5rem;
}

.dark .notes-header {
  background-color: #0f3460;
  border-bottom-color: #16213e;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-btns {
  display: flex;
  gap: 0.25rem;
}

.notes-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.dark .notes-title {
  color: #eaeaea;
}

.theme-btn {
  width: 44px;
  height: 44px;
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
  flex-shrink: 0;
}

.theme-btn:hover {
  background-color: #dde3eb;
}

.theme-btn.active {
  background-color: #d6edd8;
  color: #4caf50;
}

.dark .theme-btn {
  color: #eaeaea;
}

.dark .theme-btn:hover {
  background-color: #16213e;
}

.dark .theme-btn.active {
  background-color: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

/* ===== SEARCH ===== */
.search-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.65rem;
  color: #888;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.1rem;
  border: 1px solid #c2cad6;
  border-radius: 20px;
  font-size: 1rem;
  font-family: inherit;
  background-color: #dde3ec;
  color: #333;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #4caf50;
}

.dark .search-input {
  background-color: #16213e;
  border-color: #0f3460;
  color: #eaeaea;
}

.dark .search-input:focus {
  border-color: #4caf50;
}

.dark .search-input::placeholder {
  color: #555;
}

.clear-search-btn {
  position: absolute;
  right: 0.4rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  padding: 0.3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  min-width: 28px;
  min-height: 28px;
}

.clear-search-btn:hover {
  background-color: #c8d0da;
}

.dark .clear-search-btn:hover {
  background-color: #0f3460;
}

.search-count {
  font-size: 0.78rem;
  color: #888;
  white-space: nowrap;
  flex-shrink: 0;
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

.edit-banner {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #b86e00;
  padding: 0.2rem 0;
}

.dark .edit-banner {
  color: #f5a623;
}

.edit-banner span {
  flex: 1;
}

.cancel-edit-btn {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: none;
  border: 1px solid currentColor;
  border-radius: 12px;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  color: #b86e00;
  cursor: pointer;
  transition: background-color 0.2s;
  line-height: 1.4;
}

.cancel-edit-btn:hover {
  background-color: #fff3e0;
}

.dark .cancel-edit-btn {
  color: #f5a623;
}

.dark .cancel-edit-btn:hover {
  background-color: rgba(245, 166, 35, 0.1);
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

.cat-select-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.55rem;
  border-radius: 12px;
  border: 1px solid #c2cad6;
  background: transparent;
  color: #666;
  font-size: 0.75rem;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  line-height: 1.4;
}

.cat-select-chip:hover {
  background: #dde3ec;
}

.cat-chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--chip-color);
  flex-shrink: 0;
}

.cat-select-active {
  background: var(--chip-color);
  border-color: var(--chip-color);
  color: white;
}

.cat-select-active .cat-chip-dot {
  background: rgba(255, 255, 255, 0.7);
}

.dark .cat-select-chip {
  border-color: #1a2a4a;
  color: #888;
}

.dark .cat-select-chip:hover {
  background: #16213e;
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
  min-height: 48px;
  max-height: 140px;
  padding: 0.7rem 2.5rem 0.7rem 1rem;
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

  .notes-header {
    padding: 0.6rem calc(50% - 380px);
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

  .notes-header {
    padding: 0.6rem 2rem;
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
  .search-input {
    font-size: 16px;
  }
}
</style>
