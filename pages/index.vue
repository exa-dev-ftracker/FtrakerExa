<script setup lang="ts">
useHead({
  title: 'FTracker - Smart Finance Tracker',
  meta: [
    { name: 'description', content: 'Track your income and expenses with ease. Get insights into your financial health.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})

const router = useRouter()
const stats = [
  { label: 'Active Users', value: '10K+', icon: 'i-heroicons-users-20-solid' },
  { label: 'Transactions Tracked', value: '500K+', icon: 'i-heroicons-chart-bar-20-solid' },
  { label: 'Total Managed', value: '$50M+', icon: 'i-heroicons-banknotes-20-solid' },
]

const features = [
  {
    title: 'Easy Tracking',
    description: 'Record income and expenses in seconds with our intuitive interface',
    icon: 'i-heroicons-arrow-trending-up-20-solid',
  },
  {
    title: 'Smart Analytics',
    description: 'Get detailed insights into your spending patterns and financial trends',
    icon: 'i-heroicons-chart-pie-20-solid',
  },
  {
    title: 'WhatsApp Integration',
    description: 'Record transactions directly from WhatsApp using natural language',
    icon: 'i-heroicons-chat-bubble-left-20-solid',
  },
  {
    title: 'Real-time Sync',
    description: 'Your data syncs instantly across all your devices',
    icon: 'i-heroicons-cloud-20-solid',
  },
  {
    title: 'Secure & Private',
    description: 'Bank-level security protects your financial data',
    icon: 'i-heroicons-lock-closed-20-solid',
  },
  {
    title: 'Multiple Periods',
    description: 'View your finances by day, week, month, or year',
    icon: 'i-heroicons-calendar-20-solid',
  },
]
</script>

<template>
  <div class="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
    <!-- Navigation -->
    <nav class="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">FT</span>
          </div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">FTracker</h1>
        </div>
        <div class="flex gap-4">
          <UButton 
            to="/login" 
            color="gray" 
            variant="ghost" 
            label="Sign In"
          />
          <UButton 
            to="/register" 
            color="blue" 
            variant="solid" 
            label="Get Started"
          />
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <div class="inline-block mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <p class="text-sm font-semibold text-blue-600 dark:text-blue-400">✨ Smart Finance Management</p>
          </div>
          
          <h1 class="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Take Control of Your <span class="text-blue-600 dark:text-blue-400">Finances</span>
          </h1>
          
          <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            FTracker makes it easy to track your income and expenses. Get actionable insights into your spending patterns and build better financial habits.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 mb-8">
            <UButton 
              @click="router.push('/register')"
              color="blue" 
              variant="solid" 
              label="Start Free Today"
              size="xl"
              trailing-icon="i-heroicons-arrow-right-20-solid"
            />
            <UButton 
              to="#features" 
              color="gray" 
              variant="soft" 
              label="Learn More"
              size="xl"
            />
          </div>

          <p class="text-sm text-gray-500 dark:text-gray-400">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>

        <!-- Hero Image/Illustration -->
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-3xl opacity-20"></div>
          <div class="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
            <div class="space-y-4">
              <div class="flex justify-between items-start">
                <h3 class="text-2xl font-bold">Your Finances</h3>
                <div class="text-green-300">↗ +12%</div>
              </div>
              <div class="space-y-3">
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div class="text-sm text-blue-100">Income This Month</div>
                  <div class="text-2xl font-bold">Rp 5,000,000</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div class="text-sm text-blue-100">Expenses This Month</div>
                  <div class="text-2xl font-bold">Rp 2,500,000</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div class="text-sm text-blue-100">Remaining Budget</div>
                  <div class="text-2xl font-bold">Rp 2,500,000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="bg-gray-50 dark:bg-gray-800/50 py-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="flex justify-center mb-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <UIcon :name="stat.icon" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">{{ stat.value }}</div>
            <div class="text-gray-600 dark:text-gray-400">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div class="text-center mb-16">
        <h2 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Powerful Features</h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">Everything you need to master your finances</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="feature in features" :key="feature.title" class="bg-white dark:bg-gray-800 rounded-xl p-8 hover:shadow-lg dark:hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
            <UIcon :name="feature.icon" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ feature.title }}</h3>
          <p class="text-gray-600 dark:text-gray-400">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl font-extrabold text-white mb-4">Ready to take control?</h2>
        <p class="text-xl text-blue-100 mb-8">Join thousands of users already managing their finances smarter</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton 
            @click="router.push('/register')"
            color="white" 
            variant="solid" 
            label="Create Free Account"
            size="xl"
          />
          <UButton 
            @click="router.push('/login')"
            color="white" 
            variant="outline" 
            label="Already have an account?"
            size="xl"
          />
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold">FT</span>
              </div>
              <h3 class="font-bold text-lg">FTracker</h3>
            </div>
            <p class="text-gray-400">Smart finance management for everyone</p>
          </div>
          <div>
            <h4 class="font-bold mb-4">Product</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition">Features</a></li>
              <li><a href="#" class="hover:text-white transition">Pricing</a></li>
              <li><a href="#" class="hover:text-white transition">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Company</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition">About</a></li>
              <li><a href="#" class="hover:text-white transition">Blog</a></li>
              <li><a href="#" class="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Legal</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition">Privacy</a></li>
              <li><a href="#" class="hover:text-white transition">Terms</a></li>
              <li><a href="#" class="hover:text-white transition">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2024 FTracker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>
