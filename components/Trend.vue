<script setup lang="ts">
const props = defineProps<{
  title: string
  amount: number
  lastAmount: number
  loading: boolean
  type: string
  selectedView: string
  periode: string
}>()

const trendingUp = computed(() => {
  if (props.lastAmount === props.amount) {
    return true
  }
  if (props.type !== 'Income') {
    return props.amount < props.lastAmount
  } else {
    return props.amount > props.lastAmount
  }
})
const icon = computed(() => {
  if (trendingUp.value) {
    return props.type === 'Income' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'
  } else {
    return props.type === 'Income' ? 'i-heroicons-arrow-trending-down' : 'i-heroicons-arrow-trending-up'
  }
})


const percentage = computed(() => {
  if (props.lastAmount === props.amount) {
    return 0
  }
  if (props.lastAmount === 0) {
    return 100
  }
  const ratio = ((props.amount - props.lastAmount) / props.lastAmount) * 100
  return Math.ceil(ratio)
})

const allView = computed(() => {
  return props.selectedView === 'All'
})

const color = computed(() => {
  if (allView.value) {
    return 'white'
  }
  return trendingUp.value ? 'green' : 'red'
})

</script>

<template>
  <div>
    <div class="font-bold" :class="[color]">{{ title }}</div>
    <div class="text-2xl font-extrabold text-black dark:text-white mb-2">
      <USkeleton class="h-8 w-full" v-if="loading"/>
      <span v-else>{{ currency(amount) }}</span>
    </div>
    <div v-if="!allView">
      <USkeleton class="h-8 w-full" v-if="loading"/>
      <div v-else class="flex items-center space-x-1 text-sm">
        <UIcon :name="icon" class="w-6 h-6" :class="[color]"/>
        <span class="text-gray-500 dark:text-gray-400 ">{{ percentage }}% vs last {{ periode }}</span>
      </div>
    </div>
  </div>
</template>

<style scope>
.green {
  @apply text-green-600 dark:text-green-400;
}

.red {
  @apply text-red-600 dark:text-red-400;
}

.white {
  @apply dark:text-white text-black;
}
</style>