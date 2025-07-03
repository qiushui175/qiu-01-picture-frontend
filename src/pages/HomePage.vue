<template>
  <div id="homePage">
    <!-- 搜索框 -->
    <div class="search-bar">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="onSearch"
      />
    </div>

    <!-- 分类和标签筛选 -->
    <a-tabs v-model:active-key="selectCategory" @change="onSearch">
      <a-tab-pane key="all" tab="全部"></a-tab-pane>
      <a-tab-pane v-for="category in categoryList" :key="category" :tab="category"></a-tab-pane>
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签：</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectTagList[index]"
          @change="onSearch"
          style="font-size: 15px"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>

    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }"
      :data-source="dataList"
      :pagination="pagination"
      :loading="loading"
    >
      <!-- 单张图片 -->
      <template #renderItem="{ item }">
        <a-list-item class="custom-card-item">
          <div
            class="card-container"
            @mouseenter="handleMouseEnter(item.id)"
            @mouseleave="handleMouseLeave(item.id)"
            @click="doClickPicture(item)"
          >
            <img :alt="item.name" :src="item.url" class="card-image" />

            <div class="card-overlay" :class="{ visible: isHovered(item.id) }">
              <div class="card-content">
                <h3 class="card-title">{{ item.name }}</h3>
                <div class="card-tags">
                  <a-tag color="green" class="category-tag">
                    {{ item.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in item.tags" :key="tag" class="item-tag">
                    {{ tag }}
                  </a-tag>
                </div>
              </div>
            </div>
          </div>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import {
  listPictureTagCategoryUsingPost,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'

const dataList = ref<API.PictureVO[]>([])
const loading = ref(true)
const total = ref(0)

// 搜索条件
// reactive适用于对象内部属性是否改变，ref适用于对象本身是否改变
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'DESC',
})

// 分页器
const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    onChange: (page: number, pageSize: number) => {
      searchParams.pageSize = pageSize
      searchParams.current = page
      fetchData()
    },
  }
})

// 请求数据
const fetchData = async () => {
  loading.value = true

  // 参数处理
  const params = {
    ...searchParams,
    tags: [] as string[],
  }

  if (selectCategory.value !== 'all') {
    params.category = selectCategory.value
  }

  const cp_taglist = [...tagList.value]
  const filter_taglist = cp_taglist.filter((item, index) => {
    return selectTagList.value[index]
  })

  params.tags = filter_taglist
  // 请求
  const { data: resData } = await listPictureVoByPageUsingPost(params)

  if (resData.code === 0 && resData.data) {
    dataList.value = resData.data.records ?? []
    total.value = Number(resData.data.total) ?? 0
  } else {
    message.error(resData.message || '获取图片列表失败')
  }

  loading.value = false
}

// 在页面加载之后执行
onMounted(() => {
  fetchData()
})

// search事件
const onSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

// 标签和分类列表
const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectCategory = ref('all')
const selectTagList = ref<boolean[]>([])
const listPictureTagCategory = async () => {
  const { data: resData } = await listPictureTagCategoryUsingPost()

  if (resData.code === 0 && resData.data) {
    categoryList.value = resData.data.categoryList ?? []
    tagList.value = resData.data.tagList ?? []
  } else {
    message.error('标签信息创建失败')
  }
}
onMounted(() => {
  listPictureTagCategory()
})

// 点击图片
const router = useRouter()
const doClickPicture = (item: API.PictureVO) => {
  router.push({
    path: `/picture/${item.id}`,
  })
}

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
</script>

<style>
#homePage .search-bar {
  padding: 24px 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 24px;
}

#homePage.tag-bar {
  padding: 16px 0;
}

#homePage .custom-card-item {
  padding: 0 !important;
  margin: 12px;
  border-radius: 6px; /* 添加圆角 */
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16); /* 优化阴影效果 */
  transition: all 0.3s ease;
  cursor: pointer;
}

#homePage .custom-card-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32); /* 悬停时增强阴影 */
  transform: translateY(-2px);
  cursor: pointer;
}

#homePage .card-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

#homePage .card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  cursor: pointer;
}

#homePage .card-container:hover .card-image {
  transform: scale(1.05);
  cursor: pointer;
}

#homePage .card-overlay {
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

#homePage .card-overlay.visible {
  opacity: 1;
  transform: translateY(0);
  cursor: pointer;
  user-select: none;
}

#homePage .card-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
  cursor: default;
}

#homePage .card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  user-select: none;
  cursor: default;
}

#homePage .category-tag {
  margin-right: 4px;
  user-select: none;
  cursor: default;
}

#homePage .item-tag {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  border: none !important;
  cursor: default;
}
</style>

<style scoped>
#homePage {
  padding: 0 3%;
  margin-bottom: 20px;
}

#homePage .search-bar {
  max-width: 480px;
  margin: 0 auto 35px;
}

#homePage .tag-bar {
  margin-bottom: 20px;
  font-size: 16px;
}
</style>
