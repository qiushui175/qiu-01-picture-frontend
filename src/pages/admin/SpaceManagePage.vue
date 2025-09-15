<template>
  <div id="space-manage-page">
    <a-flex justify="space-between">
      <h2>空间管理</h2>
      <a-space>
        <a-button
          type="primary"
          href="/add_space"
          size="large"
          target="_blank"
          style="margin-bottom: 16px"
          >+ 创建空间</a-button
        >

        <a-button
          type="primary"
          ghost
          href="/space_analyze?queryAll=1"
          size="large"
          target="_blank"
          style="margin-bottom: 16px"
          >分析全部空间</a-button
        >

        <a-button
          type="primary"
          ghost
          href="/space_analyze?queryPublic=1"
          size="large"
          target="_blank"
          style="margin-bottom: 16px"
          >分析公共空间</a-button
        >
      </a-space>
    </a-flex>

    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="handleFinish">
      <a-form-item label="空间名称">
        <a-input v-model:value="searchParams.spaceName" placeholder="输入空间名" allow-clear>
        </a-input>
      </a-form-item>
      <a-form-item label="空间级别">
        <a-select
          v-model:value="searchParams.spaceLevel"
          allow-clear
          placeholder="选择空间级别"
          style="min-width: 140px"
          :options="SPACE_LEVEL_OPTIONS"
        ></a-select>
      </a-form-item>

      <a-form-item label="用户id">
        <a-input v-model:value="searchParams.userId" placeholder="输入用户id" allow-clear>
        </a-input>
      </a-form-item>

      <a-form-item label="空间类型">
        <a-select
          v-model:value="searchParams.spaceType"
          allow-clear
          placeholder="选择空间类型"
          style="min-width: 140px"
          :options="SPACE_TYPE_OPTIONS"
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
        <template v-if="column.dataIndex === 'spaceName'">
          <div class="ant-table-name">{{ record.spaceName }}</div>
        </template>

        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.dataIndex === 'updateTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.dataIndex === 'spaceUseInfo'">
          <div>
            大小：{{ formattedSize(record.totalSize) }} / {{ formattedSize(record.maxSize) }}
          </div>
          <div>数量：{{ record.totalCount }} / {{ record.maxCount }}</div>
        </template>

        <template v-else-if="column.dataIndex === 'spaceType'">
          <a-tag :color="record.spaceType == 0 ? 'green' : 'blue'">{{ SPACE_TYPE_MAP[record.spaceType] }}</a-tag>
        </template>

        <template v-else-if="column.dataIndex === 'spaceLevel'">
          <a-tag :color="getColorForSpaceLevel(record.spaceLevel)">{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <div class="editable-row-operations">
            <a-space wrap>
              <a-button primary :href="`/space_analyze?spaceId=${record.id}`">分析</a-button>
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
import { deleteSpaceUsingPost, listSpaceByPageUsingPost } from '@/api/spaceController'
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import { SPACE_LEVEL_MAP, SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { SPACE_TYPE_MAP, SPACE_TYPE_OPTIONS } from '@/utils'

// 定义数据
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    align: 'center',
  },
  {
    title: '空间名',
    dataIndex: 'spaceName',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '空间级别',
    dataIndex: 'spaceLevel',
    align: 'center',
    width: 100,
  },

  {
    title: '空间类型',
    dataIndex: 'spaceType',
    align: 'center',
    width: 100,
  },

  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
    align: 'center',
    width: 280,
  },

  {
    title: '所属用户id',
    dataIndex: 'userId',
    align: 'center',
    ellipsis: true,
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
    title: '操作',
    key: 'action',
    align: 'center',
  },
]
const dataList = ref<Array<API.Space>>([])
const total = ref(0)

// 搜索条件
// reactive适用于对象内部属性是否改变，ref适用于对象本身是否改变
const searchParams = reactive<API.SpaceQueryRequest>({
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
  const { data: resData } = await listSpaceByPageUsingPost({
    ...searchParams,
  })

  if (resData.code === 0 && resData.data) {
    dataList.value = resData.data.records ?? []
    total.value = Number(resData.data.total) ?? 0
  } else {
    message.error(resData.message || '获取空间列表失败')
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
const handleDeletespace = async (id: string) => {
  if (!id) {
    return
  }

  // 这里要使用string的id，因为使用模板生成代码暂时不能统一
  const { data: resData } = await deleteSpaceUsingPost({ id })
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
    content: '你确定要删除这张空间吗？此操作不可撤销。',
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      handleDeletespace(id)
    },
    onCancel() {
      // 取消操作，无需处理
    },
  })
}

const formattedSize = (size?: number) => {
  if (!size) return '-'
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + 'MB'
}

// 获取不同版本的标签颜色
const tagColor = ["cyan", "purple", "orange"]
const getColorForSpaceLevel = (level: number)=>{
  return tagColor[level]
}

const edit = (id: string) => {}
</script>

<style lang="css" scoped></style>
