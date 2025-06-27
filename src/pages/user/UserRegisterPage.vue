<template>
  <div id="userLoginPage">
    <h2 class="title">秋水云图库-用户注册</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入您的账号' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" />
      </a-form-item>

      <a-form-item
        name="password"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码长度不能少于8位' },
        ]"
      >
        <a-input-password v-model:value="formState.password" placeholder="请确认您的密码" />
      </a-form-item>

      <a-form-item
        name="checkPassword"
        :rules="[
          { required: true, message: '请确认密码' },
          { min: 8, message: '密码长度不能少于8位' },
          { validator: validatePasswordMatch, trigger: 'blur' },
        ]"
      >
        <a-input-password v-model:value="formState.checkPassword" placeholder="请输入您的密码" />
      </a-form-item>

      <div class="tips">
        已有账号？
        <RouterLink to="/user/login">立即登录</RouterLink>
      </div>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { userRegisterUsingPost } from '@/api/userController'
import { reactive } from 'vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { message } from 'ant-design-vue'
import router from '@/router'
import type { Rule } from 'ant-design-vue/es/form'

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  password: '',
  checkPassword: '',
})

const validatePasswordMatch = (_rule: Rule, value: string) => {
  if (!value) {
    return Promise.reject('请确认密码')
  }
  if (value !== formState.password) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}

// 获取全局的注册用户信息
const loginUserStore = useLoginUserStore()

const handleSubmit = async (value: any) => {
  const { data } = await userRegisterUsingPost(value)
  if (data.code === 0 && data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error(data.message || '注册失败')
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
