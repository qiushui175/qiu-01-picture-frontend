<template>
  <div id="AddSpacePage">
    <!-- 标题 -->
    <h2 style="margin-bottom: 16px">创建空间（{{ SPACE_TYPE_MAP[spaceType] }}）</h2>

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

      <a-card title="空间级别介绍">
        <a-typography-paragraph>
          * 目前仅提供普通版，如需使用专业版或旗舰版，请联系管理员开通
        </a-typography-paragraph>
        <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
          {{ spaceLevel.text }} 数量 {{ spaceLevel.maxCount }} 张，空间容量 {{ formattedSize(spaceLevel.maxSize) }}
        </a-typography-paragraph>
      </a-card>
      <a-space>
        <div style="display: block;height: 20px;"></div>
      </a-space>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading"
          >创建空间</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { addSpaceUsingPost, listSpaceLevelUsingGet } from '@/api/spaceController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/utils'
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
const spaceForm = reactive<API.SpaceAddRequest>({ spaceLevel: 0 })

// 补充空间信息

const handleFinish = async (values: any) => {
  loading.value = true

  const { data: resData } = await addSpaceUsingPost({
    ...spaceForm,
    spaceType: spaceType.value
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

// 空间类型获取
const spaceLevelList = ref<API.SpaceLevel[]>()
const fetchSpaceLevelList = async () => {
  const { data: resData } = await listSpaceLevelUsingGet()
  if (resData.code === 0 && resData.data) {
    spaceLevelList.value = resData.data
  }else{
    message.error(resData.message || '获取空间类型失败')
  }
}
onMounted(() => {
  fetchSpaceLevelList()
})



const formattedSize = (size?: number) => {
  if (!size) return '-'
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + 'MB'
  return (size / (1024 * 1024 * 1024)).toFixed(2) + 'GB'
}

// 获取需要添加的空间类型，默认添加私有空间
const route = useRoute();
const spaceType = computed(()=>{
  if(route.query?.type){
    return Number(route.query?.type)
  }
  return SPACE_TYPE_ENUM.PRIVATE
})
</script>

<style scoped>
#AddSpacePage {
  max-width: 620px;
  margin: 0 auto;
}
</style>
