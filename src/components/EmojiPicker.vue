<script setup>
import { emojiStore } from '../store/emoji'
import { useEmojiPicker } from '../composables/useEmojiPicker'

const { emojis } = emojiStore
const { isEmojiPickerOpen, selectEmoji, closeEmojiPicker } = useEmojiPicker()
</script>

<template>
  <div v-if="isEmojiPickerOpen" class="emoji-picker" @click.stop>
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
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
  width: 90%;
  max-width: 360px;
}

.dark .emoji-picker {
  background-color: #16213e;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
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
  text-align: center;
}

.dark .emoji-picker-title {
  color: #888;
}

.emoji-picker-grid {
  padding: 0.75rem;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 0.4rem;
  max-height: 240px;
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
