<script setup>
import { ref, watch, nextTick, computed } from 'vue'

const props = defineProps({
    id: String,
    content: String,
    createdAt: Date,
    isEditing: { type: Boolean, default: false },
    categories: { type: Array, default: () => [] },
    allCategories: { type: Array, default: () => [] },
})

const emit = defineEmits(['edit-note', 'delete-note', 'save-note', 'cancel-edit'])

const editContent = ref('')
const editCategoryIds = ref([])
const textareaRef = ref(null)

watch(() => props.isEditing, (val) => {
  if (val) {
    editContent.value = props.content
    editCategoryIds.value = props.categories.map(c => c.id)
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.focus()
        const len = textareaRef.value.value.length
        textareaRef.value.setSelectionRange(len, len)
      }
    })
  }
})

const toggleEditCategory = (catId) => {
  const idx = editCategoryIds.value.indexOf(catId)
  if (idx === -1) editCategoryIds.value.push(catId)
  else editCategoryIds.value.splice(idx, 1)
}

const insertEmoji = (emoji) => {
  const ta = textareaRef.value
  if (!ta) return
  const start = ta.selectionStart
  const end = ta.selectionEnd
  editContent.value = editContent.value.substring(0, start) + emoji + editContent.value.substring(end)
  nextTick(() => {
    ta.selectionStart = ta.selectionEnd = start + emoji.length
    ta.focus()
  })
}

defineExpose({ insertEmoji })

const saveEdit = () => {
  if (!editContent.value.trim()) return
  emit('save-note', { id: props.id, content: editContent.value.trim(), categoryIds: editCategoryIds.value })
}

const URL_RE = /https?:\/\/[^\s<>"]+/g

const parsedContent = computed(() => {
  const segments = []
  let last = 0
  for (const m of props.content.matchAll(URL_RE)) {
    if (m.index > last) segments.push({ type: 'text', value: props.content.slice(last, m.index) })
    segments.push({ type: 'url', value: m[0] })
    last = m.index + m[0].length
  }
  if (last < props.content.length) segments.push({ type: 'text', value: props.content.slice(last) })
  return segments
})

const formatTime = (date) => {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>

<template>
    <div
      :class="{ 'bubble-content': true, 'is-editing': isEditing, 'has-category': categories.length > 0 && !isEditing }"
      :style="categories.length > 0 && !isEditing ? { '--cat-color': categories[0].color } : {}"
    >
      <!-- Inline edit mode -->
      <template v-if="isEditing">
        <textarea
          ref="textareaRef"
          v-model="editContent"
          class="inline-textarea"
          @keydown.meta.enter="saveEdit"
          @keydown.ctrl.enter="saveEdit"
          @keydown.esc="emit('cancel-edit', id)"
        ></textarea>

        <div v-if="allCategories.length > 0" class="inline-cat-selector">
          <button
            v-for="cat in allCategories"
            :key="cat.id"
            class="chip"
            :class="{ 'chip-active': editCategoryIds.includes(cat.id) }"
            :style="{ '--chip-color': cat.color }"
            @click="toggleEditCategory(cat.id)"
          >
            <span class="chip-dot"></span>
            {{ cat.name }}
          </button>
        </div>

        <div class="inline-edit-actions">
          <button class="inline-save-btn" @click="saveEdit" :disabled="!editContent.trim()">Save</button>
          <button class="inline-cancel-btn" @click="emit('cancel-edit', id)">Cancel</button>
        </div>
      </template>

      <!-- Normal display mode -->
      <template v-else>
        <div v-if="categories.length > 0" class="category-badges">
          <span v-for="cat in categories" :key="cat.id" class="category-badge" :style="{ '--cat-color': cat.color }">
            <span class="cat-dot"></span>
            <span class="cat-name">{{ cat.name }}</span>
          </span>
        </div>
        <p class="note-text">
          <template v-for="(seg, i) in parsedContent" :key="i">
            <a v-if="seg.type === 'url'" :href="seg.value" target="_blank" rel="noopener noreferrer" class="note-link">{{ seg.value }}</a>
            <span v-else>{{ seg.value }}</span>
          </template>
        </p>
        <div class="note-meta">
          <span class="note-time">{{ formatTime(createdAt) }}</span>
          <div class="note-actions">
            <button @click="$emit('edit-note', id)" class="edit-btn" title="Edit note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button @click="$emit('delete-note', id)" class="delete-btn" title="Delete note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>
</template>

<style scoped>
.bubble-content {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.dark .bubble-content {
  background-color: #16213e;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.bubble-content.is-editing {
  box-shadow: 0 0 0 2px #4caf50;
}

.dark .bubble-content.is-editing {
  box-shadow: 0 0 0 2px #4caf50;
}

.has-category {
  border-left: 3px solid var(--cat-color);
  padding-left: calc(1rem - 3px);
}

/* ===== CATEGORY BADGES ===== */
.category-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.4rem;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.cat-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--cat-color);
  flex-shrink: 0;
}

.cat-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--cat-color);
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ===== NOTE DISPLAY ===== */
.note-text {
  margin: 0 0 0.5rem 0;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-word;
}

.dark .note-text {
  color: #eaeaea;
}

.note-link {
  color: #4caf50;
  text-decoration: none;
  word-break: break-all;
}

.note-link:hover {
  text-decoration: underline;
}

.dark .note-link {
  color: #81c784;
}

.note-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #888;
}

.dark .note-meta {
  color: #aaa;
}

.note-time {
  opacity: 0.8;
}

.note-actions {
  display: flex;
  gap: 0.25rem;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
}

.dark .edit-btn,
.dark .delete-btn {
  color: #707070;
}

.edit-btn:hover {
  background-color: #e3f2fd;
  color: #1976d2;
}

.edit-btn:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.delete-btn:hover {
  background-color: #ffebee;
  color: #d32f2f;
}

.delete-btn:focus-visible {
  outline: 2px solid #d32f2f;
  outline-offset: 2px;
}

/* ===== INLINE EDIT ===== */
.inline-textarea {
  width: 100%;
  min-height: 80px;
  padding: 0.5rem;
  border: 1px solid #c2cad6;
  border-radius: 8px;
  resize: vertical;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  background-color: #f8f9fb;
  color: #333;
  box-sizing: border-box;
  margin-bottom: 0.6rem;
}

.inline-textarea:focus {
  outline: none;
  border-color: #4caf50;
}

.dark .inline-textarea {
  background-color: #0f1f3a;
  border-color: #1a2a4a;
  color: #eaeaea;
}

.dark .inline-textarea:focus {
  border-color: #4caf50;
}

.inline-cat-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.6rem;
}

.inline-edit-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.inline-save-btn {
  padding: 0.3rem 0.9rem;
  border-radius: 8px;
  border: none;
  background: #4caf50;
  color: white;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.15s;
}

.inline-save-btn:hover:not(:disabled) {
  background: #43a047;
}

.inline-save-btn:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.inline-cancel-btn {
  padding: 0.3rem 0.9rem;
  border-radius: 8px;
  border: 1px solid #c2cad6;
  background: none;
  color: #555;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.15s;
}

.inline-cancel-btn:hover {
  background: #dde3ec;
}

.dark .inline-cancel-btn {
  border-color: #1a2a4a;
  color: #aaa;
}

.dark .inline-cancel-btn:hover {
  background: #16213e;
}
</style>
