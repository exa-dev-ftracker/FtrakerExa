<script setup lang="ts">
import type { Category, Transaction } from "~/types";
import { displayTransactionType } from "~/types";

const toast = useToast();
const props = defineProps<{ data: Transaction; loading?: boolean }>();
const emit = defineEmits(["edit", "delete"]);

const isIncome = computed(() => props.data?.type.toLowerCase() === "income");
const icon = computed(() =>
  isIncome.value
    ? "i-heroicons-arrow-up-right-20-solid"
    : "i-heroicons-arrow-down-left-20-solid",
);

const categoryData = computed<Category>(() => {
  const c = props.data?.category;
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

const formattedTime = computed(() => {
  if (!props.data?.createdAt) return "";
  try {
    const d = new Date(props.data.createdAt);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
});

const action = [
  [
    {
      label: "Edit Transaction",
      icon: "i-heroicons-pencil-square",
      click: () =>
        emit("edit", props.data.createdAt.split("T")[0], props.data._id),
    },
  ],
  [
    {
      label: "Delete Forever",
      icon: "i-heroicons-trash",
      class: "text-rose-500",
      click: () => {
        toast.add({
          title: "Confirm Deletion",
          description: "This action cannot be undone.",
          color: "red",
          actions: [
            {
              label: "Delete",
              color: "red",
              click: () => emit("delete", props.data._id),
            },
          ],
        });
      },
    },
  ],
];
</script>

<template>
  <div
    class="group relative bg-white dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/70 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/40 hover:-translate-y-0.5 hover:z-20 focus-within:z-30"
  >
    <!-- Subtle accent line based on income/expense -->
    <div
      class="absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-300 group-hover:w-1.5"
      :class="isIncome ? 'bg-emerald-500' : 'bg-rose-500'"
    ></div>

    <div class="flex items-center justify-between gap-3 sm:gap-5 pl-2 sm:pl-3">
      <!-- Left: Icon & Info -->
      <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div
          :class="[
            'w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm',
            isIncome
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
          ]"
        >
          <UIcon :name="icon" class="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h4
              class="text-sm sm:text-base font-black text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              {{ props.data.description }}
            </h4>
            <span
              v-if="formattedTime"
              class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 hidden sm:inline-block"
            >
              {{ formattedTime }}
            </span>
          </div>

          <div class="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
            >
              {{ displayTransactionType(props.data.type) }}
            </span>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-lg inline-flex items-center gap-1 border border-transparent shadow-xs"
              :style="{
                backgroundColor: (categoryData.color || '#3b82f6') + '18',
                color: categoryData.color || '#3b82f6',
              }"
            >
              <UIcon
                :name="categoryData.icon || 'i-heroicons-tag'"
                class="w-3 h-3"
              />
              {{ categoryData.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Amount & Actions -->
      <div class="flex items-center gap-2 sm:gap-4 shrink-0">
        <div class="text-right">
          <p
            :class="[
              'text-base sm:text-xl font-black tracking-tight',
              isIncome
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-900 dark:text-white',
            ]"
          >
            {{ isIncome ? "+" : "-" }}{{ currency(props.data.amount) }}
          </p>
          <span
            v-if="formattedTime"
            class="text-[10px] font-semibold text-gray-400 sm:hidden block"
          >
            {{ formattedTime }}
          </span>
        </div>

        <UDropdown
          :items="action"
          :popper="{ placement: 'bottom-end', strategy: 'fixed' }"
          :ui="{ container: 'z-50' }"
        >
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-ellipsis-vertical"
            class="rounded-xl w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center opacity-80 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-white/10 transition-opacity"
            aria-label="Actions"
          />
        </UDropdown>
      </div>
    </div>
  </div>
</template>
