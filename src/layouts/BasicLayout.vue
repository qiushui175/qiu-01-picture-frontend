<template>
  <div id="basic-layout">
    <a-layout style="min-height: 100vh">
      <a-layout-header>Header</a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="" target="_blank">秋水云图 by 秋水</a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
#basic-layout .content {
  padding: 20px;
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
</style>
