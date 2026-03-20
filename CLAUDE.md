# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common commands
```
# Run the dev server (already running on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Preview the built app locally
npm run preview
```
The dev server is always running on http://localhost:8080. There's no need to launch it unless it's stopped.

## Architecture

**PWA chat-style notes app** — no login, no backend. All state is in localStorage. Built with Vue 3 + Vite + vite-plugin-pwa.

### Data flow
All stores use **Pinia** (composition API) with a custom `useLocalStorage` composable (`src/composables/localStorage.js`) for automatic 2-way localStorage sync with multi-tab support.

- `src/store/notes.js` — note CRUD, localStorage key `notes_chat_notes`. Exposes `getAll()`, `add()`, `update()`, `delete()`, `getById()`. `getAll()` migrates legacy `categoryId` → `categoryIds[]` on read.
- `src/store/categories.js` — category CRUD, localStorage key `notes_chat_categories`. Exports `CATEGORY_COLORS` palette (12 colors).
- `src/store/filter.js` — non-persistent filter/search state: `category`, `searchQuery`, `isFilterOpen`.
- `src/store/theme.js` — dark mode, localStorage key `notes_chat_theme`. Exposes `toggle()`. Applies `.dark` class to `<html>` on init and on change.
- `src/store/emoji.js` — static emoji list, no persistence.
- `src/composables/localStorage.js` — `useLocalStorage(key, default)` returns a ref that auto-persists and syncs across tabs via `storage` events.

### Routing
`/` and `/notes` both render `Notes.vue`. No auth guards, no login route. Unknown paths redirect to `/`.

### Component responsibilities
- `Notes.vue` — owns note list, edit mode, emoji picker visibility. Handles keyboard shortcuts (Ctrl/Cmd+Enter to send, Esc to cancel edit). Reads `filterStore` for filtered note list.
- `Header.vue` — search (inline pill replacing the title), filter chips (inline in the header row, horizontally scrollable), dark mode toggle. Manages add-category form. Uses `filterStore`, `categoriesStore`, `themeStore`.
- `Note.vue` — stateless display bubble. Switches to inline edit mode via `isEditing` prop. Emits `edit-note`, `delete-note`, `save-note`, `cancel-edit`. Exposes `insertEmoji(emoji)`.
- `EmojiPicker.vue` — fixed-position bottom sheet. Uses the Visual Viewport API (`window.visualViewport`) to stay above the software keyboard on mobile. Emits `select-emoji` with `{ emoji }`.

### Dark mode
Managed by `src/store/theme.js`. Toggled by adding/removing `.dark` on `<html>`. All dark styles use `.dark .selector` within scoped `<style>` blocks — no CSS variables.

### PWA
Configured in `vite.config.js` via `vite-plugin-pwa` with `registerType: 'autoUpdate'`. Manifest and icons are in `public/`.

## CSS conventions
- No inline styles — always use classes.
- Prefer `src/style.css` for global/shared rules; use `<style scoped>` for component-specific styles.
- Light theme palette: app bg `#d4dce8`, surfaces (header/input) `#eef1f6`, borders `#c2cad6`, note bubbles `#ffffff`.
- Dark theme palette: app bg `#1a1a2e`, header/input `#0f3460`, surfaces `#16213e`.
- Responsive breakpoints: mobile `≤767px`, tablet `768–1023px`, desktop `≥1024px`. On desktop the content is centered via `padding: calc(50% - 380px)` on header, container, and input area.

## Component structure
Every Vue SFC must follow this order: `<script setup>` → `<template>` → `<style scoped>`.

## Commit rule
Every commit must start with `[claude]` followed by a short English summary.
After each commit, update `CHANGES.md` with the commit id, the commit comment as subtitle, and a description of the changes.

## Design Context

### Users
Uso intimo: il proprietario + poche persone vicine (famiglia, amici stretti). Contesto mobile, on-the-go — sessioni brevi (<30s), nessun onboarding. Gli utenti conoscono già l'app.

### Brand Personality
**Giocoso, caldo, informale.** Come una chat con persone care, non uno strumento di produttività. L'emoji picker è parte del carattere dell'app, non un extra.

### Aesthetic Direction
- Riferimento: Telegram / WhatsApp — bolle, feedback immediato, UI familiare
- Anti-riferimento: Notion, Linear, dashboard enterprise — niente freddo o strutturato
- Accent `#4caf50` verde — usarlo con decisione su azioni primarie e focus states

### Design Principles
1. **Mobile first, thumb first** — target minimi 44px, tutto raggiungibile col pollice. L'input è il cuore.
2. **Chat-native** — bolle, timestamp discreti, feedback immediato. Se sembra strano in una chat app, ripensarlo.
3. **Calore prima di perfezione** — bordi morbidi, ombre leggere, colori caldi. Un dettaglio giocoso vale più di un'animazione elaborata.
4. **Scrivi subito** — la barra d'input sempre visibile, sempre pronta. Zero tap extra per iniziare a scrivere.
5. **Intimità, non scalabilità** — pensato per 2-5 persone. Profondità di cura nei dettagli esistenti, non ampiezza di funzionalità.
