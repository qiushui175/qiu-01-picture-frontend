<template>
  <div id="url-picture-upload" class="mb-8">
    <!-- 图片预览容器 - 仅在有图片时显示 -->
    <div v-if="picture?.url" class="flex justify-center mb-6">
      <div class="picture-container relative overflow-hidden rounded-lg shadow-lg transition-all duration-300">
        <transition name="image-fade-in">
          <img 
            :src="picture.url" 
            alt="图片预览" 
            class="picture-preview w-auto max-w-full max-h-[400px]"
          />
        </transition>
      </div>
    </div>
    
    <!-- 输入框组 -->
    <div class="w-full max-w-2xl">
      <a-input-group compact>
        <a-input 
          v-model:value="pictureUrl" 
          placeholder="请输入图片地址" 
          class="rounded-l-lg"
          style="width: calc(100% - 120px);"
        />
        <a-button 
          type="primary" 
          class="rounded-r-lg"
          style="width: 120px;" 
          :loading="loading" 
          @click="handleUpload"
        >
          {{'获取图片'}}
        </a-button>
      </a-input-group>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost } from '@/api/pictureController'

// 创建传递值的对象
interface Props {
  picture?: API.PictureVO
  onSuccess?: (picture: API.PictureVO) => void
  spaceId?: string | number
}
const props = defineProps<Props>()
const loading = ref<boolean>(false)
const pictureUrl = ref<string>('')

// 上传处理
const handleUpload = async () => {
  if (!pictureUrl.value) {
    message.error('请填写图片地址')
    return
  }

  loading.value = true
  const params: API.PictureUploadRequest = { fileUrl: pictureUrl.value, spaceId: props.spaceId }
  if (props.picture) {
    params.id = props.picture.id
  }

  const { data: resData } = await uploadPictureByUrlUsingPost(params)

  if (resData.code === 0 && resData.data) {
    message.success('上传成功')
    // 将上传成功的图片交给父组件
    props.onSuccess?.(resData.data)
  } else {
    message.error('上传失败，' + resData.message)
  }

  loading.value = false
}
</script>

<style scoped>

.picture-container{
  display: flex;
  justify-content: center;
}

/* 图片样式 */
.picture-preview {
  display: block;
  border-radius: 4px;
  transition: all 0.3s ease;
  max-width: 100%;
  max-height: 380px;
  margin-bottom: 20px;
}

/* 平滑展开动画 */
@keyframes imageFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.image-fade-in-enter-active {
  animation: imageFadeIn 0.5s ease forwards;
}
</style>