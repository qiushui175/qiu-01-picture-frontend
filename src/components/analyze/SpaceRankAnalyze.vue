<template>
  <div class="space-rank-analyze">
    <a-card title="空间使用排行">
      <v-chart :option="options" style="height: 800px; margin-bottom: -100px;" :loading="loading"></v-chart>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { ref, computed, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceRankAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
import { formattedSize } from '@/utils'

interface Props {
  topN?: number
}

const props = withDefaults(defineProps<Props>(), {
  topN: 10,
})

// 图表加载
const loading = ref(false)

// 图表数据
const data = ref<API.Space[]>()
const fetchData = async () => {
  loading.value = true

  // 参数处理
  const params = {
    topN: props.topN,
  }
  // 请求
  const { data: resData } = await getSpaceRankAnalyzeUsingPost(params)

  if (resData.code === 0 && resData.data) {
    data.value = resData.data
  } else {
    message.error(resData.message || '获取数据失败')
  }

  loading.value = false
}

// 图表选项 - 根据返回的分类数据动态生成
const options = computed(() => {
  // 处理数据：过滤无效项并按totalSize从大到小排序（保持原排序的同时做安全处理）
  const chartData = (data.value || [])
    .filter((item) => item.spaceName && item.totalSize && item.totalSize > 0)
    .map((item) => ({
      name: item.spaceName, // 空间名称作为标签
      value: item.totalSize, // 空间使用量作为数值
      // 可添加额外信息用于 tooltip
      maxSize: item.maxSize,
      totalCount: item.totalCount,
    }))

  return {
    legend: {
      top: 'top',
      // 数据较多时启用滚动图例
      type: chartData.length > 6 ? 'scroll' : 'plain',
      orient: 'horizontal',
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params: any) {
        const data = params.data
        return `
          <div>${params.name}</div>
          <div>使用量: ${formattedSize(data.value)}</div>
          ${data.maxSize ? `<div>总容量: ${formattedSize(data.maxSize)}</div>` : ''}
          ${data.totalCount ? `<div>文件数量: ${data.totalCount} 个</div>` : ''}
        `
      },
    },
    series: [
      {
        name: '空间使用量',
        type: 'pie',
        radius: [50, 250],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: chartData.length <= 8, // 数据过多时隐藏标签
          formatter: '{b}',
        },
        labelLine: {
          show: chartData.length <= 8, // 数据过多时隐藏标签线
        },
        data: chartData,
      },
    ],
  }
})

// 监听变量进行刷新
watchEffect(() => {
  fetchData()
})
</script>

<style scoped></style>
