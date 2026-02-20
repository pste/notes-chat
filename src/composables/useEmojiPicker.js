import { ref } from 'vue'

const isEmojiPickerOpen = ref(false)
const targetRef = ref(null)
const onEmojiSelected = ref(null)

export function useEmojiPicker() {
  const openEmojiPicker = (textareaRef, callback) => {
    targetRef.value = textareaRef
    onEmojiSelected.value = callback
    isEmojiPickerOpen.value = true
  }

  const closeEmojiPicker = () => {
    isEmojiPickerOpen.value = false
    targetRef.value = null
    onEmojiSelected.value = null
  }

  const selectEmoji = (emoji) => {
    if (targetRef.value && onEmojiSelected.value) {
      const textarea = targetRef.value.el || targetRef.value
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const value = textarea.value
      textarea.value = value.substring(0, start) + emoji + value.substring(end)
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
      onEmojiSelected.value(emoji)
    }
  }

  return {
    isEmojiPickerOpen,
    targetRef,
    openEmojiPicker,
    closeEmojiPicker,
    selectEmoji
  }
}
