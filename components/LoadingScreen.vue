<script setup lang="ts">
</script>

<template>
  <div
    class="fixed inset-0 z-[9999] bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-[#030712] dark:via-[#050b1a] dark:to-[#0a0f1f] flex flex-col items-center justify-center"
  >
    <div class="relative flex flex-col items-center">
      <div class="relative">
        <div
          class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-logo-pulse"
        >
          <UIcon name="i-heroicons-bolt" class="w-10 h-10 text-white" />
        </div>
      </div>

      <div class="mt-6 text-center">
        <h1
          class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-blue-700 to-gray-900 dark:from-white dark:via-blue-400 dark:to-white bg-clip-text text-transparent"
        >
          FTraker
        </h1>
      </div>
    </div>

    <div class="absolute bottom-12 left-1/2 -translate-x-1/2 w-32">
      <div class="h-0.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          class="h-full w-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-loading-bar"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-logo-pulse {
  animation: logoPulse 2s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.85;
  }
}

.animate-loading-bar {
  animation: loadingBar 1.5s ease-in-out infinite;
}

@keyframes loadingBar {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
