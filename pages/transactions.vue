<script setup lang="ts">
import { transactionViewOptions } from "~/constants";
import type { Transaction, TransactionResponse, TransactionSummary, TransactionSummaryResponse } from "~/types";

useHead({
  title: "FTraker - Transaction History & Records",
  meta: [
    { name: "description", content: "View and manage your financial records with infinite scroll and real-time summaries." },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});

definePageMeta({
  middleware: "is-auth",
});

const toast = useToast();
const store = useDefaultStore();
const { $axios } = useNuxtApp();
const isDark = computed(() => useColorMode().value === "dark");

// Hydration flag
const isHydrated = ref(false);

// Filter & Sort States
const selectedView = ref<string>(transactionViewOptions[2] || "Month"); // Default 'Month'
const filterCategory = ref<string>("all");
const filterType = ref<"All" | "Income" | "Expense">("All");
const sortBy = ref<"newest" | "oldest" | "highest" | "lowest">("newest");
const searchQuery = ref<string>("");

// Custom Date Range States
type DateRange = [Date, Date] | null;
const dateRange = ref<DateRange>(null);
const appliedStartDate = ref<string>("");
const appliedEndDate = ref<string>("");

// Pagination & Infinite Scroll States
const page = ref(1);
const limit = 20;
const hasMore = ref(true);
const isLoadingInitial = ref(false);
const isLoadingMore = ref(false);
const isDeleting = ref(false);
const transactionsList = ref<Transaction[]>([]);
const infiniteScrollSentinel = ref<HTMLElement | null>(null);

// Summary State (Loaded from separate /api/transaction/summary endpoint)
const summary = ref<TransactionSummary>({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  totalCount: 0,
  incomeCount: 0,
  expenseCount: 0,
});
const isSummaryLoading = ref(false);

// Scroll to top button visibility
const showBackToTop = ref(false);

// Date formatting helper
const toDateStr = (d: Date | null) => {
  if (!d || !(d instanceof Date) || isNaN(+d)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// Build Query Params for API calls
const buildFilterParams = () => {
  const params = new URLSearchParams();
  params.append("view", selectedView.value);

  if (filterCategory.value && filterCategory.value !== "all") {
    params.append("category", filterCategory.value);
  }

  if (filterType.value !== "All") {
    params.append("type", filterType.value);
  }

  if (searchQuery.value.trim()) {
    params.append("search", searchQuery.value.trim());
  }

  if (selectedView.value === "Custom") {
    if (appliedStartDate.value) params.append("startDate", appliedStartDate.value);
    if (appliedEndDate.value) params.append("endDate", appliedEndDate.value);
  }

  return params;
};

// 1. Fetch Summary from Dedicated Endpoint (/api/transaction/summary)
const fetchSummary = async () => {
  if (selectedView.value === "Custom" && (!appliedStartDate.value || !appliedEndDate.value)) {
    summary.value = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      totalCount: 0,
      incomeCount: 0,
      expenseCount: 0,
    };
    return;
  }

  isSummaryLoading.value = true;
  try {
    const params = buildFilterParams();
    const res = await ($axios as any).get<TransactionSummaryResponse>(
      `/api/transaction/summary?${params.toString()}`
    );
    const data = res.data || res;
    if (data?.body) {
      summary.value = data.body;
    }
  } catch (err: any) {
    console.error("Failed to fetch transaction summary:", err);
  } finally {
    isSummaryLoading.value = false;
  }
};

// 2. Fetch Transactions Page (Scroll Pagination)
const fetchTransactions = async (targetPage = 1, isAppend = false) => {
  if (selectedView.value === "Custom" && (!appliedStartDate.value || !appliedEndDate.value)) {
    transactionsList.value = [];
    hasMore.value = false;
    return;
  }

  if (isAppend) {
    isLoadingMore.value = true;
  } else {
    isLoadingInitial.value = true;
  }

  try {
    const params = buildFilterParams();
    params.append("page", String(targetPage));
    params.append("limit", String(limit));
    params.append("sort", sortBy.value);

    const res = await ($axios as any).get<TransactionResponse>(
      `/api/transaction?${params.toString()}`
    );
    const data = res.data || res;
    const newItems: Transaction[] = data?.body?.current || [];
    const pagination = data?.body?.pagination;

    if (isAppend) {
      transactionsList.value.push(...newItems);
    } else {
      transactionsList.value = newItems;
    }

    page.value = targetPage;
    if (pagination) {
      hasMore.value = pagination.hasMore;
    } else {
      hasMore.value = newItems.length >= limit;
    }
  } catch (err: any) {
    toast.add({
      title: "Error Loading Data",
      description: err.response?.data?.message || err.message || "Failed to fetch transactions",
      color: "red",
    });
  } finally {
    isLoadingInitial.value = false;
    isLoadingMore.value = false;
  }
};

// Trigger Next Page for Infinite Scroll
const loadMoreTransactions = async () => {
  if (isLoadingInitial.value || isLoadingMore.value || !hasMore.value) return;
  await fetchTransactions(page.value + 1, true);
};

// Full Refresh (resets to page 1 & re-fetches summary)
const resetAndRefresh = async () => {
  page.value = 1;
  hasMore.value = true;
  await Promise.all([
    fetchSummary(),
    fetchTransactions(1, false),
  ]);
};

// Group transactions by date for aesthetic daily breakdown
const transactionsByDate = computed(() => {
  const groups: Record<string, Transaction[]> = {};
  for (const t of transactionsList.value) {
    const dateKey = new Date(t.createdAt).toISOString().split("T")[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(t);
  }
  return groups;
});

// Custom date range handlers
const customApplied = computed(() => !!appliedStartDate.value && !!appliedEndDate.value);

const applyCustomRange = () => {
  const range = dateRange.value;
  if (!range || range.length < 2) return;
  const start = toDateStr(range[0]);
  const end = toDateStr(range[1]);
  if (!start || !end || end < start) return;
  appliedStartDate.value = start;
  appliedEndDate.value = end;
  resetAndRefresh();
};

const clearCustomRange = () => {
  dateRange.value = null;
  appliedStartDate.value = "";
  appliedEndDate.value = "";
  resetAndRefresh();
};

// Delete transaction
const handleDeleteTransaction = async (id: string) => {
  if (isDeleting.value) return;
  isDeleting.value = true;
  try {
    await ($axios as any).delete("/api/transaction", { data: { id } });
    toast.add({ title: "Deleted", description: "Transaction removed successfully", color: "green" });
    // Remove locally for instantaneous UI feedback
    transactionsList.value = transactionsList.value.filter((t) => t._id !== id);
    // Refresh summary count and amounts
    fetchSummary();
  } catch (error: any) {
    toast.add({ title: "Error", description: "Failed to delete transaction", color: "red" });
  } finally {
    isDeleting.value = false;
  }
};

// Edit transaction
const handleEdit = (date: string, _id: string) => {
  const t = transactionsList.value.find((item) => item._id === _id);
  if (!t) return;
  store.editTransaction(t);
};

// Intersection Observer for Infinite Scroll
let observer: IntersectionObserver | null = null;
const setupIntersectionObserver = () => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

  if (observer) observer.disconnect();

  observer = new IntersectionObserver(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore.value && !isLoadingInitial.value && !isLoadingMore.value) {
        loadMoreTransactions();
      }
    },
    { rootMargin: "250px" }
  );

  if (infiniteScrollSentinel.value) {
    observer.observe(infiniteScrollSentinel.value);
  }
};

