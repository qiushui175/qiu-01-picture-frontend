<template>
  <div id="userManage">
    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="handleFinish">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" allow-clear>
        </a-input>
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="输入用户名" allow-clear>
        </a-input>
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
      :scroll="{x: '100%'}"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="60"></a-image>
        </template>

        <template v-if="column.dataIndex === 'userRole'">
          <a-checkable-tag
            v-if="editableData[record.id]"
            v-for="(tag, index) in tagsData"
            :key="tag"
            :checked="getRowSelectStates(record.id)[index]"
            @change="() => handleTagChange(record.id, index)"
          >
            {{ tag }}
          </a-checkable-tag>

          <template v-else>
            <div v-if="record.userRole === 'admin'">
              <a-tag color="green">管理员</a-tag>
            </div>
            <div v-else-if="record.userRole === 'user'">
              <a-tag color="blue">普通用户</a-tag>
            </div>
          </template>
        </template>

        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <!-- <template v-else-if="column.dataIndex === 'updateTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template> -->

        <template v-else-if="column.dataIndex === 'userName'">
          <a-input
            v-if="editableData[record.id]"
            v-model:value="editableData[record.id][column.dataIndex]"
            style="margin: -5px 0"
          />
          <template v-else>
            <div class="ant-table-name">{{ record.userName }}</div>
          </template>
        </template>

        <template v-else-if="column.dataIndex === 'userAccount'">
          <a-input
            v-if="editableData[record.id]"
            v-model:value="editableData[record.id][column.dataIndex]"
            style="margin: -5px 0"
          />
          <template v-else>
            <div class="ant-table-name">{{ record.userAccount }}</div>
          </template>
        </template>

        <template v-else-if="column.dataIndex === 'userProfile'">
          <a-input
            v-if="editableData[record.id]"
            v-model:value="editableData[record.id][column.dataIndex]"
            style="margin: -5px 0"
          />
          <template v-else>
            <div class="ant-table-name">{{ record.userProfile }}</div>
          </template>
        </template>

        <template v-else-if="column.key === 'action'">
          <div class="editable-row-operations">
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
                <a-button danger @click="handleDeleteUser(record.id)">删除</a-button>
              </a-space>
            </span>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {
  deleteUserByIdUsingPost,
  listUserVoByPageUsingPost,
  updateUserUsingPost,
} from '@/api/userController'
import { SmileOutlined, DownOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref, watch, type UnwrapRef } from 'vue'
import dayjs from 'dayjs'

// 定义数据
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    align: 'center',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    width: 150,
    ellipsis: true,
    align: 'center',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    width: 150,
    ellipsis: true,
    align: 'center',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    align: 'center',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
    align: 'center',
    ellipsis: true,
  },
  {
    title: '用户权限',
    dataIndex: 'userRole',
    align: 'center',
    width: 120,
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
const dataList = ref<API.UserVO[]>([])
const total = ref(0)

// 搜索条件
// reactive适用于对象内部属性是否改变，ref适用于对象本身是否改变
const searchParams = reactive<API.UserQueryRequest>({
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
  const { data: resData } = await listUserVoByPageUsingPost({
    ...searchParams,
  })

  if (resData.code === 0 && resData.data) {
    dataList.value = resData.data.records ?? []
    total.value = Number(resData.data.total) ?? 0
  } else {
    message.error(resData.message || '获取用户列表失败')
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
const handleDeleteUser = async (id: string) => {
  if (!id) {
    return
  }

  // 这里要使用string的id，因为使用模板生成代码暂时不能统一
  const { data: resData } = await deleteUserByIdUsingPost({ id })
  if (resData.code === 0) {
    message.success('删除成功')
    fetchData()
  } else {
    message.error(resData.message || '删除失败')
  }
}

const editableData: UnwrapRef<Record<string, API.UserVO>> = reactive({})

const tagsData = reactive(['管理员', '普通用户'])
const o_for_tagsData = ['admin', 'user']

// 行选择状态，使用Map结构更清晰
const rowSelectStates = reactive(new Map<string, number>())

import { cloneDeep } from 'lodash-es'
const edit = (id: string) => {
  editableData[id] = cloneDeep(dataList.value.filter((item) => id === item.id)[0])
}
const save = async (id: string) => {
  editableData[id].userRole = o_for_tagsData[rowSelectStates.get(id) ?? 1]

  // 前端更新
  // Object.assign(dataList.value.filter((item) => id === item.id)[0], editableData[id])

  // 后端更新
  const { data: resData } = await updateUserUsingPost({
    ...editableData[id],
  })

  if (resData.code === 0) {
    message.success('保存成功')
    fetchData()
  } else {
    message.error(resData.message || '保存失败')
  }

  delete editableData[id]
  rowSelectStates.delete(id)
}
const cancel = (id: string) => {
  delete editableData[id]
  rowSelectStates.delete(id)
}

// 标签选择
// 初始化行选择状态，从用户角色数据中映射
const initRowSelection = (id: string, userRole?: string): void => {
  // 如果已有状态则不初始化
  if (rowSelectStates.has(id)) return

  // 根据用户角色初始化选中的标签索引
  if (userRole === 'admin') {
    rowSelectStates.set(id, 0)
  } else if (userRole === 'user') {
    rowSelectStates.set(id, 1)
  }
  // const initialIndex = tagsData.findIndex((tag) => tag === userRole)

  // rowSelectStates.set(id, initialIndex >= 0 ? initialIndex : 0)
}

// 处理数据加载完成后的初始化
// watch(
//   dataList,
//   () => {
//     dataList.value.forEach((item) => {
//       if (item.id !== undefined) {
//         initRowSelection(String(item.id), item.userRole)
//       }
//     })
//   },
//   { immediate: true },
// )

// 处理标签选择变化
const handleTagChange = (rowId: string, newIndex: number): void => {
  // 获取当前选中的索引
  const currentIndex = rowSelectStates.get(rowId)

  // 如果新选中的索引和当前相同，则不处理（避免取消唯一选中项）
  if (currentIndex === newIndex) return

  // 更新选中的索引
  rowSelectStates.set(rowId, newIndex)

  // 更新用户角色数据
  // const itemIndex = dataList.value.findIndex((item) => String(item.id) === rowId)
  // if (itemIndex >= 0) {
  //   dataList.value[itemIndex].userRole = tagsData[newIndex]
  // }
}

// 获取指定行的选中状态
const getRowSelectStates = (rowId: string) => {
  initRowSelection(rowId, editableData[rowId].userRole)
  const selectedIndex = rowSelectStates.get(rowId) ?? 0
  return tagsData.map((_, index) => index === selectedIndex)
}
</script>

<style scoped></style>
