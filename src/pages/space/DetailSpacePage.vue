<template>
  <div id="detail-space-page">
    <!-- 空间信息 -->
    <a-flex justify="space-between" align="middle">
      <h2 id="spaceName">
        {{ space?.spaceName }}{{ isPrivate ? '（私有空间）' : '（团队空间）' }}
      </h2>

      <a-space size="middle">
        <a-tooltip
          :title="`占用空间 ${formattedSpaceSize(space?.totalSize)} / ${formattedSpaceSize(space?.maxSize)}`"
        >
          <a-progress
            type="dashboard"
            :percent="Number(((space?.totalSize * 100) / space?.maxSize).toFixed(1))"
            size="small"
          />
        </a-tooltip>
        <a-button
          type="primary"
          :icon="h(PlusOutlined)"
          :href="`/add_picture?spaceId=${id}`"
          size="large"
          target="_blank"
          v-if="canUpload"
          >上传图片</a-button
        >

        <a-button
          type="primary"
          ghost
          :icon="h(TeamOutlined)"
          :href="`/spaceUserManage/${id}`"
          size="large"
          target="_blank"
          v-if="
            space?.permissionList?.includes(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE) &&
            space.spaceType == 1
          "
          >空间成员</a-button
        >

        <a-button
          type="primary"
          ghost
          :icon="h(BarChartOutlined)"
          :href="`/space_analyze?spaceId=${id}`"
          size="large"
          target="_blank"
          v-if="canManageSpaceUser"
          >空间分析</a-button
        >

        <a-button :icon="h(EditOutlined)" size="large" @click="doBatchEdit" v-if="canEditPicture">批量编辑</a-button>
        <BatchEditPictureModal
          ref="batchEditPictureModalRef"
          :spaceId="props.id"
          :pictureList="dataList"
          :onSuccess="onBatchEditSuccess"
        ></BatchEditPictureModal>
      </a-space>
    </a-flex>

    <PictureSearchForm :onSearch="onSearch" :onColorChange="onColorChange"></PictureSearchForm>

    <PictureList
      :dataList="dataList"
      :loading="loading"
      :showOp="canEditPicture"
      :showSearch="true"
      :refresh="refresh"
    ></PictureList>
    <!-- 分页器 -->
    <a-pagination
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
      style="text-align: right"
    ></a-pagination>
  </div>
</template>

<script setup lang="ts">
import { getSpaceVoByIdUsingGet } from '@/api/spaceController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import { onMounted, ref, reactive, h, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EditOutlined, PlusOutlined, BarChartOutlined, TeamOutlined } from '@ant-design/icons-vue'

interface Props {
  id: string | number
}
const props = defineProps<Props>()
const space = ref<API.SpaceVO>()

const router = useRouter()
const route = useRoute()
const isPrivate = computed(()=>{
  return route.query.private
})
const fetchSpaceDetail = async () => {
  try {
    const { data: resData } = await getSpaceVoByIdUsingGet({ id: props.id })
    if (resData.code === 0 && resData.data) {
      space.value = resData.data
    } else {
      message.error('空间信息获取失败')
      router.push({
        path: '/',
      })
    }
  } catch (error) {
    message.error('空间信息获取失败')
    router.push({
      path: '/',
    })
  }
}

// 改为计算属性
const formattedSpaceSize = (size?: number) => {
  if (!size) return '-'
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + 'MB'
}

const loginUserStore = useLoginUserStore()

import PictureList from '@/components/PictureList.vue'
import {
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { SPACE_PERMISSION_ENUM } from '@/utils'

const dataList = ref<API.PictureVO[]>([])
const loading = ref(true)
const total = ref(0)

// 搜索条件
// reactive适用于对象内部属性是否改变，ref适用于对象本身是否改变
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'DESC',
})

// 请求数据
const fetchData = async () => {
  loading.value = true

  // 参数处理
  const params = {
    ...searchParams,
    spaceId: props.id,
    tags: [] as string[],
  }

  // 请求
  const { data: resData } = await listPictureVoByPageUsingPost(params)

  if (resData.code === 0 && resData.data) {
    dataList.value = resData.data.records ?? []
    total.value = Number(resData.data.total) ?? 0
  } else {
    message.error(resData.message || '获取图片列表失败')
  }

  loading.value = false
}

// 分页器
const onPageChange = (page: number, pageSize: number) => {
  searchParams.pageSize = pageSize
  searchParams.current = page
  fetchData()
}

const refresh = () => {
  fetchSpaceDetail()
  fetchData()
}
onMounted(() => {
  refresh()
})

// 查询
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  Object.keys(newSearchParams).forEach((key) => {
    searchParams[key] = newSearchParams[key]
  })
  searchParams.current = 1
  fetchData()
}

// 按颜色搜索
const onColorChange = async (color: string) => {
  loading.value = true

  // 请求
  const { data: resData } = await searchPictureByColorUsingPost({
    picColor: color,
    spaceId: props.id,
  })

  if (resData.code === 0 && resData.data) {
    dataList.value = resData.data ?? []
  } else {
    message.error(resData.message || '获取图片列表失败')
  }

  loading.value = false
}

// 批量修改操作
const batchEditPictureModalRef = ref()
const doBatchEdit = () => {
  batchEditPictureModalRef.value?.openModal()
}

const onBatchEditSuccess = () => {
  fetchData()
}

// 监听页面id变化
watch(()=> props.id, ()=>{
  fetchSpaceDetail()
  fetchData()
})


// 定义权限控制
function createPermissionChecker(permission: string){
  return computed(()=>{
  return space.value?.permissionList?.includes(permission)
})
}

const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUpload = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)

</script>

<style scoped>
#spaceName {
  margin-bottom: 0;
  font-size: 28px;
  padding-left: 12px;
  align-items: center;
  line-height: 60px;
}
</style>
