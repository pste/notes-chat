const AUTH_KEY = 'notes_chat_auth'

export const auth = {
  login(token, user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token, user }))
  },

  logout() {
    localStorage.removeItem(AUTH_KEY)
  },

  isAuthenticated() {
    const data = localStorage.getItem(AUTH_KEY)
    return data !== null
  },

  getUser() {
    const data = localStorage.getItem(AUTH_KEY)
    if (!data) return null
    try {
      return JSON.parse(data).user
    } catch {
      return null
    }
  },

  getToken() {
    const data = localStorage.getItem(AUTH_KEY)
    if (!data) return null
    try {
      return JSON.parse(data).token
    } catch {
      return null
    }
  }
}