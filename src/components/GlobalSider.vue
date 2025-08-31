<template>
  <div id="globalSider">
    <a-layout-sider
      width="160"
      v-if="loginUserStore.loginUser.id"
      breakpoint="lg"
    >
      <a-menu
        mode="inline"
        v-model:selected-keys="current"
        :items="item"
        @click="doMenuClick"
      ></a-menu>
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import { h, onMounted, ref } from 'vue'
import { UserOutlined, PictureOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const loginUserStore = useLoginUserStore()
const item = [
  {
    key: '/',
    label: '公共图库',
    title: '公共图库',
    icon: () => h(PictureOutlined),
  },
  {
    key: '/my_space',
    label: '我的空间',
    title: '我的空间',
    icon: () => h(UserOutlined),
  },
]

const router = useRouter()
// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}
// 当前所在的页面
const current = ref<string[]>([])
router.afterEach((to, from) => {
  // 高亮菜单
  current.value = [to.path]
})

// 组件挂载时初始化高亮状态
onMounted(() => {
  current.value = [router.currentRoute.value.path]
})
</script>
<style scoped>
/* #components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  margin: 16px;
} */

#globalSider {
  /* 确保侧边栏有背景色，与文字形成对比 */
  background: #fff;
  padding-top: 16px;
}
</style>
