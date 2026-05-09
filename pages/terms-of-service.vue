<script setup lang="ts">
useHead({
  title: 'Terms of Service - FTraker',
  meta: [
    { name: 'description', content: 'Read FTrakers terms of service and conditions of use.' },
  ],
})

definePageMeta({
  layout: false
})
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#030712] selection:bg-blue-500 selection:text-white overflow-x-hidden">
    <!-- Animated Background -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <!-- Navbar -->
    <header class="fixed top-0 w-full bg-white/70 dark:bg-[#030712]/70 backdrop-blur-xl z-50 border-b border-gray-200/50 dark:border-gray-800/50">
      <div class="container mx-auto px-6 h-20 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity">
          <div class="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <UIcon name="i-heroicons-moon-20-solid" class="w-6 h-6 text-white" />
          </div>
          <span class="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tighter">FTraker<span class="text-blue-600">.</span></span>
        </NuxtLink>
        <NuxtLink to="/" class="text-sm font-black text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors">← Back to Home</NuxtLink>
      </div>
    </header>

    <!-- Content -->
    <main class="relative pt-32 pb-24 px-6 overflow-visible">
      <div class="container mx-auto max-w-3xl relative z-10">
        <Motion 
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2 }"
          class="mb-16"
        >
          <h1 class="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Terms of Service</h1>
          <p class="text-gray-500 dark:text-gray-400 font-medium">Last updated: May 10, 2026</p>
        </Motion>

        <div class="prose prose-invert max-w-none space-y-12">
          <!-- Section 1 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.3 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">1. Agreement to Terms</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              By accessing and using the FTraker application and website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </Motion>

          <!-- Section 2 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.4 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">2. License</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              FTraker grants you a limited, non-exclusive, non-transferable license to use the Service for your personal, non-commercial use only. You may not copy, modify, distribute, or otherwise exploit the Service without our written permission.
            </p>
          </Motion>

          <!-- Section 3 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.5 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">3. Disclaimer of Warranties</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              THIS SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. FTRAKER MAKES NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, AS TO THE OPERATION OF THIS SERVICE OR THE INFORMATION, CONTENT, OR MATERIALS INCLUDED ON THIS SERVICE.
            </p>
          </Motion>

          <!-- Section 4 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.6 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">4. Limitation of Liability</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              IN NO EVENT SHALL FTRAKER OR ITS SUPPLIERS BE LIABLE FOR ANY DAMAGES (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS OF DATA OR PROFIT) ARISING OUT OF THE USE OR INABILITY TO USE THE MATERIALS ON FTRAKER'S SERVICE.
            </p>
          </Motion>

          <!-- Section 5 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.7 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">5. User Responsibilities</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              You agree to:
            </p>
            <ul class="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Use the Service only for lawful purposes and in a way that does not infringe upon the rights of others or restrict their use and enjoyment of the Service</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Not engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
            </ul>
          </Motion>

          <!-- Section 6 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.8 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">6. Contact Us</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl">
              <p class="text-gray-700 dark:text-gray-300 font-black">FTraker Support</p>
              <p class="text-gray-600 dark:text-gray-400">Email: support@ftraker.app</p>
              <p class="text-gray-600 dark:text-gray-400">Website: www.ftraker.app</p>
            </div>
          </Motion>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-12 px-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#030712]">
      <div class="container mx-auto text-center">
        <p class="text-gray-500 dark:text-gray-400 font-black text-sm">&copy; {{ new Date().getFullYear() }} FTraker. Built for financial freedom.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.prose {
  color: inherit;
}

.prose h2 {
  margin-top: 2rem;
}
</style>
