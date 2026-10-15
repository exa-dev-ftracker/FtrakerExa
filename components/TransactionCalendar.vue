<script setup lang="ts">
import type { Transaction } from "~/types";

interface Props {
  transactions?: Transaction[];
  initialDate?: string;
  category?: string;
  type?: string;
}

const props = withDefaults(defineProps<Props>(), {
  transactions: () => [],
  initialDate: "",
  category: "all",
  type: "All",
});

const emit = defineEmits<{
  (e: "edit", date: string, id: string): void;
  (e: "delete", id: string): void;
  (e: "select-date", dateStr: string): void;
  (e: "month-change", year: number, month: number): void;
}>();

const { $axios } = useNuxtApp();
const toast = useToast();
const store = useDefaultStore();

const internalTransactions = ref<Transaction[]>([]);
const isCalendarLoading = ref(false);
const hasFetchedInternal = ref(false);

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Date string formatter helper (YYYY-MM-DD)
const formatDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const todayStr = formatDateKey(new Date());

// State for focused month and selected date
const now = new Date();
const focusedYear = ref(now.getFullYear());
const focusedMonth = ref(now.getMonth()); // 0-11
const selectedDateStr = ref(props.initialDate || todayStr);

const focusedMonthTitle = computed(() => {
  return `${monthNames[focusedMonth.value]} ${focusedYear.value}`;
});

// Active transactions data source (prefers custom API result, fallback to props)
const activeTransactions = computed<Transaction[]>(() => {
  if (hasFetchedInternal.value) {
    return internalTransactions.value;
  }
  return props.transactions && props.transactions.length > 0
    ? props.transactions
    : internalTransactions.value;
});

// Group transactions by date string
const transactionsByDate = computed(() => {
  const map: Record<string, Transaction[]> = {};
  for (const t of activeTransactions.value) {
    const rawDate = (t as any).date || t.createdAt;
    if (!rawDate) continue;
    const match = String(rawDate).match(/^(\d{4}-\d{2}-\d{2})/);
    const dateKey = match ? match[1] : String(rawDate).split("T")[0];
    if (!map[dateKey]) {
      map[dateKey] = [];
    }
    map[dateKey].push(t);
  }
  return map;
});

// Fetch all transactions in current calendar view range from custom API (/api/transaction/calendar)
const fetchMonthTransactions = async () => {
  isCalendarLoading.value = true;
  try {
    const year = focusedYear.value;
    const month = focusedMonth.value;

    const firstDay = new Date(year, month, 1);
    const startDayOffset = firstDay.getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((startDayOffset + daysInCurrentMonth) / 7) * 7;

    let fromDate: Date;
    if (startDayOffset > 0) {
      fromDate = new Date(year, month - 1, daysInPrevMonth - startDayOffset + 1);
    } else {
      fromDate = new Date(year, month, 1);
    }

    const remainingAfter = totalCells - (startDayOffset + daysInCurrentMonth);
    let toDate: Date;
    if (remainingAfter > 0) {
      toDate = new Date(year, month + 1, remainingAfter);
    } else {
      toDate = new Date(year, month, daysInCurrentMonth);
    }

    const from = formatDateKey(fromDate);
    const to = formatDateKey(toDate);

    const params = new URLSearchParams();
    params.append("from", from);
    params.append("to", to);
    if (props.category && props.category !== "all") {
      params.append("category", props.category);
    }
    if (props.type && props.type !== "All") {
      params.append("type", props.type);
    }

    const res = await ($axios as any).get(`/api/transaction/calendar?${params.toString()}`);
    const data = res.data?.body || res?.body || res.data;
    internalTransactions.value = data?.items || [];
    hasFetchedInternal.value = true;
  } catch (err: any) {
    console.error("Failed to fetch calendar transactions:", err);
  } finally {
    isCalendarLoading.value = false;
  }
};

onMounted(() => {
  fetchMonthTransactions();
});

watch([focusedYear, focusedMonth, () => props.category, () => props.type], () => {
  fetchMonthTransactions();
});

// Calculate Monthly Summary for currently focused month
const monthlyTotals = computed(() => {
  let income = 0;
  let expense = 0;
  const targetPrefix = `${focusedYear.value}-${String(focusedMonth.value + 1).padStart(2, "0")}`;

  for (const [dateKey, list] of Object.entries(transactionsByDate.value)) {
    if (dateKey.startsWith(targetPrefix)) {
      for (const t of list) {
        if (t.type.toLowerCase() === "income") {
          income += t.amount;
        } else {
          expense += t.amount;
        }
      }
    }
  }

  return {
    income,
    expense,
    net: income - expense,
  };
});

