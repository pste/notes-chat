<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { notesStore } from '../store/notes'
import { categoriesStore, CATEGORY_COLORS } from '../store/categories'

import EmojiPicker from '../components/EmojiPicker.vue'
import Note from '../components/Note.vue'

const notesContainerRef = ref(null)
const writeNoteRef = ref(null)
const notes = ref([])
const categories = ref([])
const writingNote = ref({ content: '', categoryIds: [] })

const isEmojiKeyboardOpen = ref(false)
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const searchQuery = ref('')
const isSearchOpen = ref(false)
const searchInputRef = ref(null)
const activeFilter = ref(null)
const editingNoteId = ref(null)

const isFilterOpen = ref(false)
const isAddingCategory = ref(false)
const newCatName = ref('')
const newCatColor = ref(CATEGORY_COLORS[0])
const newCatNameRef = ref(null)

// computed
const filteredNotes = computed(() => {
  let all = [...notes.value].reverse()
  if (activeFilter.value) {
    all = all.filter(n => n.categoryIds?.includes(activeFilter.value))
  }
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return all
  return all.filter(n => n.content.toLowerCase().includes(q))
})

const reversedNotes = computed(() => filteredNotes.value)

const getCategoriesForNote = (note) => {
  if (!note.categoryIds?.length) return []
  return note.categoryIds.map(id => categories.value.find(c => c.id === id)).filter(Boolean)
}

// events
const handleClickOutside = (event) => {
  if (isEmojiKeyboardOpen.value) {
    if (!event.target.closest('.emoji-keyboard') && !event.target.closest('.emoji-btn')) {
      isEmojiKeyboardOpen.value = false
    }
  }
  if (isFilterOpen.value) {
    if (!event.target.closest('.filter-panel') && !event.target.closest('.filter-btn')) {
      isFilterOpen.value = false
    }
  }
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

// filter panel
const toggleFilter = () => {
  isFilterOpen.value = !isFilterOpen.value
  if (!isFilterOpen.value) {
    isAddingCategory.value = false
    newCatName.value = ''
    newCatColor.value = CATEGORY_COLORS[0]
  }
}

const openAddCategory = () => {
  isAddingCategory.value = true
  nextTick(() => newCatNameRef.value?.focus())
}

const cancelAddCategory = () => {
  isAddingCategory.value = false
  newCatName.value = ''
  newCatColor.value = CATEGORY_COLORS[0]
}

const confirmAddCategory = () => {
  if (!newCatName.value.trim()) return
  categoriesStore.add(newCatName.value.trim(), newCatColor.value)
  loadCategories()
  cancelAddCategory()
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

// category management
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
        <!-- Title or inline search -->
        <span v-if="!isSearchOpen" class="notes-title">Notes</span>
        <div v-else class="search-inline-wrapper">
          <svg class="search-inline-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            class="search-inline-input"
            placeholder="Search notes..."
            @keydown.esc="toggleSearch"
          />
          <button v-if="searchQuery" class="search-clear-btn" @click="searchQuery = ''">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <span v-if="searchQuery" class="search-count-inline">{{ filteredNotes.length }}</span>
        </div>

        <div class="header-btns">
          <!-- Search toggle -->
          <button @click="toggleSearch" class="theme-btn" :class="{ active: isSearchOpen }" title="Search notes">
            <svg v-if="!isSearchOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Filter toggle -->
          <button
            class="theme-btn filter-btn"
            :class="{ active: isFilterOpen || activeFilter }"
            @click="toggleFilter"
            title="Filter by category"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            <span v-if="activeFilter" class="filter-dot"></span>
          </button>

          <!-- Dark mode toggle -->
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

      <!-- Filter panel -->
      <div v-if="isFilterOpen" class="filter-panel">
        <div class="filter-chips">
          <button
            class="fchip"
            :class="{ 'fchip-active': !activeFilter }"
            @click="activeFilter = null"
          >All</button>

          <div v-for="cat in categories" :key="cat.id" class="fchip-wrapper">
            <button
              class="fchip fchip-colored"
              :class="{ 'fchip-active': activeFilter === cat.id }"
              :style="{ '--chip-color': cat.color }"
              @click="activeFilter = cat.id"
            >
              <span class="fchip-dot"></span>
              {{ cat.name }}
            </button>
            <button class="fchip-del" @click.stop="deleteCategory(cat.id)" title="Delete category">×</button>
          </div>

          <button class="fchip fchip-add" @click="openAddCategory" title="Add category">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <!-- Add category form -->
        <div v-if="isAddingCategory" class="add-cat-form">
          <input
            ref="newCatNameRef"
            v-model="newCatName"
            class="add-cat-input"
            placeholder="Category name"
            @keydown.enter="confirmAddCategory"
            @keydown.esc="cancelAddCategory"
          />
          <div class="add-cat-swatches">
            <button
              v-for="color in CATEGORY_COLORS"
              :key="color"
              class="swatch"
              :class="{ 'swatch-active': newCatColor === color }"
              :style="{ background: color }"
              @click="newCatColor = color"
            ></button>
          </div>
          <div class="add-cat-actions">
            <button class="btn-add-confirm" @click="confirmAddCategory" :disabled="!newCatName.trim()">Add</button>
            <button class="btn-add-cancel" @click="cancelAddCategory">Cancel</button>
          </div>
        </div>
      </div>
    </div>

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
            :is-editing="note.id === editingNoteId"
            :categories="getCategoriesForNote(note)"
            :all-categories="categories"
            @delete-note="deleteNote"
            @edit-note="editNote"
            @save-note="handleSaveNote"
            @cancel-edit="handleCancelEdit"
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
      <div v-if="categories.length > 0" class="category-selector">
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="cat-select-chip"
          :class="{ 'cat-select-active': writingNote.categoryIds.includes(cat.id) }"
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

/* ===== HEADER ===== */
.notes-header {
  display: flex;
  flex-direction: column;
  padding: 0.4rem 1rem;
  background-color: #eef1f6;
  border-bottom: 1px solid #c2cad6;
  flex-shrink: 0;
  gap: 0.4rem;
}

.dark .notes-header {
  background-color: #0f3460;
  border-bottom-color: #16213e;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
}

.header-btns {
  display: flex;
  gap: 0.1rem;
  flex-shrink: 0;
  margin-left: auto;
}

.notes-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
}

.dark .notes-title {
  color: #eaeaea;
}

.theme-btn {
  width: 40px;
  height: 40px;
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
  position: relative;
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

/* Filter active dot */
.filter-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4caf50;
  border: 1.5px solid #eef1f6;
}

.dark .filter-dot {
  border-color: #0f3460;
}

/* ===== INLINE SEARCH ===== */
.search-inline-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: #dde3ec;
  border: 1px solid #c2cad6;
  border-radius: 20px;
  padding: 0 0.65rem;
  height: 36px;
  min-width: 0;
}

