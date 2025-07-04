<template>
  <div id="pictureManage">
    <a-flex justify="space-between">
      <h2>图片管理</h2>
      <a-button
        type="primary"
        href="/admin/add_picture/batch"
        size="large"
        target="_blank"
        style="margin-bottom: 16px"
        >批量创建图片</a-button
      >
    </a-flex>

    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="handleFinish">
      <a-form-item label="关键词">
        <a-input v-model:value="searchParams.searchText" placeholder="从名称和简介搜索" allow-clear>
        </a-input>
      </a-form-item>
      <a-form-item label="类型">
        <a-input v-model:value="searchParams.category" placeholder="输入图片类型" allow-clear>
        </a-input>
      </a-form-item>
      <a-form-item label="标签">
        <a-select
          v-model:value="searchParams.tags"
          mode="tags"
          allow-clear
          placeholder="输入图片标签"
          style="min-width: 180px; max-width: 400px"
        ></a-select>
      </a-form-item>

      <a-form-item label="审核状态">
        <a-select
          v-model:value="searchParams.reviewStatus"
          allow-clear
          placeholder="输入审核状态"
          style="min-width: 120px"
          :options="PIC_REVIEW_STATUS_OPTIONS"
        ></a-select>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit"> 查询 </a-button>
      </a-form-item>
    </a-form>

    <div style="margin-bottom: 16px"></div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="180"></a-image>
        </template>

        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.dataIndex === 'updateTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <!-- <template v-else-if="column.dataIndex === 'updateTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template> -->

        <template v-else-if="column.dataIndex === 'name'">
          <div class="ant-table-name">{{ record.name }}</div>
        </template>

        <template v-else-if="column.dataIndex === 'picInfo'">
          <div>格式：{{ record.picFormat }}</div>
          <div>大小：{{ ((record.picSize * 1.0) / 1024 / 1024).toFixed(2) }} MB</div>
          <div>宽：{{ record.picWidth }} px</div>
          <div>高：{{ record.picHeight }} px</div>
          <div>比例：{{ record.picScale }}</div>
        </template>

        <template v-else-if="column.dataIndex === 'reviewMessage'">
          <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
          <div v-if="record.reviewTime">审核信息：{{ record.reviewMessage }}</div>
          <div v-if="record.reviewTime">审核人：{{ record.reviewerId }}</div>
          <div v-if="record.reviewTime">
            审核时间：{{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </template>

        <template v-else-if="column.dataIndex === 'introduction'">
          <div class="ant-table-name">{{ record.introduction }}</div>
        </template>

        <template v-else-if="column.dataIndex === 'tags'">
          <a-space wrap>
            <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag">{{ tag }}</a-tag>
          </a-space>
        </template>

        <template v-else-if="column.key === 'action'">
          <div class="editable-row-operations">
            <a-space wrap>
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
                primary
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
                >通过</a-button
              >
              <a-button
                v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
                danger
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
                >拒绝</a-button
              >
              <a-button primary @click="edit(record.id)">编辑</a-button>
              <a-button danger @click="confirmDelete(record.id)">删除</a-button>
            </a-space>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {
  deletePictureUsingPost,
  listPictureByPageUsingPost,
  pictureReviewUsingPost,
} from '@/api/pictureController'
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, reactive, ref, watch, type UnwrapRef } from 'vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { PIC_REVIEW_STATUS_MAP } from '@/constants/picture'
import { PIC_REVIEW_STATUS_ENUM, PIC_REVIEW_STATUS_OPTIONS } from '@/constants/picture'

// 定义数据
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    align: 'center',
  },
  {
    title: '图片名',
    dataIndex: 'name',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '图片',
    dataIndex: 'url',
    align: 'center',
    width: 200,
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    align: 'center',
    width: 200,
  },

  {
    title: '简介',
    dataIndex: 'introduction',
    align: 'center',
    ellipsis: true,
  },

  {
    title: '类型',
    dataIndex: 'category',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    align: 'center',
  },
  {
    title: '用户id',
    dataIndex: 'userId',
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center',
  },
  {
    title: '修改时间',
    dataIndex: 'updateTime',
    align: 'center',
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
    align: 'center',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
  },
]
const dataList = ref<API.Picture[]>([])
const total = ref(0)

// 搜索条件
// reactive适用于对象内部属性是否改变，ref适用于对象本身是否改变
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
})

// 分页器
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total: number) => `共 ${total} 条`,
  }
})

// 请求数据
const fetchData = async () => {
  const { data: resData } = await listPictureByPageUsingPost({
    ...searchParams,
  })

  if (resData.code === 0 && resData.data) {
    dataList.value = resData.data.records ?? []
    total.value = Number(resData.data.total) ?? 0
  } else {
    message.error(resData.message || '获取图片列表失败')
  }
}

// 在页面加载之后执行
onMounted(() => {
  fetchData()
})

// 分页查询
const handleTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 字段查询
const handleFinish = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

// 删除记录
const handleDeletepicture = async (id: string) => {
  if (!id) {
    return
  }

  // 这里要使用string的id，因为使用模板生成代码暂时不能统一
  const { data: resData } = await deletePictureUsingPost({ id })
  if (resData.code === 0) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error(resData.message || '删除失败')
  }
}

// 删除确认对话框
const confirmDelete = (id: string) => {
  Modal.confirm({
    title: '确认删除',
    content: '你确定要删除这张图片吗？此操作不可撤销。',
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      handleDeletepicture(id)
    },
    onCancel() {
      // 取消操作，无需处理
    },
  })
}

const router = useRouter()
const edit = (id: string) => {
  router.push({
    path: `/edit_picture`,
    query: {
      id: id,
    },
  })
}

// 操作审核
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus == PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const { data: resData } = await pictureReviewUsingPost({
    id: record.id,
    reviewMessage,
    reviewStatus,
  })

  if (resData.code === 0) {
    message.success('操作成功')
    fetchData()
  } else {
    message.error(resData.message || '操作失败')
  }
}
</script>

<style scoped></style>