// Build 7-column calendar cells
interface CalendarCell {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  income: number;
  expense: number;
  hasActivity: boolean;
  transactionCount: number;
}

const calendarGridCells = computed<CalendarCell[]>(() => {
  const year = focusedYear.value;
  const month = focusedMonth.value;

  const firstDay = new Date(year, month, 1);
  const startDayOffset = firstDay.getDay(); // 0 for Sun, 1 for Mon...
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const totalCells = Math.ceil((startDayOffset + daysInCurrentMonth) / 7) * 7;
  const cells: CalendarCell[] = [];

  for (let i = 0; i < totalCells; i++) {
    let cellDate: Date;
    let isCurrentMonth = false;

    if (i < startDayOffset) {
      // Previous month padding
      const dayNum = daysInPrevMonth - startDayOffset + i + 1;
      cellDate = new Date(year, month - 1, dayNum);
    } else if (i < startDayOffset + daysInCurrentMonth) {
      // Current month days
      const dayNum = i - startDayOffset + 1;
      cellDate = new Date(year, month, dayNum);
      isCurrentMonth = true;
    } else {
      // Next month padding
      const dayNum = i - (startDayOffset + daysInCurrentMonth) + 1;
      cellDate = new Date(year, month + 1, dayNum);
    }

    const dStr = formatDateKey(cellDate);
    const dayTxs = transactionsByDate.value[dStr] || [];

    let inc = 0;
    let exp = 0;
    for (const t of dayTxs) {
      if (t.type.toLowerCase() === "income") {
        inc += t.amount;
      } else {
        exp += t.amount;
      }
    }

    cells.push({
      dateStr: dStr,
      dayNumber: cellDate.getDate(),
      isCurrentMonth,
      isToday: dStr === todayStr,
      isSelected: dStr === selectedDateStr.value,
      income: inc,
      expense: exp,
      hasActivity: dayTxs.length > 0,
      transactionCount: dayTxs.length,
    });
  }

  return cells;
});

// Selected Day Transactions & Summary
const selectedDayTransactions = computed<Transaction[]>(() => {
  return transactionsByDate.value[selectedDateStr.value] || [];
});

