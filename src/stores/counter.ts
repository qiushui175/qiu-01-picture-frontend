import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  // 定义初始值
  const count = ref(0)
  // 定义计算属性
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  // 返回
  return { count, doubleCount, increment }
})
