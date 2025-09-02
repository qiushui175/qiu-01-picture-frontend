<template>
  <div id="EditPicturePage">
    <!-- 标题 -->
    <h2 style="margin-bottom: 16px">修改图片</h2>
    <!-- 上传图片组件 -->
    <!-- 将上传修改图片该为对图片的编辑操作 -->
    <!-- <PictureUpload
      :picture="picture"
      :onSuccess="onSuccess"
      @click="(e) => onClickPicture(e)"
    ></PictureUpload> -->
    <div class="img-show">
      <img v-if="picture?.url" :src="picture?.url" @click="doEditPicture" />

      <a-button type="primary" ghost :icon="h(EditOutlined)" size="large" @click="doEditPicture"
        >编辑图片</a-button
      >
      <ImageCropper
        ref="editPictureModalRef"
        :imageUrl="picture?.rawUrl"
        :onSuccess="onCropSuccess"
        :spaceId="picture?.spaceId"
        :picture="picture"
      ></ImageCropper>
    </div>

    <!-- 图片表单 -->
    <a-form
      v-if="picture && picture.id"
      layout="vertical"
      :model="pictureForm"
      @finish="handleFinish"
    >
      <a-form-item name="name" label="名称">
        <a-input v-model:value="pictureForm.name" placeholder="输入名称" allow-clear> </a-input>
      </a-form-item>
      <a-form-item name="introduction" label="简介">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="输入简介"
          allow-clear
          :autoSize="{ minRows: 1, maxRows: 5 }"
        >
        </a-textarea>
      </a-form-item>

      <a-form-item name="category" label="分类">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="输入分类"
          allow-clear
          :options="categoryOptions"
        >
        </a-auto-complete>
      </a-form-item>

      <a-form-item name="tags" label="标签">
        <a-select
          v-model:value="pictureForm.tags"
          mode="tags"
          placeholder="输入标签"
          allow-clear
          :options="tagOptions"
        ></a-select>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%"> 修改 </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import {
  editPictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingPost,
} from '@/api/pictureController'
import ImageCropper from '@/components/ImageCropper.vue'
import PictureUpload from '@/components/PictureUpload.vue'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EditOutlined } from '@ant-design/icons-vue'
const picture = ref<API.PictureVO>()

// 上传之后的操作
const onSuccess = (newPicture: API.PictureVO) => {
  // 设置图片
  picture.value = newPicture

  // 回填名称
  pictureForm.name = newPicture.name
}

const onCropSuccess = (newPicture: API.PictureVO) => {
  // 设置图片
  picture.value = newPicture
}

// 图片表单
const pictureForm = reactive<API.PictureEditRequest>({})

// 补充图片信息
const router = useRouter()
const handleFinish = async (values: any) => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    return
  }

  const { data: resData } = await editPictureUsingPost({
    id: pictureId,
    ...values,
  })

  if (resData.code === 0 && resData.data) {
    message.success('图片修改成功')

    // 跳转到图片详情页
    // TODO: 要实现管理员和用户的跳转区分
    router.push({
      path: `/picture/${pictureId}`,
    })
    // router.push({
    //   path: '/'
    // })
  } else {
    message.error('图片修改失败')
  }
}

// 获取标签和分类选项
const categoryOptions = ref<Array<{ value: string; label: string }>>([])
const tagOptions = ref<Array<{ value: string; label: string }>>([])
const listPictureTagCategory = async () => {
  const { data: resData } = await listPictureTagCategoryUsingPost()

  if (resData.code === 0 && resData.data) {
    categoryOptions.value = (resData.data.categoryList ?? []).map((item: string) => ({
      value: item,
      label: item,
    }))
    tagOptions.value = (resData.data.tagList ?? []).map((item: string) => ({
      value: item,
      label: item,
    }))
  } else {
    message.error('标签信息创建失败')
  }
}
onMounted(() => {
  listPictureTagCategory()
})

const route = useRoute()
const getOldPicture = async () => {
  const id = route.query?.id

  if (id) {
    const { data: resData } = await getPictureVoByIdUsingGet({ id })

    if (resData.code === 0 && resData.data) {
      const data = resData.data

      // 填充表单
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    } else {
      message.error('图片信息获取失败')
      router.push({
        path: '/',
      })
    }
  } else {
    router.push({
      path: '/add_picture',
    })
  }
}

onMounted(() => {
  getOldPicture()
})

// 图片裁剪编辑
const editPictureModalRef = ref()
const doEditPicture = () => {
  editPictureModalRef.value?.openModal()
}
</script>

<style scoped>
#EditPicturePage {
  max-width: 620px;
  margin: 0 auto;
}

#EditPicturePage .img-show img {
  max-width: 100%;
  max-height: 380px;
  cursor: pointer;
  margin-bottom: 16px;
}

#EditPicturePage .img-show {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
