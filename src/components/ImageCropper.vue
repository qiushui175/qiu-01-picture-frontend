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
        <div class="image-cropper-actions" v-if="isTeamSpace">
          <a-space>
            <div v-if="editingUser">{{ editingUser?.userName }} 正在编辑</div>
            <a-button type="primary" v-if="canEnterEdit" @click="enterEdit">进入编辑</a-button>
            <a-button type="primary" v-if="canExitEdit" danger @click="exitEdit">退出编辑</a-button>
          </a-space>
        </div>
        <div style="margin-bottom: 20px"></div>

        <div class="image-cropper-actions" v-if="!isTeamSpace || canEdit">
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
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constants/picture'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { SPACE_TYPE_ENUM } from '@/utils'
import PictureEditWebSocket from '@/utils/pictureEditWebsocket'
import { message } from 'ant-design-vue'
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'

interface Props {
  title?: string
  imageUrl?: string
  onSuccess?: (newPicture: API.PictureVO) => void
  spaceId?: string
  picture?: API.PictureVO
  space?: API.SpaceVO
}

const props = withDefaults(defineProps<Props>(), {
  title: '编辑图片',
})

const isTeamSpace = computed(() => {
  return props.space?.spaceType === SPACE_TYPE_ENUM.TEAM
})

const open = ref<boolean>(false)

const openModal = () => {
  open.value = true
}

const closeModal = () => {
  open.value = false

  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
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

  editAciton(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
}

// 向右旋转
const rotateRight = () => {
  cropperRef.value.rotateRight()

  editAciton(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
}

// 缩放
const changeScale = (num: number) => {
  cropperRef.value.changeScale(num)

  if (num > 0) {
    editAciton(PICTURE_EDIT_ACTION_ENUM.ZOOM_IN)
  } else if (num < 0) {
    editAciton(PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT)
  }
}

// 裁切并上传
const handleConfirm = () => {
  cropperRef.value.getCropBlob((blob: Blob) => {
    const end = props.picture?.picFormat ?? 'png'
    const fileName = (props.picture?.name || 'image') + '.' + end.toLowerCase()
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

// -----------------------------------------------
// 实时编辑扩展
const loginUser = useLoginUserStore().loginUser
const editingUser = ref<API.UserVO>()

// 是否可进入
const canEnterEdit = computed(() => {
  return !editingUser.value
})

// 是否可退出
const canExitEdit = computed(() => {
  return editingUser.value?.id === loginUser.id
})

// 是否可编辑
const canEdit = computed(() => {
  return editingUser.value?.id === loginUser.id
})

// websocket
let websocket: PictureEditWebSocket | null
const initWebSocket = () => {
  // 只有团队空间要做
  if (!isTeamSpace.value) return

  const pictureId = props.picture?.id
  if (!pictureId || !open) {
    return
  }

  // 防止未释放连接导致多次重连
  if (websocket) {
    websocket.disconnect()
  }

  websocket = new PictureEditWebSocket(pictureId)
  websocket.connect()

  // 监听动作
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (msg) => {
    message.info(msg.message)
  })
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (msg) => {
    message.info(msg.message)
  })
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (msg) => {
    message.info(msg.message)
    editingUser.value = msg.user
  })
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (msg) => {
    message.info(msg.message)
    editingUser.value = undefined
  })
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg) => {
    message.info(msg.message)

    switch (msg.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        cropperRef.value.rotateLeft()
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        cropperRef.value.rotateRight()
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        cropperRef.value.changeScale(1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        cropperRef.value.changeScale(-1)
        break
    }
  })
}

// 监听属性进行更新
// watchEffect(() => {
//   initWebSocket()W
// })
watch([() => props.picture?.id, open, isTeamSpace], ()=>{
  initWebSocket()
})

// 卸载时断开连接
onUnmounted(() => {
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
})

const enterEdit = () => {
  if (websocket) {
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT,
    })
  }
}

const exitEdit = () => {
  if (websocket) {
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,
    })
  }
}

// 发送编辑图片请求
const editAciton = (editAcitonStr: string) => {
  if (websocket) {
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
      editAction: editAcitonStr,
    })
  }
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
