<script setup lang="ts">
import { transactionViewOptions } from "~/constants";
import type { Transaction, TransactionResponse } from "~/types";

useHead({
  title: "FTraker - Finance Tracker",
  meta: [
    { name: "description", content: "View your financial summary, including income and expenses." },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});

const toast = useToast();
const router = useRouter();
const store = useDefaultStore();
const isModalOpen = ref(false);
const isLoading = ref(false);
const isEdit = ref(false);
const selectedView = ref(transactionViewOptions[2]);
const isHydrated = ref(false);

const transactionDetail = reactive<Transaction>({
  createdAt: `${new Date().toISOString().split("T")[0]}`,
  description: "",
  type: "",
  amount: 0,
  _id: "",
  updatedAt: "",
});

const { data, status, error, refresh } = useAsyncData<TransactionResponse>("transactionsUser", async () => {
    try {
      const res = await (useNuxtApp().$axios as any).get(`/api/transaction?view=${selectedView.value}`);
      return res.data || res;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to fetch transactions");
    }
});

onMounted(() => {
  isHydrated.value = true;
});

const loading = computed(() => status.value !== "success");

// Search and Filter states
const searchQuery = ref("");
const filterType = ref("All");
const sortBy = ref("newest");

const transactionByDate = computed(() => {
  let transactionGroup: Record<string, Transaction[]> = {};
  let filtered = data.value?.body?.current || [];

  if (filterType.value !== "All") {
    filtered = filtered.filter((t) => {
      if (filterType.value === "Income") return t.type.toLowerCase() === "income";
      if (filterType.value === "Expense") return t.type.toLowerCase() === "expense" || t.type.toLowerCase() === "expanse";
      return true;
    });
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(t => t.description.toLowerCase().includes(query) || t.amount.toString().includes(query));
  }

  // Sort logic...
  if (sortBy.value === "newest") filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  else if (sortBy.value === "oldest") filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  else if (sortBy.value === "highest") filtered.sort((a, b) => b.amount - a.amount);
  else if (sortBy.value === "lowest") filtered.sort((a, b) => a.amount - b.amount);

  for (let transaction of filtered) {
    const date = new Date(transaction.createdAt).toISOString().split("T")[0];
    if (transactionGroup[date]) transactionGroup[date].push(transaction);
    else transactionGroup[date] = [transaction];
  }
  return transactionGroup;
});

const handleDeleteTransaction = async (id: string) => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    await (useNuxtApp().$axios as any).delete("/api/transaction", { data: { id } });
    toast.add({ title: "Success", description: "Deleted successfully", color: "green" });
    await refresh();
  } catch (error: any) {
    toast.add({ title: "Error", description: "Failed to delete", color: "red" });
  } finally {
    isLoading.value = false;
  }
};

const handleEdit = (date: string, _id: string) => {
  isEdit.value = true;
  const transaction = transactionByDate.value[date]?.find(t => t._id === _id);
  if (!transaction) return;
  Object.assign(transactionDetail, { ...transaction, createdAt: transaction.createdAt.split("T")[0] });
  isModalOpen.value = true;
};

const handleOpenModal = (value: boolean) => {
  isEdit.value = false;
  isModalOpen.value = value;
  if (!value) Object.assign(transactionDetail, { createdAt: new Date().toISOString().split("T")[0], description: "", type: "", amount: 0 });
};

