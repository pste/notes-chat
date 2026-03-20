import { defineStore } from 'pinia'
import useLocalStorage from '../composables/localStorage'
const THEME_KEY = 'notes_chat_theme'

export const useThemeStore = defineStore('theme', () => {
  // ref
  const theme = useLocalStorage(THEME_KEY, "dark")
  setTheme(theme.value); // initial setup when loaded app

  function setTheme(theme) {
    if (theme === "dark") {
        document.documentElement.classList.add("dark")
        document.documentElement.classList.remove("light")
    }
    else {
        document.documentElement.classList.add("light")
        document.documentElement.classList.remove("dark")
    }
  }

  function toggle() {
    if (theme.value === "dark") {
        theme.value = "light"
    }
    else {
        theme.value = "dark"
    }
    setTheme(theme.value)
  }

  // export store 
  return {
    theme,
    toggle,
  }
})