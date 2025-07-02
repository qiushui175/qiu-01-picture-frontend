import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagePage from '@/pages/admin/UserManagePage.vue'
import HomePage from '@/pages/HomePage.vue'
import AddPicturePage from '@/pages/picture/AddPicturePage.vue'
import EditPicturePage from '@/pages/picture/EditPicturePage.vue'
import PictureManagePage from '@/pages/admin/PictureManagePage.vue'
import DetailPicturePage from '@/pages/picture/DetailPicturePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },

    {
      path: '/picture/:id',
      name: '图片详情',
      component: DetailPicturePage,
      props: true,
    },

    {
      path: '/user/login',
      name: '用户登录',
      component: UserLoginPage,
    },

    {
      path: '/user/register',
      name: '用户注册',
      component: UserRegisterPage,
    },

    {
      path: '/admin/userManage',
      name: '用户管理',
      component: UserManagePage,
    },

    {
      path: '/admin/pictureManage',
      name: '图片管理',
      component: PictureManagePage,
    },

    {
      path: '/add_picture',
      name: '创建图片',
      component: AddPicturePage,
    },

    {
      path: '/edit_picture',
      name: '编辑图片',
      component: EditPicturePage,
    },

    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
