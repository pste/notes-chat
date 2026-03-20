# CHANGES

## 7969a32 — new icon: dark purple brain-balloon, update theme color

Sostituisce il logo verde (chat balloon semplice) con un brain-balloon viola scuro.

**Design dell'icona** (`scripts/icon.svg`): due cerchi bianchi sovrapposti simulano i due emisferi cerebrali — la zona di background viola che si vede tra i cerchi in cima forma naturalmente la "valle" del corpo calloso. Sotto, un rettangolo arrotondato forma il corpo del balloon; in basso-sinistra una coda triangolare identifica la forma come fumetto chat. All'interno: tre righe viola di larghezza variabile (stile messaggi chat). Sfondo: quadrato viola scuro `#581C87` con angoli arrotondati.

**Colori aggiornati**: `theme_color` e `background_color` nel manifest (`vite.config.js`) e `theme-color` nel meta tag di `index.html` aggiornati da `#4caf50` (verde) a `#581C87` (viola scuro).

## 08c8f17 — refactor header: inline filter chips, fix scoped CSS inheritance

**Filter chips inline**: i filter chips sono stati spostati dentro `header-top` come terzo elemento flex, eliminando la riga separata. I chips scorrono orizzontalmente (`overflow-x: auto`, scrollbar nascosta) quando le categorie sono molte. L'header rimane sempre a singola riga (44px).

**Search + filter coesistono**: quando entrambi sono aperti, la search si restringe a 140px fissi tramite `:has(.filter-chips)`, lasciando spazio ai chips. Quando solo la search è aperta, torna `flex: 1`.

**Add-category form**: compare come seconda riga dentro `.notes-header` solo quando si sta effettivamente aggiungendo una categoria — non più come parte del panel sempre visibile.

**CSS scoped fix**: le classi `.notes-title`, `.notes-header`, `.header-top` e relative media query responsive (desktop/tablet/landscape) sono state spostate in `Header.vue`. In `Notes.vue` erano irraggiungibili perché il CSS scoped non penetra nei componenti figlio. Rimossi i CSS duplicati/morti da `Notes.vue`.

**CLAUDE.md**: aggiornata la sezione Architecture con la struttura attuale (Pinia + composable `useLocalStorage`, store `filter.js` e `theme.js`, ruolo di `Header.vue`).

## e16108f — fix PWA installability: meta tags, icon purposes, remove conflicting public files

