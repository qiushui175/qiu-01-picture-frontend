<template>
  <div class="space-user-analyze">
    <a-card title="用户空间分析">
      <v-chart :option="options" style="height: 320px" :loading="loading"></v-chart>

      <template #extra>
        <a-space>
          <a-segmented v-model:value="timeDimension" :options="segmentedData"></a-segmented>
          <a-input-search
            placeholder="请输入用户id"
            enter-button="搜索"
            allow-clear
            @search="doSearch"
            v-if="isAdmin"
          ></a-input-search>
        </a-space>
      </template>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import 'echarts'
import { computed, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { getSpaceUserAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
import { template } from 'lodash'

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: string
  isAdmin?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
  isAdmin: false
})

// 图表加载
const loading = ref(false)

// 搜索时间维度
const timeDimension = ref<'day' | 'week' | 'month'>('day')
const segmentedData = [
  {
    label: '日',
    value: 'day',
  },
  {
    label: '周',
    value: 'week',
  },
  {
    label: '月',
    value: 'month',
  },
]
// 用户id
const userId = ref<string>()
const doSearch = (value: string) => {
  userId.value = value
}

// 图表数据
const data = ref<API.SpaceUserAnalyzeResponse[]>()
const fetchData = async () => {
  loading.value = true

  // 参数处理
  const params = {
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
    timeDimension: timeDimension.value,
    userId: userId.value,
  }
  // 请求
  const { data: resData } = await getSpaceUserAnalyzeUsingPost(params)

  if (resData.code === 0 && resData.data) {
    data.value = resData.data
  } else {
    message.error(resData.message || '获取数据失败')
  }

  loading.value = false
}

// 图表选项 - 根据返回的分类数据动态生成
// const options = computed(() => {
//   // 数据处理逻辑保持不变
//   const chartData = (data.value || [])
//     .map(item => {
//       const timestamp = new Date(item.period || '').getTime();
//       return {
//         timestamp,
//         count: item.count || 0,
//         period: item.period || ''
//       };
//     })
//     .filter(item => !isNaN(item.timestamp) && item.count > 0)
//     .sort((a, b) => a.timestamp - b.timestamp)
//     .map(item => [item.timestamp, item.count]);

