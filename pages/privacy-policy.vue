<script setup lang="ts">
useHead({
  title: 'Privacy Policy - FTraker',
  meta: [
    { name: 'description', content: 'Read FTrakers privacy policy to understand how we protect your data.' },
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
          <h1 class="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Privacy Policy</h1>
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
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">1. Introduction</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              FTraker ("we", "our", "us" or "Company") operates the FTraker.app website and mobile application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
          </Motion>

          <!-- Section 2 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.4 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">2. Information Collection and Use</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <ul class="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Personal Data: Email address, name, and other information you provide</li>
              <li>Financial Data: Transaction information and banking credentials (encrypted)</li>
              <li>Usage Data: How you interact with our Service</li>
              <li>Device Information: Browser type, IP address, and device information</li>
            </ul>
          </Motion>

          <!-- Section 3 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.5 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">3. Security of Data</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </Motion>

          <!-- Section 4 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.6 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">4. Changes to This Privacy Policy</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
            </p>
          </Motion>

          <!-- Section 5 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.7 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">5. Contact Us</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl">
              <p class="text-gray-700 dark:text-gray-300 font-black">FTraker Support</p>
              <p class="text-gray-600 dark:text-gray-400">Email: privacy@ftraker.app</p>
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
