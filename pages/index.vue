<script setup lang="ts">
useHead({
  title: 'FTraker - Master Your Finances',
  meta: [
    { name: 'description', content: 'Track expenses, manage budgets, and achieve your financial goals with FTraker.' },
  ],
})

definePageMeta({
  layout: false // Disable the default app layout for the landing page
})

const store = useDefaultStore()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 selection:bg-blue-500 selection:text-white">
    <!-- Navbar -->
    <header class="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-800">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-wallet" class="w-8 h-8 text-blue-600" />
          <span class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FTraker</span>
        </div>
        <div class="flex items-center gap-4">
          <NuxtLink v-if="!store.isAuth" to="/login" class="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
            Sign In
          </NuxtLink>
          <NuxtLink v-if="!store.isAuth" to="/register">
            <UButton color="primary">Get Started</UButton>
          </NuxtLink>
          <NuxtLink v-else to="/dashboard">
            <UButton color="primary" trailing-icon="i-heroicons-arrow-right-20-solid">Go to Dashboard</UButton>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 px-4 overflow-hidden relative">
      <!-- Background Decorations -->
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl"></div>
      <div class="absolute top-32 -right-24 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl"></div>
      
      <div class="container mx-auto relative relative z-10 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8 ring-1 ring-inset ring-blue-500/20">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          v1.0 is Live Now
        </div>
        
        <h1 class="text-5xl sm:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl mx-auto leading-tight mb-8">
          The smarter way to <br class="hidden sm:block" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">track your money.</span>
        </h1>
        
        <p class="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
          Stop wondering where your money goes. FTraker gives you the tools to monitor expenses, cut unnecessary subscriptions, and reach your goals.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink v-if="!store.isAuth" to="/register">
            <UButton size="xl" color="primary" trailing-icon="i-heroicons-arrow-right-20-solid" class="w-full sm:w-auto px-8">
              Start For Free
            </UButton>
          </NuxtLink>
          <NuxtLink v-else to="/dashboard">
            <UButton size="xl" color="primary" trailing-icon="i-heroicons-arrow-right-20-solid" class="w-full sm:w-auto px-8">
              Open Dashboard
            </UButton>
          </NuxtLink>
        </div>
      </div>

      <!-- Feature Visuals / Mockup placeholder -->
      <div class="container mx-auto mt-20 max-w-5xl rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl shadow-2xl p-4 overflow-hidden relative">
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 dark:to-gray-900 pointer-events-none"></div>
        <div class="aspect-[16/9] w-full rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center border border-gray-200 dark:border-gray-700">
           <div class="text-center">
             <UIcon name="i-heroicons-chart-bar-square" class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
             <p class="text-gray-500 font-medium">Dashboard Preview</p>
           </div>
        </div>
      </div>
    </main>

    <!-- Social Proof / Logo Cloud -->
    <section class="py-10 border-y border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
      <div class="container mx-auto px-4 text-center">
        <p class="text-sm font-semibold text-gray-500 tracking-widest uppercase mb-8">TRUSTED BY THOUSANDS OF USERS WORLDWIDE</p>
        <div class="flex flex-wrap justify-center gap-10 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <UIcon name="i-logos-vue" class="w-10 h-10 text-gray-400" />
          <UIcon name="i-logos-nuxt-icon" class="w-10 h-10 text-gray-400" />
          <UIcon name="i-logos-tailwindcss-icon" class="w-10 h-10 text-gray-400" />
          <UIcon name="i-logos-whatsapp-icon" class="w-10 h-10 text-gray-400" />
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-24 bg-gray-50 dark:bg-gray-800/20">
      <div class="container mx-auto px-4 max-w-6xl">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">How it works</h2>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">Get your finances in order in just three simple steps.</p>
        </div>
        
        <div class="flex flex-col md:flex-row gap-8 lg:gap-12 relative">
          <!-- Step 1 -->
          <div class="flex-1 relative">
            <div class="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800"></div>
            <div class="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold mb-6 mx-auto relative z-10 shadow-sm border-4 border-white dark:border-gray-900">1</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">Create an Account</h3>
            <p class="text-gray-600 dark:text-gray-400 text-center leading-relaxed">Sign up in seconds. All your data is synced securely to the cloud so you can access it anywhere.</p>
          </div>
          
          <!-- Step 2 -->
          <div class="flex-1 relative">
            <div class="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800"></div>
            <div class="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold mb-6 mx-auto relative z-10 shadow-sm border-4 border-white dark:border-gray-900">2</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">Log Your Expenses</h3>
            <p class="text-gray-600 dark:text-gray-400 text-center leading-relaxed">Add transactions manually via the app or instantly by sending a chat to our WhatsApp Bot.</p>
          </div>
          
          <!-- Step 3 -->
          <div class="flex-1 relative">
            <div class="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl font-bold mb-6 mx-auto relative z-10 shadow-sm border-4 border-white dark:border-gray-900">3</div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">Gain Insights</h3>
            <p class="text-gray-600 dark:text-gray-400 text-center leading-relaxed">Watch your dashboard update in real time. Spot trends, cut waste, and grow your savings.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div class="container mx-auto px-4 max-w-6xl">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Everything you need to succeed</h2>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">Simple, powerful tools for your financial journey.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Card 1 -->
          <div class="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-chart-pie" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Clear Analytics</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">Visualize your spending patterns across different categories. Our intuitive charts make it easy to see where your money goes.</p>
          </div>

          <!-- Card 2 -->
          <div class="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-bolt" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Fast Data Entry</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">We know time is money. That's why adding new transactions takes just a couple of taps, whether you're on phone or desktop.</p>
          </div>

          <!-- Card 3 -->
          <div class="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-lock-closed" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Privacy First</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">No tracking, no sharing. Your financial data is securely encrypted and belongs 100% to you. Peace of mind included.</p>
          </div>

          <!-- Card 4 -->
          <div class="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-chat-bubble-oval-left-ellipsis" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">WhatsApp Bot</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">Too lazy to open the app? Just text our WhatsApp bot "spent 50k on coffee" and we'll record it for you automatically.</p>
          </div>

          <!-- Card 5 -->
          <div class="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-device-phone-mobile" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Install Anywhere (PWA)</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">Install FTraker directly to your phone's home screen without using the App Store. Lightweight and fast.</p>
          </div>

          <!-- Card 6 -->
          <div class="p-8 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-xl flex items-center justify-center mb-6">
              <UIcon name="i-heroicons-arrow-path-rounded-square" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Real-time Sync</h3>
            <p class="text-gray-600 dark:text-gray-400 leading-relaxed">Update a transaction on your phone and see it instantly reflect on your desktop dashboard. Always in sync.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonial Section -->
    <section class="py-24 bg-blue-600 dark:bg-blue-900 overflow-hidden relative">
      <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div class="container mx-auto px-4 relative z-10 text-center max-w-4xl">
        <UIcon name="i-heroicons-star-solid" class="w-8 h-8 text-yellow-400 inline-block mb-1" />
        <UIcon name="i-heroicons-star-solid" class="w-8 h-8 text-yellow-400 inline-block mb-1" />
        <UIcon name="i-heroicons-star-solid" class="w-8 h-8 text-yellow-400 inline-block mb-1" />
        <UIcon name="i-heroicons-star-solid" class="w-8 h-8 text-yellow-400 inline-block mb-1" />
        <UIcon name="i-heroicons-star-solid" class="w-8 h-8 text-yellow-400 inline-block mb-1" />
        
        <blockquote class="text-2xl md:text-4xl font-semibold text-white my-8 leading-snug">
          "Since I started using FTraker with their WhatsApp Bot integration, tracking my daily expenses went from a chore to something I don't even think about anymore."
        </blockquote>
        <div class="flex items-center justify-center gap-4">
          <UAvatar src="https://avatars.githubusercontent.com/u/100?v=4" alt="Alex R." size="lg" />
          <div class="text-left">
            <div class="text-white font-bold">Alex R.</div>
            <div class="text-blue-200 text-sm">Freelance Designer</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to action (CTA) Bottom -->
    <section class="py-24 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4 max-w-4xl text-center">
        <h2 class="text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Ready to transform your financial life?</h2>
        <p class="text-xl text-gray-600 dark:text-gray-400 mb-10">Join thousands of users who have saved more and stressed less with FTraker.</p>
        <NuxtLink v-if="!store.isAuth" to="/register">
          <UButton size="xl" color="primary" class="px-10 py-4 text-lg">
            Create Free Account
          </UButton>
        </NuxtLink>
        <NuxtLink v-else to="/dashboard">
          <UButton size="xl" color="primary" class="px-10 py-4 text-lg">
            Go to Dashboard
          </UButton>
        </NuxtLink>
        <p class="mt-4 text-sm text-gray-500">No credit card required. Cancel anytime.</p>
      </div>
    </section>
    
    <!-- Footer -->
    <footer class="py-12 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div class="container mx-auto px-4 max-w-6xl">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div class="col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <UIcon name="i-heroicons-wallet" class="w-6 h-6 text-blue-600" />
              <span class="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FTraker</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400 max-w-xs">Your personal financial companion. Track everywhere, analyze everything.</p>
          </div>
          <div>
            <h4 class="font-bold text-gray-900 dark:text-white mb-4">Product</h4>
            <ul class="space-y-2 text-gray-500 dark:text-gray-400">
              <li><a href="#" class="hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#" class="hover:text-blue-600 transition-colors">Integrations</a></li>
              <li><a href="#" class="hover:text-blue-600 transition-colors">Pricing</a></li>
              <li><a href="#" class="hover:text-blue-600 transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold text-gray-900 dark:text-white mb-4">Legal</h4>
            <ul class="space-y-2 text-gray-500 dark:text-gray-400">
              <li><a href="#" class="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-blue-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" class="hover:text-blue-600 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-gray-500 dark:text-gray-400">&copy; {{ new Date().getFullYear() }} FTraker. All rights reserved.</p>
          <div class="flex items-center gap-4">
            <a href="#" class="text-gray-400 hover:text-gray-900 dark:hover:text-white"><UIcon name="i-mdi-twitter" class="w-5 h-5"/></a>
            <a href="#" class="text-gray-400 hover:text-gray-900 dark:hover:text-white"><UIcon name="i-mdi-github" class="w-5 h-5"/></a>
            <a href="#" class="text-gray-400 hover:text-gray-900 dark:hover:text-white"><UIcon name="i-mdi-discord" class="w-5 h-5"/></a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>