<script setup lang="ts">
</script>

<template>
  <div
    class="fixed inset-0 z-[9999] bg-white dark:bg-[#030712] flex flex-col items-center justify-center"
  >
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] animate-pulse"
      ></div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px] animate-pulse"
        style="animation-delay: 2s"
      ></div>
    </div>

    <div class="relative w-20 h-20">
      <div
        class="absolute inset-0 rounded-2xl border-[3px] border-transparent border-t-blue-500 border-r-purple-500 animate-spin"
      ></div>
      <div
        class="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25"
      >
        <UIcon name="i-heroicons-bolt" class="w-12 h-12 text-white" />
      </div>
    </div>

    <div class="mt-6 text-center">
      <h1
        class="text-3xl font-black tracking-tighter text-gray-900 dark:text-white"
      >
        FTraker<span class="text-blue-600">.</span>
      </h1>
      <p
        class="mt-4 text-xs font-black uppercase tracking-[0.3em] text-blue-600/60 dark:text-blue-400/40"
      >
        Loading
      </p>
    </div>

    <div class="mt-6 flex items-center gap-2">
      <div
        v-for="i in 3"
        :key="i"
        class="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"
        :style="{
          animationDelay: `${i * 0.3}s`,
          animationDuration: '1.2s',
        }"
      ></div>
    </div>
  </div>
</template>
