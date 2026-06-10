<script setup lang="ts">
useHead({
  title: "FTraker - Master Your Finances",
  meta: [
    {
      name: "description",
      content:
        "Track expenses, manage budgets, and achieve your financial goals with FTraker.",
    },
  ],
});

definePageMeta({
  layout: false,
});

const store = useDefaultStore();
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-[#030712] selection:bg-blue-500 selection:text-white overflow-x-hidden"
  >
    <!-- Animated Background -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <div
        class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 rounded-full blur-[120px] animate-pulse"
      ></div>
      <div
        class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-[120px] animate-pulse"
        style="animation-delay: 2s"
      ></div>
    </div>

    <!-- Navbar -->
    <header
      class="fixed top-0 w-full bg-white/70 dark:bg-[#030712]/70 backdrop-blur-xl z-50 border-b border-gray-200/50 dark:border-gray-800/50"
    >
      <div
        class="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2"
      >
        <div
          class="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0"
        >
          <div
            class="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500"
          >
            <UIcon
              name="i-heroicons-moon-20-solid"
              class="w-5 h-5 sm:w-6 sm:h-6 text-white"
            />
          </div>
          <span
            class="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tighter"
            >FTraker<span class="text-blue-600">.</span></span
          >
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
          <ClientOnly>
            <Motion
              :key="$colorMode.value"
              :initial="{ rotate: -180, opacity: 0 }"
              :animate="{ rotate: 0, opacity: 1 }"
              :transition="{ duration: 0.5, ease: 'easeInOut' }"
            >
              <UButton
                :icon="
                  $colorMode.value === 'dark'
                    ? 'i-heroicons-moon-20-solid'
                    : 'i-heroicons-sun-20-solid'
                "
                color="gray"
                variant="ghost"
                aria-label="Theme"
                class="rounded-xl w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5"
                @click="
                  $colorMode.preference =
                    $colorMode.value === 'dark' ? 'light' : 'dark'
                "
              />
            </Motion>
          </ClientOnly>
          <NuxtLink
            v-if="!store.isAuth"
            to="/login"
            class="hidden sm:block text-sm font-black text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors px-4 py-2"
          >
            Sign In
          </NuxtLink>
          <NuxtLink v-if="!store.isAuth" to="/register">
            <UButton
              color="primary"
              size="lg"
              class="rounded-2xl px-4 sm:px-8 shadow-xl shadow-blue-500/25 font-black text-sm sm:text-base"
              >Get Started</UButton
            >
          </NuxtLink>
          <NuxtLink v-else to="/dashboard">
            <UButton
              color="primary"
              size="lg"
              variant="soft"
              class="rounded-2xl px-4 sm:px-8 font-black text-sm sm:text-base"
              trailing-icon="i-heroicons-arrow-right-20-solid"
              >Dashboard</UButton
            >
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="relative pt-44 pb-24 px-6 overflow-visible">
      <div class="container mx-auto text-center relative z-10">
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.2 }"
          class="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 mb-8"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
            ></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"
            ></span>
          </span>
          <span class="text-xs font-black uppercase tracking-widest"
            >New: AI Financial Insights</span
          >
        </Motion>

        <Motion
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, delay: 0.3 }"
        >
          <h1
            class="text-5xl sm:text-8xl lg:text-9xl font-black text-gray-900 dark:text-white leading-[0.85] tracking-tighter mb-8"
          >
            Master your <br />
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient"
              >capital.</span
            >
          </h1>
        </Motion>

        <Motion
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, delay: 0.5 }"
        >
          <p
            class="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Experience the next generation of personal finance. Beautifully
            simple, radically powerful, and built for the modern era.
          </p>
        </Motion>

        <Motion
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, delay: 0.7 }"
          class="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <NuxtLink v-if="!store.isAuth" to="/register">
            <UButton
              size="xl"
              class="rounded-2xl px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-2xl shadow-2xl shadow-blue-500/20 hover:scale-105 transition-transform"
            >
              Get Started
            </UButton>
          </NuxtLink>
        </Motion>

        <!-- Hero Mockup -->
        <Motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :animate="{
            opacity: 1,
            scale: 1,
            y: 0,
          }"
          :transition="{
            duration: 1.2,
            delay: 0.9,
            type: 'spring',
            stiffness: 50,
          }"
          class="relative mt-24 max-w-6xl mx-auto px-4"
        >
          <div
            class="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] blur-2xl opacity-10"
          ></div>
          <div
            class="relative bg-gray-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden aspect-[16/10] p-1"
          >
            <div
              class="absolute top-0 left-0 right-0 h-10 bg-gray-800/80 backdrop-blur flex items-center px-6 gap-2 border-b border-white/5 z-20"
            >
              <div class="flex gap-1.5">
                <div class="w-3 h-3 rounded-full bg-rose-500/50"></div>
                <div class="w-3 h-3 rounded-full bg-amber-500/50"></div>
                <div class="w-3 h-3 rounded-full bg-emerald-500/50"></div>
              </div>
              <div
                class="mx-auto bg-white/5 px-4 py-1 rounded-md text-[10px] text-white/30 font-bold"
              >
                ftraker.app/dashboard
              </div>
            </div>
            <div class="mt-10 p-8 grid grid-cols-12 gap-8 h-full bg-[#030712]">
              <!-- Dashboard Mockup Internal -->
              <div class="col-span-3 space-y-6">
                <div class="h-10 w-full bg-white/5 rounded-xl"></div>
                <div class="space-y-4">
                  <div
                    v-for="i in 4"
                    :key="i"
                    class="h-8 w-full bg-white/5 rounded-lg"
                  ></div>
                </div>
                <div class="mt-auto pt-10">
                  <div
                    class="h-32 w-full bg-blue-500/20 rounded-2xl border border-blue-500/20"
                  ></div>
                </div>
              </div>
              <div class="col-span-9 space-y-8">
                <div class="grid grid-cols-3 gap-6">
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="h-32 bg-white/5 rounded-2xl border border-white/5"
                  ></div>
                </div>
                <div
                  class="h-80 w-full bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden p-8"
                >
                  <div class="flex justify-between mb-8">
                    <div class="space-y-2">
                      <div class="h-4 w-32 bg-white/10 rounded"></div>
                      <div class="h-6 w-48 bg-white/20 rounded"></div>
                    </div>
                    <div class="h-10 w-32 bg-white/10 rounded-xl"></div>
                  </div>
                  <div
                    class="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-blue-500/20 to-transparent"
                  ></div>
                  <svg
                    class="absolute inset-0 w-full h-full text-blue-500/30"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 80 Q 20 40, 40 60 T 80 30 T 100 50 L 100 100 L 0 100 Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Motion>
      </div>
    </main>

    <!-- Trusted By -->
    <Motion
      :initial="{ opacity: 0, y: 40 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true }"
      :transition="{ duration: 0.8 }"
      class="py-20 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]"
    >
      <div class="container mx-auto px-6 text-center">
        <p
          class="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-[0.4em] uppercase mb-12"
        >
          Built with modern tech stack
        </p>
        <div
          class="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700"
        >
          <UIcon name="i-logos-vue" class="w-12 h-12" />
          <UIcon name="i-logos-nuxt-icon" class="w-12 h-12" />
          <UIcon name="i-logos-tailwindcss-icon" class="w-12 h-12" />
          <UIcon name="i-logos-google-icon" class="w-12 h-12" />
          <UIcon name="i-logos-typescript-icon" class="w-12 h-12" />
        </div>
      </div>
    </Motion>

    <!-- Onboarding Flow -->
    <section id="how-it-works" class="py-32 px-6">
      <div class="container mx-auto">
        <Motion
          :initial="{ opacity: 0, y: 40 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.8 }"
          class="text-center mb-24 space-y-4"
        >
          <h2
            class="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tighter"
          >
            Three steps to freedom
          </h2>
          <p
            class="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium"
          >
            We've designed FTraker to be as invisible as possible while giving
            you maximum control.
          </p>
        </Motion>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          <!-- Line Decoration -->
          <div
            class="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-gray-100 dark:bg-white/5 -z-10"
          ></div>

          <Motion
            v-for="(step, i) in [
              {
                title: 'Connect Account',
                desc: 'Securely link your accounts or start manual logging in seconds.',
                icon: 'i-heroicons-link',
              },
              {
                title: 'Smart Tracking',
                desc: 'Categorize transactions automatically with our built-in intelligence.',
                icon: 'i-heroicons-bolt',
              },
              {
                title: 'Grow Wealth',
                desc: 'Get actionable insights and reach your savings goals faster.',
                icon: 'i-heroicons-rocket-moon-20-solid',
              },
              {
                title: 'Smart Tracking',
                desc: 'Categorize transactions automatically with our built-in intelligence.',
                icon: 'i-heroicons-moon-20-solid',
              },
              {
                title: 'Grow Wealth',
                desc: 'Get actionable insights and reach your savings goals faster.',
                icon: 'i-heroicons-moon-20-solid',
              },
            ]"
            :initial="{ opacity: 0, y: 40 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.8, delay: i * 0.2 }"
            class="group text-center space-y-8"
          >
            <div
              class="w-20 h-20 mx-auto bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 rounded-3xl flex items-center justify-center text-blue-600 shadow-xl shadow-blue-500/5 group-hover:scale-110 transition-transform duration-500 relative"
            >
              <div
                class="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-black"
              >
                0{{ i + 1 }}
              </div>
              <UIcon :name="step.icon" class="w-10 h-10" />
            </div>
            <div class="space-y-4">
              <h3
                class="text-2xl font-black text-gray-900 dark:text-white tracking-tight"
              >
                {{ step.title }}
              </h3>
              <p
                class="text-gray-500 dark:text-gray-400 font-medium leading-relaxed"
              >
                {{ step.desc }}
              </p>
            </div>
          </Motion>
        </div>
      </div>
    </section>

    <!-- Features Grid -->
    <section
      id="features"
      class="py-32 px-6 bg-gray-50/50 dark:bg-white/[0.01] border-y border-gray-100 dark:border-white/5"
    >
      <div class="container mx-auto">
        <Motion
          :initial="{ opacity: 0, y: 40 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :viewport="{ once: true }"
          :transition="{ duration: 0.8 }"
          class="text-center mb-24"
        >
          <h2
            class="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter"
          >
            Superpowers for your wallet
          </h2>
          <p
            class="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium"
          >
            Everything you need to regain control and reach your financial
            potential.
          </p>
        </Motion>

        <div
          class="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <Motion
            v-for="(feat, i) in [
              {
                t: 'Deep Analytics',
                d: 'Understand where every penny goes with beautifully crafted charts and automated category breakdowns.',
                icon: 'i-heroicons-chart-pie',
                c: 'blue',
              },
              {
                t: 'Smart Budgets',
                d: 'Set goals and let FTraker guide you. Receive alerts when you\'re getting close to your limits.',
                icon: 'i-heroicons-sparkles',
                c: 'amber',
              },
              {
                t: 'Bank-Grade Security',
                d: 'Your data is yours alone. We use military-grade encryption and never sell your information.',
                icon: 'i-heroicons-shiemoon-20-solid',
                c: 'blue',
              },
              {
                t: 'Smart Budgets',
                d: 'Set goals and let FTraker guide you. Receive alerts when you\'re getting close to your limits.',
                icon: 'i-heroicons-moon-20-solid',
                c: 'amber',
              },
              {
                t: 'Bank-Grade Security',
                d: 'Your data is yours alone. We use military-grade encryption and never sell your information.',
                icon: 'i-heroicons-moon-20-solid',
                c: 'emerald',
              },
              {
                t: 'Instant Sync',
                d: 'Update on your phone, see it on your tablet. Everything stays perfectly in sync across all devices.',
                icon: 'i-heroicons-moon-20-solid',
                c: 'indigo',
              },
              {
                t: 'Native PWA',
                d: 'Install it on any device without App Store bloat. Lightning fast and works offline too.',
                icon: 'i-heroicons-moon-20-solid',
                c: 'rose',
              },
              {
                t: 'Export Anytime',
                d: 'Download your data in CSV or PDF format whenever you need it for taxes or deep audits.',
                icon: 'i-heroicons-moon-20-solid',
                c: 'cyan',
              },
            ]"
            :initial="{ opacity: 0, y: 40 }"
            :while-in-view="{ opacity: 1, y: 0 }"
            :viewport="{ once: true }"
            :transition="{ duration: 0.8, delay: i * 0.1 }"
            class="p-12 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/5 hover:scale-[1.02] transition-all group shadow-xl shadow-gray-200/20 dark:shadow-none"
          >
            <div
              :class="[
                `w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform`,
                `bg-${feat.c}-500/10 text-${feat.c}-600 dark:text-${feat.c}-400`,
              ]"
            >
              <UIcon :name="feat.icon" class="w-8 h-8" />
            </div>
            <h3
              class="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight"
            >
              {{ feat.t }}
            </h3>
            <p
              class="text-gray-500 dark:text-gray-400 leading-relaxed font-medium"
            >
              {{ feat.d }}
            </p>
          </Motion>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="py-32 px-6">
      <div class="container mx-auto">
        <Motion
          :initial="{ opacity: 0, scale: 0.95 }"
          :while-in-view="{ opacity: 1, scale: 1 }"
          :viewport="{ once: true }"
          :transition="{ duration: 1.0 }"
          class="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-[4rem] p-12 md:p-24 overflow-hidden text-center text-white shadow-2xl shadow-blue-500/20"
        >
          <div
            class="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"
          ></div>
          <div class="relative z-10">
            <h2 class="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
              Ready to take control?
            </h2>
            <p
              class="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-12 font-medium"
            >
              Join thousands of users who are mastering their finances every
              day. Start your journey today.
            </p>
            <div
              class="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <NuxtLink v-if="!store.isAuth" to="/register">
                <UButton
                  size="xl"
                  color="white"
                  class="rounded-2xl px-12 py-5 text-blue-600 font-black text-2xl hover:scale-105 transition-transform"
                >
                  Create My Account
                </UButton>
              </NuxtLink>
              <NuxtLink v-else to="/dashboard">
                <UButton
                  size="xl"
                  color="white"
                  class="rounded-2xl px-12 py-5 text-blue-600 font-black text-2xl hover:scale-105 transition-transform"
                >
                  Go to Dashboard
                </UButton>
              </NuxtLink>
            </div>
            <p
              class="mt-8 text-blue-200/60 font-black text-xs uppercase tracking-[0.3em]"
            >
              Secure • Instant • Simple
            </p>
          </div>
        </Motion>
      </div>
    </section>

    <!-- Footer -->
    <footer
      class="py-20 px-6 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#030712]"
    >
      <div class="container mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div class="col-span-1 md:col-span-2 space-y-8">
            <div>
              <div class="flex items-center gap-3 mb-6">
                <div
                  class="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                >
                  <UIcon name="i-heroicons-bolt" class="w-6 h-6 text-white" />
                </div>
                <span
                  class="text-2xl font-moon-20-solidk bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tighter"
                  >FTraker</span
                >
              </div>
              <p
                class="text-gray-500 dark:text-gray-400 max-w-sm text-lg font-medium leading-relaxed"
              >
                The most intuitive way to track your money across all your
                devices and platforms.
              </p>
            </div>

            <!-- Newsletter Subscribe -->
            <div class="max-w-sm">
              <h4
                class="font-black text-gray-900 dark:text-white mb-4 uppercase tracking-[0.2em] text-[10px]"
              >
                Stay Updated
              </h4>
              <div class="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  class="flex-1 px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                />
                <UButton color="primary" class="rounded-xl px-4 font-black"
                  >Subscribe</UButton
                >
              </div>
            </div>
          </div>

          <div>
            <h4
              class="font-black text-gray-900 dark:text-white mb-8 uppercase tracking-[0.3em] text-[10px]"
            >
              Product
            </h4>
            <ul class="space-y-4">
              <li>
                <a
                  href="#features"
                  class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors font-black text-sm"
                  >Features</a
                >
              </li>
            </ul>
          </div>

          <div>
            <h4
              class="font-black text-gray-900 dark:text-white mb-8 uppercase tracking-[0.3em] text-[10px]"
            >
              Legal
            </h4>
            <ul class="space-y-4">
              <li>
                <NuxtLink
                  to="/privacy-policy"
                  class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors font-black text-sm"
                  >Privacy Policy</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/terms-of-service"
                  class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors font-black text-sm"
                  >Terms of Service</NuxtLink
                >
              </li>
              <li>
                <NuxtLink
                  to="/cookie-policy"
                  class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors font-black text-sm"
                  >Cookie Policy</NuxtLink
                >
              </li>
            </ul>
          </div>
        </div>
        <div
          class="pt-10 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <p class="text-gray-500 dark:text-gray-400 font-black text-sm">
            &copy; {{ new Date().getFullYear() }} FTraker. Built for financial
            freedom.
          </p>
          <div class="flex items-center gap-8">
            <a
              v-for="icon in [
                'i-simple-icons-twitter',
                'i-simple-icons-github',
                'i-simple-icons-linkedin',
              ]"
              :key="icon"
              href="#"
              class="text-gray-400 hover:text-blue-600 transition-all hover:scale-110"
              ><UIcon :name="icon" class="w-6 h-6"
            /></a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

html {
  font-family: "Plus Jakarta Sans", sans-serif;
  scroll-behavior: smooth;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
