<template>
  <div>
    <a-modal
      v-model:open="open"
      :title="props.title"
      :footer="false"
      @cancel="closeModal"
      style="min-width: 400px; max-width: 1000px"
      :body-style="{ padding: '20px', overflow: 'visible' }"
      :width="null"
    >
      <div class="image-cropper">
        <vue-cropper
          ref="cropperRef"
          :outputSize="0.9"
          :img="imageUrl"
          :autoCrop="true"
          :fixedBox="false"
          :centerBox="true"
          :canMoveBox="true"
          :info="true"
          :infoTrue="true"
          :outputType="picture?.picFormat ?? 'png'"
          :full="true"
          :maxImgSize="6000"
        />
        <div style="margin-bottom: 16px" />
        <!-- 图片操作 -->
        <div class="image-cropper-actions">
          <a-space>
            <a-button @click="rotateLeft">向左旋转</a-button>
            <a-button @click="rotateRight">向右旋转</a-button>
            <a-button @click="changeScale(1)">放大</a-button>
            <a-button @click="changeScale(-1)">缩小</a-button>
            <a-button type="primary" :loading="loading" @click="handleConfirm">确认</a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { uploadPictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

interface Props {
  title?: string
  imageUrl?: string
  onSuccess?: (newPicture: API.PictureVO) => void
  spaceId?: string
  picture?: API.PictureVO
}

const props = withDefaults(defineProps<Props>(), {
  title: '编辑图片',
})

const open = ref<boolean>(false)

const openModal = () => {
  open.value = true
}

const closeModal = () => {
  open.value = false
}

// 暴露函数给父组件
defineExpose({
  openModal,
})

// 编辑器组件的引用
const cropperRef = ref()

// 向左旋转
const rotateLeft = () => {
  cropperRef.value.rotateLeft()
}

// 向右旋转
const rotateRight = () => {
  cropperRef.value.rotateRight()
}

// 缩放
const changeScale = (num: number) => {
  cropperRef.value.changeScale(num)
}

// 裁切并上传
const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    const end = props.picture?.picFormat ?? 'png'
    const fileName = (props.picture?.name || 'image') + "." + end.toLowerCase()
    const file = new File([blob], fileName, { type: blob.type })

    // 上传图片
    handleUpload({ file })
  })
}

// 上传处理
const loading = ref(false)
const handleUpload = async ({ file }: any) => {
  loading.value = true
  const params: API.PictureUploadRequest = { spaceId: props.spaceId, id: props.picture?.id }

  // console.log(params)

  const { data: resData } = await uploadPictureUsingPost(params, {}, file)

  if (resData.code === 0 && resData.data) {
    message.success('上传成功')
    // 将上传成功的图片交给父组件
    props.onSuccess?.(resData.data)
    closeModal()
  } else {
    message.error('上传失败，' + resData.message)
  }

  loading.value = false
}
</script>

<style scoped>
.image-cropper {
  text-align: center;
}

.image-cropper .vue-cropper {
  min-height: 400px;
}
</style>
