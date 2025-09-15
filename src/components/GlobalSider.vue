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
import { computed, h, onMounted, ref, watchEffect } from 'vue'
import { UserOutlined, PictureOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { listMySpaceUserVoByPageUsingPost } from '@/api/spaceUserController'
import { message } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()
const fixItem = [
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

  {
    key: '/add_space?type=1',
    label: '创建团队',
    title: '创建团队',
    icon: () => h(TeamOutlined),
  },
]

const teamSpaceList = ref<API.SpaceUserVO[]>([])
const item = computed(()=>{
  if(teamSpaceList.value.length < 1){
    return fixItem
  }

  // 如果有团队空间要展示团队空间
  const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
    const space = spaceUser.spaceVO
    return {
      key: '/space/' + spaceUser.spaceId,
      label: space?.spaceName,
    }
  })
  const teamSpaceMenuGroup = {
    type: 'group',
    label: '我的团队',
    key: 'teamSpace',
    children: teamSpaceSubMenus,
  }
  return [...fixItem, teamSpaceMenuGroup]
})

const router = useRouter()
// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}
// 当前所在的页面
const current = ref<string[]>([])
router.afterEach((to, from) => {
  // 高亮菜单
  // console.log(to)
  if (to.fullPath.endsWith('?private=1')) {
    current.value = ['/my_space']
  } else {
    current.value = [to.path]
  }
})

// 组件挂载时初始化高亮状态
onMounted(() => {
  if (router.currentRoute.value.path.startsWith('/space/')) {
    current.value = ['/my_space']
  } else {
    current.value = [router.currentRoute.value.path]
  }
})


// 加载团队空间列表
const fetchTeamSpaceList = async () => {
  const res = await listMySpaceUserVoByPageUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data.records
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}

/**
 * 监听变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  // 登录才加载
  if (loginUserStore.loginUser.id) {
    fetchTeamSpaceList()
  }
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
