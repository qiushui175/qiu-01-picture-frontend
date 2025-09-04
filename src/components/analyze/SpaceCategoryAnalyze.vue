<template>
  <div class="space-category-analyze">
    <a-card title="空间图片分类分析">
      <v-chart :option="options" style="height: 320px" :loading="loading"></v-chart>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceCategoryAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
import { formattedSize } from '@/utils'

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
const data = ref<API.SpaceCategoryAnalyzeResponse[]>()
const fetchData = async () => {
  loading.value = true

  // 参数处理
  const params = {
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  }
  // 请求
  const { data: resData } = await getSpaceCategoryAnalyzeUsingPost(params)

  if (resData.code === 0 && resData.data) {
    data.value = resData.data
  } else {
    message.error(resData.message || '获取数据失败')
  }

  loading.value = false
}


// 图表选项 - 根据返回的分类数据动态生成
const options = computed(() => {
  // 提取分类名称列表
  const categories = data.value?.map(item => item.category || '未知分类') || [];
  
  // 提取数量和大小数据
  const countData = data.value?.map(item => item.count || 0) || [];
  const sizeData = data.value?.map(item => item.totalSize || 0) || [];

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      // 自定义提示框内容
      formatter: function(params: any) {
        const category = params[0].name;
        const count = params[0].value;
        const size = formattedSize(params[1].value);
        return `${category}<br/>数量: ${count} 张<br/>总大小: ${size}`;
      }
    },
    legend: {
      data: ['图片数量', '总大小'],
      top: 0
    },
    grid: {
      left: '5%',
      right: '10%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: 30,
        interval: 0
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '图片数量',
        position: 'left',
        axisLabel: {
          formatter: '{value} 张'
        },
        // 左侧Y轴独立比例尺
        scale: true
      },
      {
        type: 'value',
        name: '总大小',
        position: 'right',
        axisLabel: {
          formatter: function(value: number) {
            return formattedSize(value);
          }
        },
        // 右侧Y轴独立比例尺，不与左侧关联
        scale: true,
        // 隐藏右侧Y轴网格线，避免与左侧冲突
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: '图片数量',
        type: 'bar',
        data: countData,
        barWidth: '30%',
        // 使用默认颜色
        yAxisIndex: 0 // 关联左侧Y轴
      },
      {
        name: '总大小',
        type: 'bar',
        data: sizeData,
        barWidth: '30%',
        // 使用默认颜色
        yAxisIndex: 1 // 关联右侧Y轴
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
