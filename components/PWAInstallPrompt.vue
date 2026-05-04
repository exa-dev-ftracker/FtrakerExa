<template>
  <div v-if="showInstallPrompt" class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-50">
    <div class="flex items-start gap-4">
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900">Install FTraker</h3>
        <p class="text-sm text-gray-600 mt-1">
          Install FTraker on your device for quick access and offline support.
        </p>
      </div>
      <button
        @click="dismissPrompt"
        class="text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>
    <div class="flex gap-2 mt-4">
      <button
        @click="dismissPrompt"
        class="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Not Now
      </button>
      <button
        @click="installApp"
        class="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Install
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)
let deferredPrompt: any = null

onMounted(() => {
  if (typeof window !== 'undefined') {
    deferredPrompt = (window as any).deferredPrompt

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      showInstallPrompt.value = false
    }
  }
})

const installApp = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to install prompt: ${outcome}`)
    deferredPrompt = null
    showInstallPrompt.value = false
  }
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
}

// Show prompt after user interacts with the app
onMounted(() => {
  if (typeof window !== 'undefined' && deferredPrompt) {
    setTimeout(() => {
      showInstallPrompt.value = true
    }, 3000)
  }
})
</script>