watch(selectedView, () => refresh());
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-[#030712] py-8 sm:py-12">
    <div class="max-w-5xl mx-auto px-6 lg:px-8">
      <UNotifications />

      <!-- Page Header -->
      <Motion 
        :initial="{ opacity: 0, y: -20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8 }"
        class="header-anim flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 bg-blue-600/10 rounded-lg flex items-center justify-center">
              <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-blue-600" />
            </div>
            <span class="text-sm font-black text-blue-600 uppercase tracking-widest">Financial History</span>
          </div>
          <h1 class="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Transactions</h1>
          <p class="text-gray-500 dark:text-gray-400 font-medium">Tracking {{ data?.body?.current?.length || 0 }} entries for this period.</p>
        </div>

        <div class="flex items-center gap-3">
          <UButton 
            @click="refresh" 
            color="gray" 
            variant="ghost" 
            icon="i-heroicons-arrow-path" 
            :loading="loading" 
            class="rounded-xl"
          />
          <UButton 
            @click="handleOpenModal(true)" 
            icon="i-heroicons-plus" 
            color="primary" 
            size="lg"
            class="rounded-2xl px-6 font-black shadow-lg shadow-blue-500/20"
          >
            Add New
          </UButton>
        </div>
      </Motion>

      <!-- Filters & Search -->
      <Motion 
        v-if="isHydrated" 
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8, delay: 0.2 }"
        class="filter-anim space-y-6 mb-10"
      >
        <div class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            v-for="view in transactionViewOptions" 
            :key="view"
            @click="selectedView = view"
            :class="['px-6 py-2.5 rounded-2xl text-sm font-black transition-all capitalize whitespace-nowrap', selectedView === view ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 text-gray-500 hover:border-blue-500/50']"
          >
            {{ view }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div class="md:col-span-6">
            <UInput 
              v-model="searchQuery" 
              icon="i-heroicons-magnifying-glass" 
              placeholder="Search by description or amount..." 
              size="xl"
              class="w-full"
              :ui="{ rounded: 'rounded-2xl', base: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/5' }"
            />
          </div>
          <div class="md:col-span-3">
            <USelect 
              v-model="filterType" 
              :options="['All', 'Income', 'Expense']" 
              size="xl"
              class="w-full"
              :ui="{ rounded: 'rounded-2xl' }"
            />
          </div>
          <div class="md:col-span-3">
            <USelect 
              v-model="sortBy" 
              :options="[{ value: 'newest', label: 'Newest First' }, { value: 'oldest', label: 'Oldest First' }, { value: 'highest', label: 'Highest Amount' }, { value: 'lowest', label: 'Lowest Amount' }]" 
              size="xl"
              class="w-full"
              :ui="{ rounded: 'rounded-2xl' }"
            />
          </div>
        </div>
      </Motion>

      <Modal :isEdit="isEdit" v-model:isModalOpen="isModalOpen" :data="isEdit ? transactionDetail : undefined" @submit="refresh" />

      <!-- Content -->
      <div v-if="isHydrated">
        <div v-if="loading" class="space-y-8">
          <div v-for="i in 3" :key="i" class="space-y-4">
            <USkeleton class="h-8 w-48 rounded-xl" />
            <USkeleton class="h-24 w-full rounded-2xl" />
            <USkeleton class="h-24 w-full rounded-2xl" />
          </div>
        </div>

        <div v-else-if="Object.keys(transactionByDate).length === 0" class="text-center py-24 bg-white dark:bg-gray-900/50 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10">
          <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <UIcon name="i-heroicons-document-magnifying-glass" class="w-10 h-10 text-gray-400" />
          </div>
          <h3 class="text-xl font-black text-gray-900 dark:text-white mb-2">No matching transactions</h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8 font-medium">Try adjusting your filters or add a new transaction to get started.</p>
          <UButton @click="handleOpenModal(true)" color="primary" size="lg" class="rounded-2xl px-8 font-black">Add Transaction</UButton>
        </div>

        <div v-else class="space-y-12">
          <Motion 
            v-for="(group, date) in transactionByDate" 
            :key="date" 
            :initial="{ opacity: 0, y: 40 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.8 }"
            class="transaction-group-anim"
          >
            <div class="flex items-center justify-between mb-6 px-2">
              <div class="flex items-center gap-3">
                <div class="w-1 h-8 bg-blue-600 rounded-full"></div>
                <h3 class="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  {{ new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }) }}
                </h3>
              </div>
              <TransactionSummaryDaily :transaction="group" :date="date.toString()" />
            </div>

            <div class="grid grid-cols-1 gap-4">
              <Transaction 
                v-for="(t, idx) in group" 
                :key="t._id" 
                :data="t" 
                :Day="transactionByDate" 
                :loading="loading"
                @delete="handleDeleteTransaction" 
                @edit="handleEdit" 
                class="hover:translate-x-1 transition-transform duration-300"
              />
            </div>
          </Motion>
        </div>
      </div>

      <!-- Initial Loader -->
      <div v-else class="flex flex-col items-center justify-center py-32 space-y-4">
        <div class="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="text-gray-500 font-black uppercase tracking-widest text-xs">Loading Securely</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>

