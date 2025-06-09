import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SalonDetail from '@/views/SalonDetail.vue'
import SubmitShop from '@/views/SubmitShop.vue'
import AdminLogin from '@/views/AdminLogin.vue'
import AdminPanel from '@/views/AdminPanel.vue'
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path:'/salon/:id',
    name: 'SalonDetail',
    component: SalonDetail
  },
  {
    path: '/submit',
    name: 'SalonSubmit',
    component:SubmitShop
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path:'/admin/panel',
    name: 'AdminPanel',
    component: AdminPanel
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
