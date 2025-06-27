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

      <a-col flex="200px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <a-space align="start">
                <a-avatar :src="loginUserStore.loginUser.userAvatar"></a-avatar>
                <span class="user-name">{{ loginUserStore.loginUser.userName }}</span>
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="doLogout">
                      <LoginOutlined />
                      <span style="padding-left: 10px;">退出登录</span>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { h, ref } from 'vue'
import { HomeOutlined, AppstoreOutlined, LoginOutlined } from '@ant-design/icons-vue'
import { message, type MenuProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController'

const loginUserStore = useLoginUserStore()
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

const doLogout = async () => {

  const { data } = await userLogoutUsingPost()
  if (data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
  }else{
    message.error(data.message || "退出登录失败")
  }
}

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

#global-header .user-name {
  display: block;
  width: 100px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
