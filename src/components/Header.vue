<script setup>
import { ref, computed, nextTick } from 'vue'
import { useCategoriesStore } from '../store/categories'
import { useThemeStore } from '../store/theme'
import { useFilterStore } from '../store/filter'

const themeStore = useThemeStore()
const categoriesStore = useCategoriesStore()
const filterStore = useFilterStore()


const isSearchOpen = ref(false)
const searchInputRef = ref(null)
const isDarkMode = computed(() => themeStore.theme  === "dark")
const isAddingCategory = ref(false)
const newCatName = ref('')
const newCatColor = ref(categoriesStore.CATEGORY_COLORS[0])
const newCatNameRef = ref(null)

//
const filteredNotes = computed(() => {
    return [] // TODO
})

// search
const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
  if (isSearchOpen.value) {
    nextTick(() => searchInputRef.value?.focus())
  } else {
    filterStore.searchQuery = ''
  }
}

// category management
const pendingDelete = ref(null)

const deleteCategory = (id) => {
  if (pendingDelete.value === id) {
    if (filterStore.category === id) filterStore.category = null
    categoriesStore.delete(id)
    pendingDelete.value = null
  } else {
    pendingDelete.value = id
  }
}

const cancelPendingDelete = () => {
  pendingDelete.value = null
}

const openAddCategory = () => {
  if (isAddingCategory.value === true) {
    cancelAddCategory()
  }
  else {
    isAddingCategory.value = true
    nextTick(() => newCatNameRef.value?.focus())
  }
}

const cancelAddCategory = () => {
  isAddingCategory.value = false
  newCatName.value = ''
  newCatColor.value = categoriesStore.CATEGORY_COLORS[0]
}

const confirmAddCategory = () => {
  if (!newCatName.value.trim()) return
  categoriesStore.add(newCatName.value.trim(), newCatColor.value)
  cancelAddCategory()
}
</script>

<template>
  <div class="notes-header">
    <div class="header-top">
      <!-- Title or inline search -->
      <span v-if="!isSearchOpen" class="notes-title">Notes</span>
      <div v-else class="search-inline-wrapper">
        <svg class="search-inline-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          ref="searchInputRef"
          v-model="filterStore.searchQuery"
          class="search-inline-input"
          placeholder="Search notes..."
          @keydown.esc="toggleSearch"
        />
        <button v-if="filterStore.searchQuery" class="search-clear-btn" @click="filterStore.searchQuery = ''">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <span v-if="filterStore.searchQuery" class="search-count-inline">{{ filteredNotes.length }}</span>
      </div>

      <!-- Filter chips inline -->
      <div class="filter-chips" @click.self="cancelPendingDelete">
        <div v-for="cat in categoriesStore.categories" :key="cat.id" class="fchip-wrapper">
          <button
            class="fchip fchip-colored"
            :class="{ 'fchip-active': filterStore.category === cat.id }"
            :style="{ '--chip-color': cat.color }"
            @click="filterStore.category = filterStore.category === cat.id ? null : cat.id; cancelPendingDelete()"
          >
            <span class="fchip-dot"></span>
            {{ cat.name }}
          </button>
          <button
            class="fchip-del"
            :class="{ 'fchip-del-confirm': pendingDelete === cat.id }"
            @click.stop="deleteCategory(cat.id)"
            :title="pendingDelete === cat.id ? 'Confirm delete' : 'Delete category'"
          >{{ pendingDelete === cat.id ? '?' : '×' }}</button>
        </div>

        <button class="fchip fchip-add" @click="openAddCategory" title="Add category">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div class="header-btns">
        <!-- Search toggle -->
        <button @click="toggleSearch" class="theme-btn" :class="{ active: isSearchOpen }" title="Search notes">
          <svg v-if="!isSearchOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Dark mode toggle -->
        <button
          @click="themeStore.toggle()"
          class="theme-btn"
          :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg v-if="isDarkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Add category form — shown below header-top only when needed -->
    <div v-if="isAddingCategory" class="add-cat-form">
      <input
        ref="newCatNameRef"
        v-model="newCatName"
        class="add-cat-input"
        placeholder="Category name"
        @keydown.enter="confirmAddCategory"
        @keydown.esc="cancelAddCategory"
      />
      <div class="add-cat-swatches">
        <button
          v-for="color in categoriesStore.CATEGORY_COLORS"
          :key="color"
          class="swatch"
          :class="{ 'swatch-active': newCatColor === color }"
          :style="{ background: color }"
          @click="newCatColor = color"
        ></button>
      </div>
      <div class="add-cat-actions">
        <button class="btn-add-confirm" @click="confirmAddCategory" :disabled="!newCatName.trim()">Add</button>
        <button class="btn-add-cancel" @click="cancelAddCategory">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ===== TITLE ===== */
