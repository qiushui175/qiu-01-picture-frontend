<template>
  <div id="space-manage-page" class="container mx-auto p-4">
    <a-flex justify="space-between" class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">空间成员管理</h2>
    </a-flex>

    <!-- 搜索表单卡片 -->
    <a-card class="mb-6 overflow-hidden">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold text-gray-700">空间成员查询</h3>
      </div>
      <a-form layout="inline" :model="searchParams" @finish="handleFinishForSearch" class="p-4">
        <a-form-item label="用户id" class="mr-4">
          <a-input
            v-model:value="searchParams.userId"
            placeholder="输入用户id"
            allow-clear
            style="width: 200px"
          ></a-input>
        </a-form-item>
        <a-form-item label="用户角色" class="mr-4">
          <a-select
            v-model:value="searchParams.spaceRole"
            allow-clear
            placeholder="选择用户角色"
            style="width: 180px"
            :options="SPACE_ROLE_OPTIONS"
          ></a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit"> 查询 </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 添加用户表单卡片 -->
    <a-card class="mb-6 overflow-hidden">
      <div class="p-4 border-b">
        <h3 class="text-lg font-semibold text-gray-700">空间成员添加</h3>
      </div>
      <a-form layout="inline" :model="addParams" @finish="handleFinishForAdd" class="p-4">
        <a-form-item label="用户id" class="mr-4">
          <a-input
            v-model:value="addParams.userId"
            placeholder="输入用户id"
            allow-clear
            style="width: 200px"
          ></a-input>
        </a-form-item>
        <a-form-item label="用户角色" class="mr-4">
          <a-select
            v-model:value="addParams.spaceRole"
            allow-clear
            placeholder="选择用户角色"
            style="width: 180px"
            :options="SPACE_ROLE_OPTIONS"
            required
          ></a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit"> 添加 </a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 表格 -->
    <a-card>
      <a-table
        :columns="columns"
        :data-source="dataList"
        :pagination="pagination"
        @change="handleTableChange"
        rowKey="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'spaceRole'">
            <!-- 编辑状态显示下拉框，否则显示文本 -->
            <template v-if="editableData[record.id]">
              <a-select
                v-model:value="editableData[record.id].spaceRole"
                style="width: 120px"
                :options="SPACE_ROLE_OPTIONS"
              ></a-select>
            </template>
            <template v-else>
              <div class="ant-table-name">{{ SPACE_ROLE_MAP[record.spaceRole] }}</div>
            </template>
          </template>

          <template v-if="column.dataIndex === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
          </template>

          <template v-if="column.key === 'action'">
            <div>
              <a-space wrap>
                <span v-if="editableData[record.id]">
                  <a-space>
                    <a-typography-link @click="save(record.id)">保存</a-typography-link>
                    <a-popconfirm title="确认取消编辑?" @confirm="cancel(record.id)">
                      <a>取消</a>
                    </a-popconfirm>
                  </a-space>
                </span>
                <span v-else>
                  <a-space>
                    <a-button primary @click="edit(record.id)">编辑</a-button>
                    <a-button danger @click="confirmDelete(record.id)">删除</a-button>
                  </a-space>
                </span>
              </a-space>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
// 外部依赖导入
import { computed, onMounted, reactive, ref, type UnwrapRef } from 'vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'

// API导入
import {
  addSpaceUserUsingPost,
  deleteSpaceUserUsingPost,
  editSpaceUserUsingPost,
  listSpaceUserVoByPageUsingPost,
} from '@/api/spaceUserController'

// 常量导入
import { SPACE_ROLE_MAP, SPACE_ROLE_OPTIONS } from '@/utils'

// 类型定义
interface Props {
  spaceId: number
}

// 组件参数
const props = defineProps<Props>()

// 表格列定义
const columns = [
  {
    title: '用户id',
    dataIndex: 'userId',
    align: 'center',
  },
  {
    title: '角色',
    dataIndex: 'spaceRole',
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    align: 'center',
  },
]

// 数据列表
const dataList = ref<Array<API.SpaceUserVO>>([])
const total = ref(0)

// 搜索参数
const searchParams = reactive<API.SpaceUserQueryRequest>({
  current: 1,
  pageSize: 20,
  spaceRole: undefined,
  userId: undefined,
})

// 添加用户参数 - [新增] 独立的添加参数对象，避免与搜索参数冲突
const addParams = reactive<Partial<API.SpaceUserVO>>({
  spaceId: props.spaceId,
  userId: undefined,
  spaceRole: undefined,
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

// 编辑相关状态 - [修改] 适配三种角色
const editableData: UnwrapRef<Record<string, API.SpaceUserVO>> = reactive({})

// 请求数据
const fetchData = async () => {
  if (!props.spaceId) return

  const { data: resData } = await listSpaceUserVoByPageUsingPost({
    ...searchParams,
    spaceId: props.spaceId,
  })

  if (resData.code === 0 && resData.data) {
    dataList.value = resData.data.records ?? []
    total.value = Number(resData.data.total) ?? 0
  } else {
    message.error(resData.message || '获取空间列表失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})

// 分页变化处理
const handleTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 搜索处理
const handleFinishForSearch = () => {
  searchParams.current = 1
  fetchData()
}

// 删除确认
const confirmDelete = (id: number) => {
  Modal.confirm({
    title: '确认删除',
    content: '你确定要删除该用户吗？此操作不可撤销。',
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      handleDeleteUser(id)
    },
  })
}

// 执行删除 - [修改] 修复API调用错误，应该使用删除用户的API
const handleDeleteUser = async (id: number) => {
  if (!id) return

  // 注意：这里应该使用删除空间用户的API，而不是删除空间的API
  // 假设API为deleteSpaceUserUsingPost，需要根据实际情况调整
  const { data: resData } = await deleteSpaceUserUsingPost({ id })
  if (resData.code === 0) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error(resData.message || '删除失败')
  }
}

// 编辑用户角色
const edit = (id: number) => {
  const record = dataList.value.find((item) => item.id === id)
  if (record) {
    editableData[id] = cloneDeep(record)
  }
}

// 保存编辑 - [修改] 修复角色保存逻辑
const save = async (id: string) => {
  if (!editableData[id]) return

  const { data: resData } = await editSpaceUserUsingPost({
    ...editableData[id],
    spaceId: props.spaceId,
  })

  if (resData.code === 0) {
    message.success('保存成功')
    fetchData()
    delete editableData[id]
  } else {
    message.error(resData.message || '保存失败')
  }
}

// 取消编辑
const cancel = (id: string) => {
  delete editableData[id]
}

// 添加用户 - [修改] 修复参数和API调用
const handleFinishForAdd = async () => {
  if (!addParams.userId || !addParams.spaceRole) {
    message.warning('请填写用户ID和选择角色')
    return
  }

  const { data: resData } = await addSpaceUserUsingPost({
    spaceId: props.spaceId,
    userId: addParams.userId,
    spaceRole: addParams.spaceRole,
  })

  if (resData.code === 0) {
    message.success('添加成功')
    // 清空表单
    addParams.userId = undefined
    addParams.spaceRole = undefined
    fetchData()
  } else {
    message.error(resData.message || '添加失败')
  }
}
</script>

<style lang="css" scoped>
/* 增加卡片阴影和圆角 */
:deep(.ant-card) {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 调整表单间距 */
:deep(.ant-form-inline .ant-form-item) {
  margin-bottom: 16px;
}

/* 按钮间距 */
:deep(.ant-space-item) {
  margin-right: 8px !important;
}

/* 表格操作按钮间距 */
.editable-row-operations {
  display: flex;
  gap: 8px;
}
</style>
