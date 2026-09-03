<script setup lang="ts">
import type { Transaction } from "~/types";

interface Props {
  transaction: Transaction[];
  date: string;
}

const props = defineProps<Props>();

const incomeTotal = computed((): number => {
  return props.transaction.reduce((sum, t) => {
    return t.type.toLowerCase() === "income" ? sum + t.amount : sum;
  }, 0);
});

const expenseTotal = computed((): number => {
  return props.transaction.reduce((sum, t) => {
    return t.type.toLowerCase() === "expense" ? sum + t.amount : sum;
  }, 0);
});

const netTotal = computed((): number => incomeTotal.value - expenseTotal.value);
</script>

<template>
  <div
    class="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2 sm:gap-5 bg-white/80 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/60 dark:border-white/10 px-3.5 py-2 rounded-xl sm:rounded-2xl shadow-xs text-xs font-bold"
  >
    <!-- Daily Income -->
    <div class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
      <span class="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold hidden md:inline">In:</span>
      <UIcon name="i-heroicons-arrow-up-right" class="w-3.5 h-3.5" />
      <span>+{{ currency(incomeTotal) }}</span>
    </div>

    <div class="h-3.5 w-px bg-gray-200 dark:bg-gray-800"></div>

    <!-- Daily Expense -->
    <div class="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
      <span class="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold hidden md:inline">Out:</span>
      <UIcon name="i-heroicons-arrow-down-left" class="w-3.5 h-3.5" />
      <span>-{{ currency(expenseTotal) }}</span>
    </div>

    <div class="h-3.5 w-px bg-gray-200 dark:bg-gray-800"></div>

    <!-- Daily Net -->
    <div
      class="flex items-center gap-1.5 font-black"
      :class="netTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'"
    >
      <span class="text-[10px] uppercase tracking-wider text-gray-400 font-extrabold hidden md:inline">Net:</span>
      <span>{{ netTotal >= 0 ? '+' : '' }}{{ currency(netTotal) }}</span>
    </div>
  </div>
</template>