import { message } from 'ant-design-vue';
import axios from 'axios';
import { SYSTEM_BASE_URL } from './constants/systemConfig';

// 创建实例
const myAxios = axios.create({
  // 如果后续要用生成代码，则这里不需要加api前缀
  baseURL: 'http://' + SYSTEM_BASE_URL,
  timeout: 60000,
  withCredentials: true,
});

axios.interceptors.request.use(
  (config) => {
    // 在发送请求之前做某事
    return config;
  },
  (error) => {
    // 请求错误时做些事
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    // 例如在此处处理异常错误码

    if (response.data.code === 40100) {
      if(
        !response.request.responseURL.includes('user/get/login') &&
        !window.location.pathname.includes('/user/login')
      ){
        message.error('登录已失效，请重新登录');
        window.location.href = `/user/login?redirect=${window.location.href}`;
      }
    }

    return response;
  },
  (error) => {
    // 请求错误时做些事
    return Promise.reject(error);
  },
);

export default myAxios;
