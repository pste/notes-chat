<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['select-emoji', 'update:isKeyboardOpen'])

defineProps({
  isKeyboardOpen: {
    type: Boolean,
    default: false
  }
})

const emojis = [
  '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇',
  '🙂','🙃','😉','😋','😎','😍','😘','🥰','😗','😙',
  '😚','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏',
  '😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌',
  '😛','😜','😝','🤤','😒','😓','😔','😕','🤑','😲',
  '☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧',
  '😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪',
  '😵','🥴','🤢','🤮','🤧','😷','🤒','🤕','🤠','🥳',
  '🤓','🧐','🥺','😸','😹','😺','😻','😼','😽','🙀',
  '😿','😾','👋','🤚','🖐️','✋','🖖','👌','🤌','🤏',
  '✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇',
  '☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐',
  '🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔',
  '❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️',
  '✨','🌟','⭐','🔥','💥','🎉','🎊','🎈','🎁','🏆',
  '🍕','🍔','🍟','🌭','🍿','🧂','🥓','🥚','🍳','🧇',
  '🥞','🧈','🍞','🥐','🥖','🥨','🧀','🥗','🍱','🍜'
]

const keyboardOffset = ref(0)

function onViewportChange() {
  if (window.visualViewport) {
    const vv = window.visualViewport
    keyboardOffset.value = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
  }
}

onMounted(() => {
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onViewportChange)
    window.visualViewport.addEventListener('scroll', onViewportChange)
  }
})

onUnmounted(() => {
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', onViewportChange)
    window.visualViewport.removeEventListener('scroll', onViewportChange)
  }
})

function selectEmoji(emoji) {
  emit('select-emoji', { emoji })
  emit('update:isKeyboardOpen', false)
}

function closeKeyboard() {
  emit('update:isKeyboardOpen', false)
}
</script>

<template>
  <div
    class="emoji-keyboard"
    :class="{ open: isKeyboardOpen }"
    :style="{ bottom: keyboardOffset + 'px' }"
    @click.stop
  >
    <div class="emoji-keyboard-header">
      <span class="emoji-keyboard-title">Emoji</span>
      <button class="close-btn" @click="closeKeyboard">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="emoji-keyboard-grid">
      <span
        v-for="emoji in emojis"
        :key="emoji"
        class="emoji-item"
        @click="selectEmoji(emoji)"
      >{{ emoji }}</span>
    </div>
  </div>
</template>

<style scoped>
.emoji-keyboard {
  position: fixed;
  left: 0;
  right: 0;
  bottom: -100%;
  background-color: #eef1f6;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.18);
  z-index: 1100;
  transform: translateY(100%);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.emoji-keyboard.open {
  transform: translateY(0);
}

.dark .emoji-keyboard {
  background-color: #16213e;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5);
}

.emoji-keyboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #c2cad6;
}

.dark .emoji-keyboard-header {
  border-bottom-color: #0f3460;
}

.emoji-keyboard-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  color: #666;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: #d4dce8;
}

.dark .close-btn {
  color: #aaa;
}

.dark .close-btn:hover {
  background-color: #0f3460;
}

.emoji-keyboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
  gap: 2px;
  padding: 0.5rem;
  max-height: 220px;
  overflow-y: auto;
}

.emoji-item {
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 8px;
  text-align: center;
  line-height: 1;
  transition: background-color 0.15s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.emoji-item:hover,
.emoji-item:active {
  background-color: #d4dce8;
}

.dark .emoji-item:hover,
.dark .emoji-item:active {
  background-color: #0f3460;
}

.emoji-keyboard-grid::-webkit-scrollbar {
  width: 4px;
}

.emoji-keyboard-grid::-webkit-scrollbar-track {
  background: transparent;
}

.emoji-keyboard-grid::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

.dark .emoji-keyboard-grid::-webkit-scrollbar-thumb {
  background-color: #4a5568;
}
</style>
