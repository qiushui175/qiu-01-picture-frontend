<template>
  <div id="userManage">
    <!-- 搜索表单 -->
    <a-form
    layout="inline"
    :model="searchParams"
    @finish="handleFinish"
  >
    <a-form-item label="账号">
      <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" allow-clear>
      </a-input>
    </a-form-item>
    <a-form-item label="用户名">
      <a-input v-model:value="searchParams.userName"  placeholder="输入用户名" allow-clear>
      </a-input>
    </a-form-item>
    <a-form-item>
      <a-button
        type="primary"
        html-type="submit"
      >
        查询
      </a-button>
    </a-form-item>
  </a-form>

    <div style="margin-bottom: 16px;"></div>

    <!-- 表格 -->
    <a-table :columns="columns" :data-source="dataList" :pagination="pagination"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
          <a-image :src="record.userAvatar" :width="60"></a-image>
        </template>

        <template v-if="column.dataIndex === 'userRole'">
          <div v-if="record.userRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else-if="record.userRole === 'user'">
            <a-tag color="blue">普通用户</a-tag>
          </div>
        </template>

        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.dataIndex === 'updateTime'">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template v-else-if="column.dataIndex === 'userName'">
          <div class="ant-table-name">{{ record.userName }}</div>
        </template>

        <template v-else-if="column.key === 'action'">
          <a-button danger @click="handleDeleteUser(record.id)">删除</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { deleteUserByIdUsingPost, listUserVoByPageUsingPost } from '@/api/userController'
import { SmileOutlined, DownOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'

// 定义数据
const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 180,
    align: 'center',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    width: 120,
    ellipsis: true,
    align: 'center',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    ellipsis: true,
    align: 'center',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    width: 140,
    align: 'center',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
    align: 'center',
    width: 140,
    ellipsis: true,
  },
  {
    title: '用户权限',
    dataIndex: 'userRole',
    align: 'center',
    width: 120
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
    showTotal: (total:number) => `共 ${total} 条`,
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
const handleTableChange = (page:any) =>{
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}


// 字段查询
const handleFinish = ()=>{
    // 重置页码
    searchParams.current = 1
    fetchData()
}

// 删除记录
const handleDeleteUser = async (id:string) => {

  if (!id) {
    return
  }

  // 这里要使用string的id，因为使用模板生成代码暂时不能统一
  const { data: resData } = await deleteUserByIdUsingPost({id})
  if(resData.code === 0){
    message.success('删除成功')
    fetchData()
  }else{
    message.error(resData.message || '删除失败')
  }
}


</script>

<style scoped></style>
