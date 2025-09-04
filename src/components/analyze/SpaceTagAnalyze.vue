<template>
  <div class="space-tag-analyze">
    <a-card title="空间图片标签分析">
      <v-chart :option="options" style="height: 320px" :loading="loading"></v-chart>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceTagAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
import { formattedSize } from '@/utils'

import * as echarts from 'echarts';
import 'echarts-wordcloud';

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
const data = ref<API.SpaceTagAnalyzeResponse[]>()
const fetchData = async () => {
  loading.value = true

  // 参数处理
  const params = {
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  }
  // 请求
  const { data: resData } = await getSpaceTagAnalyzeUsingPost(params)

  if (resData.code === 0 && resData.data) {
    data.value = resData.data
  } else {
    message.error(resData.message || '获取数据失败')
  }

  loading.value = false
}


// 图表选项 - 根据返回的分类数据动态生成
const options = computed(() => {
  // 转换数据格式：词云图需要 {name, value} 结构
  const wordCloudData = (data.value || []).map(item => ({
    name: item.tag || '未知标签', // 标签文本
    value: item.count || 0, // 数量作为权重（决定文字大小）
  })).filter(item => item.value > 0); // 过滤掉数量为0的标签

  return {
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        // 提示框显示标签和数量
        return `${params.name}<br/>数量: ${params.value} 张`;
      }
    },
    series: [{
      type: 'wordCloud',
      shape: 'circle', // 词云形状：circle/cardioid/diamond/triangle/star
      keepAspect: false,
      // 词云位置和大小
      left: 'center',
      top: 'center',
      width: '90%',
      height: '90%',
      // 文字大小范围（根据value映射）
      sizeRange: [14, 80],
      // 文字旋转范围
      rotationRange: [-45, 45],
      rotationStep: 15,
      // 文字间距
      gridSize: 10,
      // 超出画布时是否绘制
      drawOutOfBound: false,
      // 布局动画
      layoutAnimation: true,
      // 文字样式
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        // 随机颜色（柔和的蓝色系）
        color: function() {
          const hue = Math.floor(Math.random() * 40) + 180; // 180-220 蓝色系
          const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
          const lightness = Math.floor(Math.random() * 20) + 40; // 40-60%
          return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }
      },
      // 鼠标悬停效果
      emphasis: {
        focus: 'self',
        textStyle: {
          textShadowBlur: 10,
          textShadowColor: '#000',
          color: '#fff'
        }
      },
      // 词云数据（转换后的标签数据）
      data: wordCloudData
    }]
  };
});



// 监听变量进行刷新
watchEffect(() => {
  fetchData()
})
</script>

<style scoped></style>
