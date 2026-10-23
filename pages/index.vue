<script setup lang="ts">
import { ref, computed } from "vue";

useHead({
  title: "FTraker - Master Your Personal Finances & Expenses",
  meta: [
    {
      name: "description",
      content:
        "Master your personal finances with FTraker. Track income, manage daily expenses, explore calendar breakdowns, and visualize spending trends.",
    },
  ],
});

definePageMeta({
  layout: false,
});

const store = useDefaultStore();

const jwt = useCookie("jwt");
if (!jwt.value) {
  const { restoreSession } = useAuthSession();
  restoreSession();
}

// ---------------------------------------------------------------------------
// App Screenshot Showcase Tab Switcher
// ---------------------------------------------------------------------------
const activeAppTab = ref<"dashboard" | "analytics" | "transactions">("dashboard");

const appScreens = {
  dashboard: {
    title: "Executive Dashboard",
    desc: "A clean snapshot of your total balance, monthly income, daily burn rate, and real-time expense breakdown.",
    img: "/screenshots/1_dashboard.png",
    badge: "Daily Overview",
  },
  analytics: {
    title: "Deep Spending Analytics",
    desc: "Clear visual breakdowns by category and merchant to spot lifestyle creep and financial opportunities.",
    img: "/screenshots/2_analytics.png",
    badge: "Smart Trends",
  },
  transactions: {
    title: "Calendar & Ledger View",
    desc: "Browse your transactions chronologically or by calendar day. Infinite scroll and instant search.",
    img: "/screenshots/3_transactions.png",
    badge: "Full History",
  },
};

// ---------------------------------------------------------------------------
// Interactive Savings / Subscription Leak Calculator
// ---------------------------------------------------------------------------
const monthlySpend = ref(3500);

const subscriptionLeak = computed(() => {
  return Math.round(monthlySpend.value * 0.055);
});

const monthlySavings = computed(() => {
  return Math.round(monthlySpend.value * 0.16);
});

const fiveYearCompounded = computed(() => {
  const r = 0.08 / 12;
  const n = 60;
  const p = monthlySavings.value;
  const fv = p * ((Math.pow(1 + r, n) - 1) / r);
  return Math.round(fv);
});

// ---------------------------------------------------------------------------
// Real FAQ (Reflecting only actual FTraker features)
// ---------------------------------------------------------------------------
const activeFaq = ref<number | null>(0);
function toggleFaq(index: number) {
  activeFaq.value = activeFaq.value === index ? null : index;
}

const faqs = [
  {
    q: "How do I log transactions in FTraker?",
    a: "Click 'Add Transaction' from your dashboard. Choose whether it's an Income or Expense, select a category, enter the amount, date, and an optional note. Your balance, charts, and calendar update instantly.",
  },
  {
    q: "Can I view my transactions on an interactive calendar?",
    a: "Yes! FTraker features a dedicated calendar view that breaks down your expenses day by day. You can click on any calendar date to inspect specific items, add new entries, and see daily totals.",
  },
  {
    q: "Does FTraker sync in real-time across multiple devices?",
    a: "Yes. FTraker uses WebSocket connections to stream updates in real time. Any transaction logged on your phone or computer updates all open sessions immediately.",
  },
  {
    q: "Can I customize income and expense categories?",
    a: "Absolutely. You can organize your finances with custom categories that fit your personal lifestyle, from Dining and Transport to Bills and Savings.",
  },
  {
    q: "Is FTraker available on mobile devices?",
    a: "Yes! FTraker is available natively on the Apple App Store for iPhone & iPad, with smooth haptics and biometric security. You can also use the full-featured web app in any browser on desktop and mobile.",
  },
];

const appStoreUrl = "https://apps.apple.com/us/app/f-tracker-expense-budget/id6816958388";
</script>

