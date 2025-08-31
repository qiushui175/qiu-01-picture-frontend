<template>
  <div id="AddPicturePage">
    <!-- 标题 -->
    <h2 style="margin-bottom: 16px">创建图片</h2>

    <a-typography-paragraph v-if="spaceId">
      保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ spaceName }}</a>
    </a-typography-paragraph>
    <a-typography-paragraph v-else>
      保存至空间：<a :href="`/`">公共空间</a>
      <br />注意！上传至公共空间会公开您的图片，如果不想公开，则要在<a :href="`/my_space`">私人空间</a
      >上传图片
    </a-typography-paragraph>

    <!-- 上传图片组件 -->
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="本地上传">
        <PictureUpload :picture="picture" :onSuccess="onSuccess" :spaceId="spaceId"></PictureUpload>
      </a-tab-pane>

      <a-tab-pane key="url" tab="URL 上传">
        <UrlPictureUpload
          :picture="picture"
          :onSuccess="onSuccess"
          :spaceId="spaceId"
        ></UrlPictureUpload>
      </a-tab-pane>
    </a-tabs>

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
        <a-button type="primary" html-type="submit" style="width: 100%"> 创建 </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { editPictureUsingPost, listPictureTagCategoryUsingPost } from '@/api/pictureController'
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'
import PictureUpload from '@/components/PictureUpload.vue'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const picture = ref<API.PictureVO>()
const router = useRouter()

const route = useRoute()
const spaceId = computed(() => {
  return route.query?.spaceId
})

const userLoginStore = useLoginUserStore()

onMounted(() => {
  const loginUser = userLoginStore.loginUser
  if (!loginUser.id) {
    message.warn('请先登录!')
    router.push('/user/login')
  }
})

// 上传之后的操作
const onSuccess = (newPicture: API.PictureVO) => {
  // 设置图片
  picture.value = newPicture

  // 回填名称
  pictureForm.name = newPicture.name
}

// 图片表单
const pictureForm = reactive<API.PictureEditRequest>({})

// 补充图片信息

const handleFinish = async (values: any) => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    return
  }

  const { data: resData } = await editPictureUsingPost({
    id: pictureId,
    spaceId: spaceId.value,
    ...values,
  })

  if (resData.code === 0 && resData.data) {
    message.success('图片创建成功')

    // 跳转到图片详情页
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('图片创建失败')
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

const uploadType = ref<'file' | 'url'>('file')

// 空间名称获取
const spaceName = ref<string>('')

watch(
  spaceId, // 监听的目标：spaceId计算属性
  async (newId, oldId) => {
    // 当ID为空时重置名称
    if (!newId) {
      spaceName.value = '默认空间'
      return
    }

    // 避免重复请求（如果ID没变化）
    if (newId === oldId) return

    try {
      // 调用接口获取名称（假设接口返回{ name: '空间名称' }）
      const response = await getSpaceVoByIdUsingGet({ id: newId })
      spaceName.value = response.data.data?.spaceName || '未知空间'
    } catch (error) {
      console.error('获取空间名称失败:', error)
      spaceName.value = '获取失败'
    }
  },
  {
    immediate: true, // 组件初始化时立即执行一次
    deep: true, // 深度监听（如果spaceId是复杂类型）
  },
)
</script>

<style scoped>
#AddPicturePage {
  max-width: 620px;
  margin: 0 auto;
}
</style>
