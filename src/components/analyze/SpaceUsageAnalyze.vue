<template>
  <div class="space-usage-analyze">
    <a-flex gap="middle">
      <a-card title="存储空间" style="width: 50%">
        <h3>
          {{ formattedSize(data.usedSize) }} /
          {{ data.maxSize ? formattedSize(data.maxSize) : '无限制' }}
        </h3>
        <v-chart
          :option="optionSize"
          style="height: 420px; text-align: center; margin-bottom: -120px"
          :loading="loading"
        ></v-chart>
      </a-card>

      <a-card title="图片数量" style="width: 50%">
        <h3>
          {{ data.usedCount + ' 张' }} /
          {{ data.maxCount ? data.maxCount + ' 张' : '无限制' }}
        </h3>
        <v-chart
          :option="optionCount"
          style="height: 420px; text-align: center; margin-bottom: -120px"
          :loading="loading"
        ></v-chart>
      </a-card>
    </a-flex>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, onMounted, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceUsageAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
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
const data = ref<API.SpaceUsageAnalyzeResponse>({
  usedSize: 0,
  maxSize: 100 * 1024 *1024, // 默认值（避免初始为 undefined）
  usedCount: 0,
  maxCount: 100,
})
const fetchData = async () => {
  loading.value = true

  // 参数处理
  const params = {
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
  }
  // 请求
  const { data: resData } = await getSpaceUsageAnalyzeUsingPost(params)

  if (resData.code === 0 && resData.data) {
    data.value = resData.data
  } else {
    message.error(resData.message || '获取数据失败')
  }

  loading.value = false
}

// 图表选项

// 用 computed 或 watchEffect 监听 data 变化
const optionSize = computed(() => {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: data.value.maxSize, // 初始值
        splitNumber: 12,
        itemStyle: {
          color: '#58D9F9',
          shadowColor: 'rgba(0,138,255,0.45)',
          shadowBlur: 10,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        },
        progress: {
          show: true,
          roundCap: true,
          width: 18,
        },
        pointer: {
          icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
          length: '75%',
          width: 16,
          offsetCenter: [0, '5%'],
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 18,
          },
        },
        axisLabel: { show: false }, // 隐藏刻度文字
        title: { show: false },
        detail: { show: false }, // 隐藏底部数字
        data: [
          { value: data.value.usedSize }, // 初始值
        ],
      },
    ],
  }
})

const optionCount = computed(() => {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: data.value.maxCount, // 初始值
        splitNumber: 12,
        itemStyle: {
          color: '#58D9F9',
          shadowColor: 'rgba(0,138,255,0.45)',
          shadowBlur: 10,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
        },
        progress: {
          show: true,
          roundCap: true,
          width: 18,
        },
        pointer: {
          icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.84314 2083.82081,728.755929 L2088.2792,617.312956 C2088.32396,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
          length: '75%',
          width: 16,
          offsetCenter: [0, '5%'],
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 18,
          },
        },
        axisLabel: { show: false }, // 隐藏刻度文字
        title: { show: false },
        detail: { show: false }, // 隐藏底部数字
        data: [
          { value: data.value.usedCount }, // 初始值
        ],
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
