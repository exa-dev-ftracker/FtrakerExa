<script setup lang="ts">
useHead({
  title: 'Help & Support - FTraker',
  meta: [
    { name: 'description', content: 'Contact FTraker support team and find answers to frequently asked questions.' },
  ],
})

definePageMeta({
  layout: false
})

const faqs = [
  {
    q: 'How do I permanently delete my account and data?',
    a: 'You can delete your account at any time directly in the mobile app by going to Settings > Danger Zone > Permanently Delete Account. This immediately and irreversibly removes all your transactions, categories, and personal profile from our servers. You can also email us at support@eka-dev.cloud from your registered email address to request manual deletion.',
  },
  {
    q: 'How does offline mode and synchronization work?',
    a: 'FTraker is built offline-first. When you have no internet access, all income, expense entries, and category modifications are securely saved to your local device storage. Once an active connection is restored, the app automatically reconciles and syncs your local changes with our cloud servers.',
  },
  {
    q: 'How is my financial data protected?',
    a: 'All data transmissions between your device and our servers are encrypted using industry-standard TLS 1.3 / HTTPS. We do not sell or rent personal financial data to third-party advertisers. You can also enable Biometric Lock (Face ID / Fingerprint) in the app settings for device-level security.',
  },
  {
    q: 'How does receipt scanning work?',
    a: 'When you photograph a receipt using the in-app scanner, optical character recognition (OCR) analyzes the text locally or securely through our OCR pipeline to detect transaction dates, amounts, and merchant names, saving you from manual data entry.',
  },
  {
    q: 'I forgot my password. How can I reset it?',
    a: 'On the login screen, click "Forgot Password", enter your registered email address, and follow the instructions sent to your inbox to securely reset your credentials.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#030712] selection:bg-blue-500 selection:text-white overflow-x-hidden">
    <!-- Animated Background Gradients -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px] animate-pulse" style="animation-delay: 2s"></div>
    </div>

    <!-- Top Navigation Bar -->
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

    <!-- Main Content -->
    <main class="relative pt-32 pb-24 px-6 overflow-visible">
      <div class="container mx-auto max-w-4xl relative z-10">
        <!-- Page Title & Header -->
        <Motion 
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.1 }"
          class="text-center mb-16"
        >
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider mb-4">
            Help & Customer Support
          </div>
          <h1 class="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">
            We're here to help you.
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Got a question about F-Tracker, need help with your account, or want to report an issue? Check our guides below or reach out to our team.
          </p>
        </Motion>

        <!-- Quick Contact Channels Cards -->
        <Motion 
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2 }"
          class="grid sm:grid-cols-2 gap-6 mb-16"
        >
          <!-- Email Support Card -->
          <div class="bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800 p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                <UIcon name="i-heroicons-envelope-20-solid" class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-black text-gray-900 dark:text-white mb-2">Direct Email Support</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Send our dedicated support team an inquiry. We typically reply within 24-48 business hours.
              </p>
            </div>
            <a 
              href="mailto:support@eka-dev.cloud?subject=F-Tracker%20Support%20Request"
              class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
            >
              <UIcon name="i-heroicons-paper-airplane-20-solid" class="w-4 h-4" />
              Email support@eka-dev.cloud
            </a>
          </div>

          <!-- Official Portal Card -->
          <div class="bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800 p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-6">
                <UIcon name="i-heroicons-globe-alt-20-solid" class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-black text-gray-900 dark:text-white mb-2">Web Application Portal</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                Access your dashboard, manage transactions, and review settings from any web browser.
              </p>
            </div>
            <NuxtLink 
              to="/login"
              class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold text-sm transition-colors"
            >
              Open Web App
              <UIcon name="i-heroicons-arrow-right-20-solid" class="w-4 h-4" />
            </NuxtLink>
          </div>
        </Motion>

        <!-- FAQs Section -->
        <Motion 
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.3 }"
          class="space-y-6 mb-16"
        >
          <div class="border-b border-gray-200 dark:border-gray-800 pb-4 mb-8">
            <h2 class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Find quick answers to common questions about accounts, privacy, and features.
            </p>
          </div>

          <div class="space-y-4">
            <div 
              v-for="(item, idx) in faqs" 
              :key="idx"
              class="bg-white dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800/80 p-6 rounded-2xl"
            >
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {{ item.q }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ item.a }}
              </p>
            </div>
          </div>
        </Motion>

        <!-- Legal References Banner -->
        <Motion 
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.4 }"
          class="p-8 rounded-3xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 text-center"
        >
          <h3 class="text-xl font-black text-gray-900 dark:text-white mb-2">
            Looking for Legal & Policy Information?
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
            Review how we protect your personal financial records and the terms governing our mobile and web applications.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 text-sm font-bold">
            <NuxtLink to="/privacy-policy" class="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</NuxtLink>
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <NuxtLink to="/terms-of-service" class="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</NuxtLink>
            <span class="text-gray-300 dark:text-gray-700">•</span>
            <NuxtLink to="/cookie-policy" class="text-blue-600 dark:text-blue-400 hover:underline">Cookie Policy</NuxtLink>
          </div>
        </Motion>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-12 px-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#030712]">
      <div class="container mx-auto text-center">
        <p class="text-gray-500 dark:text-gray-400 font-black text-sm">&copy; {{ new Date().getFullYear() }} FTraker (f-tracker.eka-dev.cloud). Built for financial freedom.</p>
      </div>
    </footer>
  </div>
</template>
