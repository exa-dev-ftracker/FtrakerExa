<script lang="ts" setup>
import { z } from "zod";
import type { Transaction } from "~/types";

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
    .refine((val) => ["Income", "Expense", "Expanse"].includes(val), {
      message: "Type must be Income or Expense",
    }),
  amount: z.number().min(1000, "Amount must be at least Rp 1000"),
});

const isOpen = computed({
  get: () => props.isModalOpen,
  set: (value: boolean) => {
    emit("update:isModalOpen", value);
  },
});

const formData = reactive({
  createdAt: `${new Date().toISOString().split("T")[0]}`,
  description: "",
  type: "",
  amount: 0,
  _id: "",
});

const formattedAmount = ref("Rp 0");

// Fungsi yang dipanggil setiap input berubah
const onInput = (event: InputEvent) => {
  // Hapus semua karakter non-digit

  const value = event.target.value.replace(/[^\d]/g, "");

  // Simpan nilai asli (tanpa format Rupiah)
  formData.amount = parseInt(value) || 0;

  // Format input menjadi Rupiah
  formattedAmount.value = currency(formData.amount);
};

const isLoading = ref(false);
const onSubmit = async () => {
  // Validasi form
  if (isLoading.value) return;
  isLoading.value = true;

  try {
    await schema.parseAsync(formData);
    // Kirim data ke server
    if (props.isEdit && props.data) {
      formData._id = props.data?._id;
      try {
        await (useNuxtApp().$axios as any).put("/api/transaction", formData);
        // Tutup modal
        toast.add({
          title: "Success",
          description: "Transaction saved successfully",
        });
        emit("submit");
        formData.createdAt = `${new Date().toISOString().split("T")[0]}`;
        formData.description = "";
        formData.type = "";
        formData.amount = 0;
        formattedAmount.value = "Rp 0";
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
        await (useNuxtApp().$axios as any).post("/api/transaction", formData);
        // Tutup modal
        toast.add({
          title: "Success",
          description: "Transaction saved successfully",
        });
        emit("submit");
        formData.createdAt = `${new Date().toISOString().split("T")[0]}`;
        formData.description = "";
        formData.type = "";
        formData.amount = 0;
        formattedAmount.value = "Rp 0";
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

watch(
  () => props.data,
  (newValue) => {
    if (newValue) {
      formData.createdAt = newValue.createdAt.split("T")[0];
      formData.description = newValue.description;

      // Normalisasi tipe ke format Capitalize yang tepat
      let parsedType =
        newValue.type.charAt(0).toUpperCase() +
        newValue.type.slice(1).toLowerCase();
      if (parsedType === "Expanse") {
        parsedType = "Expense";
      }
      formData.type = parsedType;

      formData.amount = newValue.amount;
      formData._id = newValue._id;
      formattedAmount.value = currency(newValue.amount);
    } else {
      formData.createdAt = `${new Date().toISOString().split("T")[0]}`;
      formData.description = "";
      formData.type = "";
      formData.amount = 0;
      formData._id = "";
      formattedAmount.value = "Rp 0";
    }
  },
  { immediate: true, deep: true },
);

watch(
  () => props.isModalOpen,
  (newValue) => {
    if (!newValue) {
      formData.createdAt = `${new Date().toISOString().split("T")[0]}`;
      formData.description = "";
      formData.type = "";
      formData.amount = 0;
      formData._id = "";
      formattedAmount.value = "Rp 0";
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
