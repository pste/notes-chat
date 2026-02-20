<script setup>
import { ref, onUnmounted, defineProps } from 'vue'
import { useEmojiPicker } from '../composables/useEmojiPicker'

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    content: String,
})

const editContent = ref(props.content)
const editInputRef = ref(null)
const { openEmojiPicker, closeEmojiPicker } = useEmojiPicker()

const openEmojiPickerForEdit = (event) => {
    event.stopPropagation()
    openEmojiPicker({ el: editInputRef.value }, (emoji) => {
        // Emoji already inserted by composable
        closeEmojiPicker()
    })
}

onUnmounted(() => {
    editContent.value = ''
})
</script>

<template>
    <div class="modal-overlay" @click.stop>
      <div class="edit-modal">
        <h3>Edit Note</h3>
        <div class="edit-input-wrapper">
          <textarea
            ref="editInputRef"
            v-model="editContent"
            class="edit-input"
            :rows="4"
          ></textarea>
          <button
            @click="openEmojiPickerForEdit"
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

.dark .modal-overlay {
  background-color: rgba(0, 0, 0, 0.7);
}

.edit-modal {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.dark .edit-modal {
  background-color: #16213e;
}

.edit-modal h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #333;
}

.dark .edit-modal h3 {
  color: #eaeaea;
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

.dark .edit-input {
  background-color: #1a1a2e;
  border-color: #0f3460;
  color: #eaeaea;
}

.dark .edit-input:focus {
  border-color: #4caf50;
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

.dark .cancel-btn {
  background-color: #0f3460;
  color: #eaeaea;
}

.dark .cancel-btn:hover {
  background-color: #1a1a2e;
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

.dark .save-btn:disabled {
  background-color: #333;
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

.dark .edit-emoji-btn:hover {
  background-color: #0f3460;
}

.edit-emoji-btn:hover {
  background-color: #e0e0e0;
}

</style>
