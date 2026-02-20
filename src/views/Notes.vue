<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'
import { notesStore } from '../store/notes'

import EmojiPicker from '../components/EmojiPicker.vue'
import Note from '../components/Note.vue'
import NoteEditor from '../components/NoteEditor.vue'

const router = useRouter()
const notesContainer = ref(null)
const isEmojiPickerOpen = ref(false)

const user = ref(null)
const notes = ref([])
const newNote = ref('')
const editingNote = ref(null)
// Initialize dark mode from localStorage
const isDarkMode = ref(localStorage.getItem('theme') === 'dark')
const editInputRef = ref(null)

const reversedNotes = computed(() => {
  return [...notes.value].reverse()
})

onMounted(() => {
  user.value = auth.getUser()
  loadNotes()
})

const loadNotes = () => {
  notes.value = notesStore.getAll()
  nextTick(() => {
    scrollToBottom()
  })
}

const scrollToBottom = () => {
  if (notesContainer.value) {
    notesContainer.value.scrollTop = notesContainer.value.scrollHeight
  }
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

// save note workflow
const sendNote = () => {
  if (!newNote.value.trim()) return

  notesStore.add(newNote.value.trim())
  newNote.value = ''
  loadNotes()
}

// edit note workflow
const editNote = (id) => {
  const note = notesStore.getById(id)
  editingNote.value = note
}

const closeEditModal = () => {
  editingNote.value = null
}

const saveEditNote = (editContent) => {
  if (!editContent.content.trim() || !editingNote.value) return

  notesStore.update(editContent.id, editContent.content.trim())
  closeEditModal()
  loadNotes()
}

// delete note workflow
const deleteNote = (id) => {
  if (confirm('Are you sure you want to delete this note?')) {
    notesStore.delete(id)
    loadNotes()
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

// emoji handler
const addEmoji = (emoji) => {
  isEmojiPickerOpen.value = false
  //
  const textarea = editInputRef.value
  if (!textarea) return
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value
  newNote.value = value.substring(0, start) + emoji + value.substring(end)
}
</script>

<template>
  <div class="notes-app" :class="{ 'dark': isDarkMode }">
    <!-- Header with user info and logout -->
    <div class="notes-header">
      <div class="header-user">
        <img v-if="user?.picture" :src="user.picture" alt="Avatar" class="avatar" />
        <span class="user-name">{{ user?.name || 'User' }}</span>
      </div>
      <div class="header-actions">
        <button @click="toggleDarkMode" class="theme-btn" :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
          <svg v-if="!isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </div>

    <!-- Notes list (chat-style) -->
    <div class="notes-container" ref="notesContainer">
      <div v-if="notes.length === 0" class="empty-state">
        <p class="empty-message">No notes yet. Start the conversation!</p>
      </div>

      <div v-for="note in reversedNotes" :key="note.id" class="note-bubble">
        <Note 
            :id="note.id" 
            :content="note.content" 
            :created-at="new Date(note.createdAt)" 
            @delete-note="deleteNote"
            @edit-note="editNote"
        >
        </Note>
      </div>
    </div>

    <!-- Input area -->
    <div class="input-area">
      <div class="note-input-wrapper">
        <textarea
            ref="editInputRef"
            v-model="newNote"
            placeholder="Type a note... (Press Ctrl+Enter to send)"
            class="note-input"
            :rows="1"
            @keydown.meta.enter="sendNote"
            @keydown.ctrl.enter="sendNote"
        ></textarea>
        <EmojiPicker
            v-if="isEmojiPickerOpen"
            class="emoji-picker-wrapper"
            @select="addEmoji"
            @closed="isEmojiPickerOpen = false"
        />
      </div>
      <div class="input-actions">
        <button
          @click.stop="isEmojiPickerOpen = !isEmojiPickerOpen"
          class="emoji-btn"
          title="Add emoji"
        >
          😊
        </button>
        <button @click="sendNote" class="send-btn" :disabled="!newNote.trim()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>

    <!-- Edit modal -->
    <NoteEditor
        v-if="editingNote"
        :id="editingNote.id"
        :content="editingNote.content"
        @click.self="closeEditModal"
        @close-edit="closeEditModal"
        @save-note="saveEditNote"
    ></NoteEditor>
  </div>
</template>

<style scoped>
.notes-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
}

.notes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.dark .notes-header {
  background-color: #16213e;
  border-bottom-color: #0f3460;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.theme-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  color: #333;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-btn:hover {
  background-color: #e0e0e0;
}

.input-actions {
  display: flex;
  gap: 0.5rem;
}

.emoji-btn {
  width: 48px;
  height: 48px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  color: #333;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
}

.emoji-btn:hover {
  background-color: #e0e0e0;
}

.emoji-picker-wrapper {
  position: relative;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 600;
  color: #333;
}
.dark .user-name {
  color: #eaeaea;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #ff4757;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #ff6b81;
}

.notes-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
  font-style: italic;
}

.empty-message {
  margin: 0;
  font-size: 1.1rem;
}

.note-bubble {
  width: 100%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}



.input-area {
  display: flex;
  align-items: flex-end;
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  gap: 0.75rem;
}

.note-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.note-input {
  flex: 1;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  resize: none;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  max-height: 150px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.note-input:focus {
  outline: none;
  border-color: #4caf50;
}

.send-btn {
  padding: 0.75rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  background-color: #45a049;
  transform: scale(1.05);
}

.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}


.edit-input:focus {
  outline: none;
  border-color: #4caf50;
}

.edit-emoji-btn {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  color: #333;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.edit-emoji-btn:hover {
  background-color: #e0e0e0;
}


.emoji-item {
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.1s;
  text-align: center;
}

.emoji-item:hover {
  background-color: #f0f0f0;
}





.dark .logout-btn:hover {
  background-color: #ff6b81;
}

.dark .notes-container {
  background-color: #1a1a2e;
}

.dark .empty-message {
  color: #888;
}

.dark .note-input {
  background-color: #16213e;
  border-color: #0f3460;
  color: #eaeaea;
}

.dark .note-input:focus {
  border-color: #4caf50;
}

.dark .theme-btn:hover {
  background-color: #0f3460;
}

.dark .input-area {
  background-color: #16213e;
  border-top-color: #0f3460;
}

.dark .edit-modal {
  background-color: #16213e;
}

.dark .edit-modal h3 {
  color: #eaeaea;
}

.dark .edit-input {
  background-color: #1a1a2e;
  border-color: #0f3460;
  color: #eaeaea;
}

.dark .edit-input:focus {
  border-color: #4caf50;
}

.dark .cancel-btn {
  background-color: #0f3460;
  color: #eaeaea;
}

.dark .cancel-btn:hover {
  background-color: #1a1a2e;
}

.dark .send-btn:disabled {
  background-color: #333;
}

@media (max-width: 600px) {
  .notes-header {
    padding: 1rem;
  }

  .notes-container {
    padding: 1rem;
  }

  .input-area {
    padding: 1rem;
  }
}
</style>