.notes-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  flex-shrink: 0;
}

.dark .notes-title {
  color: #eaeaea;
}

/* ===== HEADER ===== */
.notes-header {
  display: flex;
  flex-direction: column;
  padding: 0.4rem 1rem;
  background-color: #eef1f6;
  border-bottom: 1px solid #c2cad6;
  flex-shrink: 0;
  gap: 0.4rem;
}

.dark .notes-header {
  background-color: #0f3460;
  border-bottom-color: #16213e;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
}

.header-btns {
  display: flex;
  gap: 0.1rem;
  flex-shrink: 0;
  margin-left: auto;
}

/* ===== FILTER CHIPS (inline in header-top) ===== */
.filter-chips {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  flex-wrap: nowrap;
}

.filter-chips::-webkit-scrollbar {
  display: none;
}

.fchip-wrapper {
  display: flex;
  align-items: center;
}

.fchip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.22rem 0.6rem;
  border-radius: 20px;
  border: 1px solid #c2cad6;
  background: #dde3ec;
  color: #555;
  font-size: 0.76rem;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s, color 0.15s;
  line-height: 1.4;
}

.fchip:hover {
  background: #d5dbe6;
}

.fchip:focus-visible {
  outline: 2px solid #4caf50;
  outline-offset: 2px;
}

.dark .fchip {
  background: #16213e;
  border-color: #1a2a4a;
  color: #aaa;
}

.dark .fchip:hover {
  background: #192847;
}

.fchip-active {
  background: #4caf50;
  border-color: #4caf50;
  color: white;
}

.fchip-active:hover {
  background: #43a047;
}

.dark .fchip-active,
.dark .fchip-active:hover {
  background: #4caf50;
  border-color: #4caf50;
  color: white;
}

.fchip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--chip-color);
  flex-shrink: 0;
}

.fchip-colored.fchip-active {
  background: var(--chip-color);
  border-color: var(--chip-color);
  color: white;
}

.fchip-colored.fchip-active .fchip-dot {
  background: rgba(255, 255, 255, 0.7);
}

.fchip-del {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  border: none;
  background: #b0b8c4;
  color: white;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: -5px;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.15s, background-color 0.15s;
  line-height: 1;
}

.fchip-wrapper:hover .fchip-del {
  opacity: 1;
}

.fchip-del:hover {
  background: #d32f2f;
}

.fchip-del-confirm {
  opacity: 1;
  background: #d32f2f;
  color: white;
}

.fchip-del-confirm:hover {
  background: #b71c1c;
}

@media (hover: none) {
  .fchip-del {
    opacity: 0.7;
  }
}

.fchip-add {
  padding: 0.22rem 0.45rem;
  min-width: 28px;
  justify-content: center;
}

/* THEME BTN */

.theme-btn {
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: 50%;
  color: #555;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.theme-btn:hover {
  background-color: #dde3eb;
}

.theme-btn:focus-visible {
  outline: 2px solid #4caf50;
  outline-offset: 2px;
}

.theme-btn.active {
  background-color: #d6edd8;
  color: #4caf50;
}

.dark .theme-btn {
  color: #eaeaea;
}

.dark .theme-btn:hover {
  background-color: #16213e;
}

