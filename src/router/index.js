import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../store/auth'
import Notes from '../views/Notes.vue'
import Login from '../views/Login.vue'

const routes = [
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  },
  {
    path: '/',
    redirect: (to) => {
      return auth.isAuthenticated() ? '/notes' : '/login'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { public: true }
  },
  {
    path: '/notes',
    name: 'notes',
    component: Notes,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  if (to.meta.public) {
    next()
  }
  else if (auth.isAuthenticated()) {
    next()
  } else {
    next('/login')
  }
})

export default router