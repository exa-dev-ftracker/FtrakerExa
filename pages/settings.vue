<script setup lang="ts">
import type { Category } from "~/types";

const store = useDefaultStore();
const toast = useToast();
const userEmail = computed(() => store.user?.email || "user@example.com");
const userName = computed(() => store.user?.name || "User");
const isRequestingReset = ref(false);

useHead({
  title: "Settings - FTraker",
  meta: [{ name: "description", content: "Manage your account settings" }],
});

const { $axios } = useNuxtApp();

const fetchUser = async () => {
  try {
    const res: any = await ($axios as any).get("/api/users/me");
    if (res.data?.body?.user) {
      store.setUser(res.data.body.user);
    }
  } catch (err) {
    console.error("Failed to fetch user:", err);
  }
};

onMounted(async () => {
  if (!store.isAuth) {
    return navigateTo("/login");
  }
  
  if (!store.user) {
    await fetchUser();
  }
  if (store.categories.length === 0) {
    await store.fetchCategories();
  }
});

const requestPasswordReset = async () => {
  try {
    isRequestingReset.value = true;
    await ($axios as any).post("/api/auth/request-password-reset");
    toast.add({ 
      title: 'Secure Link Sent', 
      description: 'Check your email for password reset instructions.', 
      color: 'green' 
    });
  } catch (err: any) {
    console.error(err);
    toast.add({ 
      title: 'Failed to send', 
      description: err.response?.data?.statusMessage || 'An error occurred while sending the email.', 
      color: 'red' 
    });
  } finally {
    isRequestingReset.value = false;
  }
};

// Category Management
const isCategoryModalOpen = ref(false);
const categoryForm = reactive({
  _id: "",
  name: "",
  type: "" as string,
  color: "#6366f1",
  icon: "i-heroicons-tag",
});
const isEditingCategory = ref(false);
const categoryLoading = ref(false);

const openCategoryModal = (cat?: Category) => {
  if (cat) {
    isEditingCategory.value = true;
    categoryForm._id = cat._id;
    categoryForm.name = cat.name;
    categoryForm.type = cat.type || "";
    categoryForm.color = cat.color;
    categoryForm.icon = cat.icon;
  } else {
    isEditingCategory.value = false;
    categoryForm._id = "";
    categoryForm.name = "";
    categoryForm.type = "";
    categoryForm.color = "#6366f1";
    categoryForm.icon = "i-heroicons-tag";
  }
  isCategoryModalOpen.value = true;
};

const closeCategoryModal = () => {
  isCategoryModalOpen.value = false;
};

const saveCategory = async () => {
  if (categoryLoading.value) return;
  if (!categoryForm.name.trim()) {
    toast.add({ title: "Error", description: "Category name is required", color: "red" });
    return;
  }
  categoryLoading.value = true;
  try {
    if (isEditingCategory.value) {
      await ($axios as any).put("/api/category", {
        _id: categoryForm._id,
        name: categoryForm.name.trim(),
        type: categoryForm.type || null,
        color: categoryForm.color,
        icon: categoryForm.icon,
      });
      toast.add({ title: "Success", description: "Category updated", color: "green" });
    } else {
      await ($axios as any).post("/api/category", {
        name: categoryForm.name.trim(),
        type: categoryForm.type || null,
        color: categoryForm.color,
        icon: categoryForm.icon,
      });
      toast.add({ title: "Success", description: "Category created", color: "green" });
    }
    closeCategoryModal();
    await store.fetchCategories();
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err.response?._data?.body?.message || "Failed to save category",
      color: "red",
    });
  } finally {
    categoryLoading.value = false;
  }
};

const deleteCategory = async (cat: Category) => {
  try {
    await ($axios as any).delete("/api/category", { data: { _id: cat._id } });
    toast.add({ title: "Success", description: "Category deleted", color: "green" });
    await store.fetchCategories();
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err.response?._data?.body?.message || "Failed to delete category",
      color: "red",
    });
  }
};