.dark .search-inline-wrapper {
  background: #16213e;
  border-color: #1a2a4a;
}

.search-inline-wrapper:focus-within {
  border-color: #4caf50;
}

.search-inline-icon {
  color: #888;
  flex-shrink: 0;
}

.search-inline-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-family: inherit;
  color: #333;
  min-width: 0;
}

.search-inline-input:focus {
  outline: none;
}

.dark .search-inline-input {
  color: #eaeaea;
}

.dark .search-inline-input::placeholder {
  color: #555;
}

.search-clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  padding: 0.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.15s;
}

.search-clear-btn:hover {
  background-color: #c8d0da;
}

.dark .search-clear-btn:hover {
  background-color: #0f3460;
}

.search-count-inline {
  font-size: 0.72rem;
  color: #888;
  flex-shrink: 0;
  background: #c8d0da;
  border-radius: 10px;
  padding: 0.05rem 0.4rem;
  line-height: 1.5;
}

.dark .search-count-inline {
  background: #0f3460;
  color: #aaa;
}

/* ===== FILTER PANEL ===== */
.filter-panel {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-bottom: 0.2rem;
}

.filter-chips {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.fchip-wrapper {
  display: flex;
  align-items: center;
}

.fchip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.22rem 0.6rem;
  border-radius: 20px;
  border: 1px solid #c2cad6;
  background: #dde3ec;
  color: #555;
  font-size: 0.76rem;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s, color 0.15s;
  line-height: 1.4;
}

.fchip:hover {
  background: #cdd5e0;
}

.dark .fchip {
  background: #16213e;
  border-color: #1a2a4a;
  color: #aaa;
}

.dark .fchip:hover {
  background: #1e2d52;
}

.fchip-active {
  background: #4caf50;
  border-color: #4caf50;
  color: white;
}

.fchip-active:hover {
  background: #43a047;
}

.dark .fchip-active,
.dark .fchip-active:hover {
  background: #4caf50;
  border-color: #4caf50;
  color: white;
}

.fchip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--chip-color);
  flex-shrink: 0;
}

.fchip-colored.fchip-active {
  background: var(--chip-color);
  border-color: var(--chip-color);
  color: white;
}

.fchip-colored.fchip-active .fchip-dot {
  background: rgba(255, 255, 255, 0.7);
}

.fchip-del {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: none;
  background: #b0b8c4;
  color: white;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: -5px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s, background-color 0.15s;
  line-height: 1;
}

.fchip-wrapper:hover .fchip-del {
  opacity: 1;
}

.fchip-del:hover {
  background: #d32f2f;
}

@media (hover: none) {
  .fchip-del {
    opacity: 0.7;
  }
}

.fchip-add {
  padding: 0.22rem 0.45rem;
  min-width: 28px;
  justify-content: center;
}

/* ===== ADD CATEGORY FORM ===== */
.add-cat-form {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem;
  background: #e4eaf3;
  border-radius: 8px;
}

.dark .add-cat-form {
  background: #16213e;
}

.add-cat-input {
  padding: 0.35rem 0.65rem;
  border: 1px solid #c2cad6;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  background: #ffffff;
  color: #333;
  box-sizing: border-box;
}

.add-cat-input:focus {
  outline: none;
  border-color: #4caf50;
}

.dark .add-cat-input {
  background: #0f1f3a;
  border-color: #1a2a4a;
  color: #eaeaea;
}

.dark .add-cat-input::placeholder {
  color: #555;
}

.add-cat-swatches {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.1s, border-color 0.1s;
  padding: 0;
  flex-shrink: 0;
}

.swatch:hover {
  transform: scale(1.15);
}

.swatch-active {
  border-color: #333;
  transform: scale(1.1);
}

.dark .swatch-active {
  border-color: #fff;
}

.add-cat-actions {
  display: flex;
  gap: 0.4rem;
}

.btn-add-confirm {
  padding: 0.25rem 0.8rem;
  border-radius: 6px;
  border: none;
  background: #4caf50;
  color: white;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-add-confirm:hover:not(:disabled) {
  background: #43a047;
}

.btn-add-confirm:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.btn-add-cancel {
  padding: 0.25rem 0.8rem;
  border-radius: 6px;
  border: 1px solid #c2cad6;
  background: none;
  color: #555;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-add-cancel:hover {
  background: #dde3ec;
}

.dark .btn-add-cancel {
  border-color: #1a2a4a;
  color: #aaa;
}

.dark .btn-add-cancel:hover {
  background: #1a2a4a;
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
    padding: 0.4rem calc(50% - 380px);
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
    padding: 0.4rem 2rem;
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
