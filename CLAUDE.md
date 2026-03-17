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
- `src/store/notes.js` — plain JS store (not Pinia) wrapping localStorage under key `notes_chat_notes`. Exposes `getAll()`, `add()`, `update()`, `delete()`, `getById()`.
- `src/store/emoji.js` — static emoji list, no persistence.
- Pinia is installed but unused — all stores are custom plain JS modules.

### Routing
`/` and `/notes` both render `Notes.vue`. No auth guards, no login route. Unknown paths redirect to `/`.

### Component responsibilities
- `Notes.vue` — owns all app state: note list, edit mode, emoji picker visibility, search, dark mode. Handles keyboard shortcuts (Ctrl/Cmd+Enter to send, Esc to cancel edit).
- `Note.vue` — stateless display bubble. Emits `edit-note` and `delete-note` upward.
- `EmojiPicker.vue` — fixed-position bottom sheet. Uses the Visual Viewport API (`window.visualViewport`) to stay above the software keyboard on mobile. Emits `select-emoji` with `{ emoji }`.

### Dark mode
Toggled by adding/removing `.dark` on `<html>`. Initialized from localStorage key `theme` in `src/main.js`. All dark styles use `.dark .selector` within scoped `<style>` blocks — no CSS variables.

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
