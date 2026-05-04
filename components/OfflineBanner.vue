<template>
  <Transition
    enter-active-class="transition duration-300"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-300"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div v-if="!isOnline" class="fixed bottom-0 left-0 right-0 bg-red-500 text-white py-3 px-4 shadow-lg z-50">
      <div class="flex items-center justify-between max-w-4xl mx-auto">
        <div class="flex items-center gap-3">
          <span class="text-xl">📡</span>
          <span class="font-medium">You are offline - Limited functionality available</span>
        </div>
        <span class="text-sm opacity-75">Cached data only</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { isOnline } = useOnline();
</script>
