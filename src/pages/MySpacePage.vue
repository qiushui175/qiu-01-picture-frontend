<template>
  <div id="mySpacePage">
    <p>正在跳转，请稍后......</p>
  </div>
</template>

<script setup lang="ts">
import { listSpaceVoByPageUsingPost } from '@/api/spaceController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const checkUserSpace = async () => {
  const loginUser = loginUserStore.loginUser

  if (!loginUser.id) {
    // 未登录状态
    router.replace('/user/login')
    message.warn('请先登录！')
    return
  }

  // 若用户登录则获取已创建空间
  const res = await listSpaceVoByPageUsingPost({
    userId: loginUser.id,
  })

  if (res.data.code === 0) {
    const data = res.data.data
    // console.log(res.data)
    if (data?.records?.length > 0) {
      // 转跳到对应空间
      const space = data?.records[0]
      router.replace(`/space/${space?.id}`)
    } else {
      router.replace('/add_space')
      message.warn('请先创建空间！')
      return
    }
  } else {
    message.error('加载空间失败, ' + res.data.message)
  }
}

onMounted(() => {
  checkUserSpace()
})
</script>
<style scoped></style>