.dark .theme-btn.active {
  background-color: rgba(76, 175, 80, 0.15);
  color: #4caf50;
}

/**/
/* ===== INLINE SEARCH ===== */
.search-inline-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: #dde3ec;
  border: 1px solid #c2cad6;
  border-radius: 20px;
  padding: 0 0.65rem;
  height: 36px;
  min-width: 0;
}

/* when chips are also inline, give search a compact fixed width */
.header-top:has(.filter-chips) .search-inline-wrapper {
  flex: 0 0 auto;
  width: 140px;
}

.dark .search-inline-wrapper {
  background: #16213e;
  border-color: #1a2a4a;
}

.search-inline-wrapper:focus-within {
  border-color: #4caf50;
}

.search-inline-icon {
  color: #888;
  flex-shrink: 0;
}

.search-inline-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-family: inherit;
  color: #333;
  min-width: 0;
}

.search-inline-input:focus {
  outline: none;
}

.dark .search-inline-input {
  color: #eaeaea;
}

.dark .search-inline-input::placeholder {
  color: #555;
}

.search-clear-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  padding: 0.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 0.15s;
}

.search-clear-btn:hover {
  background-color: #c8d0da;
}

.dark .search-clear-btn:hover {
  background-color: #0f3460;
}

.search-count-inline {
  font-size: 0.72rem;
  color: #888;
  flex-shrink: 0;
  background: #c8d0da;
  border-radius: 10px;
  padding: 0.05rem 0.4rem;
  line-height: 1.5;
}

.dark .search-count-inline {
  background: #0f3460;
  color: #aaa;
}

/* ===== ADD CATEGORY FORM ===== */
.add-cat-form {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.5rem;
  background: #e4eaf3;
  border-radius: 8px;
}

.dark .add-cat-form {
  background: #16213e;
}

.add-cat-input {
  padding: 0.35rem 0.65rem;
  border: 1px solid #c2cad6;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  background: #ffffff;
  color: #333;
  box-sizing: border-box;
}

.add-cat-input:focus {
  outline: none;
  border-color: #4caf50;
}

.dark .add-cat-input {
  background: #0f1f3a;
  border-color: #1a2a4a;
  color: #eaeaea;
}

.dark .add-cat-input::placeholder {
  color: #555;
}

.add-cat-swatches {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: transform 0.1s, border-color 0.1s;
  padding: 0;
  flex-shrink: 0;
}

.swatch:hover {
  transform: scale(1.15);
}

.swatch-active {
  border-color: #333;
  transform: scale(1.1);
}

.dark .swatch-active {
  border-color: #fff;
}

.add-cat-actions {
  display: flex;
  gap: 0.4rem;
}

.btn-add-confirm {
  padding: 0.25rem 0.8rem;
  border-radius: 6px;
  border: none;
  background: #4caf50;
  color: white;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-add-confirm:hover:not(:disabled) {
  background: #43a047;
}

.btn-add-confirm:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.btn-add-cancel {
  padding: 0.25rem 0.8rem;
  border-radius: 6px;
  border: 1px solid #c2cad6;
  background: none;
  color: #555;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-add-cancel:hover {
  background: #dde3ec;
}

.dark .btn-add-cancel {
  border-color: #1a2a4a;
  color: #aaa;
}

.dark .btn-add-cancel:hover {
  background: #1a2a4a;
}

/* ===== DESKTOP (≥1024px) ===== */
@media (min-width: 1024px) {
  .notes-header {
    padding: 0.4rem calc(50% - 380px);
  }
}

/* ===== TABLET (768px–1023px) ===== */
@media (min-width: 768px) and (max-width: 1023px) {
  .notes-header {
    padding: 0.4rem 2rem;
  }
}

/* ===== LANDSCAPE MOBILE (altezza ridotta) ===== */
@media (max-height: 480px) and (orientation: landscape) {
  .notes-header {
    padding-top: 0.15rem;
    padding-bottom: 0.15rem;
    gap: 0.15rem;
  }

  .header-top {
    min-height: 36px;
  }
}
</style>