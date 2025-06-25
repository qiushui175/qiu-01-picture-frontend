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
        ><a-menu v-model:selectedKeys="current" mode="horizontal" :items="items"
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
const current = ref<string[]>(['mail'])
const items = ref<MenuProps['items']>([
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/关于',
    icon: () => h(AppstoreOutlined),
    label: '关于',
    title: '关于',
  },
])
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
