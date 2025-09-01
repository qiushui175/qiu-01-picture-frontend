<template>
  <div id="search-picture-page">
    <h2 id="search-picture-title" style="margin-left: 12px;">以图搜图</h2>


    <h3 style="font-size: 20px; margin-bottom: 16px; margin-top: 10px;  margin-left: 12px;">原图</h3>
    <a-card hoverable style="width: 430px;  margin-left: 12px;">
      <template #cover>
        <img
          :alt="picture?.name"
          :src="picture?.thumbnailUrl ?? picture?.url"
          style="object-fit: cover"
        />
      </template>
    </a-card>


    <h3 style="font-size: 20px; margin-bottom: 10px; margin-top: 30px; margin-left: 12px;">识图结果</h3>
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }"
      :data-source="dataList"
      :loading="loading"
      class="picture-list"
    >
      <!-- 单张图片 -->
      <template #renderItem="{ item }">
        <a-list-item class="custom-card-item">
          <div
            class="card-container"
            @mouseenter="handleMouseEnter(item.thumbUrl)"
            @mouseleave="handleMouseLeave(item.thumbUrl)"
            @click="doClickPicture(item)"
          >
            <img :alt="item.name" :src="item.thumbUrl" class="card-image" />

            <div class="card-overlay" :class="{ visible: isHovered(item.thumbUrl) }">
              <div class="card-content">
              </div>
            </div>
          </div>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { getPictureVoByIdUsingGet, searchPictureByPictureUsingPost } from '@/api/pictureController'
import { message, Modal } from 'ant-design-vue'
import { computed, onMounted, ref, h, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const pictureId = computed(() => {
  return route.query?.pictureId
})
const picture = ref<API.PictureVO>()

const router = useRouter()
const fetchPictureDetail = async () => {
  try {
    const { data: resData } = await getPictureVoByIdUsingGet({ id: pictureId.value })
    if (resData.code === 0 && resData.data) {
      picture.value = resData.data
    } else {
      message.warn(resData.message)
      router.push({
        path: '/',
      })
    }
  } catch (error) {
    message.error('图片信息获取失败')
    router.push({
      path: '/',
    })
  }
}

// 改为计算属性
const formattedPictureSize = (size?: number) => {
  if (!size) return '-'
  if (size < 1024) return size + 'B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + 'MB'
}

const dataList = ref<API.ImageSearchResult[]>([])
const loading = ref(true)
// 请求数据
const fetchData = async () => {
  loading.value = true

  // 请求
  const { data: resData } = await searchPictureByPictureUsingPost({ pictureId: pictureId.value })

  if (resData.code === 0 && resData.data) {
    dataList.value = resData.data ?? []
  } else {
    message.error(resData.message || '获取图片列表失败')
  }

  loading.value = false
}

onMounted(() => {
  fetchPictureDetail()
  fetchData()
})


// 卡片悬停状态管理
const hoveredCardId = shallowRef<string | null>(null)

const handleMouseEnter = (id: string) => {
  hoveredCardId.value = id
}

const handleMouseLeave = (id: string) => {
  if (hoveredCardId.value === id) {
    hoveredCardId.value = null
  }
}

const isHovered = (id: string) => {
  return hoveredCardId.value === id
}

const doClickPicture = (item: API.ImageSearchResult) => {
  window.open(item.fromUrl, "_blank")
}

</script>

<style scoped>
#search-picture-page {
  padding: 0 3%;
  /* margin-bottom: 20px; */
  overflow: hidden;
}

#search-picture-title {
  margin-bottom: 0;
  font-size: 28px;
  align-items: center;
  line-height: 60px;
}
</style>



<style>
#search-picture-page .custom-card-item {
  padding: 0 !important;
  margin: 12px;
  border-radius: 6px; /* 添加圆角 */
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16); /* 优化阴影效果 */
  transition: all 0.3s ease;
  cursor: pointer;
}

#search-picture-page .custom-card-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32); /* 悬停时增强阴影 */
  transform: translateY(-2px);
  cursor: pointer;
}

#search-picture-page .card-container {
  position: relative;
  width: 100%;
  max-height: 330px;
  /* height: 330px; */
  /* height: 330px; 统一图片高度 */
  /* object-fit: cover; 关键属性：保持比例并覆盖容器 */
  object-position: center; /* 图片居中显示 */
  overflow: hidden;
}

#search-picture-page .card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  cursor: pointer;
}

#search-picture-page .card-container:hover .card-image {
  transform: scale(1.05);
  cursor: pointer;
}

#search-picture-page .card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  padding: 16px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  cursor: pointer;
}

#search-picture-page .card-overlay.visible {
  opacity: 1;
  transform: translateY(0);
  cursor: pointer;
  user-select: none;
}


#search-picture-page .item-tag {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  border: none !important;
  cursor: default;
}
</style>