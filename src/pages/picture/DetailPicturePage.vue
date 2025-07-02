<template>
  <div id="detail-picture-page">
    <a-row :gutter="[16, 16]">
      <!-- 图片预览 -->
      <a-col :sm="24" :md="16" :lg="14">
        <a-card title="图片预览">
          <a-image :src="picture?.url" style="max-height: 600px; object-fit: contain" />
        </a-card>
      </a-col>

      <!-- 图片信息 -->
      <a-col :sm="24" :md="8" :lg="6">
        <a-card title="图片信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture?.user?.userAvatar" />
                <div>{{ picture?.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>

            <a-descriptions-item label="名称">
              {{ picture?.name ?? '未命名' }}
            </a-descriptions-item>

            <a-descriptions-item label="简介">
              {{ picture?.introduction ?? '暂无简介' }}
            </a-descriptions-item>

            <a-descriptions-item label="分类">
              {{ picture?.category ?? '默认' }}
            </a-descriptions-item>

            <a-descriptions-item label="标签">
              <a-tag v-for="(tag, index) in picture?.tags" :key="index">{{ tag }}</a-tag>
            </a-descriptions-item>

            <a-descriptions-item label="格式">
              {{ picture?.picFormat ?? '-' }}
            </a-descriptions-item>

            <a-descriptions-item label="尺寸">
              {{ picture?.picWidth ?? '-' }} x {{ picture?.picHeight ?? '-' }}
            </a-descriptions-item>

            <a-descriptions-item label="宽高比">
              {{ picture?.picScale ?? '-' }}
            </a-descriptions-item>

            <a-descriptions-item label="大小">
              {{ formattedPictureSize(picture?.picSize) }}
            </a-descriptions-item>
          </a-descriptions>

          <!-- 图片操作 -->
          <a-space wrap>
            <a-button :icon="h(DownloadOutlined)" type="default" @click="handleDownload"
              >免费下载</a-button
            >

            <a-button :icon="h(EditOutlined)" v-if="canEdit" type="default" @click="handleEdit"
              >编辑</a-button
            >
            <a-button :icon="h(DeleteOutlined)" v-if="canEdit" danger @click="handleDelete"
              >删除</a-button
            >
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { deletePictureUsingPost, getPictureVoByIdUsingGet } from '@/api/pictureController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { downloadImage } from '@/utils'
import { DeleteOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, ref, h } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  id: string | number
}
const props = defineProps<Props>()
const picture = ref<API.PictureVO>()

const router = useRouter()
const fetchPictureDetail = async () => {
  try {
    const { data: resData } = await getPictureVoByIdUsingGet({ id: props.id })
    if (resData.code === 0 && resData.data) {
      picture.value = resData.data
    } else {
      message.error('图片信息获取失败')
      router.push({
        path: '/',
      })
    }
  } catch (error) {
    message.error('图片信息获取失败')
    router.push({
      path: '/',
    })
  }
}

onMounted(() => {
  fetchPictureDetail()
})

// 改为计算属性
const formattedPictureSize = (size?: number) => {
  if (!size) return '-'
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + 'MB'
}

const loginUserStore = useLoginUserStore()

// 权限判断
const canEdit = computed(() => {
  const loginUser = loginUserStore.loginUser
  if (!loginUser.id) {
    return false
  }

  const user = picture.value?.user || {}
  return loginUser.id === user.id || loginUser.userRole === 'admin'
})

// 编辑
const handleEdit = () => {
  if (!canEdit.value) {
    message.error('无权限')
  }

  router.push({
    path: '/edit_picture',
    query: { id: props.id },
  })
}

// 删除
const handleDelete = async () => {
  if (!canEdit.value) {
    message.error('无权限')
  }

  const id = picture.value?.id
  if (!id) {
    message.error('图片信息获取失败')
    return
  }

  const { data: resData } = await deletePictureUsingPost({ id })

  if (resData.code === 0) {
    message.success('删除成功')
    router.push({
      path: '/',
    })
  } else {
    message.error('删除失败')
  }
}


// 下载
const handleDownload = () => {
  downloadImage(picture.value?.url, picture.value?.name)
}
</script>

<style scoped>

#detail-picture-page{
  padding: 0 3%;
  margin-bottom: 20px;
}

</style>
