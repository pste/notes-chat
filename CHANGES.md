# Changes

## 7467dc0 - make emoji picker a reusable component

- Create useEmojiPicker composable for shared state management
- EmojiPicker now renders at fixed center position on the screen
- Works from both Notes page and NoteEditor dialog
- Removed inline emoji picker from templates
- Click outside closes the picker

## f6353d0 - improve emoji picker with nicer dialog design

- Add header with "Select Emoji" title
- Better spacing and padding
- Gradient hover effect with subtle scale animation
- Rounded corners and improved shadow
- Scrollbar styling for emoji grid
- Dark mode support for new styles

## 9a4c2ef - refactor dark mode to use .dark class with CSS files

- Replace .dark-theme class with .dark class across all components
- Remove inline CSS styles from JavaScript code
- Move all dark mode styles to CSS files
- Add localStorage persistence for dark mode preference
- Add dark mode styles to Login, Notes, Note, NoteEditor, EmojiPicker components

## 319ceef - [emojipicker] close on click outside + insert emoji in cursor position

## de6eddc - [1st commit] created app
