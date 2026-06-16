<script setup lang="ts">
import type { Category, Transaction, TransactionResponse } from "~/types";

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
  await navigateTo("/login");
}

const selectedView = ref<"Week" | "Month" | "Year">("Month");

const { $axios } = useNuxtApp();
const { data, status, error, refresh } = useAsyncData<TransactionResponse>(
  "dashboardData",
  async () => {
    try {
      const jwt = useCookie("jwt");
      if (!jwt.value) {
        throw new Error("No JWT token found");
      }
      const res = await ($axios as any).get(
        `/api/transaction?view=${selectedView.value}`,
      );
      return res.data || res;
    } catch (err: any) {
      throw new Error(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch dashboard data",
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

// Calculate key metrics
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
      return type === "expense" ? sum + t.amount : sum;
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
    .slice(0, 8); // Show more on refactored dashboard
});

const getCategoryName = (t: Transaction): string => {
  if (typeof t.category === "object") return (t.category as Category).name;
  return "General";
};

const topExpenses = computed(() => {
  const map: Record<string, number> = {};
  const expenses = (data.value?.body?.current || []).filter(
    (t: Transaction) => {
      const type = t.type.toLowerCase();
      return type === "expense";
    },
  );
  expenses.forEach((t: Transaction) => {
    const name = getCategoryName(t);
    map[name] = (map[name] || 0) + t.amount;
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

watch(
  () => store.refreshTrigger,
  () => refresh(),
);

watch(error, (newError) => {
  if (newError && isHydrated.value) {
    toast.add({
      title: "Error",
      description:
        newError.message || "An error occurred while loading dashboard",
      color: "red",
    });
  }
});

const currency = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};
</script>

<template>
  <div
    class="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] p-3 sm:p-4 pb-32 md:p-8"
  >
    <UNotifications />

    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header / Welcome Section -->
      <Motion
        :initial="{ opacity: 0, y: -30 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8 }"
        class="dash-header flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div class="shrink-0">
          <h1
            class="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
          >
            Hello,
            <span class="text-blue-600">{{
              store.user?.name?.split(" ")[0] || "User"
            }}</span>
            👋
          </h1>
          <p
            class="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium"
          >
            Here's what's happening with your money today.
          </p>
        </div>

        <div
          class="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 sm:pb-0 no-scrollbar"
        >
          <div
            class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex shadow-sm shrink-0"
          >
            <button
              v-for="v in ['Week', 'Month', 'Year']"
              :key="v"
              @click="selectedView = v as any"
              :class="[
                'px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all',
                selectedView === v
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white',
              ]"
            >
              {{ v }}
            </button>
          </div>
        </div>
      </Motion>

      <!-- Stats Grid -->
      <section v-if="!loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Balance Card -->
        <Motion
          :initial="{ opacity: 0, y: 40 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, delay: 0.2 }"
          class="stat-card relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm group"
        >
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/10 transition-colors"
          ></div>
          <div class="relative flex flex-col h-full">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600"
              >
                <UIcon name="i-heroicons-credit-card" class="w-6 h-6" />
              </div>
              <span
                class="text-sm font-black text-slate-400 uppercase tracking-widest"
                >Total Balance</span
              >
            </div>
            <div class="mt-auto">
              <h2
                class="text-3xl font-black text-slate-900 dark:text-white mb-1"
              >
                {{ currency(balance) }}
              </h2>
              <div class="flex items-center gap-2">
                <span
                  class="flex h-2 w-2 rounded-full"
                  :class="balance >= 0 ? 'bg-emerald-500' : 'bg-rose-500'"
                ></span>
                <p
                  class="text-xs font-bold"
                  :class="balance >= 0 ? 'text-emerald-600' : 'text-rose-600'"
                >
                  {{ balance >= 0 ? "Surplus" : "Deficit" }} this period
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Income Card -->
        <Motion
          :initial="{ opacity: 0, y: 40 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, delay: 0.35 }"
          class="stat-card relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm group"
        >
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-colors"
          ></div>
          <div class="relative flex flex-col h-full">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600"
              >
                <UIcon name="i-heroicons-arrow-trending-up" class="w-6 h-6" />
              </div>
              <span
                class="text-sm font-black text-slate-400 uppercase tracking-widest"
                >Total Income</span
              >
            </div>
            <div class="mt-auto">
              <h2
                class="text-3xl font-black text-slate-900 dark:text-white mb-1"
              >
                {{ currency(incomeTotal) }}
              </h2>
              <p class="text-xs font-bold text-slate-400">
                Received this {{ selectedView.toLowerCase() }}
              </p>
            </div>
          </div>
        </Motion>

        <!-- Expense Card -->
        <Motion
          :initial="{ opacity: 0, y: 40 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, delay: 0.5 }"
          class="stat-card relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm group"
        >
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-rose-500/10 transition-colors"
          ></div>
          <div class="relative flex flex-col h-full">
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-600"
              >
                <UIcon name="i-heroicons-arrow-trending-down" class="w-6 h-6" />
              </div>
              <span
                class="text-sm font-black text-slate-400 uppercase tracking-widest"
                >Total Expenses</span
              >
            </div>
            <div class="mt-auto">
              <h2
                class="text-3xl font-black text-slate-900 dark:text-white mb-1"
              >
                {{ currency(expenseTotal) }}
              </h2>
              <p class="text-xs font-bold text-slate-400">
                Spent this {{ selectedView.toLowerCase() }}
              </p>
            </div>
          </div>
        </Motion>
      </section>

      <!-- Main Content Grid -->
      <div v-if="!loading" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Recent Transactions -->
        <Motion
          :initial="{ opacity: 0, y: 40 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 1.0, delay: 0.6 }"
          class="main-content lg:col-span-8 space-y-6"
        >
          <div
            class="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            <div
              class="p-5 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
            >
              <h3
                class="text-lg sm:text-xl font-black text-slate-900 dark:text-white"
              >
                Recent Activity
              </h3>
              <NuxtLink to="/transactions">
                <UButton
                  variant="ghost"
                  color="gray"
                  trailing-icon="i-heroicons-arrow-right"
                  class="font-bold text-xs sm:text-sm"
                  >View All</UButton
                >
              </NuxtLink>
            </div>
            <div class="p-2">
              <div
                v-if="recentTransactions.length > 0"
                class="divide-y divide-slate-50 dark:divide-slate-800/50"
              >
                <div
                  v-for="t in recentTransactions"
                  :key="t._id"
                  class="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors group"
                >
                  <div class="flex items-center gap-4">
                    <div
                      :class="[
                        'w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0',
                        t.type.toLowerCase() === 'income'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
                          : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600',
                      ]"
                    >
                      <UIcon
                        :name="
                          t.type.toLowerCase() === 'income'
                            ? 'i-heroicons-banknotes'
                            : 'i-heroicons-shopping-cart'
                        "
                        class="w-5 h-5 sm:w-6 sm:h-6"
                      />
                    </div>
                    <div>
                      <p
                        class="font-bold text-slate-900 dark:text-white leading-none mb-1"
                      >
                        {{ t.description }}
                      </p>
                      <p class="text-xs font-bold text-slate-400">
                        {{
                          new Date(t.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right shrink-0">
                    <p
                      :class="[
                        'text-base sm:text-lg font-black',
                        t.type.toLowerCase() === 'income'
                          ? 'text-emerald-600'
                          : 'text-slate-900 dark:text-white',
                      ]"
                    >
                      {{ t.type.toLowerCase() === "income" ? "+" : "-"
                      }}{{ currency(t.amount) }}
                    </p>
                  </div>
                </div>
              </div>
              <div v-else class="py-20 text-center">
                <UIcon
                  name="i-heroicons-inbox"
                  class="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4"
                />
                <p class="text-slate-500 font-bold">
                  No transactions found for this period.
                </p>
              </div>
            </div>
          </div>
        </Motion>

        <!-- Sidebar Widgets -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Top Expenses Widget -->
          <Motion
            :initial="{ opacity: 0, x: 40 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.8, delay: 0.7 }"
            class="sidebar-card bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm"
          >
            <h3 class="text-lg font-black text-slate-900 dark:text-white mb-6">
              Top Spending
            </h3>
            <div v-if="topExpenses.length > 0" class="space-y-4">
              <div
                v-for="[desc, amount] in topExpenses"
                :key="desc"
                class="space-y-2"
              >
                <div class="flex justify-between items-end gap-2">
                  <span
                    class="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 truncate max-w-[100px] sm:max-w-[150px]"
                    >{{ desc }}</span
                  >
                  <span
                    class="text-xs sm:text-sm font-black text-slate-900 dark:text-white shrink-0"
                    >{{ currency(amount) }}</span
                  >
                </div>
                <div
                  class="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"
                >
                  <div
                    class="h-full bg-blue-600 rounded-full"
                    :style="{ width: `${(amount / expenseTotal) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="py-10 text-center">
              <p class="text-sm text-slate-400 font-bold">
                No data to display.
              </p>
            </div>
          </Motion>
        </div>
      </div>

      <!-- Loading State Skeleton -->
      <div v-else class="space-y-8">
        <div class="flex justify-between items-center">
          <USkeleton class="h-10 w-48 rounded-lg" />
          <USkeleton class="h-10 w-64 rounded-lg" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <USkeleton v-for="i in 3" :key="i" class="h-32 rounded-3xl" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <USkeleton class="lg:col-span-8 h-[500px] rounded-[2rem]" />
          <div class="lg:col-span-4 space-y-6">
            <USkeleton class="h-64 rounded-[2rem]" />
            <USkeleton class="h-48 rounded-[2rem]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.min-h-screen {
  font-family: "Plus Jakarta Sans", sans-serif;
}
</style>
