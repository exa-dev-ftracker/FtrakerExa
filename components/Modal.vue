<script lang="ts" setup>
import { z } from "zod";
import type { Category, Transaction } from "~/types";

interface InputEvent extends Event {
  target: HTMLInputElement & {
    value: string;
  };
}

const props = defineProps<{
  isModalOpen: boolean;
  isEdit: boolean;
  data?: Transaction;
}>();

const toast = useToast();
const store = useDefaultStore();
const emit = defineEmits(["update:isModalOpen", "submit"]);

const schema = z.object({
  createdAt: z.string().min(8, "Date must be a valid date"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  type: z
    .string()
    .refine((val) => ["Income", "Expense"].includes(val), {
      message: "Type must be Income or Expense",
    }),
  amount: z.number().min(1000, "Amount must be at least Rp 1000"),
  category: z.string().min(1, "Category is required"),
});

const isOpen = computed({
  get: () => props.isModalOpen,
  set: (value: boolean) => {
    emit("update:isModalOpen", value);
  },
});

const getTodayInTimezone = (tz?: string): string => {
  try {
    const timeZone =
      tz ||
      store.user?.timezone ||
      (typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "UTC");
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch (e) {
    return new Date().toLocaleDateString("en-CA");
  }
};

const toUtcIsoString = (dateInput: string): string => {
  if (!dateInput) return new Date().toISOString();
  
  const todayStr = getTodayInTimezone();
  // If it's today's date and creating a fresh transaction, record current exact UTC timestamp
  if (dateInput === todayStr && !props.isEdit) {
    return new Date().toISOString();
  }

  // Convert date in user timezone to UTC ISO string
  const tz = store.user?.timezone;
  try {
    const parts = dateInput.split("-").map(Number);
    if (parts.length === 3) {
      const now = new Date();
      // Anchor at current time on selected date
      const testUtc = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));
      if (!tz || tz === "UTC") {
        return testUtc.toISOString();
      }
      const invDate = new Date(testUtc.toLocaleString("en-US", { timeZone: tz }));
      const diff = testUtc.getTime() - invDate.getTime();
      return new Date(testUtc.getTime() + diff).toISOString();
    }
  } catch (e) {
    // fallback
  }
  return new Date(`${dateInput}T12:00:00.000Z`).toISOString();
};

const formData = reactive({
  createdAt: getTodayInTimezone(),
  description: "",
  type: "",
  amount: 0,
  category: "",
  linkedIncomeId: "",
  _id: "",
});

const formattedAmount = ref("Rp 0");
const availableIncomes = ref<Transaction[]>([]);

const incomePage = ref(1);
const hasMoreIncomes = ref(true);
const isLoadingIncomes = ref(false);
const isLoadingMoreIncomes = ref(false);
const incomeSearch = ref("");
let incomeSearchDebounceTimer: any = null;

const loadAvailableIncomes = async (reset = false) => {
  if (reset) {
    incomePage.value = 1;
    hasMoreIncomes.value = true;
    availableIncomes.value = [];
  }
  if (isLoadingIncomes.value || isLoadingMoreIncomes.value) return;

  if (incomePage.value === 1) {
    isLoadingIncomes.value = true;
  } else {
    isLoadingMoreIncomes.value = true;
  }

  try {
    const params: Record<string, any> = {
      page: incomePage.value,
      limit: 10,
    };
    if (incomeSearch.value.trim()) {
      params.search = incomeSearch.value.trim();
    }
    const res = await (useNuxtApp().$axios as any).get("/api/transaction/incomes/available", { params });
    const payload = res.data?.body || res.data || {};
    const list: Transaction[] = Array.isArray(payload) ? payload : (payload.incomes || []);
    const pagination = payload.pagination;

    if (incomePage.value === 1) {
      availableIncomes.value = list;
    } else {
      const existingIds = new Set(availableIncomes.value.map((i) => i._id));
      const newItems = list.filter((i) => !existingIds.has(i._id));
      availableIncomes.value = [...availableIncomes.value, ...newItems];
    }

    if (pagination) {
      hasMoreIncomes.value = pagination.hasMore;
    } else {
      hasMoreIncomes.value = list.length >= 10;
    }
  } catch (e) {
    console.error("Failed to load available incomes", e);
  } finally {
    isLoadingIncomes.value = false;
    isLoadingMoreIncomes.value = false;
  }
};

const loadMoreIncomes = () => {
  if (!hasMoreIncomes.value || isLoadingIncomes.value || isLoadingMoreIncomes.value) return;
  incomePage.value++;
  loadAvailableIncomes(false);
};

const handleIncomeScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target) return;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight - 50) {
    loadMoreIncomes();
  }
};

const onIncomeSearch = () => {
  clearTimeout(incomeSearchDebounceTimer);
  incomeSearchDebounceTimer = setTimeout(() => {
    loadAvailableIncomes(true);
  }, 300);
};

const clearIncomeSearch = () => {
  incomeSearch.value = "";
  loadAvailableIncomes(true);
};

const selectIncome = (id: string, close?: () => void) => {
  formData.linkedIncomeId = id;
  if (close) close();
};

const selectedIncome = computed(() => {
  if (!formData.linkedIncomeId) return null;
  const match = availableIncomes.value.find((i) => i._id === formData.linkedIncomeId);
  if (match) return match;
  if (props.data?.linkedIncomeId && typeof props.data.linkedIncomeId === "object") {
    return props.data.linkedIncomeId as any;
  }
  return null;
});

watch(
  () => formData.type,
  (newType) => {
    if (newType === "Income") {
      formData.linkedIncomeId = "";
    } else if (newType === "Expense") {
      loadAvailableIncomes(true);
    }
  }
);

const onInput = (event: InputEvent) => {
  const value = event.target.value.replace(/[^\d]/g, "");
  formData.amount = parseInt(value) || 0;
  formattedAmount.value = currency(formData.amount);
};

const filteredCategories = computed(() => {
  const type = formData.type.toLowerCase();
  if (!type) return store.categories;
  return store.categories.filter(
    (c) => !c.type || c.type === type
  );
});