const selectedDaySummary = computed(() => {
  let income = 0;
  let expense = 0;
  for (const t of selectedDayTransactions.value) {
    if (t.type.toLowerCase() === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  }
  return {
    income,
    expense,
    net: income - expense,
    count: selectedDayTransactions.value.length,
  };
});

const formattedSelectedDateHeader = computed(() => {
  const parts = selectedDateStr.value.split("-").map(Number);
  if (parts.length === 3) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return selectedDateStr.value;
});

// Actions
const selectCell = (cell: CalendarCell) => {
  selectedDateStr.value = cell.dateStr;
  emit("select-date", cell.dateStr);

  // If clicked cell belongs to another month, shift focus
  const parts = cell.dateStr.split("-").map(Number);
  if (parts[1] - 1 !== focusedMonth.value || parts[0] !== focusedYear.value) {
    focusedYear.value = parts[0];
    focusedMonth.value = parts[1] - 1;
    emit("month-change", focusedYear.value, focusedMonth.value + 1);
  }
};

const prevMonth = () => {
  if (focusedMonth.value === 0) {
    focusedMonth.value = 11;
    focusedYear.value -= 1;
  } else {
    focusedMonth.value -= 1;
  }
  emit("month-change", focusedYear.value, focusedMonth.value + 1);
};

const nextMonth = () => {
  if (focusedMonth.value === 11) {
    focusedMonth.value = 0;
    focusedYear.value += 1;
  } else {
    focusedMonth.value += 1;
  }
  emit("month-change", focusedYear.value, focusedMonth.value + 1);
};

const goToToday = () => {
  const today = new Date();
  focusedYear.value = today.getFullYear();
  focusedMonth.value = today.getMonth();
  selectedDateStr.value = todayStr;
  emit("select-date", todayStr);
  emit("month-change", focusedYear.value, focusedMonth.value + 1);
};

const handleDeleteTransaction = async (id: string) => {
  try {
    await ($axios as any).delete("/api/transaction", { data: { id } });
    internalTransactions.value = internalTransactions.value.filter((t) => t._id !== id);
    toast.add({ title: "Deleted", description: "Transaction removed successfully", color: "green" });
    emit("delete", id);
  } catch (err: any) {
    toast.add({ title: "Error", description: "Failed to delete transaction", color: "red" });
  }
};

const handleEditTransaction = (date: string, id: string) => {
  const item = activeTransactions.value.find((t) => t._id === id);
  if (item) {
    store.editTransaction(item);
  }
  emit("edit", date, id);
};

defineExpose({
  refresh: fetchMonthTransactions,
});
</script>

<template>
  <div class="space-y-6">
    <!-- Top Month Toolbar & KPI Badges -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-200/70 dark:border-white/10 shadow-xs"
    >
      <!-- Month Navigation Controls -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <UIcon name="i-heroicons-calendar-days" class="w-5 h-5" />
          </div>
          <h2 class="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{{ focusedMonthTitle }}</span>
            <UIcon
              v-if="isCalendarLoading"
              name="i-heroicons-arrow-path"
              class="w-4 h-4 text-blue-500 animate-spin"
            />
          </h2>
        </div>

        <div class="flex items-center gap-1 ml-2">
          <UButton
            @click="prevMonth"
            icon="i-heroicons-chevron-left"
            color="gray"
            variant="ghost"
            class="rounded-xl w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10"
            aria-label="Previous Month"
          />
          <UButton
            @click="nextMonth"
            icon="i-heroicons-chevron-right"
            color="gray"
            variant="ghost"
            class="rounded-xl w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10"
            aria-label="Next Month"
          />
          <UButton
            v-if="focusedYear !== now.getFullYear() || focusedMonth !== now.getMonth()"
            @click="goToToday"
            size="xs"
            color="primary"
            variant="soft"
            class="rounded-xl font-black ml-1 text-xs"
          >
            Today
          </UButton>
        </div>
      </div>

      <!-- Monthly Summary KPI Badges -->
      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
        <!-- Monthly Inflow -->
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          <UIcon name="i-heroicons-arrow-up-right" class="w-3.5 h-3.5" />
          <span>+{{ currency(monthlyTotals.income) }}</span>
        </div>

        <!-- Monthly Outflow -->
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-600 dark:text-rose-400">
          <UIcon name="i-heroicons-arrow-down-left" class="w-3.5 h-3.5" />
          <span>-{{ currency(monthlyTotals.expense) }}</span>
        </div>

        <!-- Monthly Net -->
        <div
          class="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black"
          :class="monthlyTotals.net >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-white/10'"
        >
          <span class="text-[10px] text-gray-400 font-extrabold uppercase">Net:</span>
          <span>{{ monthlyTotals.net >= 0 ? '+' : '' }}{{ currency(monthlyTotals.net) }}</span>
        </div>
      </div>
    </div>

    <!-- Responsive Layout: 7-Column Grid + Selected Day Agenda Panel -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left: 7-Column Interactive Monthly Calendar Grid (7 cols) -->
      <div
        class="lg:col-span-7 bg-white dark:bg-gray-900/80 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-gray-200/70 dark:border-white/10 shadow-xs space-y-3"
      >
        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-1 text-center font-bold text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider py-1 border-b border-gray-100 dark:border-white/5">
          <div v-for="w in weekdayLabels" :key="w" class="py-1">
            {{ w }}
          </div>
        </div>

        <!-- Calendar Day Cells -->
        <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
          <button
            v-for="cell in calendarGridCells"
            :key="cell.dateStr"
            type="button"
            @click="selectCell(cell)"
            :class="[
              'group relative min-h-[58px] sm:min-h-[72px] p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between text-left transition-all select-none border',
              // Selected style
              cell.isSelected
                ? 'bg-blue-600/10 dark:bg-blue-500/15 border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/30'
                // Today style
                : cell.isToday
                ? 'bg-gray-50 dark:bg-white/5 border-blue-400/40 dark:border-blue-400/30'
                // Default style
                : 'bg-white dark:bg-gray-950/40 border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50/70 dark:hover:bg-white/5',
              // Outside month muted opacity
              !cell.isCurrentMonth ? 'opacity-40' : 'opacity-100',
            ]"
          >
            <!-- Day Number & Today Marker -->
            <div class="flex items-center justify-between w-full">
              <span
                :class="[
                  'text-xs sm:text-sm font-black transition-colors',
                  cell.isSelected
                    ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                    : cell.isToday
                    ? 'text-blue-600 dark:text-blue-400 font-extrabold'
                    : 'text-gray-800 dark:text-gray-200',
                ]"
              >
                {{ cell.dayNumber }}
              </span>

              <!-- Today Indicator Pill -->
              <span
                v-if="cell.isToday"
                class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ring-2 ring-blue-400/30"
              ></span>
            </div>

            <!-- Activity Indicators / Micro Pills -->
            <div class="w-full space-y-0.5 mt-1">
              <!-- Desktop / Tablet: Compact financial tags -->
              <div v-if="cell.income > 0" class="hidden sm:flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
                <span class="truncate">+{{ currency(cell.income) }}</span>
              </div>
              <div v-if="cell.expense > 0" class="hidden sm:flex items-center text-[10px] font-bold text-rose-600 dark:text-rose-400 truncate">
                <span class="truncate">-{{ currency(cell.expense) }}</span>
              </div>

              <!-- Mobile: Micro Indicator Dots -->
              <div class="flex sm:hidden items-center gap-1 justify-center pt-1">
                <div
                  v-if="cell.income > 0"
                  class="w-1.5 h-1.5 rounded-full bg-emerald-500"
                ></div>
                <div
                  v-if="cell.expense > 0"
                  class="w-1.5 h-1.5 rounded-full bg-rose-500"
                ></div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Right: Selected Day Inspection Panel (5 cols) -->
      <div
        class="lg:col-span-5 bg-white dark:bg-gray-900/80 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-gray-200/70 dark:border-white/10 shadow-xs space-y-5"
      >
        <!-- Panel Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
          <div>
            <span class="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Day Breakdown
            </span>
            <h3 class="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
              {{ formattedSelectedDateHeader }}
            </h3>
          </div>

          <UButton
            @click="store.toggleTransactionModal(true)"
            icon="i-heroicons-plus"
            size="xs"
            color="primary"
            class="rounded-xl px-3 py-1.5 font-bold self-start sm:self-auto"
          >
            Add Record
          </UButton>
        </div>

        <!-- Daily Financial Summary Strip -->
        <div
          v-if="selectedDaySummary.count > 0"
          class="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 text-center"
        >
          <div>
            <span class="block text-[10px] uppercase tracking-wider text-gray-400 font-bold">In</span>
            <span class="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
              +{{ currency(selectedDaySummary.income) }}
            </span>
          </div>
          <div>
            <span class="block text-[10px] uppercase tracking-wider text-gray-400 font-bold">Out</span>
            <span class="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400">
              -{{ currency(selectedDaySummary.expense) }}
            </span>
          </div>
          <div>
            <span class="block text-[10px] uppercase tracking-wider text-gray-400 font-bold">Net</span>
            <span
              class="text-xs sm:text-sm font-black"
              :class="selectedDaySummary.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'"
            >
              {{ selectedDaySummary.net >= 0 ? '+' : '' }}{{ currency(selectedDaySummary.net) }}
            </span>
          </div>
        </div>

        <!-- Selected Day Transaction Items -->
        <div v-if="selectedDayTransactions.length > 0" class="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          <Transaction
            v-for="t in selectedDayTransactions"
            :key="t._id"
            :data="t"
            @delete="(id) => handleDeleteTransaction(id)"
            @edit="(date, id) => handleEditTransaction(date, id)"
          />
        </div>

        <!-- Empty State for Selected Day -->
        <div
          v-else
          class="text-center py-12 px-4 rounded-2xl border border-dashed border-gray-200 dark:border-white/10"
        >
          <div class="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 flex items-center justify-center mx-auto mb-3">
            <UIcon name="i-heroicons-calendar" class="w-6 h-6" />
          </div>
          <h4 class="text-sm font-black text-gray-800 dark:text-gray-200 mb-1">
            No Transactions
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-4 font-medium">
            No financial activity recorded on this date.
          </p>
          <UButton
            @click="store.toggleTransactionModal(true)"
            size="xs"
            color="primary"
            variant="soft"
            class="rounded-xl px-4 py-1.5 font-bold"
          >
            Record Transaction
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
