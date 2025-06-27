import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserUsingGet } from '@/api/userController'

/**
 * 存储登录用户信息
 */
export const useLoginUserStore = defineStore('login', () => {
  // 定义初始值
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  async function fetchLoginUser() {
    const { data } = await getLoginUserUsingGet()
    if (data.code === 0 && data.data) {
      loginUser.value = data.data
    }
  }
  function setLoginUser(user: API.LoginUserVO) {
    loginUser.value = user
  }

  // 返回
  return { loginUser, setLoginUser, fetchLoginUser }
})
