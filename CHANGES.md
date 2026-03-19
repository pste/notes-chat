# CHANGES

## a5c351a — add category labels with filter bar and note badge

Added a full category/label system for notes.

**New files:**
- `src/store/categories.js` — plain JS store persisting categories in localStorage (`notes_chat_categories`). Exports `categoriesStore` (add, delete, getAll, getById) and `CATEGORY_COLORS` palette.
- `src/components/CategoryBar.vue` — horizontal scrollable chip bar shown below the header. Displays "All" + one chip per category. Clicking a chip filters the notes list. Each chip has a delete button (visible on hover / always on touch). A "+" button opens an inline form (name input + 12 color swatches) to create a new category.

**Modified files:**
- `src/store/notes.js` — `add()` and `update()` now accept an optional `categoryId` parameter; notes are stored with a `categoryId` field.
- `src/components/Note.vue` — accepts a `category` prop (`{ id, name, color }` or null). Notes with a category get a colored left border stripe and a small badge (dot + uppercase name) above the text. Uses CSS custom property `--cat-color` for the dynamic color.
- `src/views/Notes.vue` — imports `categoriesStore` and `CategoryBar`. Adds `categories`, `activeFilter` refs and related logic (`loadCategories`, `addCategory`, `deleteCategory`, `toggleNoteCategory`, `getCategoryForNote`). The `filteredNotes` computed also filters by `activeFilter`. The input area shows a compact chip row above the textarea to assign a category to the note being written.
