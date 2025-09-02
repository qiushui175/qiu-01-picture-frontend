// 在这里进行全局权限控制

import { message } from "ant-design-vue";
import router from "./router";
import { useLoginUserStore } from "./stores/useLoginUserStore";

let firstFetchUser = true;

router.beforeEach(async (to, from, next) => {
  // 获取登录用户状态
  const loginUserStore = useLoginUserStore();
  let loginUser = loginUserStore.loginUser;
  
  // 首次加载时获取用户信息
  if (firstFetchUser) {
    await loginUserStore.fetchLoginUser();
    loginUser = loginUserStore.loginUser;
    firstFetchUser = false;
  }
  
  const toUrl = to.fullPath;
  
  // 1. 管理员权限控制 - 访问/admin路径需要管理员权限
  if (toUrl.startsWith('/admin')) {
    // 未登录（没有id）或非管理员
    if (!loginUser.id || loginUser.userRole !== 'admin') {
      message.error('没有权限访问该页面，需要管理员权限');
      
      // 如果未登录（没有id），跳转到登录页并记录原路径
      if (!loginUser.id) {
        loginUserStore.setRedirectPath(toUrl);
        next(`/user/login?redirect=${toUrl}`);
      } else {
        // 已登录但非管理员，跳转到主页
        next('/');
      }
      return;
    }
  }
  
  // 2. 登录权限控制 - 需要登录的页面
  if (to.meta.requiresAuth && !loginUser.id) {
    // 记录当前想要访问的路径
    loginUserStore.setRedirectPath(toUrl);
    // 跳转到登录页并携带redirect参数
    next(`/user/login?redirect=${toUrl}`);
    return;
  }
  
  // 3. 正常跳转
  next();
});
    