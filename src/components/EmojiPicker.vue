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
    <span
      v-for="emoji in emojis"
      :key="emoji"
      @click="selectEmoji(emoji)"
      class="emoji-item"
    >{{ emoji }}</span>
  </div>
</template>

<style scoped>
.emoji-picker {
  position: absolute;
  bottom: 110%;
  left: 0;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 0.25rem;
  max-height: 120px;
  overflow-y: auto;
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
</style>