//   return {
//     tooltip: {
//       trigger: 'axis',
//       position: (pt: any) => [pt[0], '10%'],
//       formatter: (params: any) => {
//         const date = new Date(params[0].value[0]);
//         const formattedDate = date.toLocaleDateString();
//         return `${formattedDate}<br/>图片数量: ${params[0].value[1]} 张`;
//       }
//     },
//     title: {
//       left: 'center',
//       text: '用户图片数量趋势'
//     },
//     // 工具条只保留重置按钮
//     toolbox: {
//       feature: {
//         // 移除其他工具，只保留restore（重置）
//         restore: {
//           show: true,
//           title: '重置视图' // 鼠标悬停提示文字
//         }
//       }
//     },
//     xAxis: {
//       type: 'time',
//       boundaryGap: false,
//       name: '日期',
//       axisLabel: {
//         formatter: (value: number) => new Date(value).toLocaleDateString()
//       }
//     },
//     yAxis: {
//       type: 'value',
//       boundaryGap: [0, '10%'],
//       name: '图片数量',
//       axisLabel: {
//         formatter: '{value} 张'
//       }
//     },
//     // 缩放配置：仅作用于X轴
//     dataZoom: [
//       {
//         type: 'inside', // 鼠标滚轮缩放（仅X轴）
//         start: 0,
//         end: 100,
//         xAxisIndex: 0, // 明确指定只缩放第0个X轴
//         yAxisIndex: -1 // 不缩放Y轴（-1表示所有Y轴都不缩放）
//       },
//       {
//         type: 'slider', // 底部滑动条缩放（仅X轴）
//         start: 0,
//         end: 100,
//         xAxisIndex: 0, // 明确指定只缩放第0个X轴
//         yAxisIndex: -1 // 不缩放Y轴
//       }
//     ],
//     series: [
//       {
//         name: '图片数量',
//         type: 'line',
//         // smooth: true,
//         // symbol: 'none',
//         lineStyle: { width: 2 },
//         areaStyle: {
//           color: {
//             type: 'linear',
//             x: 0, y: 0, x2: 0, y2: 1,
//             colorStops: [
//               { offset: 0, color: 'rgba(88, 217, 249, 0.6)' },
//               { offset: 1, color: 'rgba(88, 217, 249, 0)' }
//             ]
//           }
//         },
//         data: chartData
//       }
//     ]
//   };
// });
const options = computed(() => {
  // 1. 原始数据处理与格式识别
  const processedData = (data.value || [])
    .map((item) => {
      if (!item.period) return null

      let date: Date | null = null
      let dateStr = item.period

      // 根据粒度解析不同格式的period
      switch (timeDimension.value) {
        case 'day':
          // 格式: 'YYYY-MM-DD'
          date = new Date(item.period)
          break
        case 'week':
          // 格式: 'YYYY-WW' (ISO周格式，WW为01-53)
          const [year, week] = item.period.split('-')
          // 计算该周的第一天（周一）
          date = getFirstDayOfWeek(parseInt(year), parseInt(week))
          break
        case 'month':
          // 格式: 'YYYY-MM'
          date = new Date(`${item.period}-01`) // 当月第一天
          break
      }

      if (!date || isNaN(date.getTime())) return null

      return {
        dateStr,
        timestamp: date.getTime(),
        count: item.count || 0,
      }
    })
    .filter(Boolean) as Array<{ dateStr: string; timestamp: number; count: number }>

  // 无有效数据时的空配置
  if (processedData.length === 0) {
    return {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'time' },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: [] }],
    }
  }

  // 2. 排序并确定时间范围
  const sortedData = [...processedData].sort((a, b) => a.timestamp - b.timestamp)
  const start = new Date(sortedData[0].timestamp)
  const end = new Date(sortedData[sortedData.length - 1].timestamp)

  // 3. 生成完整时间序列（填充缺失值为0）
  const dateMap = new Map(processedData.map((item) => [item.dateStr, item.count]))
  const fullData: [number, number][] = []
  const current = new Date(start)

  while (current <= end) {
    let dateStr: string

    // 根据粒度生成日期字符串key
    switch (timeDimension.value) {
      case 'day':
        dateStr = current.toISOString().split('T')[0] // 'YYYY-MM-DD'
        current.setDate(current.getDate() + 1) // 加1天
        break
      case 'week':
        const year = current.getFullYear()
        const week = getWeekNumber(current) // 获取ISO周数
        dateStr = `${year}-${week.toString().padStart(2, '0')}` // 'YYYY-WW'
        current.setDate(current.getDate() + 7) // 加1周
        break
      case 'month':
        dateStr = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}` // 'YYYY-MM'
        current.setMonth(current.getMonth() + 1) // 加1月
        break
    }

    // 填充数据（存在则用原数据，否则用0）
    const count = dateMap.get(dateStr) || 0
    // 使用该时间单位的起始时间戳作为x轴值
    const timestamp =
      timeDimension.value === 'week'
        ? getFirstDayOfWeek(
            parseInt(dateStr.split('-')[0]),
            parseInt(dateStr.split('-')[1]),
          ).getTime()
        : new Date(timeDimension.value === 'month' ? `${dateStr}-01` : dateStr).getTime()

    fullData.push([timestamp, count])
  }

  // 4. 图表配置
  return {
    tooltip: {
      trigger: 'axis',
      position: (pt: any) => [pt[0], '10%'],
      formatter: (params: any) => {
        const [timestamp, count] = params[0].value
        const date = new Date(timestamp)

        // 根据粒度格式化提示框日期
        let dateStr: string
        switch (timeDimension.value) {
          case 'day':
            dateStr = date.toLocaleDateString()
            break
          case 'week':
            const year = date.getFullYear()
            const week = getWeekNumber(date)
            dateStr = `第${week}周 (${year})`
            break
          case 'month':
            dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
            break
        }
        return `${dateStr}<br/>图片数量: ${count} 张`
      },
    },
    title: {
      left: 'center',
      text: `用户图片数量趋势 (${formatGranularity(timeDimension.value)})`,
    },
    toolbox: {
      feature: {
        restore: { show: true, title: '重置视图' },
      },
    },
    xAxis: {
      type: 'time',
      boundaryGap: false,
      name: '时间',
      axisLabel: {
        // 根据时间粒度动态调整标签间隔
        interval: (index: number, value: number) => {
          const date = new Date(value)
          switch (timeDimension.value) {
            case 'day':
              // 每天数据较多时，每隔3天显示一个标签
              return date.getDate() % 3 !== 0
            case 'week':
              // 每周数据，每隔2周显示一个标签
              return getWeekNumber(date) % 2 !== 0
            case 'month':
              // 每月数据，只显示每月1号的标签
              return date.getDate() !== 1
            default:
              return false
          }
        },
        formatter: (value: number) => {
          const date = new Date(value)
          // 根据粒度格式化x轴标签
          switch (timeDimension.value) {
            case 'day':
              return date.toLocaleDateString()
            case 'week':
              return `第${getWeekNumber(date)}周`
            case 'month':
              return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
          }
        },
      },
      minInterval:
        timeDimension.value === 'day'
          ? 24 * 3600 * 1000 * 2 // 日粒度：至少2天一个刻度
          : timeDimension.value === 'week'
            ? 7 * 24 * 3600 * 1000 * 3 // 周粒度：至少2周一个刻度
            : 30 * 24 * 3600 * 1000, // 月粒度：至少1个月一个刻度
    },
    yAxis: {
      type: 'value',
      boundaryGap: [0, '10%'],
      name: '图片数量',
      axisLabel: { formatter: '{value} 张' },
      min: 0, // 确保从0开始
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        xAxisIndex: 0,
        yAxisIndex: -1,
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        xAxisIndex: 0,
        yAxisIndex: -1,
      },
    ],
    series: [
      {
        name: '图片数量',
        type: 'line',
        smooth: timeDimension.value !== 'day', // 周/月粒度使用平滑曲线，日粒度更适合折线
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(49, 120, 207, 0.7)' },
              { offset: 1, color: 'rgba(49, 120, 207, 0)' },
            ],
          },
        },
        data: fullData,
      },
    ],
  }
})

// 辅助函数：获取ISO周数（1-53）
function getWeekNumber(date: Date): number {
  const temp = new Date(date.getTime())
  temp.setHours(0, 0, 0, 0)
  // 把周一作为一周的第一天
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7))
  const firstDayOfYear = new Date(temp.getFullYear(), 0, 4)
  return Math.ceil(((temp.getTime() - firstDayOfYear.getTime()) / 86400000 + 1) / 7)
}

// 辅助函数：获取指定年份和周数的周一日期
function getFirstDayOfWeek(year: number, week: number): Date {
  const date = new Date(year, 0, 1)
  const dayOfWeek = date.getDay() || 7 // 转换为周一为1，周日为7
  const diff = 1 - dayOfWeek + (dayOfWeek > 4 ? 7 : 0)
  date.setDate(date.getDate() + diff + (week - 1) * 7)
  return date
}

// 辅助函数：格式化粒度显示名称
function formatGranularity(granularity: string): string {
  const map = { day: '按日', week: '按周', month: '按月' }
  return map[granularity]
}

// 监听变量进行刷新
watchEffect(() => {
  fetchData()
})
</script>

<style scoped></style>
