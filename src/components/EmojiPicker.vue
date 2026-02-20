<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { emojiStore } from '../store/emoji'

const props = defineProps({
  targetRef: {
    type: Object
  }
})

const emit = defineEmits(['select', 'closed'])

const { emojis } = emojiStore

const pickerRef = ref(null)

const selectEmoji = (emoji) => {
  if (props.targetRef) {
    const textarea = props.targetRef.el || props.targetRef
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value
    textarea.value = value.substring(0, start) + emoji + value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }
  emit('select', emoji)
  emit('closed')
}

const handleClickOutside = (event) => {
  if (pickerRef.value && !pickerRef.value.contains(event.target)) {
    emit('closed')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('touchstart', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('touchstart', handleClickOutside)
})
</script>

<template>
  <div class="emoji-picker" ref="pickerRef">
    <div class="emoji-picker-header">
      <span class="emoji-picker-title">Select Emoji</span>
    </div>
    <div class="emoji-picker-grid">
      <span
        v-for="emoji in emojis"
        :key="emoji"
        @click="selectEmoji(emoji)"
        class="emoji-item"
      >{{ emoji }}</span>
    </div>
  </div>
</template>

<style scoped>
.emoji-picker {
  position: absolute;
  bottom: 110%;
  left: 0;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 100;
  overflow: hidden;
  min-width: 280px;
  max-width: 320px;
}

.dark .emoji-picker {
  background-color: #16213e;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
}

.emoji-picker-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.dark .emoji-picker-header {
  border-bottom-color: #0f3460;
}

.emoji-picker-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dark .emoji-picker-title {
  color: #888;
}

.emoji-picker-grid {
  padding: 0.75rem;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 0.35rem;
  max-height: 160px;
  overflow-y: auto;
}

.emoji-item {
  font-size: 1.6rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.15s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emoji-item:hover {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  transform: scale(1.15);
}

.dark .emoji-item:hover {
  background: linear-gradient(135deg, #1f3b5e 0%, #16213e 100%);
}

.emoji-picker-grid::-webkit-scrollbar {
  width: 6px;
}

.emoji-picker-grid::-webkit-scrollbar-track {
  background: transparent;
}

.emoji-picker-grid::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

.dark .emoji-picker-grid::-webkit-scrollbar-thumb {
  background-color: #4a5568;
}

.emoji-picker-grid::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
