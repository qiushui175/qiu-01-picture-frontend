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
    <!-- <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl:4}"
      :data-source="dataList"
      :pagination="pagination"
      :loading="loading"
    >
      <template #renderItem="{ item }">
        <a-list-item class="custom-card-item">
          <div
            class="card-container"
            @mouseenter="handleMouseEnter(item.id)"
            @mouseleave="handleMouseLeave(item.id)"
            @click="doClickPicture(item)"
          >
            <img :alt="item.name" :src="item.thumbnailUrl ?? item.url" class="card-image" />

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
    </a-list> -->

    <!-- 新组件替代原始写法 -->
    <PictureList :dataList="dataList" :loading="loading" :showSearch="true"></PictureList>
    <!-- 分页器 -->
    <a-pagination
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
      style="text-align: right;"
    ></a-pagination>
  </div>
</template>

<script setup lang="ts">
import {
  listPictureTagCategoryUsingPost,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import PictureList from '@/components/PictureList.vue'
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
const onPageChange = (page: number, pageSize: number) => {
  searchParams.pageSize = pageSize
  searchParams.current = page
  fetchData()
}

const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    onChange: onPageChange,
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
</style>

<style scoped>
#homePage {
  padding: 0 1%;
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
