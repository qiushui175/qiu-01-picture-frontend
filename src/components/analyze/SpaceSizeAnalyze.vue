<template>
  <div class="space-size-analyze">
    <a-card title="空间图片大小分析">
      <v-chart :option="options" style="height: 320px" :loading="loading"></v-chart>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceSizeAnalyzeUsingPost } from '@/api/spaceAnalyzeController'

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
const data = ref<API.SpaceSizeAnalyzeResponse[]>()
const fetchData = async () => {
  loading.value = true

  // 参数处理
  const params = {
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  }
  // 请求
  const { data: resData } = await getSpaceSizeAnalyzeUsingPost(params)

  if (resData.code === 0 && resData.data) {
    data.value = resData.data
  } else {
    message.error(resData.message || '获取数据失败')
  }

  loading.value = false
}


// 图表选项 - 根据返回的分类数据动态生成
const options = computed(() => {
  // 处理数据，确保格式正确
  const chartData = (data.value || []).map(item => ({
    name: item.sizeRange || '未知范围',
    value: item.count || 0,
  })).filter(item => item.value > 0);

  return {
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        return `${params.name}<br/>图片数量: ${params.value} 张`;
      }
    },
    legend: {
      top: '5%',
      left: 'center',
      // 数据较多时使用滚动图例
      type: chartData.length > 6 ? 'scroll' : 'plain',
      orient: 'horizontal'
    },
    series: [
      {
        name: '图片大小分布',
        type: 'pie',
        radius: ['40%', '70%'], // 环形内外半径
        avoidLabelOverlap: false,
        padAngle: 5, // 扇区间距
        itemStyle: {
          borderRadius: 10, // 扇形圆角
          borderColor: '#fff', // 扇形边框
          borderWidth: 2 // 边框宽度
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 32, // 适中的强调文字大小
            fontWeight: 'bold',
            formatter: '{c}' // 强调时显示数量
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  };
});



// 监听变量进行刷新
watchEffect(() => {
  fetchData()
})
</script>

<style scoped></style>
