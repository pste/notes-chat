<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../store/auth'

const router = useRouter()

// Replace with your actual Google Client ID from Google Cloud Console
const googleClientId = '383182013519-t61iiutljglviidfmigkt1lrtflighoe.apps.googleusercontent.com'

// Global callback for Google Identity Services
window.handleGoogleLogin = (response) => {
  // Decode JWT token to get user info
  const payload = parseJwt(response.credential)
  auth.login(response.credential, {
    name: payload.name,
    email: payload.email,
    picture: payload.picture
  })
  router.push('/notes')
}

// Helper to decode JWT
function parseJwt(token) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64))
}

onMounted(() => {
  // Load Google Identity Services script if not already loaded
  if (!window.google) {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  }
})

onUnmounted(() => {
  delete window.handleGoogleLogin
})
</script>

<template>
  <div class="login">
    <div class="login-content">
      <div class="logo">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <h1>Notes Chat</h1>
      <p>Sign in to start your conversation</p>
      <div id="g_id_onload"
           :data-client_id="googleClientId"
           data-callback="handleGoogleLogin"
           data-auto_prompt="false"></div>
      <div class="g_id_signin" data-type="standard" data-size="medium"></div>
    </div>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dark .login {
  background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
}

.login-content {
  text-align: center;
  background-color: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.5s ease;
}

.dark .login-content {
  background-color: #16213e;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.logo {
  margin-bottom: 1.5rem;
  color: #667eea;
}

.dark .logo {
  color: #667eea;
}

h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #333;
}

.dark h1 {
  color: #eaeaea;
}

p {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.dark p {
  color: #888;
}

:deep(.g_id_signin) {
  margin: 0 auto;
}

:deep(.g_idbtn) {
  border-radius: 8px;
}
</style>