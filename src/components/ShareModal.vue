<template>
  <div>
    <a-modal
      v-model:open="open"
      :title="props.title"
      :footer="false"
      @cancel="closeModal"
      style="min-width: 400px"
    >
      <h4 style="margin-top: 12px">复制分享链接</h4>
      <a-typography-link copyable>
        {{ link }}
      </a-typography-link>
      <h4 style="margin-top: 12px">手机扫码查看</h4>
      <a-qrcode :value="props.link" icon="/asset/icon.jpg" error-level="H" />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
interface Props {
  title?: string
  link?: string
}

const props = withDefaults(defineProps<Props>(), {
  link: 'https://www.baidu.com',
  title: '分享图片',
})

const open = ref<boolean>(false)

const openModal = () => {
  open.value = true
}

const closeModal = () => {
  open.value = false
}

// 暴露函数给父组件
defineExpose({
  openModal,
})
</script>
