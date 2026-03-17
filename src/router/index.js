import { createRouter, createWebHistory } from 'vue-router'
import Notes from '../views/Notes.vue'

const routes = [
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  },
  {
    path: '/',
    name: 'home',
    component: Notes,
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

export default router
