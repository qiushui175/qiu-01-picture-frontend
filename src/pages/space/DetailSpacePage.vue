<template>
  <div id="detail-space-page">
    <!-- 空间信息 -->
    <a-flex justify="space-between" align="middle">
      <h2 id="spaceName">{{ space?.spaceName }}（私有空间）</h2>

      <a-space size="middle">
        <a-tooltip
          :title="`占用空间 ${formattedSpaceSize(space?.totalSize)} / ${formattedSpaceSize(space?.maxSize)}`"
        >
          <a-progress
            type="dashboard"
            :percent="((space?.totalSize * 100) / space?.maxSize).toFixed(1)"
            size="small"
          />
        </a-tooltip>
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`" size="large" target="_blank"
          >上传图片</a-button
        >
      </a-space>
    </a-flex>

    <PictureList
      :dataList="dataList"
      :loading="loading"
      :showOp="true"
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
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  id: string | number
}
const props = defineProps<Props>()
const space = ref<API.SpaceVO>()

const router = useRouter()
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

onMounted(() => {
  fetchSpaceDetail()
})

// 改为计算属性
const formattedSpaceSize = (size?: number) => {
  if (!size) return '-'
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + 'MB'
}

const loginUserStore = useLoginUserStore()

import PictureList from '@/components/PictureList.vue'
import { listPictureVoByPageUsingPost } from '@/api/pictureController'

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

onMounted(() => {
  fetchData()
})

const refresh = () => {
  fetchSpaceDetail()
  fetchData()
}
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
