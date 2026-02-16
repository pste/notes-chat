<script setup>
import { ref, onUnmounted, defineProps } from 'vue'
import EmojiPicker from './EmojiPicker.vue'

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    content: String,
})

const editContent = ref(props.content)
const isEmojiPickerOpen = ref(false)
const editInputRef = ref(null)

const addEmoji = (emoji) => {
  const textarea = editInputRef.value
  if (!textarea) return
  console.log(emoji)

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value
  editContent.value = value.substring(0, start) + emoji + value.substring(end)
  //textarea.value = value.substring(0, start) + emoji + value.substring(end)
  textarea.selectionStart = textarea.selectionEnd = start + emoji.length
  //textarea.dispatchEvent(new Event('input', { bubbles: true }))
}

onUnmounted(() => {
  editContent.value = ''
})
</script>

<template>
    <div class="modal-overlay" >
      <div class="edit-modal">
        <h3>Edit Note</h3>
        <div class="edit-input-wrapper">
          <textarea
            ref="editInputRef"
            v-model="editContent"
            class="edit-input"
            :rows="4"
          ></textarea>
          <EmojiPicker
            v-if="isEmojiPickerOpen"
            class="emoji-picker-wrapper"
            :target-ref="editInputRef"
            @select="addEmoji"
            @closed="isEmojiPickerOpen = false"
          />
          <button
            @click.stop="isEmojiPickerOpen = !isEmojiPickerOpen"
            class="edit-emoji-btn"
            title="Add emoji"
          >
            😊
          </button>
        </div>
        <div class="modal-actions">
          <button @click="$emit('close-edit')" class="cancel-btn">Cancel</button>
          <button 
                @click="$emit('save-note', { id: id, content: editContent})" 
                class="save-btn" 
                :disabled="!editContent.trim()"
            >
                Save
            </button>
        </div>
      </div>
    </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.edit-modal {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.edit-modal h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #333;
}

.edit-input-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.edit-input {
  width: 100%;
  padding: 0.75rem 3.5rem 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: vertical;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.6;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-btn,
.save-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #333;
}

.cancel-btn:hover {
  background-color: #d0d0d0;
}

.save-btn {
  background-color: #4caf50;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.emoji-picker-wrapper {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
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

</style>