const colorOptions = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#3b82f6", "#2563eb", "#1d4ed8",
];
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] p-4 pb-32 md:p-8">
    <div class="max-w-5xl mx-auto">
      <UNotifications />

      <!-- Page Header -->
      <Motion 
        :initial="{ opacity: 0, y: -20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8 }"
        class="header-anim flex justify-between items-end mb-12"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
            <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
            System Preferences
          </div>
          <h1 class="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Settings <span class="text-blue-600">.</span></h1>
          <p class="text-gray-500 dark:text-gray-400 font-medium">Manage your account preferences and security.</p>
        </div>
        <UButton to="/dashboard" icon="i-heroicons-arrow-left" color="gray" variant="soft" class="rounded-2xl px-6 font-black">Dashboard</UButton>
      </Motion>
      
      <div class="w-full">
        <!-- Main Content -->
        <Motion 
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, delay: 0.2 }"
          class="content-anim"
        >
          <div class="bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-[3rem] p-10 shadow-xl shadow-gray-200/20 dark:shadow-none min-h-[500px]">
             
             <!-- Account Section -->
             <div class="space-y-10">
                <div class="space-y-2">
                   <h2 class="text-2xl font-black text-gray-900 dark:text-white">Profile Identity</h2>
                   <p class="text-gray-500 font-medium">Welcome back, <span class="text-blue-600">{{ userName }}</span>. Manage your account details here.</p>
                </div>

                <div class="grid grid-cols-1 gap-8">
                   <div class="space-y-2">
                      <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Account Email</label>
                      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl text-gray-900 dark:text-white font-bold">{{ userEmail }}</div>
                   </div>
                </div>

                 <div class="pt-8 border-t border-gray-100 dark:border-white/5 space-y-6">
                    <div class="space-y-2">
                       <h3 class="text-lg font-black text-gray-900 dark:text-white">Security & Password</h3>
                       <p class="text-gray-500 text-sm font-medium">Keep your account secure with regular updates.</p>
                    </div>
                    <UButton 
                      :loading="isRequestingReset"
                      label="Update Password via Email" 
                      icon="i-heroicons-key" 
                      color="primary" 
                      size="xl" 
                      class="rounded-2xl px-8 font-black" 
                      @click="requestPasswordReset" 
                    />
                 </div>

                 <!-- Category Management -->
                 <div class="pt-8 border-t border-gray-100 dark:border-white/5 space-y-6">
                    <div class="flex items-center justify-between">
                       <div class="space-y-2">
                          <h3 class="text-lg font-black text-gray-900 dark:text-white">Category Management</h3>
                          <p class="text-gray-500 text-sm font-medium">Organize your transactions with custom categories.</p>
                       </div>
                       <UButton
                          @click="openCategoryModal()"
                          icon="i-heroicons-plus"
                          color="primary"
                          size="md"
                          class="rounded-xl font-black"
                       >
                          Add Category
                       </UButton>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       <div
                          v-for="cat in store.categories"
                          :key="cat._id"
                          class="group relative bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-white/5 rounded-2xl p-5 hover:shadow-lg transition-all duration-300"
                       >
                          <div class="flex items-start justify-between">
                             <div class="flex items-center gap-3">
                                <div
                                   class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
                                   :style="{ backgroundColor: cat.color }"
                                >
                                   <UIcon :name="cat.icon" class="w-5 h-5" />
                                </div>
                                <div>
                                   <p class="font-bold text-gray-900 dark:text-white">{{ cat.name }}</p>
                                   <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                      {{ cat.type || "Both" }}
                                   </p>
                                </div>
                             </div>
                             <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <UButton
                                   @click="openCategoryModal(cat)"
                                   color="gray"
                                   variant="ghost"
                                   icon="i-heroicons-pencil-square"
                                   class="rounded-lg"
                                   size="xs"
                                />
                                <UButton
                                   @click="deleteCategory(cat)"
                                   color="red"
                                   variant="ghost"
                                   icon="i-heroicons-trash"
                                   class="rounded-lg"
                                   size="xs"
                                />
                             </div>
                          </div>
                       </div>
                       <div
                          v-if="store.categories.length === 0"
                          class="col-span-full text-center py-12 text-gray-400 font-bold"
                       >
                          No categories yet. Create your first category!
                       </div>
                    </div>
                 </div>
              </div>

           </div>
         </Motion>
       </div>

       <!-- Category Modal -->
       <UModal v-model="isCategoryModalOpen" class="animate-fade-in">
          <UCard
             :ui="{
                ring: 'ring-2 ring-blue-200 dark:ring-blue-800',
                divide: 'divide-y divide-gray-200 dark:divide-gray-800',
                body: { padding: 'px-6 py-6' },
                header: { padding: 'px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20' },
             }"
          >
             <template #header>
                <div class="flex items-center justify-between">
                   <div>
                      <h3 class="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                         {{ isEditingCategory ? "Edit Category" : "New Category" }}
                      </h3>
                   </div>
                   <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="closeCategoryModal" />
                </div>
             </template>
             <div class="flex flex-col gap-5">
                <UFormGroup label="Name" required>
                   <UInput v-model="categoryForm.name" placeholder="e.g., Food, Salary" />
                </UFormGroup>

                <UFormGroup label="Type">
                   <USelect
                      v-model="categoryForm.type"
                      :options="[
                         { value: '', label: 'Both (Income & Expense)' },
                         { value: 'income', label: 'Income Only' },
                         { value: 'expense', label: 'Expense Only' },
                      ]"
                      placeholder="Select type"
                   />
                </UFormGroup>

                <UFormGroup label="Color">
                   <div class="flex flex-wrap gap-2">
                      <button
                         v-for="c in colorOptions"
                         :key="c"
                         @click="categoryForm.color = c"
                         class="w-8 h-8 rounded-xl border-2 transition-all duration-200 hover:scale-110"
                         :class="categoryForm.color === c ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-offset-2 ring-blue-500' : 'border-transparent'"
                         :style="{ backgroundColor: c }"
                      />
                   </div>
                </UFormGroup>

                <UFormGroup label="Icon">
                   <USelect
                      v-model="categoryForm.icon"
                      :options="[
                         { value: 'i-heroicons-tag', label: 'Tag' },
                         { value: 'i-heroicons-shopping-cart', label: 'Cart' },
                         { value: 'i-heroicons-truck', label: 'Transport' },
                         { value: 'i-heroicons-home', label: 'Home' },
                         { value: 'i-heroicons-heart', label: 'Health' },
                         { value: 'i-heroicons-academic-cap', label: 'Education' },
                         { value: 'i-heroicons-briefcase', label: 'Work' },
                         { value: 'i-heroicons-gift', label: 'Gift' },
                         { value: 'i-heroicons-musical-note', label: 'Entertainment' },
                         { value: 'i-heroicons-banknotes', label: 'Money' },
                         { value: 'i-heroicons-credit-card', label: 'Card' },
                         { value: 'i-heroicons-chart-bar', label: 'Investment' },
                      ]"
                      placeholder="Select an icon"
                   >
                      <template #option="{ option }">
                         <div class="flex items-center gap-2">
                            <UIcon :name="option.value" class="w-4 h-4" />
                            {{ option.label }}
                         </div>
                      </template>
                   </USelect>
                </UFormGroup>

                <div class="flex gap-3 pt-2">
                   <UButton
                      @click="saveCategory"
                      color="blue"
                      variant="solid"
                      :label="isEditingCategory ? 'Update Category' : 'Create Category'"
                      size="lg"
                      class="flex-1 justify-center"
                      :loading="categoryLoading"
                   />
                   <UButton
                      @click="closeCategoryModal"
                      color="gray"
                      variant="soft"
                      label="Cancel"
                      size="lg"
                      class="flex-1 justify-center"
                   />
                </div>
             </div>
          </UCard>
       </UModal>
    </div>
  </div>
</template>

<style scoped>
</style>
