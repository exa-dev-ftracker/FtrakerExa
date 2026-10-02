<script setup lang="ts">
import type { Category, Transaction } from "~/types";
import { displayTransactionType } from "~/types";

const props = defineProps<{
  isOpen: boolean;
  transaction: Transaction | null;
}>();

const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "edit", date: string, id: string): void;
  (e: "delete", id: string): void;
}>();

const store = useDefaultStore();
const toast = useToast();

const isModalOpen = computed({
  get: () => props.isOpen,
  set: (val) => emit("update:isOpen", val),
});

const detailedData = ref<Transaction | null>(null);
const isLoadingDetail = ref(false);

const isIncome = computed(() => {
  const t = detailedData.value || props.transaction;
  return t?.type?.toLowerCase() === "income";
});

const categoryData = computed<Category>(() => {
  const t = detailedData.value || props.transaction;
  const c = t?.category;
  if (typeof c === "object" && c !== null) return c as Category;
  return {
    _id: "",
    name: "General",
    color: "#3b82f6",
    icon: "i-heroicons-tag",
    user: "",
    type: null,
    createdAt: "",
    updatedAt: "",
  };
});

const formattedDateTime = computed(() => {
  const t = detailedData.value || props.transaction;
  if (!t) return "";
  const rawDate = t.date || t.createdAt;
  if (!rawDate) return "";
  const str = String(rawDate).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const day = parseInt(match[3]);
    const dateObj = new Date(year, month, day);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  try {
    const tz = store.user?.timezone || undefined;
    const dateObj = new Date(rawDate);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateObj);
  } catch {
    return str;
  }
});

const formatDateShort = (d?: string) => {
  if (!d) return "";
  const str = String(d).trim();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const day = parseInt(match[3]);
    const dateObj = new Date(year, month, day);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return str.split("T")[0] || "";
};

const fetchDetail = async (id: string) => {
  isLoadingDetail.value = true;
  try {
    const { $axios } = useNuxtApp();
    const res = await ($axios as any).get(`/api/transaction/detail?id=${id}`);
    const data = res.data?.body || res.data;
    if (data && data._id) {
      detailedData.value = data;
    }
  } catch (err) {
    console.error("Failed to fetch transaction detail:", err);
  } finally {
    isLoadingDetail.value = false;
  }
};

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.transaction?._id) {
      detailedData.value = props.transaction;
      fetchDetail(props.transaction._id);
    } else if (!open) {
      detailedData.value = null;
    }
  },
  { immediate: true },
);

const handleEditClick = () => {
  const t = detailedData.value || props.transaction;
  if (!t) return;
  isModalOpen.value = false;
  store.editTransaction(t);
};

const handleDeleteClick = () => {
  const t = detailedData.value || props.transaction;
  if (!t) return;
  toast.add({
    title: "Confirm Deletion",
    description: `Delete "${t.description}"? This action cannot be undone.`,
    color: "red",
    actions: [
      {
        label: "Delete",
        color: "red",
        click: async () => {
          try {
            const { $axios } = useNuxtApp();
            await ($axios as any).delete("/api/transaction", { data: { id: t._id } });
            toast.add({ title: "Deleted", description: "Transaction removed successfully", color: "green" });
            isModalOpen.value = false;
            store.triggerRefresh();
          } catch (err: any) {
            toast.add({ title: "Error", description: err.message || "Failed to delete transaction", color: "red" });
          }
        },
      },
    ],
  });
};
</script>

