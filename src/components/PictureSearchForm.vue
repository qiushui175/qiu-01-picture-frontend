<template>
  <div id="pictureSearchForm">
    <!-- 搜索表单 -->
    <a-form
      layout="inline"
      :model="searchParams"
      @finish="handleFinish"
      style="max-width: 1400px; margin-bottom: 16px; margin-top: 10px"
    >
      <a-form-item label="关键词">
        <a-input v-model:value="searchParams.searchText" placeholder="从名称和简介搜索" allow-clear>
        </a-input>
      </a-form-item>
      <a-form-item label="类型">
        <a-input v-model:value="searchParams.category" placeholder="输入图片类型" allow-clear>
        </a-input>
      </a-form-item>
      <a-form-item label="标签">
        <a-select
          v-model:value="searchParams.tags"
          mode="tags"
          allow-clear
          placeholder="输入图片标签"
          style="min-width: 180px; max-width: 400px"
        ></a-select>
      </a-form-item>

      <a-form-item label="日期" name="dateRange">
        <a-range-picker
          style="width: 400px"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
          :presets="rangePresets"
          @change="onRangeChange"
          v-model:value="dataRange"
        />
      </a-form-item>

      <a-form-item label="宽度">
        <a-input-number
          v-model:value="searchParams.picWidth"
          placeholder="输入图片宽度"
          allow-clear
          style="min-width: 120px"
          max="100000"
        >
        </a-input-number>
      </a-form-item>
      <a-form-item label="高度">
        <a-input-number
          v-model:value="searchParams.picHeight"
          placeholder="输入图片高度"
          style="min-width: 120px"
          allow-clear
          max="100000"
        >
        </a-input-number>
      </a-form-item>
      <a-form-item label="格式">
        <a-select
          v-model:value="searchParams.picFormat"
          allow-clear
          placeholder="选择格式"
          style="min-width: 100px; max-width: 100px"
        >
          <a-select-option value="jpg">jpg</a-select-option>
          <a-select-option value="jpeg">jpeg</a-select-option>
          <a-select-option value="png">png</a-select-option>
          <a-select-option value="webp">webp</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item>
        <a-space>
          <a-button html-type="reset" style="width: 80px" @click="doClear"> 重置 </a-button>
          <a-button type="primary" html-type="submit" style="width: 180px"> 查询 </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Props {
  onSearch?: (searchParams: API.PictureEditRequest) => void
}
const props = defineProps<Props>()

// 搜索条件
// reactive适用于对象内部属性是否改变，ref适用于对象本身是否改变
const searchParams = reactive<API.PictureQueryRequest>({})

// 搜索操作
const handleFinish = () => {
  props.onSearch?.(searchParams)
}

// 日期范围相关
const dataRange = ref<[]>([])
import dayjs, { Dayjs } from 'dayjs'
const rangePresets = ref([
  { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
  { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
  { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
  { label: 'Last 90 Days', value: [dayjs().add(-90, 'd'), dayjs()] },
])

type RangeValue = [Dayjs, Dayjs]
const onRangeChange = (dates: RangeValue, dateStrings: string[]) => {
  if (dates) {
    searchParams.startTime = dateStrings[0]
    searchParams.endTime = dateStrings[1]
  } else {
    // 清除
    searchParams.startTime = undefined
    searchParams.endTime = undefined
  }
}

const doClear = () => {
  Object.keys(searchParams).forEach((key) => {
    searchParams[key] = undefined
  })
  dataRange.value = []

  props.onSearch?.(searchParams)
}
</script>

<style scoped>
.ant-form-item {
  margin-top: 12px;
}
</style>
