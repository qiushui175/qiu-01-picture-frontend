<template>
  <div id="detail-picture-page">
    <a-row :gutter="[16, 16]">
      <!-- 图片预览 -->
      <a-col :sm="24" :md="16" :lg="14">
        <a-card title="图片预览">
          <div style="display: flex; justify-content: center; width: 100%">
            <a-image :src="picture?.url" style="max-height: 600px; object-fit: contain" />
          </div>
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

            <a-descriptions-item label="主色调">
              <a-space>
                {{ picture?.picColor ?? '-' }}
                <div
                  :style="{
                    width: '16px',
                    height: '16px',
                    backgroundColor: toHexColor(picture?.picColor),
                  }"
                ></div>
              </a-space>
            </a-descriptions-item>
          </a-descriptions>

          <!-- 图片操作 -->

          <!-- 分享图片 -->
          <ShareModal ref="shareModalRef" :link="shareLink"></ShareModal>

          <a-space wrap>
            <a-button
              :icon="h(DownloadOutlined)"
              v-if="canEdit"
              type="primary"
              @click="handleDownload"
              >下载</a-button
            >
            <a-button :icon="h(DownloadOutlined)" v-else type="primary" @click="handleDownload"
              >免费下载</a-button
            >

            <a-button :icon="h(ShareAltOutlined)" ghost type="primary" @click="handleShare"
              >分享</a-button
            >

            <a-button :icon="h(EditOutlined)" v-if="canEdit" type="default" @click="handleEdit"
              >编辑</a-button
            >

            <!-- <a-button :icon="h(LockOutlined)" v-if="canEdit && picture?.reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS" type="default" @click="handleLock(PIC_REVIEW_STATUS_ENUM.REJECT)"
              >锁定</a-button
            >

            <a-button :icon="h(UnlockOutlined)" v-if="canEdit && picture?.reviewStatus === PIC_REVIEW_STATUS_ENUM.REJECT" type="default" @click="handleLock(PIC_REVIEW_STATUS_ENUM.PASS)"

              >解锁</a-button
            >

            <a-button :icon="h(DeleteOutlined)" v-if="canEdit" danger @click="handleDelete"
              >删除</a-button
            > -->

            <a-button
              :icon="h(LockOutlined)"
              v-if="
                canEdit &&
                picture?.reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS &&
                loginUserStore.loginUser.userRole === 'admin'
              "
              type="default"
              @click="confirmLock(PIC_REVIEW_STATUS_ENUM.REJECT)"
              >锁定</a-button
            >

            <a-button
              :icon="h(UnlockOutlined)"
              v-if="
                canEdit &&
                picture?.reviewStatus === PIC_REVIEW_STATUS_ENUM.REJECT &&
                loginUserStore.loginUser.userRole === 'admin'
              "
              type="default"
              @click="confirmLock(PIC_REVIEW_STATUS_ENUM.PASS)"
              >解锁</a-button
            >

            <a-button :icon="h(DeleteOutlined)" v-if="canEdit" danger @click="confirmDelete"
              >删除</a-button
            >
          </a-space>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import {
  deletePictureUsingPost,
  getPictureVoByIdUsingGet,
  pictureReviewUsingPost,
} from '@/api/pictureController'
import ShareModal from '@/components/ShareModal.vue'
import { PIC_REVIEW_STATUS_ENUM } from '@/constants/picture'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { downloadImage } from '@/utils'
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  LockOutlined,
  ShareAltOutlined,
  UnlockOutlined,
} from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
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
      message.warn(resData.message)
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
    return
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
    return
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
  downloadImage(picture.value?.rawUrl ?? picture.value?.url, picture.value?.name)
}

// 锁定/解锁
const handleLock = (status: number) => {
  if (!canEdit.value) {
    message.error('无权限')
    return
  }

  handleReview(picture.value!, status)
}

// 操作审核
const handleReview = async (record: API.PictureVO, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus == PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const { data: resData } = await pictureReviewUsingPost({
    id: record.id,
    reviewMessage,
    reviewStatus,
  })

  if (resData.code === 0) {
    message.success('操作成功')
    fetchPictureDetail()
  } else {
    message.error(resData.message || '操作失败')
  }
}

// 删除确认对话框
const confirmDelete = () => {
  if (!canEdit.value) {
    message.error('无权限')
    return
  }

  Modal.confirm({
    title: '确认删除',
    content: '你确定要删除这张图片吗？此操作不可撤销。',
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      handleDelete()
    },
    onCancel() {
      // 取消操作，无需处理
    },
  })
}

// 锁定/解锁确认对话框
const confirmLock = (status: number) => {
  if (!canEdit.value) {
    message.error('无权限')
    return
  }

  const actionText = status === PIC_REVIEW_STATUS_ENUM.PASS ? '解锁' : '锁定'

  Modal.confirm({
    title: `确认${actionText}`,
    content: `你确定要${actionText}这张图片吗？`,
    okText: '确认',
    okType: 'primary',
    cancelText: '取消',
    onOk() {
      handleLock(status)
    },
    onCancel() {
      // 取消操作，无需处理
    },
  })
}

function toHexColor(input: string): string {
  if (!input) {
    return '#FFF' // 或者返回默认颜色
  }

  const colorValue = input.startsWith('0x') ? input.slice(2) : input

  const hexColor = parseInt(colorValue, 16).toString(16).padStart(6, '0')

  return `#${hexColor}`
}

// 分享操作
const shareModalRef = ref()
const shareLink = ref<string>()
const handleShare = () => {
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.value?.id}`
  if(shareModalRef.value){
    shareModalRef.value.openModal()
  }
}
</script>

<style scoped>
#detail-picture-page {
  padding: 0 3%;
  /* margin-bottom: 20px; */
  overflow: hidden;
}
</style>
