<script setup lang="ts">
import type { Transaction, TransactionResponse } from "~/types";

useHead({
  title: "FTraker - Dashboard",
  meta: [
    { name: "description", content: "Your financial dashboard at a glance." },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});

const router = useRouter();
const store = useDefaultStore();
const toast = useToast();

// Check if user is authenticated
const jwt = useCookie("jwt");
if (!jwt.value) {
  router.push("/login");
}

const selectedView = ref<"Week" | "Month" | "Year">("Month");

const { data, status, error, refresh } = useAsyncData<TransactionResponse>(
  "dashboardData",
  async () => {
    try {
      const jwt = useCookie("jwt");
      if (!jwt.value) {
        throw new Error("No JWT token found");
      }
      const res = await (useNuxtApp().$axios as any).get(
        `/api/transaction?view=${selectedView.value}`,
      );
      return res.data || res;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to fetch dashboard data");
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

// Calculate key metrics
const incomeTotal = computed(() => {
  return (data.value?.body?.current || []).reduce(
    (sum: number, t: Transaction) => {
      return t.type.toLowerCase() === "income" ? sum + t.amount : sum;
    },
    0,
  );
});
console.log("Income Total:", data.value);
const expenseTotal = computed(() => {
  return (data.value?.body?.current || []).reduce(
    (sum: number, t: Transaction) => {
      const type = t.type.toLowerCase();
      console.log(
        `Transaction: ${t.description}, Type: ${type}, Amount: ${t.amount}`,
      );
      return type === "expense" || type === "expanse" ? sum + t.amount : sum;
    },
    0,
  );
});

const balance = computed(() => {
  return incomeTotal.value - expenseTotal.value;
});

const recentTransactions = computed(() => {
  const all = (data.value?.body?.current || []) as Transaction[];
  return [...all]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);
});

const topExpenses = computed(() => {
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
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
});

const transactionCount = computed(() => {
  return (data.value?.body?.current || []).length;
});

watch(selectedView, async () => {
  await refresh();
});

watch(error, (newError) => {
  if (newError && isHydrated.value) {
    toast.add({
      title: "Error",
      description: newError.message || "An error occurred while loading dashboard",
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

    <!-- Welcome Hero -->
    <section
      class="mb-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl shadow-xl p-8 md:p-12"
    >
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        <div class="flex-1">
          <h1 class="text-4xl md:text-5xl font-black mb-2">Welcome back! 👋</h1>
          <p class="text-blue-100 text-lg">Here's your financial overview</p>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink to="/analytics">
            <UButton
              color="white"
              variant="ghost"
              size="lg"
              class="bg-white/10 hover:bg-white/20"
            >
              📊 Analytics
            </UButton>
          </NuxtLink>
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

    <!-- Key Metrics -->
    <section v-if="isHydrated && !loading" class="mb-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Balance Card -->
        <div
          class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white p-8"
        >
          <div
            class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-6">
              <p class="text-sm font-semibold opacity-90 uppercase">
                Current Balance
              </p>
              <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <i
                  class="i-material-symbols-account-balance-wallet text-2xl"
                ></i>
              </div>
            </div>
            <p class="text-4xl font-black mb-2">{{ currency(balance) }}</p>
            <p class="text-sm opacity-80">
              {{ balance > 0 ? "✅ Positive" : "⚠️ Negative" }}
            </p>
          </div>
        </div>

        <!-- Income Card -->
        <div
          class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white p-8"
        >
          <div
            class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-6">
              <p class="text-sm font-semibold opacity-90 uppercase">
                Total Income
              </p>
              <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <i class="i-material-symbols-trending-up-outline text-2xl"></i>
              </div>
            </div>
            <p class="text-4xl font-black mb-2">+{{ currency(incomeTotal) }}</p>
            <p class="text-sm opacity-80">💰 This {{ selectedView }}</p>
          </div>
        </div>

        <!-- Expense Card -->
        <div
          class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-400 via-red-500 to-rose-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white p-8"
        >
          <div
            class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
          <div class="relative">
            <div class="flex items-center justify-between mb-6">
              <p class="text-sm font-semibold opacity-90 uppercase">
                Total Expense
              </p>
              <div class="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <i
                  class="i-material-symbols-trending-down-outline text-2xl"
                ></i>
              </div>
            </div>
            <p class="text-4xl font-black mb-2">
              -{{ currency(expenseTotal) }}
            </p>
            <p class="text-sm opacity-80">📊 This {{ selectedView }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Content Grid -->
    <div
      v-if="isHydrated && !loading"
      class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
    >
      <!-- Recent Transactions (Main) -->
      <div
        class="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8"
      >
        <div class="flex items-center justify-between mb-6">
          <h2
            class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
          >
            <i class="i-material-symbols-receipt text-2xl text-blue-600"></i>
            Recent Transactions
          </h2>
          <NuxtLink
            to="/transactions"
            class="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            View All →
          </NuxtLink>
        </div>

        <div v-if="recentTransactions.length > 0" class="space-y-3">
          <div
            v-for="transaction in recentTransactions"
            :key="transaction._id"
            class="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-300"
          >
            <div class="flex items-center flex-1 min-w-0 gap-4">
              <div
                :class="[
                  'p-3 rounded-lg flex-shrink-0',
                  transaction.type.toLowerCase() === 'income'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-red-100 dark:bg-red-900/30',
                ]"
              >
                <i
                  :class="[
                    'text-lg',
                    transaction.type.toLowerCase() === 'income'
                      ? 'i-material-symbols-trending-up text-green-600'
                      : 'i-material-symbols-trending-down text-red-600',
                  ]"
                ></i>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 dark:text-white truncate">
                  {{ transaction.description }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{
                    new Date(transaction.createdAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" },
                    )
                  }}
                </p>
              </div>
            </div>
            <p
              :class="[
                'text-lg font-bold flex-shrink-0',
                transaction.type.toLowerCase() === 'income'
                  ? 'text-green-600'
                  : 'text-red-600',
              ]"
            >
              {{ transaction.type.toLowerCase() === "income" ? "+" : "-"
              }}{{ currency(transaction.amount) }}
            </p>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          No transactions yet. Start by adding one!
        </div>
      </div>

      <!-- Quick Stats Sidebar -->
      <div class="space-y-6">
        <!-- Transactions Count -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
          <div class="flex items-center justify-between mb-4">
            <p
              class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase"
            >
              Transactions
            </p>
            <i class="i-material-symbols-counter text-2xl text-purple-600"></i>
          </div>
          <p class="text-3xl font-black text-gray-900 dark:text-white">
            {{ transactionCount }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This {{ selectedView }}
          </p>
        </div>

        <!-- Top Expenses -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
          <h3
            class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
          >
            <i
              class="i-material-symbols-trending-down text-red-600 text-xl"
            ></i>
            Top Expenses
          </h3>
          <div v-if="topExpenses.length > 0" class="space-y-3">
            <div
              v-for="([desc, amount], idx) in topExpenses.slice(0, 3)"
              :key="idx"
              class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50"
            >
              <p
                class="text-sm font-medium text-gray-900 dark:text-white truncate"
              >
                {{ desc }}
              </p>
              <p class="text-sm font-bold text-red-600 flex-shrink-0">
                {{ currency(amount) }}
              </p>
            </div>
          </div>
          <div v-else class="text-center py-4 text-gray-500 text-sm">
            No expenses yet
          </div>
        </div>

        <!-- Quick Actions -->
        <div
          class="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8"
        >
          <h3
            class="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
          >
            <i class="i-material-symbols-flash-on text-yellow-500 text-xl"></i>
            Quick Actions
          </h3>
          <div class="space-y-3">
            <NuxtLink
              to="/transactions"
              class="block w-full px-4 py-2 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              View Transactions
            </NuxtLink>
            <NuxtLink
              to="/analytics"
              class="block w-full px-4 py-2 text-center bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              View Analytics
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <section v-else class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <USkeleton v-for="i in 3" :key="i" class="h-40 rounded-2xl" />
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <USkeleton class="lg:col-span-2 h-96 rounded-2xl" />
        <div class="space-y-6">
          <USkeleton class="h-40 rounded-2xl" />
          <USkeleton class="h-40 rounded-2xl" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.min-h-screen > section,
.min-h-screen > div:not(.absolute) {
  animation: fadeIn 0.5s ease-out;
}
</style>
