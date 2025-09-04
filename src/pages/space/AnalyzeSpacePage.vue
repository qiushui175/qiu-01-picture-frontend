<template>
  <div id="AnalyzeSpacePage">
    <h2 style="margin-bottom: 0;">
      图库分析 - 
      <span v-if="queryAll">全部空间</span>
      <span v-else-if="queryPublic">公共空间</span>
      <span v-else>
        <a :herf="`/space/${spaceId}`" target="_blank">空间id: {{ spaceId }}</a>
      </span>
    </h2>
    <div style="margin-top: 14px;"></div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :md="24">
        <SpaceUsageAnalyze
          :queryAll="queryAll"
          :queryPublic="queryPublic"
          :spaceId="spaceId"
        ></SpaceUsageAnalyze>
      </a-col>

      <a-col :xs="24" :md="24">
        <SpaceUserAnalyze
          :queryAll="queryAll"
          :queryPublic="queryPublic"
          :spaceId="spaceId"
          :isAdmin="isAdmin"
        ></SpaceUserAnalyze>
      </a-col>

      <a-col :xs="24" :md="12">
        <SpaceTagAnalyze
          :queryAll="queryAll"
          :queryPublic="queryPublic"
          :spaceId="spaceId"
        ></SpaceTagAnalyze>
      </a-col>

      <a-col :xs="24" :md="12">
        <SpaceSizeAnalyze
          :queryAll="queryAll"
          :queryPublic="queryPublic"
          :spaceId="spaceId"
        ></SpaceSizeAnalyze>
      </a-col>

      <a-col :xs="24" :md="24">
        <SpaceCategoryAnalyze
          :queryAll="queryAll"
          :queryPublic="queryPublic"
          :spaceId="spaceId"
        ></SpaceCategoryAnalyze>
      </a-col>

      <a-col :xs="24" :md="24" v-if="isAdmin && queryAll">
        <SpaceRankAnalyze></SpaceRankAnalyze>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import SpaceCategoryAnalyze from '@/components/analyze/SpaceCategoryAnalyze.vue'
import SpaceRankAnalyze from '@/components/analyze/SpaceRankAnalyze.vue'
import SpaceSizeAnalyze from '@/components/analyze/SpaceSizeAnalyze.vue'
import SpaceTagAnalyze from '@/components/analyze/SpaceTagAnalyze.vue'
import SpaceUsageAnalyze from '@/components/analyze/SpaceUsageAnalyze.vue'
import SpaceUserAnalyze from '@/components/analyze/SpaceUserAnalyze.vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

// 管理员判断
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser
const isAdmin = computed(() => {
  return loginUser.userRole === 'admin'
})

const route = useRoute()

// 空间id
const spaceId = computed(() => {
  return route.query?.spaceId as string
})

// 是否查询所有空间
const queryAll = computed(() => {
  return !!route.query?.queryAll
})

// 是否查询公共
const queryPublic = computed(() => {
  return !!route.query?.queryPublic
})
</script>

<style scoped>
#AnalyzeSpacePage span{
  margin-bottom: 0;
}
</style>
