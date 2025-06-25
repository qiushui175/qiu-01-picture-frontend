<template>
  <div id="global-header">
    <a-row :wrap="false">
      <a-col flex="200px">
        <router-link to="/">
          <div class="title-bar">
            <img src="/asset/icon.jpg" alt="logo" />
            <div class="title">秋水云图库</div>
          </div>
        </router-link>
      </a-col>

      <a-col flex="auto"
        ><a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
      /></a-col>

      <a-col flex="120px">
        <div class="user-login-status">
          <a-button type="primary" href="/user/login">登录</a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { h, ref } from 'vue'
import { HomeOutlined, AppstoreOutlined, SettingOutlined } from '@ant-design/icons-vue'
import { type MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { healthUsingGet } from '@/api/api/mainController'
const items = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/about',
    icon: () => h(AppstoreOutlined),
    label: '关于',
    title: '关于',
  },
])

const router = useRouter()
// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 当前所在的页面
const current = ref<string[]>([])
router.afterEach((to, from, next) => {
  // 高亮菜单
  current.value = [to.path]
})

healthUsingGet().then((res) => {
  console.log(res)
})

</script>

<style scoped>
#global-header .title-bar {
  display: flex;
  align-items: center;
}

#global-header .title-bar img {
  width: 48px;
}

#global-header .title-bar .title {
  margin-left: 10px;
  font-size: 20px;
  color: black;
}
</style>
