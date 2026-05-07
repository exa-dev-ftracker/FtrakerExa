<script setup lang="ts">
import type { Transaction, TransactionResponse } from "~/types";

useHead({
  title: "FTraker - Analytics",
  meta: [
    {
      name: "description",
      content: "View your financial analytics and insights.",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});

const toast = useToast();
const router = useRouter();
const selectedView = ref<"Week" | "Month" | "Year">("Month");
const showError = ref(false);

const { data, status, error, refresh } = useAsyncData<TransactionResponse>(
  "analyticsData",
  async () => {
    const jwt = useCookie("jwt");
    if (!jwt.value) {
      throw new Error("No JWT token found");
    }
    try {
      const res = await (useNuxtApp().$axios as any).get(
        `/api/transaction?view=${selectedView.value}`,
      );
      return res.data || res;
    } catch (err: any) {
      console.error("Error fetching analytics data:", err);
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch analytics data",
      );
    }
  },
);

const isHydrated = ref(false);
onMounted(() => {
  isHydrated.value = true;
});

const loading = computed(() => {
  return status.value !== "success";
});

// Calculate analytics
const incomeByCategory = computed(() => {
  const map: Record<string, number> = {};
  const incomes = (data.value?.body?.current || []).filter(
    (t: Transaction) => t.type.toLowerCase() === "income",
  );
  incomes.forEach((t: Transaction) => {
    map[t.description] = (map[t.description] || 0) + t.amount;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
});

const expenseByCategory = computed(() => {
  const map: Record<string, number> = {};
  const expenses = (data.value?.body?.current || []).filter(
    (t: Transaction) => {
      const type = t.type.toLowerCase();
      return type === "expense" || type === "expanse";
    },
  );
  expenses.forEach((t: Transaction) => {
    map[t.description] = (map[t.description] || 0) + t.amount;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
});

const incomeTotal = computed(() => {
  return (data.value?.body?.current || []).reduce(
    (sum: number, t: Transaction) => {
      return t.type.toLowerCase() === "income" ? sum + t.amount : sum;
    },
    0,
  );
});

const expenseTotal = computed(() => {
  return (data.value?.body?.current || []).reduce(
    (sum: number, t: Transaction) => {
      const type = t.type.toLowerCase();
      return type === "expense" || type === "expanse" ? sum + t.amount : sum;
    },
    0,
  );
});

const transactionCount = computed(() => {
  return (data.value?.body?.current || []).length;
});

const averageTransaction = computed(() => {
  return transactionCount.value > 0
    ? (incomeTotal.value + expenseTotal.value) / transactionCount.value
    : 0;
});

const largestTransaction = computed(() => {
  const all = data.value?.body?.current || [];
  return all.length > 0
    ? Math.max(...all.map((t: Transaction) => t.amount))
    : 0;
});

const getPercentage = (value: number, total: number): number => {
  return total > 0 ? Math.round((value / total) * 100) : 0;
};

watch(selectedView, async () => {
  await refresh();
});

watch(error, (newError) => {
  if (newError && isHydrated.value) {
    showError.value = true;
    toast.add({
      title: "Error",
      description: newError.message || "Failed to fetch analytics. Please refresh.",
      color: "red",
    });
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900"
  >
    <UNotifications />

    <!-- Header -->
    <section
      class="mb-12 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white rounded-2xl shadow-xl p-8 md:p-12"
    >
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-2xl">
              📊
            </div>
            <h1 class="text-4xl md:text-5xl font-black">
              Analytics & Insights
            </h1>
          </div>
          <p class="text-blue-100 text-lg">
            Deep dive into your financial data
          </p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <UButton
            @click="refresh"
            color="white"
            variant="ghost"
            :loading="loading"
            size="lg"
            class="bg-white/10 hover:bg-white/20"
          >
            🔄 Refresh
          </UButton>
          <USelect
            v-model="selectedView"
            :options="[
              { label: 'Weekly', value: 'Week' },
              { label: 'Monthly', value: 'Month' },
              { label: 'Yearly', value: 'Year' },
            ]"
          />
        </div>
      </div>
    </section>

    <!-- Error State -->
    <section
      v-if="showError && !loading"
      class="mb-12 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center"
    >
      <p class="text-lg text-red-600 dark:text-red-400 mb-4">
        ❌ Unable to load analytics data
      </p>
      <UButton @click="refresh" color="red">Try Again</UButton>
    </section>

    <!-- Key Metrics -->
    <section v-else-if="isHydrated && !loading" class="mb-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Income -->
        <div
          class="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 p-6"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4">
              <p
                class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase truncate pr-2"
              >
                Total Income
              </p>
              <div
                class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-lg shrink-0"
              >
                📈
              </div>
            </div>
            <p
              class="text-2xl xl:text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent break-words whitespace-normal"
            >
              +{{ currency(incomeTotal) }}
            </p>
          </div>
        </div>

        <!-- Total Expense -->
        <div
          class="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 p-6"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4">
              <p
                class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase truncate pr-2"
              >
                Total Expense
              </p>
              <div
                class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-lg shrink-0"
              >
                📉
              </div>
            </div>
            <p
              class="text-2xl xl:text-3xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent break-words whitespace-normal"
            >
              -{{ currency(expenseTotal) }}
            </p>
          </div>
        </div>

        <!-- Net Balance -->
        <div
          class="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 p-6"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4">
              <p
                class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase truncate pr-2"
              >
                Net Balance
              </p>
              <div
                class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-lg shrink-0"
              >
                💳
              </div>
            </div>
            <p
              :class="[
                incomeTotal - expenseTotal >= 0
                  ? 'text-green-600'
                  : 'text-red-600',
                'text-2xl xl:text-3xl font-black break-words whitespace-normal',
              ]"
            >
              {{ incomeTotal - expenseTotal >= 0 ? "+" : "-"
              }}{{ currency(Math.abs(incomeTotal - expenseTotal)) }}
            </p>
          </div>
        </div>

        <!-- Transactions Count -->
        <div
          class="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 p-6"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-4">
              <p
                class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase truncate pr-2"
              >
                Transactions
              </p>
              <div
                class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-lg shrink-0"
              >
                📝
              </div>
            </div>
            <p
              class="text-2xl xl:text-3xl font-black text-purple-600 dark:text-purple-400"
            >
              {{ transactionCount }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Charts Section -->
    <!-- Charts Section -->
    <div
      v-if="!loading && !showError"
      class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
    >
      <!-- Income Breakdown -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <h3
          class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
        >
          <span class="text-2xl">📈</span>
          Income Breakdown
        </h3>
        <div class="space-y-4">
          <div
            v-for="([description, amount], idx) in incomeByCategory"
            :key="idx"
            class="group"
          >
            <div class="flex items-center justify-between mb-2">
              <p class="font-semibold text-gray-900 dark:text-white truncate">
                {{ description }}
              </p>
              <p class="text-sm font-bold text-green-600">
                {{ getPercentage(amount, incomeTotal) }}%
              </p>
            </div>
            <div
              class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden"
            >
              <div
                class="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500 group-hover:from-green-600 group-hover:to-emerald-600"
                :style="{ width: `${getPercentage(amount, incomeTotal)}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ currency(amount) }}
            </p>
          </div>
          <div
            v-if="incomeByCategory.length === 0"
            class="text-center py-8 text-gray-500"
          >
            No income data
          </div>
        </div>
      </div>

      <!-- Expense Breakdown -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <h3
          class="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
        >
          <span class="text-2xl">📉</span>
          Expense Breakdown
        </h3>
        <div class="space-y-4">
          <div
            v-for="([description, amount], idx) in expenseByCategory"
            :key="idx"
            class="group"
          >
            <div class="flex items-center justify-between mb-2">
              <p class="font-semibold text-gray-900 dark:text-white truncate">
                {{ description }}
              </p>
              <p class="text-sm font-bold text-red-600">
                {{ getPercentage(amount, expenseTotal) }}%
              </p>
            </div>
            <div
              class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden"
            >
              <div
                class="bg-gradient-to-r from-red-500 to-rose-500 h-full rounded-full transition-all duration-500 group-hover:from-red-600 group-hover:to-rose-600"
                :style="{ width: `${getPercentage(amount, expenseTotal)}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ currency(amount) }}
            </p>
          </div>
          <div
            v-if="expenseByCategory.length === 0"
            class="text-center py-8 text-gray-500"
          >
            No expense data
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Stats -->
    <section
      v-if="!loading && !showError"
      class="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      <!-- Average Transaction -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <div class="flex items-center justify-between mb-4">
          <p
            class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase"
          >
            Average Transaction
          </p>
          <span class="text-2xl">🧮</span>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">
          {{ currency(averageTransaction) }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {{ transactionCount }} transactions
        </p>
      </div>

      <!-- Largest Transaction -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <div class="flex items-center justify-between mb-4">
          <p
            class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase"
          >
            Largest Transaction
          </p>
          <span class="text-2xl">🚀</span>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">
          {{ currency(largestTransaction) }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Single transaction
        </p>
      </div>

      <!-- Income/Expense Ratio -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <div class="flex items-center justify-between mb-4">
          <p
            class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase"
          >
            Income/Expense Ratio
          </p>
          <span class="text-2xl">📊</span>
        </div>
        <p class="text-2xl font-black text-gray-900 dark:text-white">
          {{
            expenseTotal > 0 ? (incomeTotal / expenseTotal).toFixed(2) : "∞"
          }}x
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Ratio</p>
      </div>
    </section>

    <!-- Loading State -->
    <section v-else-if="loading" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <USkeleton v-for="i in 4" :key="i" class="h-32 rounded-2xl" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <USkeleton class="h-96 rounded-2xl" />
        <USkeleton class="h-96 rounded-2xl" />
      </div>
    </section>
  </div>
</template>
