<template>
  <div class="picture-out-painting">
    <a-modal
      v-model:open="open"
      :title="props.title"
      :footer="false"
      @cancel="closeModal"
      :style="{ minWidth: '400px', maxWidth: '1000px', width: '90%' }"
      :body-style="{ padding: '24px', borderRadius: '8px' }"
      class="custom-modal"
      destroyOnClose
    >
      <div class="modal-content">
        <a-row gutter="24" class="image-comparison-row">
          <a-col span="12" class="image-column">
            <div class="image-container">
              <h4 class="image-title">原始图片</h4>
              <div class="image-wrapper">
                <img
                  :src="picture?.url"
                  :alt="picture?.name || '原始图片'"
                  class="modal-image original-image"
                />
              </div>
            </div>
          </a-col>

          <a-col span="12" class="image-column">
            <div class="image-container">
              <h4 class="image-title">扩图结果</h4>
              <div class="image-wrapper">
                <img
                  v-if="resultImageUrl"
                  :src="resultImageUrl"
                  :alt="picture?.name || '扩图结果'"
                  class="modal-image result-image"
                />
                <div v-else class="placeholder-image">
                  <p v-if="loading && !errorMsg">正在生成，请不要退出....</p>
                  <p v-if="errorMsg">{{ errorMsg }}</p>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>

        <div class="button-container">
          <a-flex justify="center" gap="16">
            <a-button 
              type="primary" 
              ghost 
              @click="createTask" 
              v-if="!ex_success" 
              :loading="loading"
            >
              生成图片
            </a-button>
            <a-button 
              type="primary" 
              v-if="ex_success" 
              @click="handleUpload" 
              :disabled="!ex_success" 
              :loading="loading"
            >
              应用图片
            </a-button>
          </a-flex>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {
  getOutPaintingTaskUsingGet,
  outPaintingCreateTaskUsingPost,
  uploadPictureByUrlUsingPost,
  uploadPictureUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { create } from 'lodash'
import { onMounted, ref, watch } from 'vue'

interface Props {
  title?: string
  onSuccess?: (newPicture: API.PictureVO) => void
  picture?: API.PictureVO
}

const props = withDefaults(defineProps<Props>(), {
  title: 'AI扩图',
})

const open = ref<boolean>(false)

const openModal = () => {
  open.value = true
}
import { Modal } from 'ant-design-vue';
const closeModal = () => {
  open.value = false
  errorMsg.value = undefined
}

// 暴露函数给父组件
defineExpose({
  openModal,
})

// 上传处理
const loading = ref(false)
const handleUpload = async () => {
  if (!resultImageUrl.value) {
    message.error('获取扩图结果失败')
    return
  }

  loading.value = true
  const params: API.PictureUploadRequest = {
    fileUrl: resultImageUrl.value,
    spaceId: props.picture?.spaceId,
    id: props.picture?.id,
  }

  const { data: resData } = await uploadPictureByUrlUsingPost(params)

  if (resData.code === 0 && resData.data) {
    message.success('上传成功')
    // 将上传成功的图片交给父组件
    props.onSuccess?.(resData.data)


    // 设置新值
    resultImageUrl.value = undefined
    taskId.value = undefined
    ex_success.value = false

    // 关闭弹窗
    closeModal()
  } else {
    message.error('上传失败，' + resData.message)
  }

  loading.value = false
}

// 扩图结果
const resultImageUrl = ref<string>()
const taskId = ref<string>() // 任务id
const ex_success = ref(false)

const createTask = async () => {
  loading.value = true

  const params: API.PictureExpansionTaskRequest = {
    pictureId: props.picture?.id,
    parameters: {
      // 扩图参数
      xScale: 2,
      yScale: 2,
    },
  }

  const { data: resData } = await outPaintingCreateTaskUsingPost(params)

  if (resData.code === 0 && resData.data) {
    message.success('创建任务成功, 请耐心等待，不要退出页面！')
    taskId.value = resData.data.output?.taskId

    // 开启轮询
    startPolling()
  } else {
    message.error('创建任务失败，' + resData.message)
  }
}

// 轮询请求
const errorMsg = ref<string | undefined>()
let pollingTimer: any = null
const startPolling = () => {
  if (!taskId.value) {
    return
  }

  try {
    pollingTimer = setInterval(async () => {
      const { data: resData } = await getOutPaintingTaskUsingGet({
        taskId: taskId.value,
      })

      if (resData.code === 0 && resData.data) {
        const taskResult = resData.data.output
        if (taskResult?.taskStatus === 'SUCCEEDED') {
          // 成功
          message.success('扩图任务执行成功')
          resultImageUrl.value = taskResult.outputImageUrl

          ex_success.value = true
          loading.value = false

          // 清理轮询
          clearPolling()
        } else if (taskResult?.taskStatus === 'FAILED') {
          // 失败
          message.error('扩图任务执行失败')
          loading.value = false
          console.log(taskResult)
          errorMsg.value = taskResult.message

          // 清理轮询
          clearPolling()
        }
      } else {
        message.error('任务状态获取失败，' + resData.message)
      }
    }, 3000)
  } catch (error) {
    message.error('任务状态获取失败')
  }
}

const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    taskId.value = undefined
  }
}
</script>

<style scoped>
.custom-modal {
  --antd-modal-content-bg: #fafafa;
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.image-comparison-row {
  width: 100%;
}

.image-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.image-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.image-title {
  margin: 0;
  padding: 0 0 8px 0;
  color: #1f2329;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid #f0f0f0;
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.modal-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.modal-image:hover {
  transform: scale(1.02);
}

.original-image {
  border: 1px solid #e0e0e0;
}

.result-image {
  border: 1px solid #4cae4c;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
  font-size: 14px;
}

.button-container {
  padding: 12px 0 8px;
}

.action-button {
  min-width: 120px;
  padding: 8px 24px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.generate-button:hover {
  background-color: rgba(18, 18, 18, 0.04);
}

.apply-button {
  background-color: #1677ff;
  border-color: #1677ff;
}

.apply-button:hover {
  background-color: #0f62d9;
  border-color: #0f62d9;
}

@media (max-width: 768px) {
  .image-comparison-row {
    flex-direction: column;
  }
  
  .image-column {
    width: 100% !important;
  }
  
  .image-wrapper {
    height: 240px;
  }
}
</style>
