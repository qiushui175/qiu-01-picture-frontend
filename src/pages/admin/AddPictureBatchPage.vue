<template>
  <div id="AddPictureBatchPage">
    <!-- 标题 -->
    <h2 style="margin-bottom: 16px">批量创建图片</h2>

    <!-- 表单 -->
    <a-form layout="vertical" :model="FormData" @finish="handleFinish">
      <a-form-item name="searchText" label="关键词">
        <a-input v-model:value="FormData.searchText" placeholder="输入关键词" allow-clear>
        </a-input>
      </a-form-item>

      <a-form-item name="count" label="获取图片数量">
        <a-input-number
          v-model:value="FormData.count"
          placeholder="输入获取图片数量"
          :min="1"
          :max="30"
          style="min-width: 160px"
          allow-clear
        >
        </a-input-number>
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          style="width: 100%"
          :loading="loding"
          size="large"
        >
          执行任务
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { editPictureUsingPost, uploadPictureByBatchUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
const picture = ref<API.PictureVO>()
const router = useRouter()
const loding = ref(false)

// 图片表单
const FormData = reactive<API.PictureUploadByBatchRequest>({ count: 1 })

// 执行任务
const handleFinish = async (values: any) => {
  loding.value = true

  if (values.count < 1) {
    values.count = 1
  }
  if (values.searchText === undefined || values.searchText === null || values.searchText === '') {
    message.error('关键词不能为空')
    loding.value = false
    return
  }

  const { data: resData } = await uploadPictureByBatchUsingPost({
    ...values,
  })

  if (resData.code === 0 && resData.data) {
    message.success(`图片创建成功，共 ${resData.data} 张`)

    // 跳转到图片详情页
    router.push({
      path: `/`,
    })
  } else {
    message.error(resData.message || '图片创建失败')
  }

  loding.value = false
}
</script>

<style scoped>
#AddPictureBatchPage {
  max-width: 620px;
  margin: 0 auto;
  font-size: 18px;
}
</style>
