<script setup lang="ts">
import { transactionViewOptions } from "~/constants";

useHead({
  title: "FTraker - Finance Tracker",
  meta: [
    {
      name: "description",
      content: "View your financial summary, including income and expenses.",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});

import type { Transaction, TransactionResponse } from "~/types";

const toast = useToast();
const router = useRouter();
const store = useDefaultStore();
const isModalOpen = ref(false);
const isLoading = ref(false);
const isEdit = ref(false);
const selectedView = ref(transactionViewOptions[2]);
const transactionDetail = reactive<Transaction>({
  createdAt: `${new Date().toISOString().split("T")[0]}`,
  description: "",
  type: "",
  amount: 0,
  _id: "",
  updatedAt: "",
});
const { data, status, error, refresh, clear } =
  useAsyncData<TransactionResponse>("transactionsUser", async () => {
    try {
      const res = await (useNuxtApp().$axios as any).get(
        `/api/transaction?view=${selectedView.value}`,
      );
      return res.data || res;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Failed to fetch transactions");
    }
  });

const isHydrated = ref(false);
onMounted(() => {
  isHydrated.value = true;
});

const loading = computed(() => {
  return status.value !== "success";
});

// Search and Filter states
const searchQuery = ref("");
const filterType = ref("All");
const sortBy = ref("newest");

const transactionByDate = computed(() => {
  let transactionGroup: Record<string, Transaction[]> = {};

  // Get filtered transactions
  let filtered = data.value?.body?.current || [];

  // Filter by type
  if (filterType.value !== "All") {
    filtered = filtered.filter((t) => {
      if (filterType.value === "Income")
        return t.type.toLowerCase() === "income";
      if (filterType.value === "Expense") {
        const type = t.type.toLowerCase();
        return type === "expense" || type === "expanse";
      }
      return true;
    });
  }

  // Search by description
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(query) ||
        t.amount.toString().includes(query),
    );
  }

  // Sort
  if (sortBy.value === "newest") {
    filtered = [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else if (sortBy.value === "oldest") {
    filtered = [...filtered].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  } else if (sortBy.value === "highest") {
    filtered = [...filtered].sort((a, b) => b.amount - a.amount);
  } else if (sortBy.value === "lowest") {
    filtered = [...filtered].sort((a, b) => a.amount - b.amount);
  }

  for (let transaction of filtered) {
    const date = new Date(transaction.createdAt).toISOString().split("T")[0];
    if (transactionGroup[date]) {
      transactionGroup[date].push(transaction);
    } else {
      transactionGroup = {
        ...transactionGroup,
        [date]: [transaction],
      };
    }
  }
  return transactionGroup;
});

const income = computed(() => {
  if (!data.value?.body) return [];
  return data.value.body.current.filter(
    (transaction: Transaction) => transaction.type.toLowerCase() === "income",
  );
});

if (error.value && isHydrated.value) {
  toast.add({
    title: "Error",
    description: error.value.message || "An error occurred while trying to fetch the transactions",
  });
}

const lastIncome = computed(() => {
  if (!data.value?.body) return [];
  return data.value.body.last.filter(
    (transaction: Transaction) => transaction.type.toLowerCase() === "income",
  );
});

const lastExpanse = computed((): Transaction[] => {
  if (!data.value?.body) return [];
  return data.value.body.last.filter((transaction: Transaction) => {
    const type = transaction.type.toLowerCase();
    return type === "expanse" || type === "expense";
  });
});

const lastIncomeTotal = computed(() => {
  if (!lastIncome.value) return 0;
  return useTotal(lastIncome.value).total.value;
});

const lastExpanseTotal = computed(() => {
  if (!lastExpanse.value) return 0;
  return useTotal(lastExpanse.value).total.value;
});

const incomeTotal = computed(() => {
  if (!income.value) return 0;
  return useTotal(income.value).total.value;
});

const expanse = computed(() => {
  if (!data.value?.body) return [];
  return data.value.body.current.filter((transaction: Transaction) => {
    const type = transaction.type.toLowerCase();
    return type === "expanse" || type === "expense";
  });
});

const expanseTotal = computed(() => {
  if (!expanse.value) return 0;
  return useTotal(expanse.value).total.value;
});

const handleDeleteTransaction = async (id: string): Promise<void> => {
  if (isLoading.value) return;
  isLoading.value = true;
  try {
    await (useNuxtApp().$axios as any).delete("/api/transaction", {
      data: { id },
    });
    toast.add({
      title: "Success",
      description: "Transaction deleted successfully",
      color: "green",
    });
    await refresh();
  } catch (error: any) {
    console.error("Delete error:", error);
    toast.add({
      title: "Error",
      description:
        error.response?.data?.body?.message ||
        error.message ||
        "An error occurred while trying to delete the transaction",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const handleEdit = (date: string, _id: string): void => {
  isEdit.value = true;
  const transactions = transactionByDate.value[date];
  if (!transactions) return;
  const transaction = transactions.find((t: Transaction) => t._id === _id);
  if (!transaction) return;
  transactionDetail.createdAt = transaction.createdAt.split("T")[0];
  transactionDetail.description = transaction.description;
  transactionDetail.type = transaction.type;
  transactionDetail.amount = transaction.amount;
  transactionDetail._id = transaction._id;
  transactionDetail.updatedAt = transaction.updatedAt;
  isModalOpen.value = true;
};

watch(selectedView, async () => {
  await refresh();
  if (error.value && isHydrated.value) {
    const message = error.value.message || "An error occurred while trying to fetch the transactions";
    if (message.includes("401") || message.includes("Unauthorized")) {
      toast.add({
        title: "Unauthorized",
        description: "You need to login to view your transactions",
        color: "red",
      });
      router.push("/login");
    } else {
      toast.add({
        title: "Error",
        description: message,
        color: "red",
      });
    }
  }
});

const handleOpenModal = (value: boolean): void => {
  isEdit.value = false;
  isModalOpen.value = value;
  if (!value) {
    transactionDetail.createdAt = `${new Date().toISOString().split("T")[0]}`;
    transactionDetail.description = "";
    transactionDetail.type = "";
    transactionDetail.amount = 0;
  }
};

const handleSubmit = (): void => {
  refresh();
};
</script>

<template>
  <div class="py-6 sm:py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
    <UNotifications />

    <!-- Page Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
    >
      <div>
        <h1
          class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
        >
          Transactions
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          Manage and track your financial activities
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UButton
          @click="refresh"
          color="gray"
          variant="ghost"
          icon="i-heroicons-arrow-path"
          :loading="loading"
        />
        <UButton
          @click="handleOpenModal(true)"
          icon="i-heroicons-plus"
          color="primary"
        >
          Add Transaction
        </UButton>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div v-if="isHydrated" class="mb-8 mt-8 space-y-4">
      <div
        class="flex items-center overflow-x-auto pb-2 scrollbar-none gap-2 w-full border-b border-gray-200 dark:border-gray-800"
      >
        <UButton
          v-for="view in transactionViewOptions"
          :key="view"
          :color="selectedView === view ? 'primary' : 'gray'"
          :variant="selectedView === view ? 'solid' : 'ghost'"
          @click="selectedView = view"
          class="capitalize rounded-full px-4"
          size="sm"
        >
          {{ view }}
        </UButton>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <UInput
          v-model="searchQuery"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search transactions..."
          class="flex-1"
        />
        <div class="flex gap-3">
          <USelect
            v-model="filterType"
            :options="['All', 'Income', 'Expense']"
            class="w-full sm:w-32"
          />
          <USelect
            v-model="sortBy"
            :options="[
              { value: 'newest', label: 'Newest' },
              { value: 'oldest', label: 'Oldest' },
              { value: 'highest', label: 'Highest' },
              { value: 'lowest', label: 'Lowest' },
            ]"
            class="w-full sm:w-36"
          />
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Modal
      :isEdit="isEdit"
      v-model:isModalOpen="isModalOpen"
      :data="isEdit ? transactionDetail : undefined"
      @submit="handleSubmit"
    />

    <!-- Transactions List -->
    <div v-if="isHydrated">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-6">
        <div v-for="i in 3" :key="i" class="space-y-3">
          <USkeleton class="h-8 w-48" />
          <USkeleton class="h-20 w-full" />
          <USkeleton class="h-20 w-full" />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="Object.keys(transactionByDate).length === 0"
        class="text-center py-16 px-4"
      >
        <div
          class="inline-flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4"
        >
          <UIcon
            name="i-heroicons-document-text"
            class="w-8 h-8 text-gray-500 dark:text-gray-400 block"
          />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No transactions found
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          You don't have any transactions matching your current filters.
        </p>
        <UButton
          @click="handleOpenModal(true)"
          icon="i-heroicons-plus"
          color="primary"
          variant="soft"
        >
          Add Transaction
        </UButton>
      </div>

      <!-- Transactions Grouped by Date -->
      <div v-else class="space-y-8">
        <div v-for="(transactionOnDay, date) in transactionByDate" :key="date">
          <!-- Date Sticky Header -->
          <div
            class="sticky top-[60px] z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 py-3 mb-4 mt-2 transition-all px-4 rounded-t-lg"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
                {{
                  new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }}
              </h3>
              <TransactionSummaryDaily
                :transaction="transactionOnDay"
                :date="date.toString()"
              />
            </div>
          </div>

          <!-- Transaction Cards -->
          <div class="grid grid-cols-1 gap-3">
            <Transaction
              v-for="(transactionUser, index) in transactionOnDay"
              :key="index"
              :data="transactionUser"
              :Day="transactionByDate"
              :loading="loading"
              @delete="handleDeleteTransaction"
              @edit="handleEdit"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Hydration Loading -->
    <div v-else class="flex justify-center items-center py-20">
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 text-gray-400 animate-spin block"
      />
    </div>
  </div>
</template>

<style scoped>
/* Removed old styles, kept empty to prevent HMR issues after removal */
</style>