// Scroll listener for back-to-top button
const handleScroll = () => {
  if (typeof window === "undefined") return;
  showBackToTop.value = window.scrollY > 400;
};

const scrollToTop = () => {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Watchers for filter adjustments
watch(selectedView, (newVal) => {
  if (newVal !== "Custom") {
    resetAndRefresh();
  } else {
    dateRange.value = null;
    appliedStartDate.value = "";
    appliedEndDate.value = "";
  }
});

watch(filterCategory, () => resetAndRefresh());
watch(filterType, () => resetAndRefresh());
watch(sortBy, () => resetAndRefresh());

// Debounced search watcher
let searchDebounceTimeout: any = null;
watch(searchQuery, () => {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(() => {
    resetAndRefresh();
  }, 350);
});

// Watch global store refresh trigger (after adding or updating transaction)
watch(
  () => store.refreshTrigger,
  () => resetAndRefresh()
);

onMounted(() => {
  isHydrated.value = true;
  if (store.categories.length === 0) {
    store.fetchCategories();
  }
  resetAndRefresh();
  nextTick(() => {
    setupIntersectionObserver();
  });
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  if (observer) observer.disconnect();
  window.removeEventListener("scroll", handleScroll);
});

watch(infiniteScrollSentinel, (newEl) => {
  if (newEl && observer) {
    observer.disconnect();
    observer.observe(newEl);
  }
});
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] pt-6 pb-32 sm:py-10 selection:bg-blue-500/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <UNotifications />

      <!-- Top Header & Actions -->
      <Motion
        :initial="{ opacity: 0, y: -20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6 }"
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2"
      >
        <div>
          <div class="flex items-center gap-2.5 mb-1.5">
            <div class="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <UIcon name="i-heroicons-banknotes" class="w-5 h-5" />
            </div>
            <span class="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Financial Registry
            </span>
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Transaction History
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
            Real-time breakdown and infinite history feed.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <UButton
            @click="resetAndRefresh"
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-path"
            :loading="isLoadingInitial || isSummaryLoading"
            class="rounded-xl w-10 h-10 flex items-center justify-center hover:bg-white dark:hover:bg-white/10"
            aria-label="Refresh Data"
          />
          <UButton
            @click="store.toggleTransactionModal(true)"
            icon="i-heroicons-plus"
            color="primary"
            size="lg"
            class="rounded-2xl px-6 sm:px-8 font-black shadow-lg shadow-blue-500/25 active:scale-95 transition-all text-sm sm:text-base"
          >
            Add Transaction
          </UButton>
        </div>
      </Motion>

      <!-- 4 Rich KPI Metric Cards (Loaded from /api/transaction/summary) -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <!-- 1. Total Income -->
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.05 }"
          class="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/70 dark:border-white/10 p-5 sm:p-6 shadow-xs group hover:border-emerald-500/40 transition-all"
        >
          <div class="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Inflow</span>
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UIcon name="i-heroicons-arrow-trending-up" class="w-5 h-5" />
            </div>
          </div>
          <div class="space-y-1">
            <div v-if="isSummaryLoading" class="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            <h2 v-else class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {{ currency(summary.totalIncome) }}
            </h2>
            <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {{ summary.incomeCount }} income transaction{{ summary.incomeCount === 1 ? '' : 's' }}
            </p>
          </div>
        </Motion>

        <!-- 2. Total Expense -->
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.1 }"
          class="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/70 dark:border-white/10 p-5 sm:p-6 shadow-xs group hover:border-rose-500/40 transition-all"
        >
          <div class="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-rose-500/10 blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Outflow</span>
            <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <UIcon name="i-heroicons-arrow-trending-down" class="w-5 h-5" />
            </div>
          </div>
          <div class="space-y-1">
            <div v-if="isSummaryLoading" class="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            <h2 v-else class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {{ currency(summary.totalExpense) }}
            </h2>
            <p class="text-xs font-bold text-rose-600 dark:text-rose-400">
              {{ summary.expenseCount }} expense transaction{{ summary.expenseCount === 1 ? '' : 's' }}
            </p>
          </div>
        </Motion>

        <!-- 3. Net Cash Flow (Balance) -->
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.15 }"
          class="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/70 dark:border-white/10 p-5 sm:p-6 shadow-xs group hover:border-blue-500/40 transition-all"
        >
          <div class="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Net Flow</span>
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UIcon name="i-heroicons-scale" class="w-5 h-5" />
            </div>
          </div>
          <div class="space-y-1">
            <div v-if="isSummaryLoading" class="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            <h2
              v-else
              class="text-2xl sm:text-3xl font-black tracking-tight"
              :class="summary.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
            >
              {{ summary.balance >= 0 ? '+' : '' }}{{ currency(summary.balance) }}
            </h2>
            <p class="text-xs font-bold text-gray-500">
              {{ summary.balance >= 0 ? 'Net Surplus' : 'Net Deficit' }}
            </p>
          </div>
        </Motion>

        <!-- 4. Total Volume / Records -->
        <Motion
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.5, delay: 0.2 }"
          class="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/70 dark:border-white/10 p-5 sm:p-6 shadow-xs group hover:border-purple-500/40 transition-all"
        >
          <div class="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">Records Logged</span>
            <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5" />
            </div>
          </div>
          <div class="space-y-1">
            <div v-if="isSummaryLoading" class="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            <h2 v-else class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {{ summary.totalCount }}
            </h2>
            <p class="text-xs font-bold text-purple-600 dark:text-purple-400">
              {{ selectedView }} view period
            </p>
          </div>
        </Motion>
      </section>

      <!-- Advanced Control Deck (Filters, Period, Type, Category, Sort, Search) -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.6, delay: 0.25 }"
        class="bg-white dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/70 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5"
      >
        <!-- Period Tabs & Quick Type Filter -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <!-- Period Selector -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 no-scrollbar">
            <button
              v-for="v in transactionViewOptions"
              :key="v"
              @click="selectedView = v"
              :class="[
                'px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all shrink-0 select-none',
                selectedView === v
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-white/10',
              ]"
            >
              {{ v }}
            </button>
          </div>

          <!-- Quick Type Switch (All / Income / Expense) -->
          <div class="inline-flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-2xl shrink-0 self-start sm:self-auto border border-gray-200/50 dark:border-white/5">
            <button
              v-for="t in ['All', 'Income', 'Expense'] as const"
              :key="t"
              @click="filterType = t"
              :class="[
                'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all',
                filterType === t
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
              ]"
            >
              {{ t }}
            </button>
          </div>
        </div>

        <!-- Custom Date Range Picker (Visible only when 'Custom' is selected) -->
        <div
          v-if="selectedView === 'Custom'"
          class="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 transition-all"
        >
          <div class="flex flex-col sm:flex-row sm:items-end gap-3">
            <div class="flex-1">
              <label class="block text-xs font-black text-blue-900 dark:text-blue-300 mb-1.5 uppercase tracking-wider">
                Select Date Range
              </label>
              <VueDatePicker
                v-model="dateRange"
                range
                :dark="isDark"
                :max-date="new Date()"
                :enable-time-picker="false"
                :formats="{ input: 'yyyy-MM-dd', output: 'yyyy-MM-dd' }"
                placeholder="Pick start date - end date"
                :teleport="true"
              />
            </div>
            <div class="flex items-center gap-2">
              <UButton
                @click="applyCustomRange"
                color="primary"
                icon="i-heroicons-check"
                class="rounded-xl px-5 font-black text-xs sm:text-sm"
              >
                Apply Range
              </UButton>
              <UButton
                @click="clearCustomRange"
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark"
                class="rounded-xl font-bold text-xs sm:text-sm"
              >
                Reset
              </UButton>
            </div>
          </div>
        </div>

        <!-- Search, Category & Sort Toolbar -->
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 pt-1">
          <!-- Search Input -->
          <div class="sm:col-span-6 lg:col-span-5">
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Search by description..."
              size="lg"
              :ui="{
                rounded: 'rounded-2xl',
                base: 'bg-gray-50 dark:bg-white/5 border-gray-200/80 dark:border-white/10 font-medium',
              }"
            >
              <template #trailing>
                <UButton
                  v-if="searchQuery"
                  color="gray"
                  variant="link"
                  icon="i-heroicons-x-mark"
                  :padded="false"
                  @click="searchQuery = ''"
                  class="text-gray-400 hover:text-gray-600"
                />
              </template>
            </UInput>
          </div>

          <!-- Category Selector -->
          <div class="sm:col-span-3 lg:col-span-4">
            <USelect
              v-model="filterCategory"
              :options="[
                { value: 'all', label: '📁 All Categories' },
                ...store.categories.map((c) => ({ value: c._id, label: c.name })),
              ]"
              size="lg"
              :ui="{ rounded: 'rounded-2xl', base: 'bg-gray-50 dark:bg-white/5 border-gray-200/80 dark:border-white/10 font-medium' }"
            />
          </div>

          <!-- Sort Selector -->
          <div class="sm:col-span-3 lg:col-span-3">
            <USelect
              v-model="sortBy"
              :options="[
                { value: 'newest', label: '🕒 Newest First' },
                { value: 'oldest', label: '📅 Oldest First' },
                { value: 'highest', label: '📈 Highest Amount' },
                { value: 'lowest', label: '📉 Lowest Amount' },
              ]"
              size="lg"
              :ui="{ rounded: 'rounded-2xl', base: 'bg-gray-50 dark:bg-white/5 border-gray-200/80 dark:border-white/10 font-medium' }"
            />
          </div>
        </div>
      </Motion>

      <!-- Transaction Feed Section -->
      <section class="space-y-8">
        <!-- Initial Loading Skeletons -->
        <div v-if="isLoadingInitial" class="space-y-6">
          <div v-for="i in 3" :key="i" class="space-y-3">
            <div class="flex justify-between items-center px-1">
              <USkeleton class="h-6 w-40 rounded-lg" />
              <USkeleton class="h-6 w-32 rounded-lg" />
            </div>
            <USkeleton class="h-20 w-full rounded-3xl" />
            <USkeleton class="h-20 w-full rounded-3xl" />
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="transactionsList.length === 0"
          class="text-center py-20 px-4 bg-white dark:bg-gray-900/60 rounded-3xl border border-dashed border-gray-200 dark:border-white/10"
        >
          <div class="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
            <UIcon
              :name="selectedView === 'Custom' && !customApplied ? 'i-heroicons-calendar-days' : 'i-heroicons-document-magnifying-glass'"
              class="w-8 h-8"
            />
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white mb-1.5">
            {{ selectedView === 'Custom' && !customApplied ? 'Select a Date Range' : 'No Transactions Found' }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6 font-medium">
            {{
              selectedView === 'Custom' && !customApplied
                ? 'Choose start and end dates in the filter panel above to inspect your activity.'
                : 'No records matched your current filters. Try changing your search query or add a new transaction.'
            }}
          </p>
          <UButton
            @click="store.toggleTransactionModal(true)"
            color="primary"
            size="lg"
            class="rounded-2xl px-6 font-black"
          >
            Create New Transaction
          </UButton>
        </div>

        <!-- Grouped Transaction Feed -->
        <div v-else class="space-y-8">
          <div
            v-for="(group, dateKey) in transactionsByDate"
            :key="dateKey"
            class="space-y-3"
          >
            <!-- Daily Section Header with Date & Daily Summary Pill -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div class="flex items-center gap-2.5">
                <div class="w-1.5 h-6 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
                <h3 class="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  {{
                    new Date(dateKey).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                </h3>
                <span class="text-xs font-bold text-gray-400 dark:text-gray-500">
                  ({{ group.length }})
                </span>
              </div>

              <!-- Daily Summary Component -->
              <TransactionSummaryDaily :transaction="group" :date="dateKey" />
            </div>

            <!-- Transaction Items in this Day -->
            <div class="grid grid-cols-1 gap-3">
              <Transaction
                v-for="t in group"
                :key="t._id"
                :data="t"
                @delete="handleDeleteTransaction"
                @edit="handleEdit"
              />
            </div>
          </div>

          <!-- Infinite Scroll Trigger Sentinel -->
          <div ref="infiniteScrollSentinel" class="h-4 w-full"></div>

          <!-- Loading More Spinner / Pill -->
          <div v-if="isLoadingMore" class="flex items-center justify-center py-6">
            <div class="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-white/10 shadow-sm">
              <div class="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
              <span class="text-xs font-bold text-gray-600 dark:text-gray-300">
                Loading more transactions...
              </span>
            </div>
          </div>

          <!-- End of List Notice -->
          <div
            v-if="!hasMore && transactionsList.length > 0"
            class="text-center py-8"
          >
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 text-xs font-black text-gray-500 dark:text-gray-400">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-emerald-500" />
              <span>All {{ summary.totalCount || transactionsList.length }} transactions loaded</span>
            </div>
          </div>

          <!-- Manual Fallback Button (if scroll didn't trigger) -->
          <div v-if="hasMore && !isLoadingMore && !isLoadingInitial" class="text-center pt-2">
            <UButton
              @click="loadMoreTransactions"
              variant="soft"
              color="gray"
              class="rounded-2xl px-6 font-black text-xs uppercase tracking-wider"
            >
              Load Next Page
            </UButton>
          </div>
        </div>
      </section>

      <!-- Floating Scroll-to-Top Button -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-75"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-75"
      >
        <button
          v-if="showBackToTop"
          @click="scrollToTop"
          class="fixed bottom-24 lg:bottom-10 right-6 z-40 w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
          aria-label="Scroll to top"
        >
          <UIcon name="i-heroicons-arrow-up" class="w-6 h-6" />
        </button>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
