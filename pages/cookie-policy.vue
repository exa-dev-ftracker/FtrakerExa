<script setup lang="ts">
useHead({
  title: 'Cookie Policy - FTraker',
  meta: [
    { name: 'description', content: 'Learn how FTraker uses cookies to enhance your experience.' },
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
      <div class="absolute bottom-[-10%] right=[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
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
          <h1 class="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">Cookie Policy</h1>
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
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">1. What Are Cookies?</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Cookies are small pieces of text stored on your device when you visit our Service. They help us recognize you, remember your preferences, and understand how you use FTraker. Cookies may be "persistent" cookies or "session" cookies.
            </p>
          </Motion>

          <!-- Section 2 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.4 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">2. Types of Cookies We Use</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              We use the following types of cookies:
            </p>
            <ul class="list-disc list-inside space-y-3 text-gray-600 dark:text-gray-300">
              <li><strong class="text-gray-700 dark:text-gray-200">Essential Cookies:</strong> Required for the Service to function properly. These cannot be disabled.</li>
              <li><strong class="text-gray-700 dark:text-gray-200">Performance Cookies:</strong> Help us understand how users interact with our Service to improve performance.</li>
              <li><strong class="text-gray-700 dark:text-gray-200">Functional Cookies:</strong> Remember your preferences and choices to provide a personalized experience.</li>
              <li><strong class="text-gray-700 dark:text-gray-200">Analytics Cookies:</strong> Help us analyze usage patterns and improve our Service.</li>
            </ul>
          </Motion>

          <!-- Section 3 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.5 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">3. Third-Party Cookies</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              We may allow third-party service providers to place cookies on your device for analytics, advertising, and other purposes. These third parties have their own privacy policies governing the use of cookies.
            </p>
          </Motion>

          <!-- Section 4 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.6 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">4. Managing Cookies</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Most web browsers allow you to control cookies through their settings. You can typically find these settings under:
            </p>
            <ul class="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li><strong class="text-gray-700 dark:text-gray-200">Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong class="text-gray-700 dark:text-gray-200">Firefox:</strong> Preferences → Privacy & Security → Cookies and Site Data</li>
              <li><strong class="text-gray-700 dark:text-gray-200">Safari:</strong> Preferences → Privacy → Cookies and website data</li>
              <li><strong class="text-gray-700 dark:text-gray-200">Edge:</strong> Settings → Privacy, search, and services → Clear browsing data</li>
            </ul>
          </Motion>

          <!-- Section 5 -->
          <Motion 
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.7 }"
            class="space-y-4"
          >
            <h2 class="text-3xl font-black text-gray-900 dark:text-white tracking-tight">5. Do Not Track</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
              Some browsers include a Do Not Track (DNT) feature. Our Service does not respond to DNT signals, but we respect your privacy choices and provide cookie controls as described in this policy.
            </p>
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
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl">
              <p class="text-gray-700 dark:text-gray-300 font-black">FTraker Support</p>
              <p class="text-gray-600 dark:text-gray-400">Email: cookies@ftraker.app</p>
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
