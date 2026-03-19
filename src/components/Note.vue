<script setup>
defineProps({
    id: String,
    content: String,
    createdAt: Date,
    isEdited: Boolean,
    category: { type: Object, default: null },
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
      :class="{ 'bubble-content': true, 'edited-note': isEdited, 'has-category': !!category }"
      :style="category ? { '--cat-color': category.color } : {}"
    >
        <div v-if="category" class="category-badge">
          <span class="cat-dot"></span>
          <span class="cat-name">{{ category.name }}</span>
        </div>
        <p class="note-text">{{ content }}</p>
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
    </div>
</template>

<style scoped>
.dark .bubble-content {
  background-color: #16213e;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.bubble-content {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.bubble-content.edited-note {
  background-color: #b86e00;
}

.has-category {
  border-left: 3px solid var(--cat-color);
  padding-left: calc(1rem - 3px);
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 0.4rem;
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

.dark .note-text {
  color: #eaeaea;
}

.note-text {
  margin: 0 0 0.5rem 0;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}

.dark .note-meta {
  color: #eaeaea;
}

.note-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #888;
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

.delete-btn:hover {
  background-color: #ffebee;
  color: #d32f2f;
}
</style>