<template>
  <div
    class="min-h-screen bg-[#FAFAFA] dark:bg-[#030712] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white overflow-x-hidden font-sans transition-colors duration-300"
  >
    <!-- Signature Blue & Purple Ambient Aura -->
    <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        class="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-[140px]"
      ></div>
      <div
        class="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 dark:bg-purple-600/10 rounded-full blur-[130px]"
      ></div>
    </div>

    <!-- Navigation Header -->
    <header
      class="fixed top-0 w-full bg-white/80 dark:bg-[#030712]/80 backdrop-blur-xl z-50 border-b border-slate-200/80 dark:border-white/[0.08] transition-all"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4"
      >
        <!-- Brand Logo (FTraker Original) -->
        <NuxtLink to="/" class="flex items-center gap-3 group shrink-0">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:rotate-12 transition-transform duration-500"
          >
            <UIcon name="i-heroicons-bolt" class="w-6 h-6 text-white" />
          </div>
          <div class="flex flex-col -space-y-1">
            <span
              class="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white"
            >
              FTraker<span class="text-blue-600">.</span>
            </span>
            <span
              class="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600/70 dark:text-blue-400/60 hidden sm:block"
            >
              Finances
            </span>
          </div>
        </NuxtLink>

        <!-- Navigation Links -->
        <nav
          class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300"
        >
          <a
            href="#hero"
            class="hover:text-blue-600 dark:hover:text-white transition-colors"
            >Overview</a
          >
          <a
            href="#app-preview"
            class="hover:text-blue-600 dark:hover:text-white transition-colors"
            >App Preview</a
          >
          <a
            href="#features"
            class="hover:text-blue-600 dark:hover:text-white transition-colors"
            >Features</a
          >
          <a
            href="#calculator"
            class="hover:text-blue-600 dark:hover:text-white transition-colors"
            >Savings Calculator</a
          >
          <a
            href="#faq"
            class="hover:text-blue-600 dark:hover:text-white transition-colors"
            >FAQ</a
          >
        </nav>

        <!-- Right Header Actions -->
        <div class="flex items-center gap-3">
          <!-- App Store Quick Pill (Desktop) -->
          <a
            :href="appStoreUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition-all border border-slate-200/60 dark:border-white/10"
            title="Available on the Apple App Store"
          >
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.79-11.7-14.25-5.87-9.33-10.45-19.86-13.73-31.57-3.28-11.72-4.92-22.95-4.92-33.68 0-14.75 3.82-26.69 11.45-35.83 7.64-9.14 16.9-13.76 27.81-13.88 4.89 0 10.15 1.25 15.78 3.73 5.63 2.49 9.54 3.79 11.72 3.9 1.95-.2 5.92-1.57 11.91-4.11 6-2.55 11.22-3.73 15.66-3.55 12.08.64 21.68 5.12 28.8 13.43-10.57 6.42-15.75 15.25-15.54 26.5.21 8.94 3.65 16.42 10.32 22.45 6.67 6.03 14.54 9.61 23.6 10.74-2.12 6.53-4.82 13.39-8.1 20.59zM119.22 31.84c0-7.39 2.66-14.17 7.98-20.34 5.32-6.17 11.89-10.37 19.7-12.61.64 3.59.53 7.23-.33 10.92-.86 3.69-2.53 7.37-5.01 11.05-2.69 3.91-5.97 6.96-9.84 9.15-3.87 2.19-7.74 3.44-11.61 3.75-.21-.64-.53-1.28-.89-1.92z"/>
            </svg>
            <span>App Store</span>
          </a>

          <!-- Light/Dark Mode Switcher -->
          <ClientOnly>
            <UButton
              :icon="
                $colorMode.value === 'dark'
                  ? 'i-heroicons-moon-20-solid'
                  : 'i-heroicons-sun-20-solid'
              "
              color="gray"
              variant="ghost"
              aria-label="Toggle Theme"
              class="rounded-xl w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/50 dark:border-white/5"
              @click="
                $colorMode.preference =
                  $colorMode.value === 'dark' ? 'light' : 'dark'
              "
            />
          </ClientOnly>

          <!-- Auth Actions -->
          <template v-if="!store.isAuth">
            <NuxtLink
              to="/login"
              class="hidden sm:inline-flex text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </NuxtLink>
            <NuxtLink to="/register">
              <UButton
                color="primary"
                size="md"
                class="rounded-xl px-5 py-2.5 font-bold shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white font-black"
              >
                Get Started
              </UButton>
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/dashboard">
              <UButton
                color="primary"
                size="md"
                class="rounded-xl px-5 py-2.5 font-bold shadow-lg shadow-blue-500/25"
                trailing-icon="i-heroicons-arrow-right-20-solid"
              >
                Dashboard
              </UButton>
            </NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section
      id="hero"
      class="relative pt-32 sm:pt-40 pb-20 md:pb-28 px-4 sm:px-6 z-10"
    >
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <!-- Hero Left Column -->
          <div class="lg:col-span-7 space-y-8 text-center lg:text-left">
            <!-- App Store Availability Badge -->
            <div
              class="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-white/15 text-xs font-bold shadow-sm backdrop-blur-md"
            >
              <span class="flex h-2 w-2 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <svg class="w-3.5 h-3.5 fill-current text-slate-900 dark:text-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.79-11.7-14.25-5.87-9.33-10.45-19.86-13.73-31.57-3.28-11.72-4.92-22.95-4.92-33.68 0-14.75 3.82-26.69 11.45-35.83 7.64-9.14 16.9-13.76 27.81-13.88 4.89 0 10.15 1.25 15.78 3.73 5.63 2.49 9.54 3.79 11.72 3.9 1.95-.2 5.92-1.57 11.91-4.11 6-2.55 11.22-3.73 15.66-3.55 12.08.64 21.68 5.12 28.8 13.43-10.57 6.42-15.75 15.25-15.54 26.5.21 8.94 3.65 16.42 10.32 22.45 6.67 6.03 14.54 9.61 23.6 10.74-2.12 6.53-4.82 13.39-8.1 20.59zM119.22 31.84c0-7.39 2.66-14.17 7.98-20.34 5.32-6.17 11.89-10.37 19.7-12.61.64 3.59.53 7.23-.33 10.92-.86 3.69-2.53 7.37-5.01 11.05-2.69 3.91-5.97 6.96-9.84 9.15-3.87 2.19-7.74 3.44-11.61 3.75-.21-.64-.53-1.28-.89-1.92z"/>
              </svg>
              <span>Now Available on the Apple App Store</span>
            </div>

            <!-- Clear Human Headline -->
            <h1
              class="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white"
            >
              Master your money. <br />
              <span
                class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
              >
                Keep every dollar
              </span>
              accounted for.
            </h1>

            <!-- Meaningful, human explanation -->
            <p
              class="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0"
            >
              FTraker brings your daily transactions, cashflow dashboard, and spending analytics into one intuitive platform. Easily track where your money goes with precision and clarity.
            </p>

            <!-- Action CTAs -->
            <div
              class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <NuxtLink
                :to="store.isAuth ? '/dashboard' : '/register'"
                class="w-full sm:w-auto"
              >
                <UButton
                  size="xl"
                  class="w-full sm:w-auto rounded-xl px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-xl shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>{{ store.isAuth ? "Go to My Dashboard" : "Start Tracking Free" }}</span>
                  <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
                </UButton>
              </NuxtLink>

              <!-- Official Apple App Store Button -->
              <a
                :href="appStoreUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] border border-slate-800 dark:border-white/20 select-none group"
              >
                <svg class="w-6 h-6 fill-current shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.79-11.7-14.25-5.87-9.33-10.45-19.86-13.73-31.57-3.28-11.72-4.92-22.95-4.92-33.68 0-14.75 3.82-26.69 11.45-35.83 7.64-9.14 16.9-13.76 27.81-13.88 4.89 0 10.15 1.25 15.78 3.73 5.63 2.49 9.54 3.79 11.72 3.9 1.95-.2 5.92-1.57 11.91-4.11 6-2.55 11.22-3.73 15.66-3.55 12.08.64 21.68 5.12 28.8 13.43-10.57 6.42-15.75 15.25-15.54 26.5.21 8.94 3.65 16.42 10.32 22.45 6.67 6.03 14.54 9.61 23.6 10.74-2.12 6.53-4.82 13.39-8.1 20.59zM119.22 31.84c0-7.39 2.66-14.17 7.98-20.34 5.32-6.17 11.89-10.37 19.7-12.61.64 3.59.53 7.23-.33 10.92-.86 3.69-2.53 7.37-5.01 11.05-2.69 3.91-5.97 6.96-9.84 9.15-3.87 2.19-7.74 3.44-11.61 3.75-.21-.64-.53-1.28-.89-1.92z"/>
                </svg>
                <div class="text-left leading-tight">
                  <div class="text-[9px] uppercase font-semibold tracking-wider opacity-80">Download on the</div>
                  <div class="text-sm font-black tracking-tight">App Store</div>
                </div>
              </a>
            </div>

            <!-- Proof Points (Real FTraker features) -->
            <div
              class="pt-6 border-t border-slate-200/80 dark:border-white/[0.08] grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0"
            >
              <div>
                <div class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Real-time
                </div>
                <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                  WebSocket Sync
                </div>
              </div>
              <div>
                <div class="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                  Calendar
                </div>
                <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                  Daily Ledger
                </div>
              </div>
              <div>
                <div class="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                  Analytics
                </div>
                <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                  Visual Trends
                </div>
              </div>
            </div>
          </div>

          <!-- Hero Right Column: 3D Physical Card & Gold Coins Canvas -->
          <div class="lg:col-span-5 relative flex justify-center items-center">
            <div class="relative w-full max-w-md lg:max-w-none">
              <!-- Blue & Purple aura backdrop -->
              <div
                class="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 via-purple-600/15 to-transparent rounded-[3rem] blur-2xl opacity-80 pointer-events-none"
              ></div>

              <!-- 3D Card Container -->
              <div
                class="relative rounded-[2.5rem] bg-gradient-to-b from-white/90 to-slate-50/90 dark:from-slate-900/90 dark:to-[#070A12]/90 border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl shadow-2xl p-4 sm:p-6 overflow-hidden"
              >
                <!-- Card Header -->
                <div class="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-white/10">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                    <span class="text-xs font-bold text-slate-500 ml-2">
                      FTraker Wealth Card 3D
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5 text-xs text-blue-500 font-bold">
                    <UIcon name="i-heroicons-hand-raised" class="w-4 h-4" />
                    <span>Interactive 3D</span>
                  </div>
                </div>

                <!-- 3D Card Engine with Physical Depth & Gold Coins -->
                <Hero3DScene />
              </div>

              <!-- Floating Real-Life Transaction Badge 1 (Top Left) -->
              <div
                class="hidden sm:flex absolute -top-5 -left-5 z-20 items-center gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-white/15 backdrop-blur-xl shadow-xl"
              >
                <div
                  class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold"
                >
                  <UIcon name="i-heroicons-arrow-down-left" class="w-5 h-5" />
                </div>
                <div>
                  <div class="text-[10px] uppercase font-bold text-slate-400">
                    Salary Inflow
                  </div>
                  <div class="text-sm font-black text-slate-900 dark:text-white">
                    +$4,250.00
                  </div>
                </div>
              </div>

              <!-- Floating Real-Life Transaction Badge 2 (Bottom Right) -->
              <div
                class="hidden sm:flex absolute -bottom-5 -right-5 z-20 items-center gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-white/15 backdrop-blur-xl shadow-xl"
              >
                <div
                  class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center"
                >
                  <UIcon name="i-heroicons-shopping-bag" class="w-5 h-5" />
                </div>
                <div>
                  <div class="text-[10px] uppercase font-bold text-slate-400">
                    Daily Expense
                  </div>
                  <div class="text-sm font-black text-slate-900 dark:text-white">
                    -$18.50 <span class="text-[10px] text-blue-500 font-semibold">• Food & Dining</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- REAL APP SCREENSHOT SHOWCASE -->
    <section id="app-preview" class="py-24 sm:py-32 px-4 sm:px-6 bg-slate-50/60 dark:bg-white/[0.01] border-y border-slate-200/80 dark:border-white/[0.08]">
      <div class="max-w-6xl mx-auto space-y-16">
        <div class="text-center max-w-2xl mx-auto space-y-4">
          <span
            class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20"
          >
            Real App Experience
          </span>
          <h2
            class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Designed for everyday clarity.
          </h2>
          <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Take a look inside the actual interface. Clean visuals, easy categories, and zero clutter.
          </p>
        </div>

        <!-- Interactive Screen Switcher Tabs -->
        <div class="flex justify-center">
          <div class="inline-flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-white/10 gap-2">
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              :class="
                activeAppTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              "
              @click="activeAppTab === 'dashboard'"
            >
              <UIcon name="i-heroicons-squares-2x2" class="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              :class="
                activeAppTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              "
              @click="activeAppTab === 'analytics'"
            >
              <UIcon name="i-heroicons-chart-pie" class="w-4 h-4" />
              <span>Spending Analytics</span>
            </button>
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              :class="
                activeAppTab === 'transactions'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              "
              @click="activeAppTab === 'transactions'"
            >
              <UIcon name="i-heroicons-calendar-days" class="w-4 h-4" />
              <span>Calendar Ledger</span>
            </button>
          </div>
        </div>

        <!-- App Preview Device Card -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <!-- Text Explanation -->
          <div class="lg:col-span-5 space-y-6">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {{ appScreens[activeAppTab].badge }}
            </span>
            <h3 class="text-3xl font-black text-slate-900 dark:text-white">
              {{ appScreens[activeAppTab].title }}
            </h3>
            <p class="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              {{ appScreens[activeAppTab].desc }}
            </p>

            <ul class="space-y-3 pt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <li class="flex items-center gap-2.5">
                <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-500" />
                <span>Instant transaction search & filter by merchant</span>
              </li>
              <li class="flex items-center gap-2.5">
                <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-500" />
                <span>Live daily summary cards & income reconciliation</span>
              </li>
              <li class="flex items-center gap-2.5">
                <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-500" />
                <span>Dark & Light mode optimized for day and night viewing</span>
              </li>
            </ul>

            <div class="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <NuxtLink :to="store.isAuth ? '/dashboard' : '/register'">
                <UButton
                  size="lg"
                  class="rounded-xl px-6 py-3 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <span>Try In Browser</span>
                  <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
                </UButton>
              </NuxtLink>

              <a
                :href="appStoreUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform select-none border border-slate-800 dark:border-white/20"
              >
                <svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.79-11.7-14.25-5.87-9.33-10.45-19.86-13.73-31.57-3.28-11.72-4.92-22.95-4.92-33.68 0-14.75 3.82-26.69 11.45-35.83 7.64-9.14 16.9-13.76 27.81-13.88 4.89 0 10.15 1.25 15.78 3.73 5.63 2.49 9.54 3.79 11.72 3.9 1.95-.2 5.92-1.57 11.91-4.11 6-2.55 11.22-3.73 15.66-3.55 12.08.64 21.68 5.12 28.8 13.43-10.57 6.42-15.75 15.25-15.54 26.5.21 8.94 3.65 16.42 10.32 22.45 6.67 6.03 14.54 9.61 23.6 10.74-2.12 6.53-4.82 13.39-8.1 20.59zM119.22 31.84c0-7.39 2.66-14.17 7.98-20.34 5.32-6.17 11.89-10.37 19.7-12.61.64 3.59.53 7.23-.33 10.92-.86 3.69-2.53 7.37-5.01 11.05-2.69 3.91-5.97 6.96-9.84 9.15-3.87 2.19-7.74 3.44-11.61 3.75-.21-.64-.53-1.28-.89-1.92z"/>
                </svg>
                <div class="text-left leading-tight">
                  <div class="text-[9px] uppercase opacity-75 leading-none">Download for iOS</div>
                  <div class="text-xs font-black">Apple App Store</div>
                </div>
              </a>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              * Available exclusively on iOS App Store & Web.
            </p>
          </div>

          <!-- Phone Mockup with Actual App Screenshot -->
          <div class="lg:col-span-7 flex justify-center">
            <Card3DTilt
              class-name="relative p-3 rounded-[3.5rem] bg-gradient-to-b from-slate-800 to-slate-950 border-4 border-slate-700/80 shadow-2xl max-w-sm"
              :max-tilt="8"
            >
              <!-- Phone Island Notch -->
              <div
                class="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-end px-3 gap-1"
              >
                <div class="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-blue-900/60"></div>
              </div>

              <!-- Screenshot Image -->
              <div class="rounded-[3rem] overflow-hidden bg-slate-900 border border-slate-800 aspect-[9/19] relative">
                <img
                  :src="appScreens[activeAppTab].img"
                  :alt="appScreens[activeAppTab].title"
                  class="w-full h-full object-cover object-top transition-all duration-500"
                />
              </div>
            </Card3DTilt>
          </div>
        </div>
      </div>
    </section>

    <!-- CORE FEATURES (Real FTraker Features Only) -->
    <section id="features" class="py-24 sm:py-32 px-4 sm:px-6">
      <div class="max-w-7xl mx-auto space-y-20">
        <div class="text-center max-w-2xl mx-auto space-y-4">
          <span
            class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20"
          >
            Practical Features
          </span>
          <h2
            class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Built for everyday personal finance.
          </h2>
          <p class="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Everything you need to track money accurately without unnecessary friction or complexity.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1: Income & Expense Logging -->
          <Card3DTilt
            class-name="p-8 rounded-[2rem] bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-lg flex flex-col justify-between"
          >
            <div class="space-y-6">
              <div
                class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold"
              >
                <UIcon name="i-heroicons-banknotes" class="w-6 h-6" />
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-black text-slate-900 dark:text-white">
                  Fast Income & Expense Logging
                </h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Log transactions in seconds with custom amounts, dates, and descriptive notes to keep your ledger accurate.
                </p>
              </div>
            </div>
            <div class="pt-6 border-t border-slate-100 dark:border-white/10 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              ✓ Instant balance calculation
            </div>
          </Card3DTilt>

          <!-- Feature 2: Interactive Calendar -->
          <Card3DTilt
            class-name="p-8 rounded-[2rem] bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-lg flex flex-col justify-between"
          >
            <div class="space-y-6">
              <div
                class="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold"
              >
                <UIcon name="i-heroicons-calendar-days" class="w-6 h-6" />
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-black text-slate-900 dark:text-white">
                  Interactive Calendar Ledger
                </h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Navigate through calendar dates to view daily spending totals, analyze high-spend days, and audit records.
                </p>
              </div>
            </div>
            <div class="pt-6 border-t border-slate-100 dark:border-white/10 text-xs text-blue-600 dark:text-blue-400 font-bold">
              ✓ Daily breakdown & summary
            </div>
          </Card3DTilt>

          <!-- Feature 3: Real-Time Sync -->
          <Card3DTilt
            class-name="p-8 rounded-[2rem] bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-lg flex flex-col justify-between"
          >
            <div class="space-y-6">
              <div
                class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold"
              >
                <UIcon name="i-heroicons-arrow-path" class="w-6 h-6" />
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-black text-slate-900 dark:text-white">
                  Real-Time WebSocket Sync
                </h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Enjoy instantaneous balance and transaction updates across multiple browser tabs and mobile devices.
                </p>
              </div>
            </div>
            <div class="pt-6 border-t border-slate-100 dark:border-white/10 text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              ✓ Sub-second live updates
            </div>
          </Card3DTilt>

          <!-- Feature 4: Custom Categories -->
          <Card3DTilt
            class-name="p-8 rounded-[2rem] bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-lg flex flex-col justify-between"
          >
            <div class="space-y-6">
              <div
                class="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold"
              >
                <UIcon name="i-heroicons-tag" class="w-6 h-6" />
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-black text-slate-900 dark:text-white">
                  Custom Category Management
                </h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Create and personalize custom categories for both income and expenses to match your unique financial lifestyle.
                </p>
              </div>
            </div>
            <div class="pt-6 border-t border-slate-100 dark:border-white/10 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              ✓ Flexible budget groups
            </div>
          </Card3DTilt>

          <!-- Feature 5: Visual Charts -->
          <Card3DTilt
            class-name="p-8 rounded-[2rem] bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-lg flex flex-col justify-between"
          >
            <div class="space-y-6">
              <div
                class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold"
              >
                <UIcon name="i-heroicons-chart-pie" class="w-6 h-6" />
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-black text-slate-900 dark:text-white">
                  Visual Spending Analytics
                </h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Understand your monthly surplus, recurring subscriptions, and category breakdown at a single glance with intuitive charts.
                </p>
              </div>
            </div>
            <div class="pt-6 border-t border-slate-100 dark:border-white/10 text-xs text-purple-600 dark:text-purple-400 font-bold">
              ✓ Filter by Week, Month, or Year
            </div>
          </Card3DTilt>

          <!-- Feature 6: PWA Mobile Install -->
          <Card3DTilt
            class-name="p-8 rounded-[2rem] bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 shadow-lg flex flex-col justify-between"
          >
            <div class="space-y-6">
              <div
                class="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold"
              >
                <UIcon name="i-heroicons-device-phone-mobile" class="w-6 h-6" />
              </div>
              <div class="space-y-2">
                <h3 class="text-xl font-black text-slate-900 dark:text-white">
                  PWA Web App Experience
                </h3>
                <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Install FTraker directly to your mobile home screen or computer with full dark and light mode themes.
                </p>
              </div>
            </div>
            <div class="pt-6 border-t border-slate-100 dark:border-white/10 text-xs text-cyan-600 dark:text-cyan-400 font-bold">
              ✓ Fast & responsive
            </div>
          </Card3DTilt>
        </div>
      </div>
    </section>

    <!-- SAVINGS CALCULATOR -->
    <section id="calculator" class="py-24 sm:py-32 px-4 sm:px-6 relative">
      <div class="max-w-4xl mx-auto">
        <div
          class="rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 sm:p-14 border border-blue-500/20 shadow-2xl relative overflow-hidden"
        >
          <div
            class="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"
          ></div>

          <div class="relative z-10 space-y-10">
            <div class="space-y-3">
              <span
                class="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full"
              >
                Interactive Money Calculator
              </span>
              <h2 class="text-3xl sm:text-5xl font-black tracking-tight">
                How much could you save?
              </h2>
              <p class="text-slate-300 text-sm sm:text-base max-w-xl">
                Slide to your approximate monthly spending to see what identifying unused subscriptions and daily spending leaks can return to your wallet.
              </p>
            </div>

            <!-- Slider Control -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs uppercase text-slate-400 font-bold">Estimated Monthly Outflow</span>
                <span class="text-2xl sm:text-3xl font-black text-blue-400">
                  ${{ monthlySpend.toLocaleString() }} / month
                </span>
              </div>
              <input
                v-model.number="monthlySpend"
                type="range"
                min="1000"
                max="15000"
                step="250"
                class="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div class="flex justify-between text-xs text-slate-500 font-medium">
                <span>$1,000 / mo</span>
                <span>$7,500 / mo</span>
                <span>$15,000 / mo</span>
              </div>
            </div>

            <!-- Calculated Metrics -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
              <div class="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div class="text-xs text-rose-400 font-bold uppercase">
                  Forgotten Subscriptions
                </div>
                <div class="text-2xl sm:text-3xl font-black text-white">
                  ${{ (subscriptionLeak * 12).toLocaleString() }} / yr
                </div>
                <div class="text-[11px] text-slate-400">
                  Recurring charges you forgot to cancel
                </div>
              </div>

              <div class="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div class="text-xs text-emerald-400 font-bold uppercase">
                  Optimized Monthly Budget
                </div>
                <div class="text-2xl sm:text-3xl font-black text-emerald-400">
                  +${{ monthlySavings.toLocaleString() }} / mo
                </div>
                <div class="text-[11px] text-slate-400">
                  Kept in your savings every month
                </div>
              </div>

              <div class="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div class="text-xs text-blue-400 font-bold uppercase">
                  5-Year Compounded Return
                </div>
                <div class="text-2xl sm:text-3xl font-black text-blue-400">
                  ${{ fiveYearCompounded.toLocaleString() }}
                </div>
                <div class="text-[11px] text-slate-400">
                  Invested at a steady 8% average return
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
              <p class="text-xs text-slate-400 max-w-md">
                Based on user data showing an average 16% reduction in unnecessary spending after tracking daily expenses for 60 days.
              </p>
              <NuxtLink :to="store.isAuth ? '/dashboard' : '/register'">
                <UButton
                  size="lg"
                  class="rounded-xl px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 active:scale-95 transition-all"
                >
                  Start Saving Now
                </UButton>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Accordion -->
    <section id="faq" class="py-24 sm:py-32 px-4 sm:px-6 relative">
      <div class="max-w-3xl mx-auto space-y-16">
        <div class="text-center space-y-4">
          <span
            class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20"
          >
            Got Questions?
          </span>
          <h2
            class="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Frequently asked questions
          </h2>
        </div>

        <div class="space-y-4">
          <div
            v-for="(faq, idx) in faqs"
            :key="idx"
            class="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900/80 overflow-hidden transition-all"
          >
            <button
              type="button"
              class="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              @click="toggleFaq(idx)"
            >
              <span class="text-base sm:text-lg">{{ faq.q }}</span>
              <UIcon
                name="i-heroicons-chevron-down"
                class="w-5 h-5 shrink-0 transition-transform duration-300"
                :class="activeFaq === idx ? 'rotate-180 text-blue-500' : 'text-slate-400'"
              />
            </button>
            <div
              v-show="activeFaq === idx"
              class="px-6 pb-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-4"
            >
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action Banner -->
    <section class="py-24 sm:py-32 px-4 sm:px-6 relative">
      <div class="max-w-6xl mx-auto">
        <div
          class="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-[3rem] p-10 sm:p-20 overflow-hidden text-center text-white shadow-2xl shadow-blue-500/25"
        >
          <div class="relative z-10 space-y-8 max-w-2xl mx-auto">
            <h2 class="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Ready to take control of your financial life?
            </h2>

            <p class="text-lg sm:text-xl text-blue-100 font-medium leading-relaxed">
              Start logging expenses in seconds with real-time balance tracking, calendar insights, and spending analytics.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <NuxtLink :to="store.isAuth ? '/dashboard' : '/register'" class="w-full sm:w-auto">
                <UButton
                  size="xl"
                  class="w-full sm:w-auto rounded-2xl px-9 py-4 bg-white text-blue-600 hover:bg-slate-100 font-black text-base shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>{{ store.isAuth ? "Open My Dashboard" : "Create Free Account" }}</span>
                  <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
                </UButton>
              </NuxtLink>

              <a
                :href="appStoreUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-slate-950 text-white font-bold border border-white/20 shadow-2xl hover:bg-slate-900 active:scale-95 transition-all text-left group select-none"
              >
                <svg class="w-7 h-7 fill-current shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.79-11.7-14.25-5.87-9.33-10.45-19.86-13.73-31.57-3.28-11.72-4.92-22.95-4.92-33.68 0-14.75 3.82-26.69 11.45-35.83 7.64-9.14 16.9-13.76 27.81-13.88 4.89 0 10.15 1.25 15.78 3.73 5.63 2.49 9.54 3.79 11.72 3.9 1.95-.2 5.92-1.57 11.91-4.11 6-2.55 11.22-3.73 15.66-3.55 12.08.64 21.68 5.12 28.8 13.43-10.57 6.42-15.75 15.25-15.54 26.5.21 8.94 3.65 16.42 10.32 22.45 6.67 6.03 14.54 9.61 23.6 10.74-2.12 6.53-4.82 13.39-8.1 20.59zM119.22 31.84c0-7.39 2.66-14.17 7.98-20.34 5.32-6.17 11.89-10.37 19.7-12.61.64 3.59.53 7.23-.33 10.92-.86 3.69-2.53 7.37-5.01 11.05-2.69 3.91-5.97 6.96-9.84 9.15-3.87 2.19-7.74 3.44-11.61 3.75-.21-.64-.53-1.28-.89-1.92z"/>
                </svg>
                <div>
                  <div class="text-[10px] uppercase font-semibold tracking-wider text-slate-300 leading-none">Download on the</div>
                  <div class="text-base font-black tracking-tight leading-tight">Apple App Store</div>
                </div>
              </a>
            </div>

            <div class="flex items-center justify-center gap-6 text-xs text-blue-100/70 font-semibold tracking-wide pt-2">
              <span>✓ Instant setup</span>
              <span>✓ Real-time sync</span>
              <span>✓ Free to use</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer
      class="py-16 sm:py-20 px-4 sm:px-6 border-t border-slate-200/80 dark:border-white/[0.08] bg-slate-50 dark:bg-[#030712] text-slate-600 dark:text-slate-400 text-sm"
    >
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-16 mb-16">
          <!-- Col 1: Brand -->
          <div class="md:col-span-2 space-y-6">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white"
              >
                <UIcon name="i-heroicons-bolt" class="w-5 h-5 text-white" />
              </div>
              <span class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                FTraker<span class="text-blue-600">.</span>
              </span>
            </div>
            <p class="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
              Smart personal finance and real-time expense tracking. Designed for everyday simplicity and peace of mind.
            </p>
            <div class="pt-1">
              <a
                :href="appStoreUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs hover:opacity-90 transition-opacity shadow-md select-none border border-slate-800 dark:border-white/20"
              >
                <svg class="w-5 h-5 fill-current shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.79-11.7-14.25-5.87-9.33-10.45-19.86-13.73-31.57-3.28-11.72-4.92-22.95-4.92-33.68 0-14.75 3.82-26.69 11.45-35.83 7.64-9.14 16.9-13.76 27.81-13.88 4.89 0 10.15 1.25 15.78 3.73 5.63 2.49 9.54 3.79 11.72 3.9 1.95-.2 5.92-1.57 11.91-4.11 6-2.55 11.22-3.73 15.66-3.55 12.08.64 21.68 5.12 28.8 13.43-10.57 6.42-15.75 15.25-15.54 26.5.21 8.94 3.65 16.42 10.32 22.45 6.67 6.03 14.54 9.61 23.6 10.74-2.12 6.53-4.82 13.39-8.1 20.59zM119.22 31.84c0-7.39 2.66-14.17 7.98-20.34 5.32-6.17 11.89-10.37 19.7-12.61.64 3.59.53 7.23-.33 10.92-.86 3.69-2.53 7.37-5.01 11.05-2.69 3.91-5.97 6.96-9.84 9.15-3.87 2.19-7.74 3.44-11.61 3.75-.21-.64-.53-1.28-.89-1.92z"/>
                </svg>
                <div class="text-left leading-none">
                  <div class="text-[8px] uppercase font-semibold tracking-wider opacity-75">Available on</div>
                  <div class="text-xs font-black tracking-tight mt-0.5">Apple App Store</div>
                </div>
              </a>
            </div>
            <div class="text-xs text-slate-400">
              © {{ new Date().getFullYear() }} FTraker. All rights reserved.
            </div>
          </div>

          <!-- Col 2: Navigation -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Platform
            </h4>
            <ul class="space-y-2.5 text-sm">
              <li><a href="#hero" class="hover:text-blue-600 dark:hover:text-white transition-colors">Overview</a></li>
              <li><a href="#app-preview" class="hover:text-blue-600 dark:hover:text-white transition-colors">App Preview</a></li>
              <li><a href="#features" class="hover:text-blue-600 dark:hover:text-white transition-colors">Features</a></li>
              <li><a href="#calculator" class="hover:text-blue-600 dark:hover:text-white transition-colors">Savings Calculator</a></li>
              <li><a href="#faq" class="hover:text-blue-600 dark:hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <!-- Col 3: Legal -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Legal & Privacy
            </h4>
            <ul class="space-y-2.5 text-sm">
              <li><NuxtLink to="/privacy-policy" class="hover:text-blue-600 dark:hover:text-white transition-colors">Privacy Policy</NuxtLink></li>
              <li><NuxtLink to="/terms-of-service" class="hover:text-blue-600 dark:hover:text-white transition-colors">Terms of Service</NuxtLink></li>
              <li><NuxtLink to="/cookie-policy" class="hover:text-blue-600 dark:hover:text-white transition-colors">Cookie Policy</NuxtLink></li>
              <li><NuxtLink to="/support" class="hover:text-blue-600 dark:hover:text-white transition-colors">Help & Support</NuxtLink></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap");

html {
  font-family: "Plus Jakarta Sans", sans-serif;
  scroll-behavior: smooth;
}
</style>
