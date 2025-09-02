<template>
  <div id="batch-edit-picture">
    <a-modal
      v-model:open="open"
      :title="props.title"
      :footer="false"
      @cancel="closeModal"
      style="min-width: 400px"
    >
      <a-typography-paragraph type="secondary">* 仅针对当前页面的所有图片生效</a-typography-paragraph>

      <!-- 图片表单 -->
      <a-form layout="vertical" :model="dataForm" @finish="handleFinish">
        <a-form-item name="nameRule" label="命名规则">
          <a-input v-model:value="dataForm.nameRule" placeholder="输入命名规则，输入'{序号}'可自动进行编号" allow-clear> </a-input>
        </a-form-item>

        <a-form-item name="category" label="分类">
          <a-auto-complete
            v-model:value="dataForm.category"
            placeholder="输入分类"
            allow-clear
            :options="categoryOptions"
          >
          </a-auto-complete>
        </a-form-item>

        <a-form-item name="tags" label="标签">
          <a-select
            v-model:value="dataForm.tags"
            mode="tags"
            placeholder="输入标签"
            allow-clear
            :options="tagOptions"
          ></a-select>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" style="width: 100%"> 提交修改 </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { editPictureByBatchUsingPost, listPictureTagCategoryUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
interface Props {
  title?: string
  onSuccess?: () => void
  spaceId: number | string
  pictureList: API.PictureVO[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '批量编辑图片',
})

const open = ref<boolean>(false)

const openModal = () => {
  open.value = true
  dataForm.category = undefined
  dataForm.nameRule = undefined
  dataForm.tags = undefined
}

const closeModal = () => {
  open.value = false
}

// 暴露函数给父组件
defineExpose({
  openModal,
})

// 表单
// 图片表单
const dataForm = reactive<API.PictureEditByBatchRequest>({})

// 补充图片信息

const handleFinish = async (values: any) => {
  const {data: resData} = await editPictureByBatchUsingPost({
    pictureIdList: props.pictureList.map(p => p.id) as number[],
    spaceId: props.spaceId,
    ...values
  })

  if(resData.code === 0 && resData.data){
    message.success("修改成功")
    closeModal()
    props.onSuccess?.()
  }else{
    message.error("修改失败：" + resData.message)
  }
}

// 获取标签和分类选项
const categoryOptions = ref<Array<{ value: string; label: string }>>([])
const tagOptions = ref<Array<{ value: string; label: string }>>([])
const listPictureTagCategory = async () => {
  const { data: resData } = await listPictureTagCategoryUsingPost()

  if (resData.code === 0 && resData.data) {
    categoryOptions.value = (resData.data.categoryList ?? []).map((item: string) => ({
      value: item,
      label: item,
    }))
    tagOptions.value = (resData.data.tagList ?? []).map((item: string) => ({
      value: item,
      label: item,
    }))
  } else {
    message.error('标签信息创建失败')
  }
}
onMounted(() => {
  listPictureTagCategory()
})
</script>
