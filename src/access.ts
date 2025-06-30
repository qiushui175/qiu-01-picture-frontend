// 在这里进行全局权限控制

import { message } from "ant-design-vue";
import router from "./router";
import { useLoginUserStore } from "./stores/useLoginUserStore";

let firstFetchUser = true;

router.beforeEach(async (to, from, next) => {
  // 这里进行权限控制
  const loginUserStore = useLoginUserStore();
  let loginUser = loginUserStore.loginUser;
  if (firstFetchUser) {
    await loginUserStore.fetchLoginUser();
    loginUser = loginUserStore.loginUser;
    firstFetchUser = false;
  }
  const toUrl = to.fullPath;
  // 权限控制
  if (toUrl.startsWith('/admin')) {
    if(!loginUser || loginUser.userRole !== 'admin'){
      message.error('没有权限访问该页面');
      next('/user/login?redirect=' + toUrl);
      return;
    }
  }
  // 正常跳转
  next();
})