<template>
  <UModal v-model="isModalOpen" :ui="{ width: 'sm:max-w-lg' }">
    <UCard
      :ui="{
        ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        body: { padding: 'p-5 sm:p-6' },
        header: { padding: 'px-5 py-4 bg-gray-50/60 dark:bg-gray-800/40' },
        footer: { padding: 'px-5 py-3.5 bg-gray-50/50 dark:bg-gray-800/20' },
      }"
    >
      <!-- Header -->
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div
              :class="[
                'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                isIncome
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
              ]"
            >
              <UIcon
                :name="isIncome ? 'i-heroicons-arrow-up-right-20-solid' : 'i-heroicons-arrow-down-left-20-solid'"
                class="w-5 h-5"
              />
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Transaction Details
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Full breakdown & funding tracking
              </p>
            </div>
          </div>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="isModalOpen = false"
          />
        </div>
      </template>

      <!-- Body -->
      <div v-if="props.transaction" class="space-y-5">
        <!-- Main Amount & Description Hero -->
        <div class="text-center py-2">
          <div class="inline-flex items-center gap-2 mb-2">
            <span
              class="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg"
              :class="isIncome ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'"
            >
              {{ displayTransactionType(props.transaction.type) }}
            </span>
            <span
              class="text-xs font-bold px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1.5"
              :style="{
                backgroundColor: (categoryData.color || '#3b82f6') + '18',
                color: categoryData.color || '#3b82f6',
              }"
            >
              <UIcon :name="categoryData.icon || 'i-heroicons-tag'" class="w-3.5 h-3.5" />
              {{ categoryData.name }}
            </span>
          </div>

          <h2
            class="text-3xl sm:text-4xl font-black tracking-tight"
            :class="isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'"
          >
            {{ isIncome ? '+' : '-' }}{{ currency(props.transaction.amount) }}
          </h2>

          <p class="text-base font-semibold text-gray-800 dark:text-gray-200 mt-1 max-w-sm mx-auto">
            {{ props.transaction.description }}
          </p>

          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1.5 flex items-center justify-center gap-1">
            <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5" />
            {{ formattedDateTime }}
          </p>
        </div>

        <!-- Section 1: Linked Income (If Expense is linked) -->
        <div
          v-if="!isIncome && (props.transaction.linkedIncomeId || detailedData?.linkedIncomeDetails)"
          class="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-blue-50/40 dark:from-emerald-950/20 dark:to-blue-950/20 border border-emerald-500/20"
        >
          <div class="flex items-center gap-2 mb-2.5">
            <div class="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <UIcon name="i-heroicons-link" class="w-4 h-4" />
            </div>
            <div>
              <h4 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Funding Income Source
              </h4>
              <p class="text-[11px] text-gray-500 dark:text-gray-400">
                This expense was deducted from a specific income
              </p>
            </div>
          </div>

          <!-- Income Source Overview -->
          <div class="bg-white/80 dark:bg-gray-900/60 p-3 rounded-xl border border-emerald-500/15 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-gray-900 dark:text-white">
                {{
                  typeof props.transaction.linkedIncomeId === 'object' && props.transaction.linkedIncomeId !== null
                    ? props.transaction.linkedIncomeId.description
                    : (detailedData?.linkedIncomeDetails?.description || 'Linked Income')
                }}
              </span>
              <span
                v-if="detailedData?.linkedIncomeDetails?.date"
                class="text-[10px] text-gray-400 font-medium"
              >
                {{ formatDateShort(detailedData.linkedIncomeDetails.date) }}
              </span>
            </div>

            <!-- Stats Columns -->
            <div
              v-if="detailedData?.linkedIncomeDetails"
              class="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px]"
            >
              <div>
                <span class="text-[9px] text-gray-400 uppercase font-semibold block">Total Income</span>
                <span class="font-bold text-gray-800 dark:text-gray-200">
                  Rp {{ detailedData.linkedIncomeDetails.amount.toLocaleString('id-ID') }}
                </span>
              </div>
              <div>
                <span class="text-[9px] text-gray-400 uppercase font-semibold block">Already Used</span>
                <span class="font-bold text-gray-800 dark:text-gray-200">
                  Rp {{ detailedData.linkedIncomeDetails.totalUsed.toLocaleString('id-ID') }}
                </span>
              </div>
              <div>
                <span class="text-[9px] text-gray-400 uppercase font-semibold block">Remaining</span>
                <span
                  class="font-bold"
                  :class="detailedData.linkedIncomeDetails.remainingAmount < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'"
                >
                  Rp {{ detailedData.linkedIncomeDetails.remainingAmount.toLocaleString('id-ID') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: Income Burn-down Status & Linked Expenses (If Income) -->
        <div
          v-if="isIncome"
          class="p-4 rounded-2xl bg-gradient-to-br from-blue-50/80 to-emerald-50/50 dark:from-blue-950/20 dark:to-emerald-950/20 border border-blue-500/20 space-y-3"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <UIcon name="i-heroicons-banknotes" class="w-4 h-4" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Income Burn-down Status
                </h4>
                <p class="text-[11px] text-gray-500 dark:text-gray-400">
                  Tracking expenses deducted from this salary/income
                </p>
              </div>
            </div>
            <span
              v-if="detailedData"
              class="text-xs font-bold px-2 py-0.5 rounded-lg"
              :class="(detailedData.percentageUsed || 0) >= 100 ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'"
            >
              {{ (detailedData.percentageUsed || 0).toFixed(0) }}% Used
            </span>
          </div>

          <!-- 3-Column Burn-down Grid -->
          <div class="grid grid-cols-3 gap-2 bg-white/80 dark:bg-gray-900/60 p-3 rounded-xl border border-blue-500/15 text-xs">
            <div>
              <span class="text-[10px] text-gray-400 uppercase font-semibold block">Total Income</span>
              <span class="font-bold text-gray-900 dark:text-white block mt-0.5">
                Rp {{ props.transaction.amount.toLocaleString('id-ID') }}
              </span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 uppercase font-semibold block">Total Used</span>
              <span class="font-bold text-gray-700 dark:text-gray-300 block mt-0.5">
                Rp {{ ((detailedData?.totalUsed !== undefined ? detailedData.totalUsed : props.transaction.totalUsed) || 0).toLocaleString('id-ID') }}
              </span>
            </div>
            <div>
              <span class="text-[10px] text-gray-400 uppercase font-semibold block">Remaining Sisa</span>
              <span
                class="font-bold block mt-0.5"
                :class="((detailedData?.remainingAmount !== undefined ? detailedData.remainingAmount : props.transaction.remainingAmount) ?? props.transaction.amount) < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'"
              >
                Rp {{ ((detailedData?.remainingAmount !== undefined ? detailedData.remainingAmount : props.transaction.remainingAmount) ?? props.transaction.amount).toLocaleString('id-ID') }}
              </span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="space-y-1">
            <div class="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="((detailedData?.percentageUsed || props.transaction.percentageUsed) || 0) >= 100 ? 'bg-rose-500' : 'bg-emerald-500'"
                :style="{ width: `${Math.min((detailedData?.percentageUsed || props.transaction.percentageUsed) || 0, 100)}%` }"
              />
            </div>
          </div>

          <!-- List of Linked Child Expenses -->
          <div v-if="detailedData?.linkedExpenses && detailedData.linkedExpenses.length > 0" class="pt-2">
            <h5 class="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
              <span>Expenses Funded ({{ detailedData.linkedExpenses.length }})</span>
              <span class="text-[10px] text-gray-400">Chronological</span>
            </h5>
            <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1 divide-y divide-gray-100 dark:divide-gray-800">
              <div
                v-for="exp in detailedData.linkedExpenses"
                :key="exp._id"
                class="flex items-center justify-between py-1.5 text-xs"
              >
                <div class="min-w-0 flex-1 mr-2">
                  <p class="font-medium text-gray-800 dark:text-gray-200 truncate">{{ exp.description }}</p>
                  <p class="text-[10px] text-gray-400">{{ formatDateShort(exp.date || exp.createdAt) }}</p>
                </div>
                <span class="font-bold text-rose-500 shrink-0">
                  -{{ currency(exp.amount) }}
                </span>
              </div>
            </div>
          </div>
          <div
            v-else-if="isLoadingDetail"
            class="py-3 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin text-blue-500" />
            Loading linked expenses...
          </div>
          <div
            v-else
            class="text-center py-2 text-[11px] text-gray-400 font-medium"
          >
            No expenses linked to this income yet.
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <template #footer>
        <div class="flex items-center justify-between gap-3">
          <UButton
            color="red"
            variant="ghost"
            icon="i-heroicons-trash"
            label="Delete"
            class="rounded-xl font-bold"
            @click="handleDeleteClick"
          />

          <div class="flex items-center gap-2">
            <UButton
              color="gray"
              variant="soft"
              label="Close"
              class="rounded-xl font-bold"
              @click="isModalOpen = false"
            />
            <UButton
              color="primary"
              variant="solid"
              icon="i-heroicons-pencil-square"
              label="Edit Transaction"
              class="rounded-xl font-black px-4"
              @click="handleEditClick"
            />
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
