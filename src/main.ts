
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css'

// 权限控制
import '@/access'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Antd);

// 图片编辑组件
// app.use(VueCropper)
// 全局注册组件（关键步骤）
app.component('VueCropper', VueCropper)

app.mount('#app')