**Root `index.html`**: aggiornato con tutti i meta tag necessari — `theme-color: #4caf50`, meta iOS (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`, `apple-mobile-web-app-title`), `apple-touch-icon`. Il viewport ora include `maximum-scale=1.0, user-scalable=no`. Il titolo è allineato a "Notes Chat".

**`vite.config.js`**: `theme_color` e `background_color` aggiornati a `#4caf50`. Gli icon entries ora hanno purpose separati: 4 entry totali (`any` + `maskable` per 192px e 512px) — Chrome richiede almeno un'entry con `purpose: 'any'`; il valore combinato `'any maskable'` non era riconosciuto correttamente.

**File conflittuali rimossi**: `public/index.html` e `public/manifest.json` eliminati — venivano copiati nella cartella `dist/` sovrascrivendo i file generati da `vite-plugin-pwa`. Il plugin genera autonomamente `manifest.webmanifest` e inietta il link nel `dist/index.html`.

## 4d3ee04 — fix input bar, emoji in edit mode, keyboard nav, landscape layout

**Input bar (mobile)**: `min-height`/`max-height` sostituiti con `height: 48px` fisso e `overflow-y: hidden` — la barra di scrittura appare sempre come linea singola senza scrollbar.

**Emoji in edit mode**: l'emoji picker ora inserisce nel textarea della nota in editing (non nella barra principale). `Note.vue` espone `insertEmoji(emoji)` via `defineExpose`. `Notes.vue` mantiene un dizionario `noteRefs` (ref per component) e reindirizza l'inserimento quando `editingNoteId` è attivo.

**Keyboard navigation**: aggiunto `focus-visible` con `outline: 2px solid` su tutti i controlli interattivi — `.theme-btn`, `.fchip`, `.emoji-btn`, `.send-btn` (verde `#4caf50`), `.edit-btn` (blu `#1976d2`), `.delete-btn` (rosso `#d32f2f`). Visibile solo con navigazione da tastiera (non su click/touch).

**Landscape mobile**: nuova media query `@media (max-height: 480px) and (orientation: landscape)` — riduce padding di header e input area, abbassa `min-height` dell'header a 36px per recuperare spazio verticale sul telefono in orizzontale.

**Design context**: aggiunto `## Design Context` a `CLAUDE.md` e creato `.impeccable.md` con profilo utenti, personalità del brand, riferimenti estetici e 5 principi di design (mobile-first, chat-native, calore, scrivi subito, intimità).

## d61c0c8 — move search and category filter into header, remove CategoryBar

Consolidates all controls into the header to save vertical space.

**Search**: clicking the search icon now replaces the title inline (same row) with a compact pill-shaped input. No second row is added. Result count appears as a small badge inside the pill. Pressing Esc or the × button closes it.

**Category filter**: a new funnel icon button in the header toggles a collapsible panel that expands below the header-top row. The panel contains "All" + category chips (with inline delete buttons) + a "+" button that opens a compact add-category form (name input + color swatches). The filter button shows a green dot when a filter is active. Clicking outside closes the panel.

**CategoryBar component**: no longer used (file kept, import removed from Notes.vue). All category management (add, delete, filter) is now handled inside the header panel.

## 7bc7d59 — inline editing: edit notes in place instead of input area

Clicking the edit button now transforms the note bubble itself into an editable form, instead of sending the content to the bottom input area.

**Modified files:**
- `src/components/Note.vue` — component is now slightly stateful during edit mode. New props: `isEditing` (bool), `allCategories` (array). When `isEditing` is true shows: a `<textarea>` pre-filled with the note content (auto-focused, cursor at end), a category chip selector, and Save/Cancel buttons. Emits `save-note` with `{ id, content, categoryIds }` and `cancel-edit`. Ctrl/Cmd+Enter saves, Esc cancels. The note bubble gets a green ring (`box-shadow: 0 0 0 2px #4caf50`) while editing.
- `src/views/Notes.vue` — removed edit state from `writingNote`. Added `editingNoteId` ref. `editNote(id)` now just sets `editingNoteId`. Added `handleSaveNote` and `handleCancelEdit`. Removed edit-banner from the input area and its CSS.

## 80955c2 — support multiple categories per note

Each note can now have multiple categories assigned simultaneously.

**Modified files:**
- `src/store/notes.js` — `categoryId` (single) replaced by `categoryIds` (array). `add()` and `update()` now accept `categoryIds = []`. `getAllNotes()` automatically migrates old notes with `categoryId` to the new format on read.
- `src/views/Notes.vue` — `writingNote` uses `categoryIds: []` instead of `categoryId`. `toggleNoteCategory` adds/removes category IDs from the array. `getCategoriesForNote()` returns an array of category objects. Filter logic updated to use `categoryIds.includes()`.
- `src/components/Note.vue` — `category` prop replaced by `categories` (array). Shows one badge per assigned category. Border color uses the first category's color.

## a5c351a — add category labels with filter bar and note badge

Added a full category/label system for notes.

**New files:**
- `src/store/categories.js` — plain JS store persisting categories in localStorage (`notes_chat_categories`). Exports `categoriesStore` (add, delete, getAll, getById) and `CATEGORY_COLORS` palette.
- `src/components/CategoryBar.vue` — horizontal scrollable chip bar shown below the header. Displays "All" + one chip per category. Clicking a chip filters the notes list. Each chip has a delete button (visible on hover / always on touch). A "+" button opens an inline form (name input + 12 color swatches) to create a new category.

**Modified files:**
- `src/store/notes.js` — `add()` and `update()` now accept an optional `categoryId` parameter; notes are stored with a `categoryId` field.
- `src/components/Note.vue` — accepts a `category` prop (`{ id, name, color }` or null). Notes with a category get a colored left border stripe and a small badge (dot + uppercase name) above the text. Uses CSS custom property `--cat-color` for the dynamic color.
- `src/views/Notes.vue` — imports `categoriesStore` and `CategoryBar`. Adds `categories`, `activeFilter` refs and related logic (`loadCategories`, `addCategory`, `deleteCategory`, `toggleNoteCategory`, `getCategoryForNote`). The `filteredNotes` computed also filters by `activeFilter`. The input area shows a compact chip row above the textarea to assign a category to the note being written.
