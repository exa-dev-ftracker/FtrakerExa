<script setup lang="ts">
import type { Transaction, TransactionResponse } from "~/types";

useHead({
  title: "FTraker - Analytics",
  meta: [
    { name: "description", content: "View your financial analytics and insights." },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});

const toast = useToast();
const selectedView = ref<"Week" | "Month" | "Year">("Month");
const showError = ref(false);

const { data, status, error, refresh } = useAsyncData<TransactionResponse>(
  "analyticsData",
  async () => {
    try {
      const res = await (useNuxtApp().$axios as any).get(`/api/transaction?view=${selectedView.value}`);
      return res.data || res;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to fetch analytics");
    }
  }
);
const loading = computed(() => status.value !== "success");

// Calculations
const incomeByCategory = computed(() => {
  const map: Record<string, number> = {};
  (data.value?.body?.current || [])
    .filter(t => t.type.toLowerCase() === "income")
    .forEach(t => map[t.description] = (map[t.description] || 0) + t.amount);
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
});

const expenseByCategory = computed(() => {
  const map: Record<string, number> = {};
  (data.value?.body?.current || [])
    .filter(t => ["expense", "expanse"].includes(t.type.toLowerCase()))
    .forEach(t => map[t.description] = (map[t.description] || 0) + t.amount);
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
});

const incomeTotal = computed(() => (data.value?.body?.current || []).reduce((s, t) => t.type.toLowerCase() === "income" ? s + t.amount : s, 0));
const expenseTotal = computed(() => (data.value?.body?.current || []).reduce((s, t) => ["expense", "expanse"].includes(t.type.toLowerCase()) ? s + t.amount : s, 0));
const transactionCount = computed(() => (data.value?.body?.current || []).length);
const averageTransaction = computed(() => transactionCount.value > 0 ? (incomeTotal.value + expenseTotal.value) / transactionCount.value : 0);
const largestTransaction = computed(() => {
  const all = data.value?.body?.current || [];
  return all.length > 0 ? Math.max(...all.map(t => t.amount)) : 0;
});

const getPercentage = (v: number, t: number) => t > 0 ? Math.round((v / t) * 100) : 0;

watch(selectedView, () => refresh());
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#030712] pt-8 pb-32 sm:py-12">
    <div class="max-w-6xl mx-auto px-6 lg:px-8">
      <UNotifications />

      <!-- Header -->
      <Motion 
        :initial="{ opacity: 0, y: -30 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8 }"
        class="header-anim flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
      >
        <div class="space-y-2">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center">
              <UIcon name="i-heroicons-chart-pie" class="w-6 h-6 text-purple-600" />
            </div>
            <span class="text-sm font-black text-purple-600 uppercase tracking-widest">Financial Insights</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Intelligence</h1>
          <p class="text-gray-500 dark:text-gray-400 font-medium text-lg">Detailed analysis of your spending and earning patterns.</p>
        </div>

        <div class="flex items-center gap-4">
           <USelectMenu
              v-model="selectedView"
              :options="['Week', 'Month', 'Year']"
              size="xl"
              class="w-40"
              :ui-menu="{ rounded: 'rounded-2xl' }"
           >
              <template #label>
                 <span class="font-black text-blue-600">{{ selectedView }} View</span>
              </template>
           </USelectMenu>
           <UButton @click="refresh" icon="i-heroicons-arrow-path" color="gray" variant="soft" :loading="loading" class="rounded-2xl h-12 w-12 flex items-center justify-center" />
        </div>
      </Motion>

      <!-- Metrics Grid -->
      <div v-if="!loading && !showError" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Motion 
           v-for="(metric, i) in [
             { label: 'Total Income', val: incomeTotal, icon: 'i-heroicons-arrow-up-circle', color: 'text-emerald-500', bg: 'bg-emerald-500/10', prefix: '+' },
             { label: 'Total Expenses', val: expenseTotal, icon: 'i-heroicons-arrow-down-circle', color: 'text-rose-500', bg: 'bg-rose-500/10', prefix: '-' },
             { label: 'Net Savings', val: incomeTotal - expenseTotal, icon: 'i-heroicons-banknotes', color: 'text-blue-500', bg: 'bg-blue-500/10', prefix: (incomeTotal - expenseTotal >= 0 ? '+' : '-') },
             { label: 'Volume', val: transactionCount, icon: 'i-heroicons-document-text', color: 'text-purple-500', bg: 'bg-purple-500/10', isRaw: true }
           ]" 
           :key="i" 
           :initial="{ opacity: 0, y: 30 }"
           :animate="{ opacity: 1, y: 0 }"
           :transition="{ duration: 0.6, delay: i * 0.1 + 0.4 }"
           class="metric-card bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-8 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-gray-200/20 dark:shadow-none relative overflow-hidden group"
        >
           <div :class="['absolute top-0 right-0 w-24 h-24 blur-3xl opacity-20 transition-opacity group-hover:opacity-40', metric.bg]"></div>
           <div class="relative z-10 space-y-4">
              <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center', metric.bg]">
                <UIcon :name="metric.icon" :class="['w-6 h-6', metric.color]" />
              </div>
              <div>
                 <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{{ metric.label }}</p>
                 <h2 class="text-2xl font-black text-gray-900 dark:text-white">
                   <template v-if="!metric.isRaw">{{ metric.prefix }}{{ currency(Math.abs(metric.val)) }}</template>
                   <template v-else>{{ metric.val }}</template></h2 >
              </div>
           </div>
        </Motion>
      </div>

      <!-- Detailed Breakdown -->
      <div v-if="!loading && !showError" class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <!-- Income Breakdown -->
        <Motion 
           :initial="{ opacity: 0, scale: 0.95 }"
           :animate="{ opacity: 1, scale: 1 }"
           :transition="{ duration: 0.8, delay: 0.8 }"
           class="chart-card bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-[3rem] p-10"
        >
           <h3 class="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <UIcon name="i-heroicons-squares-2x2" class="w-7 h-7 text-emerald-500" />
              Income Sources
           </h3>
           <div v-if="incomeByCategory.length > 0" class="space-y-8">
              <Motion 
                v-for="([desc, amt], i) in incomeByCategory" 
                :key="i" 
                :initial="{ opacity: 0, x: -20 }"
                :animate="{ opacity: 1, x: 0 }"
                :transition="{ delay: i * 0.05 + 1.2 }"
                class="progress-item space-y-3"
              >
                 <div class="flex justify-between items-end">
                    <span class="font-bold text-gray-700 dark:text-gray-300">{{ desc }}</span>
                    <span class="text-sm font-black text-emerald-500">{{ getPercentage(amt, incomeTotal) }}%</span>
                 </div>
                 <div class="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" :style="{ width: getPercentage(amt, incomeTotal) + '%' }"></div>
                 </div>
                 <p class="text-xs font-black text-gray-400 uppercase tracking-tighter">{{ currency(amt) }}</p>
              </Motion>
           </div>
           <div v-else class="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-sm">No Income Logged</div>
        </Motion>

        <!-- Expense Breakdown -->
        <Motion 
           :initial="{ opacity: 0, scale: 0.95 }"
           :animate="{ opacity: 1, scale: 1 }"
           :transition="{ duration: 0.8, delay: 1.0 }"
           class="chart-card bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/5 rounded-[3rem] p-10"
        >
           <h3 class="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
              <UIcon name="i-heroicons-rectangle-group" class="w-7 h-7 text-rose-500" />
              Expense Categories
           </h3>
           <div v-if="expenseByCategory.length > 0" class="space-y-8">
              <Motion 
                v-for="([desc, amt], i) in expenseByCategory" 
                :key="i" 
                :initial="{ opacity: 0, x: -20 }"
                :animate="{ opacity: 1, x: 0 }"
                :transition="{ delay: i * 0.05 + 1.4 }"
                class="progress-item space-y-3"
              >
                 <div class="flex justify-between items-end">
                    <span class="font-bold text-gray-700 dark:text-gray-300">{{ desc }}</span>
                    <span class="text-sm font-black text-rose-500">{{ getPercentage(amt, expenseTotal) }}%</span>
                 </div>
                 <div class="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" :style="{ width: getPercentage(amt, expenseTotal) + '%' }"></div>
                 </div>
                 <p class="text-xs font-black text-gray-400 uppercase tracking-tighter">{{ currency(amt) }}</p>
              </Motion>
           </div>
           <div v-else class="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-sm">No Expenses Logged</div>
        </Motion>
      </div>

      <!-- Advanced Stats -->
      <div v-if="!loading && !showError" class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
         <div v-for="(stat, i) in [
            { label: 'Avg Ticket', val: currency(averageTransaction), sub: transactionCount + ' total ops' },
            { label: 'Peak Ops', val: currency(largestTransaction), sub: 'Max single entry' },
            { label: 'Stability', val: (expenseTotal > 0 ? (incomeTotal / expenseTotal).toFixed(2) : '∞') + 'x', sub: 'Inc/Exp multiplier' }
         ]" :key="i" class="metric-card bg-gray-50 dark:bg-white/5 rounded-[2.5rem] p-8 text-center border border-gray-200 dark:border-white/5">
            <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{{ stat.label }}</p>
            <h4 class="text-3xl font-black text-gray-900 dark:text-white mb-1">{{ stat.val }}</h4>
            <p class="text-xs font-bold text-blue-600 uppercase">{{ stat.sub }}</p>
         </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
           <USkeleton v-for="i in 4" :key="i" class="h-40 rounded-[2.5rem]" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <USkeleton class="h-[500px] rounded-[3rem]" />
           <USkeleton class="h-[500px] rounded-[3rem]" />
        </div>
      </div>
    </div>
  </div>
</template>

