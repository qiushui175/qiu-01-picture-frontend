import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/**
 * 存储登录用户信息
 */
export const useLoginUserStore = defineStore('login', () => {
  // 定义初始值
  const loginUser = ref<any>({
    userName: '未登录',
  })

  async function fetchLoginUser() {}
  function setLoginUser(user: any) {
    loginUser.value = user
  }

  // 返回
  return { loginUser, setLoginUser, fetchLoginUser}
})
