<template>
  <div id="basic-layout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header"> <GlobalHeader></GlobalHeader></a-layout-header>
      <a-layout>
        <GlobalSider class="sider"></GlobalSider>
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>
      <a-layout-footer class="footer">
        <a href="" target="_blank">秋水云图 by 秋水</a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
</script>

<style scoped>
#basic-layout .header {
  background-color: white;
  color: unset;
  margin-bottom: 1px;
}

#basic-layout .content {
  padding: 28px;
  background: linear-gradient(to bottom, #f5f5f5, #fff);
  margin-bottom: 28px;
}

#basic-layout .footer {
  background-color: #efefef;
  padding: 10px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}

#basic-layout .sider {
  background: #fff;
}

/* #basic-layout :deep(.ant-menu-item){
  
} */

</style>
