<template>
  <div id="AddSpacePage">
    <!-- 标题 -->
    <h2 style="margin-bottom: 16px">编辑空间</h2>

    <!-- 空间表单 -->
    <a-form layout="vertical" :model="spaceForm" @finish="handleFinish">
      <a-form-item name="name" label="空间名称">
        <a-input v-model:value="spaceForm.spaceName" placeholder="输入名称" allow-clear> </a-input>
      </a-form-item>

      <a-form-item label="空间级别">
        <a-select
          v-model:value="spaceForm.spaceLevel"
          allow-clear
          placeholder="选择空间级别"
          style="min-width: 140px"
          :options="SPACE_LEVEL_OPTIONS"
        ></a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading"
          >保存修改</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { editSpaceUsingPost } from '@/api/spaceController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { SPACE_LEVEL_OPTIONS } from '@/constants/space'
const space = ref<API.SpaceVO>()
const router = useRouter()
const loading = ref(false)

const userLoginStore = useLoginUserStore()

onMounted(() => {
  const loginUser = userLoginStore.loginUser
  if (!loginUser.id) {
    message.warn('请先登录!')
    router.push('/user/login')
  }
})

// 上传之后的操作
const onSuccess = (newSpace: API.SpaceVO) => {
  // 设置空间
  space.value = newSpace

  // 回填名称
  spaceForm.spaceName = newSpace.spaceName
}

// 空间表单
const spaceForm = reactive<API.SpaceUpdateRequest>({ spaceLevel: 0 })

// 补充空间信息

const handleFinish = async (values: any) => {
  loading.value = true

  const { data: resData } = await editSpaceUsingPost({
    ...spaceForm,
  })

  if (resData.code === 0 && resData.data) {
    message.success('空间创建成功')
    // 跳转到空间详情页
    router.push({
      path: `/space/${resData.data}`,
    })
  } else {
    message.error(resData.message || '空间创建失败')
  }

  loading.value = false
}
</script>

<style scoped>
#AddSpacePage {
  max-width: 620px;
  margin: 0 auto;
}
</style>
