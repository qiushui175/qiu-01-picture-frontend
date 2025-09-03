<template>
  <div class="picture-upload">
    <a-upload
      list-type="picture-card"
      class="avatar-uploader"
      :show-upload-list="false"
      :custom-request="handleUpload"
      :before-upload="beforeUpload"
    >
      <img v-if="picture?.url" :src="picture?.url" alt="avatar" />
      <div v-else>
        <loading-outlined v-if="loading"></loading-outlined>
        <plus-outlined v-else></plus-outlined>
        <div class="ant-upload-text">点击或拖拽上传</div>
      </div>
    </a-upload>

    <div style="margin-top: 10px; margin-bottom: 20px; display: flex; text-align: center; width: 100%; justify-content: center; gap: 20px;">

      <a-button  v-if="picture?.url" type="primary" ghost :icon="h(EditOutlined)" size="large" @click="doEditPicture"
        >编辑图片</a-button
      >

      <a-button type="primary" :icon="h(ExperimentOutlined)" size="large" @click="doExpandPicture"
          >AI扩图</a-button
        >
    </div>
    
      <ImageCropper
        ref="editPictureModalRef"
        :imageUrl="picture?.rawUrl"
        :onSuccess="onCropSuccess"
        :spaceId="picture?.spaceId"
        :picture="picture"
      ></ImageCropper>


      <PictureOutPainting
          :picture="picture"
          ref="expandPictureModalRef"
          :onSuccess="onExpandSuccess"
        ></PictureOutPainting>
  </div>
</template>
<script lang="ts" setup>
import { ref, h } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController'
import { EditOutlined, ExperimentOutlined } from '@ant-design/icons-vue'
import ImageCropper from '@/components/ImageCropper.vue'
import PictureOutPainting from '@/components/PictureOutPainting.vue'

// 创建传递值的对象
interface Props {
  picture?: API.PictureVO
  onSuccess?: (picture: API.PictureVO) => void
  spaceId: number | string
}
const props = defineProps<Props>()
const loading = ref<boolean>(false)

// 上传处理
const handleUpload = async ({ file }: any) => {
  loading.value = true
  const params : API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
  params.spaceId = props.spaceId

  // console.log(params)

  const { data: resData } = await uploadPictureUsingPost(params, {}, file)

  if (resData.code === 0 && resData.data) {
    message.success('上传成功')
    // 将上传成功的图片交给父组件
    props.onSuccess?.(resData.data)
  } else {
    message.error('上传失败，' + resData.message)
  }

  loading.value = false
}

// 上传前校验
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('请上传 JPG/PNG 格式的图片!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
  }
  return isJpgOrPng && isLt2M
}


// 图片裁剪编辑
const editPictureModalRef = ref()
const doEditPicture = () => {
  // 增加判断，确保组件已加载且方法存在
  if (editPictureModalRef.value && typeof editPictureModalRef.value.openModal === 'function') {
    editPictureModalRef.value.openModal()
  } else {
    console.error('ImageCropper 组件未正确加载或未暴露 openModal 方法')
  }
}

const onCropSuccess = (newPicture: API.PictureVO) => {
  // 设置图片
  props.onSuccess?.(newPicture)
}



// 图片扩展
const expandPictureModalRef = ref()
const doExpandPicture = () => {
  expandPictureModalRef.value?.openModal()
}
const onExpandSuccess = (newPicture: API.PictureVO) => {
  props.onSuccess?.(newPicture)
}

</script>
<style scoped>
.picture-upload :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  min-width: 152px;
  min-height: 152px;
}

.picture-upload img{
  max-width: 100%;
  max-height: 380px;
}

.avatar-uploader > .ant-upload {
  width: 128px;
  height: 128px;
}
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
