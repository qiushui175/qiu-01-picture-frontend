<template>
  <div id="pictureList">
    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }"
      :data-source="props.dataList"
      :loading="props.loading"
      class="picture-list"
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
            <img :alt="item.name" :src="item.thumbnailUrl ?? item.url" class="card-image" />

            <div class="card-overlay" :class="{ visible: isHovered(item.id) }">
              <div class="card-content">
                <h3 class="card-title">{{ item.name }}</h3>
                <a-flex justify="space-between">
                  <div class="card-tags">
                    <a-tag color="green" class="category-tag">
                      {{ item.category ?? '默认' }}
                    </a-tag>
                    <a-tag v-for="tag in item.tags" :key="tag" class="item-tag">
                      {{ tag }}
                    </a-tag>
                  </div>

                  <!-- 编辑和删除按钮 -->
                  <div class="card-actions" v-if="props.showOp">
                    <a-space>
                      <a-button size="small" type="primary" @click="(e) => doEdit(e, item)">
                        编辑
                      </a-button>
                      <a-button size="small" danger @click.stop="(e) => doDelete(e, item)">
                        删除
                      </a-button>
                    </a-space>
                  </div>
                </a-flex>
              </div>
            </div>
          </div>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { deletePictureUsingPost } from '@/api/pictureController'

// const dataList = ref<API.PictureVO[]>([])
// const loading = ref(true)

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  refresh?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
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

// 编辑
const doEdit = (e, picture: API.PictureVO) => {
  e.stopPropagation()
  router.push({
    path: '/edit_picture',
    query: { id: picture.id },
  })
}

// 删除
const doDelete = async (e, picture: API.PictureVO) => {
  e.stopPropagation()

  const id = picture.id
  if (!id) {
    message.error('图片信息获取失败')
    return
  }

  const { data: resData } = await deletePictureUsingPost({ id })

  if (resData.code === 0) {
    message.success('删除成功')
  } else {
    message.error('删除失败')
  }

  props.refresh && props.refresh()
}
</script>

<style>
#pictureList .custom-card-item {
  padding: 0 !important;
  margin: 12px;
  border-radius: 6px; /* 添加圆角 */
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16); /* 优化阴影效果 */
  transition: all 0.3s ease;
  cursor: pointer;
}

#pictureList .custom-card-item:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32); /* 悬停时增强阴影 */
  transform: translateY(-2px);
  cursor: pointer;
}

#pictureList .card-container {
  position: relative;
  width: 100%;
  height: 330px; /* 统一图片高度 */
  object-fit: cover; /* 关键属性：保持比例并覆盖容器 */
  object-position: center; /* 图片居中显示 */
  overflow: hidden;
}

#pictureList .card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  cursor: pointer;
}

#pictureList .card-container:hover .card-image {
  transform: scale(1.05);
  cursor: pointer;
}

#pictureList .card-overlay {
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

#pictureList .card-overlay.visible {
  opacity: 1;
  transform: translateY(0);
  cursor: pointer;
  user-select: none;
}

#pictureList .card-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
  cursor: default;
}

#pictureList .card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  user-select: none;
  cursor: default;
}

#pictureList .category-tag {
  margin-right: 4px;
  user-select: none;
  cursor: default;
}

#pictureList .item-tag {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  border: none !important;
  cursor: default;
}
</style>
