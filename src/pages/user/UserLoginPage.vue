<template>
  <div id="userLoginPage">
    <h2 class="title">秋水云图库-用户登录</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item
        label="账号"
        name="userAccount"
        :rules="[{ required: true, message: '请输入您的账号' }]"
      >
        <a-input v-model:value="formState.userAccount" placeholder="请输入您的账号" />
      </a-form-item>

      <a-form-item
        label="密码"
        name="password"
        :rules="[
          { required: true, message: '请输入您的密码' },
          { min: 8, message: '密码长度不能少于8位' },
        ]"
      >
        <a-input-password v-model:value="formState.password" placeholder="请输入您的密码" />
      </a-form-item>

      <div class="tips">
        没有账号？
        <RouterLink to="/user/register">立即注册</RouterLink>
      </div>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">登录</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { userLoginUsingPost } from '@/api/userController'
import { reactive } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import router from '@/router'
import { useRoute } from 'vue-router'

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  password: '',
})

// 获取全局的登录用户信息
const loginUserStore = useLoginUserStore()
const route = useRoute()
const handleSubmit = async (value: any) => {
  const { data } = await userLoginUsingPost(value)
  if (data.code === 0 && data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')

    // 获取需要跳转的路径，优先级：路由参数中的redirect > 存储的路径 > 主页
    const redirectPath = route.query.redirect || loginUserStore.redirectPath || '/'

    // 跳转到目标页面
    router.push({
      path: redirectPath as string,
      replace: true,
    })

    // 重置跳转路径
    loginUserStore.setRedirectPath('')
  } else {
    message.error(data.message || '登录失败')
  }
}
</script>

<style scoped>
#userLoginPage {
  max-width: 360px;
  margin: 0 auto;
}

.title {
  text-align: center;
  margin-bottom: 16px;
}

.desc {
  color: #bbb;
  text-align: center;
  margin-bottom: 16px;
}

.tips {
  color: #aaa;
  text-align: right;
  font-size: 13px;
  margin-bottom: 16px;
}
</style>
