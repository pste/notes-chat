<script setup>
import { ref, nextTick } from 'vue'
import { CATEGORY_COLORS } from '../store/categories'

defineProps({
  categories: Array,
  activeFilter: { type: String, default: null },
})

const emit = defineEmits(['update:activeFilter', 'add-category', 'delete-category'])

const isAdding = ref(false)
const newName = ref('')
const newColor = ref(CATEGORY_COLORS[0])
const nameInputRef = ref(null)

const openAdd = () => {
  isAdding.value = true
  nextTick(() => nameInputRef.value?.focus())
}

const cancelAdd = () => {
  isAdding.value = false
  newName.value = ''
  newColor.value = CATEGORY_COLORS[0]
}

const confirmAdd = () => {
  if (!newName.value.trim()) return
  emit('add-category', { name: newName.value.trim(), color: newColor.value })
  cancelAdd()
}
</script>

<template>
  <div class="category-bar">
    <div class="chips-row">
      <button
        class="chip"
        :class="{ 'chip-active': !activeFilter }"
        @click="emit('update:activeFilter', null)"
      >
        All
      </button>

      <div v-for="cat in categories" :key="cat.id" class="chip-wrapper">
        <button
          class="chip chip-colored"
          :class="{ 'chip-active': activeFilter === cat.id }"
          :style="{ '--chip-color': cat.color }"
          @click="emit('update:activeFilter', cat.id)"
        >
          <span class="chip-dot"></span>
          {{ cat.name }}
        </button>
        <button
          class="chip-del"
          @click.stop="emit('delete-category', cat.id)"
          title="Delete category"
        >×</button>
      </div>

      <button class="chip chip-add" @click="openAdd" title="Add category">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>

    <div v-if="isAdding" class="add-form">
      <input
        ref="nameInputRef"
        v-model="newName"
        class="name-input"
        placeholder="Category name"
        @keydown.enter="confirmAdd"
        @keydown.esc="cancelAdd"
      />
      <div class="swatches">
        <button
          v-for="color in CATEGORY_COLORS"
          :key="color"
          class="swatch"
          :class="{ 'swatch-selected': newColor === color }"
          :style="{ background: color }"
          @click="newColor = color"
        ></button>
      </div>
      <div class="form-actions">
        <button class="btn-confirm" @click="confirmAdd" :disabled="!newName.trim()">Add</button>
        <button class="btn-cancel" @click="cancelAdd">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-bar {
  background-color: #eef1f6;
  border-bottom: 1px solid #c2cad6;
  padding: 0.4rem 1rem;
  flex-shrink: 0;
}

.dark .category-bar {
  background-color: #0f3460;
  border-bottom-color: #16213e;
}

.chips-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.chips-row::-webkit-scrollbar {
  display: none;
}

.chip-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  border: 1px solid #c2cad6;
  background: #dde3ec;
  color: #555;
  font-size: 0.78rem;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s, color 0.15s;
  line-height: 1.4;
}

.chip:hover {
  background: #cdd5e0;
}

.dark .chip {
  background: #16213e;
  border-color: #1a2a4a;
  color: #aaa;
}

.dark .chip:hover {
  background: #1e2d52;
}

.chip-active {
  background: #4caf50;
  border-color: #4caf50;
  color: white;
}

.chip-active:hover {
  background: #43a047;
}

.dark .chip-active,
.dark .chip-active:hover {
  background: #4caf50;
  border-color: #4caf50;
  color: white;
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chip-color);
  flex-shrink: 0;
}

.chip-colored.chip-active {
  background: var(--chip-color);
  border-color: var(--chip-color);
  color: white;
}

.chip-colored.chip-active:hover {
  background: var(--chip-color);
}

.chip-colored.chip-active .chip-dot {
  background: rgba(255, 255, 255, 0.7);
}

.chip-del {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: none;
  background: #999;
  color: white;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  opacity: 0;
  transition: opacity 0.15s, background-color 0.15s;
}

.chip-wrapper:hover .chip-del {
  opacity: 1;
}

.chip-del:hover {
  background: #d32f2f;
}

@media (hover: none) {
  .chip-del {
    opacity: 0.6;
  }
}

.chip-add {
  padding: 0.25rem 0.5rem;
  flex-shrink: 0;
  min-width: 32px;
  justify-content: center;
}

/* Add form */
.add-form {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.name-input {
  width: 100%;
  padding: 0.4rem 0.75rem;
  border: 1px solid #c2cad6;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  background: #ffffff;
  color: #333;
  box-sizing: border-box;
}

.name-input:focus {
  outline: none;
  border-color: #4caf50;
}

.dark .name-input {
  background: #16213e;
  border-color: #1a2a4a;
  color: #eaeaea;
}

.dark .name-input::placeholder {
  color: #555;
}

.dark .name-input:focus {
  border-color: #4caf50;
}

.swatches {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.1s, border-color 0.1s;
  padding: 0;
}

.swatch:hover {
  transform: scale(1.15);
}

.swatch-selected {
  border-color: #333;
  transform: scale(1.1);
}

.dark .swatch-selected {
  border-color: #fff;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-confirm {
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

.btn-confirm:hover:not(:disabled) {
  background: #43a047;
}

.btn-confirm:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.btn-cancel {
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

.btn-cancel:hover {
  background: #dde3ec;
}

.dark .btn-cancel {
  border-color: #1a2a4a;
  color: #aaa;
}

.dark .btn-cancel:hover {
  background: #16213e;
}

@media (min-width: 1024px) {
  .category-bar {
    padding: 0.4rem calc(50% - 380px);
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .category-bar {
    padding: 0.4rem 2rem;
  }
}

@media (max-width: 767px) {
  .category-bar {
    padding: 0.4rem 0.75rem;
  }
}
</style>