const isLoading = ref(false);
const onSubmit = async () => {
  if (isLoading.value) return;
  isLoading.value = true;

  try {
    await schema.parseAsync(formData);
    const utcDateStr = toUtcIsoString(formData.createdAt);
    const payload = {
      ...formData,
      createdAt: utcDateStr,
      date: utcDateStr,
    };
    if (props.isEdit && props.data) {
      payload._id = props.data._id;
      try {
        await (useNuxtApp().$axios as any).put("/api/transaction", payload);
        toast.add({
          title: "Success",
          description: "Transaction saved successfully",
        });
        emit("submit");
        resetForm();
        store.toggleTransactionModal(false);
      } catch (error: any) {
        toast.add({
          title: "Error",
          description: error.response?._data?.body?.message
            ? error.response._data.body.message
            : "An error occurred while trying to save the transaction",
          color: "red",
        });
      }
    } else {
      try {
        await (useNuxtApp().$axios as any).post("/api/transaction", payload);
        toast.add({
          title: "Success",
          description: "Transaction saved successfully",
        });
        emit("submit");
        resetForm();
        store.toggleTransactionModal(false);
      } catch (error: any) {
        console.error(error);
        toast.add({
          title: "Error",
          description: error.response?._data?.body?.message
            ? error.response._data.body.message
            : "An error occurred while trying to save the transaction",
        });
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  formData.createdAt = getTodayInTimezone();
  formData.description = "";
  formData.type = "";
  formData.amount = 0;
  const general = store.categories.find(c => c.name === "General");
  formData.category = general?._id || "";
  formData.linkedIncomeId = "";
  formData._id = "";
  formattedAmount.value = "Rp 0";
  incomeSearch.value = "";
  incomePage.value = 1;
};

watch(
  () => props.data,
  (newValue) => {
    if (newValue) {
      const rawDate = (newValue as any).date || newValue.createdAt;
      try {
        const timeZone = store.user?.timezone || undefined;
        formData.createdAt = new Intl.DateTimeFormat("en-CA", {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(rawDate));
      } catch (e) {
        formData.createdAt = rawDate ? rawDate.split("T")[0] : getTodayInTimezone();
      }
      formData.description = newValue.description;
      let parsedType =
        newValue.type.charAt(0).toUpperCase() +
        newValue.type.slice(1).toLowerCase();
      formData.type = parsedType;
      formData.amount = newValue.amount;
      formData._id = newValue._id;
      formData.category =
        typeof newValue.category === "object" && newValue.category
          ? (newValue.category as Category)._id
          : (newValue.category as string) || "";
      if (newValue.linkedIncomeId) {
        formData.linkedIncomeId = typeof newValue.linkedIncomeId === "object"
          ? (newValue.linkedIncomeId as any)._id
          : newValue.linkedIncomeId;
      } else {
        formData.linkedIncomeId = "";
      }
      formattedAmount.value = currency(newValue.amount);
      if (parsedType === "Expense") {
        loadAvailableIncomes(true);
      }
    } else {
      resetForm();
    }
  },
  { immediate: true, deep: true },
);

watch(
  () => props.isModalOpen,
  (newValue) => {
    if (newValue && store.categories.length === 0) {
      store.fetchCategories();
    }
    if (newValue && formData.type === "Expense") {
      loadAvailableIncomes(true);
    }
    if (newValue && !props.data) {
      formData.createdAt = getTodayInTimezone();
    }
    if (!newValue) {
      resetForm();
    }
  },
);
</script>

<template>
  <div>
    <UModal v-model="isOpen" prevent-close class="animate-fade-in">
      <UCard
        :ui="{
          ring: 'ring-2 ring-blue-200 dark:ring-blue-800',
          divide: 'divide-y divide-gray-200 dark:divide-gray-800',
          body: { padding: 'px-6 py-6' },
          header: {
            padding:
              'px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20',
          },
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3
                class="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                {{ isEdit ? "✏️ Edit Transaction" : "➕ New Transaction" }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{
                  isEdit
                    ? "Update your transaction details"
                    : "Record a new transaction"
                }}
              </p>
            </div>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1 hover:scale-110 transition-transform"
              @click="isOpen = false"
            />
          </div>
        </template>
        <UForm
          class="flex flex-col gap-6"
          :schema="schema"
          :state="formData"
          @submit="onSubmit"
        >
          <div class="grid grid-cols-2 gap-4">
            <UFormGroup
              eager-validation
              label="📅 Date"
              name="createdAt"
              required
            >
              <UInput
                type="date"
                placeholder="Select date"
                v-model="formData.createdAt"
                name="createdAt"
              />
            </UFormGroup>
            <UFormGroup eager-validation name="type" label="💳 Type" required>
              <USelect
                name="type"
                v-model="formData.type"
                placeholder="Select type"
                :options="['Income', 'Expense']"
              />
            </UFormGroup>
          </div>

          <UFormGroup
            eager-validation
            name="description"
            label="📝 Description"
            required
          >
            <UInput
              name="description"
              v-model="formData.description"
              placeholder="e.g., Coffee, Salary, etc."
            />
          </UFormGroup>

          <UFormGroup eager-validation name="category" label="🏷️ Category" required>
            <USelect
              name="category"
              v-model="formData.category"
              placeholder="Select a category"
              :options="filteredCategories.map(c => ({ value: c._id, label: c.name }))"
              :ui="{ rounded: 'rounded-xl' }"
            />
          </UFormGroup>

          <UFormGroup
            v-if="formData.type === 'Expense'"
            name="linkedIncomeId"
            label="🔗 Funded By (Linked Income)"
            help="Optional: link to an income source to track burn-down"
          >
            <UPopover :popper="{ placement: 'bottom-start' }" class="w-full">
              <template #default="{ open }">
                <button
                  type="button"
                  class="w-full flex items-center justify-between py-2.5 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-left text-sm hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div class="truncate flex items-center gap-2">
                    <div
                      class="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                      :class="selectedIncome ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'"
                    >
                      <UIcon :name="selectedIncome ? 'i-heroicons-banknotes' : 'i-heroicons-link-slash'" class="w-3.5 h-3.5" />
                    </div>
                    <span v-if="selectedIncome" class="font-medium text-gray-900 dark:text-white truncate">
                      {{ selectedIncome.description }}
                      <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-1">
                        (Remaining: Rp {{ (selectedIncome.remainingAmount !== undefined ? selectedIncome.remainingAmount : selectedIncome.amount).toLocaleString('id-ID') }})
                      </span>
                    </span>
                    <span v-else class="text-gray-400 dark:text-gray-400 font-normal">
                      General Balance (No link)
                    </span>
                  </div>
                  <UIcon
                    :name="open ? 'i-heroicons-chevron-up-20-solid' : 'i-heroicons-chevron-down-20-solid'"
                    class="w-5 h-5 text-gray-400 flex-shrink-0 ml-2"
                  />
                </button>
              </template>

              <template #panel="{ close }">
                <div class="w-[320px] sm:w-[400px] max-w-[90vw] p-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 space-y-2">
                  <!-- Search input -->
                  <div class="mb-1">
                    <UInput
                      v-model="incomeSearch"
                      icon="i-heroicons-magnifying-glass-20-solid"
                      placeholder="Search income source..."
                      size="sm"
                      autofocus
                      :ui="{ rounded: 'rounded-lg' }"
                      @input="onIncomeSearch"
                    >
                      <template #trailing>
                        <UButton
                          v-if="incomeSearch"
                          color="gray"
                          variant="link"
                          icon="i-heroicons-x-mark-20-solid"
                          :padded="false"
                          @click="clearIncomeSearch"
                        />
                      </template>
                    </UInput>
                  </div>

                  <!-- Incomes List with Scroll Pagination -->
                  <div
                    class="max-h-60 overflow-y-auto space-y-1 divide-y divide-gray-100 dark:divide-gray-800/40 pr-1 scrollbar-thin"
                    @scroll="handleIncomeScroll"
                  >
                    <!-- Option: General Balance (No Link) -->
                    <div
                      class="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between transition-colors"
                      :class="!formData.linkedIncomeId ? 'bg-blue-50 dark:bg-blue-900/20' : ''"
                      @click="selectIncome('', close)"
                    >
                      <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 flex-shrink-0">
                          <UIcon name="i-heroicons-link-slash" class="w-4 h-4" />
                        </div>
                        <div class="truncate">
                          <p class="text-xs font-semibold text-gray-900 dark:text-white">General Balance (No link)</p>
                          <p class="text-[11px] text-gray-400 truncate">Deduct from general wallet balance</p>
                        </div>
                      </div>
                      <UIcon v-if="!formData.linkedIncomeId" name="i-heroicons-check-circle" class="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                    </div>

                    <!-- Income Items -->
                    <div
                      v-for="inc in availableIncomes"
                      :key="inc._id"
                      class="pt-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between transition-colors"
                      :class="formData.linkedIncomeId === inc._id ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''"
                      @click="selectIncome(inc._id, close)"
                    >
                      <div class="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                        <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <UIcon name="i-heroicons-banknotes" class="w-4 h-4" />
                        </div>
                        <div class="min-w-0 flex-1">
                          <p class="text-xs font-semibold text-gray-900 dark:text-white truncate">{{ inc.description }}</p>
                          <div class="flex items-center justify-between text-[11px] mt-0.5">
                            <span
                              class="font-semibold"
                              :class="(inc.remainingAmount ?? inc.amount) < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'"
                            >
                              Remaining: Rp {{ (inc.remainingAmount !== undefined ? inc.remainingAmount : inc.amount).toLocaleString('id-ID') }}
                            </span>
                            <span class="text-[10px] text-gray-400">
                              Total: Rp {{ inc.amount.toLocaleString('id-ID') }}
                            </span>
                          </div>
                          <!-- Micro progress bar -->
                          <div class="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full mt-1 overflow-hidden">
                            <div
                              class="h-full rounded-full transition-all duration-300"
                              :class="(inc.percentageUsed || 0) >= 100 ? 'bg-rose-500' : 'bg-emerald-500'"
                              :style="{ width: `${Math.min(inc.percentageUsed || 0, 100)}%` }"
                            />
                          </div>
                        </div>
                      </div>
                      <UIcon v-if="formData.linkedIncomeId === inc._id" name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    </div>

                    <!-- Empty state -->
                    <div v-if="!isLoadingIncomes && availableIncomes.length === 0" class="py-6 text-center text-xs text-gray-400">
                      {{ incomeSearch ? 'No matching incomes found' : 'No income transactions found yet' }}
                    </div>

                    <!-- Infinite Scroll / Loading indicator -->
                    <div v-if="isLoadingIncomes || isLoadingMoreIncomes" class="py-2.5 flex justify-center items-center gap-2 text-xs text-gray-400">
                      <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin text-blue-500" />
                      <span>{{ isLoadingMoreIncomes ? 'Loading more...' : 'Loading incomes...' }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </UPopover>
          </UFormGroup>

          <UFormGroup label="💰 Amount" eager-validation name="amount" required>
            <UInput
              v-model="formattedAmount"
              @keyup="onInput"
              type="text"
              placeholder="0"
              name="amount"
            >
            </UInput>
          </UFormGroup>

          <div class="flex gap-3 pt-4">
            <UButton
              type="submit"
              color="blue"
              variant="solid"
              label="Save Transaction"
              size="lg"
              class="flex-1 justify-center transition-all duration-200"
              :loading="isLoading"
            />
            <UButton
              type="button"
              color="gray"
              variant="soft"
              label="Cancel"
              size="lg"
              class="flex-1 justify-center transition-all duration-200"
              @click="isOpen = false"
            />
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in :deep(.fixed) {
  animation: fadeIn 0.3s ease-out;
}
</style>
