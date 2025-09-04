<template>
  <div class="">
    <a-card title="">
      <v-chart :option="options" style="height: 320px" :loading="loading"></v-chart>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: string
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

// 图表加载
const loading = ref(false)

// 图表数据
const data = ref<>({})
const fetchData = async () => {
  loading.value = true

  // 参数处理
  const params = {
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  }
  // 请求
  const { data: resData } = await (params)

  if (resData.code === 0 && resData.data) {
    data.value = resData.data
  } else {
    message.error(resData.message || '获取数据失败')
  }

  loading.value = false
}

// 图表选项
const options = computed(()=>{
  return {

  }
})

// 监听变量进行刷新
watchEffect(()=>{
  fetchData()
})
</script>

<style scoped></style>
