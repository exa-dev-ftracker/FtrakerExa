<script setup lang="ts">
import type { Category } from "~/types";

definePageMeta({
  middleware: "is-auth",
});

const store = useDefaultStore();
const toast = useToast();
const userEmail = computed(() => store.user?.email || "user@example.com");
const userName = computed(() => store.user?.name || "User");
const isRequestingReset = ref(false);

const { authorizeAppleForBinding, isAppleLoading } = useAppleSignIn();
const { authorizeGoogleForBinding } = useGoogleSignIn();

const oauthStatus = reactive({
  is_google_linked: false,
  google_email: null as string | null,
  is_apple_linked: false,
  apple_email: null as string | null,
  isLoading: false,
  isUnbindingApple: false,
  isBindingGoogle: false,
});

useHead({
  title: "Settings - FTraker",
  meta: [{ name: "description", content: "Manage your account settings" }],
});

const { $axios } = useNuxtApp();

const fetchOAuthSettings = async () => {
  oauthStatus.isLoading = true;
  try {
    const res: any = await ($axios as any).get("/api/user/settings");
    const data = res.data?.body || res.body;
    if (data) {
      oauthStatus.is_google_linked = Boolean(data.is_google_linked);
      oauthStatus.google_email = data.google_email;
      oauthStatus.is_apple_linked = Boolean(data.is_apple_linked);
      oauthStatus.apple_email = data.apple_email;
    }
  } catch (err) {
    console.error("Failed to fetch OAuth settings:", err);
  } finally {
    oauthStatus.isLoading = false;
  }
};

const bindGoogleAccount = async () => {
  oauthStatus.isBindingGoogle = true;
  try {
    const code = await authorizeGoogleForBinding();
    const res: any = await ($axios as any).post("/api/user/bind-google", { code });
    const data = res.data || res;
    if (data.statusCode === 200) {
      oauthStatus.is_google_linked = true;
      oauthStatus.google_email = data.body?.google_email;
      toast.add({
        title: "Google Connected! 🎉",
        description: "Google account connected successfully.",
        color: "green",
      });
    }
  } catch (err: any) {
    if (err?.message !== "popup_closed_by_user") {
      toast.add({
        title: "Failed to Connect Google",
        description: err.response?.data?.body?.message || err.message || "Failed to link Google account",
        color: "red",
      });
    }
  } finally {
    oauthStatus.isBindingGoogle = false;
  }
};

const handleBindApple = async () => {
  try {
    const appleAuth = await authorizeAppleForBinding();
    if (!appleAuth) return;

    const res: any = await ($axios as any).post("/api/user/bind-apple", {
      identityToken: appleAuth.identityToken,
      email: appleAuth.email,
    });
    const data = res.data || res;
    if (data.statusCode === 200) {
      oauthStatus.is_apple_linked = true;
      oauthStatus.apple_email = data.body?.apple_email;
      toast.add({
        title: "Apple ID Connected! 🍏",
        description: "Apple ID linked to your account successfully.",
        color: "green",
      });
    }
  } catch (err: any) {
    toast.add({
      title: "Failed to Connect Apple",
      description: err.response?.data?.body?.message || err.message,
      color: "red",
    });
  }
};

const handleUnbindApple = async () => {
  if (!confirm("Are you sure you want to unlink your Apple ID from this account?")) return;

  oauthStatus.isUnbindingApple = true;
  try {
    const res: any = await ($axios as any).post("/api/user/unbind-apple");
    const data = res.data || res;
    if (data.statusCode === 200) {
      oauthStatus.is_apple_linked = false;
      oauthStatus.apple_email = null;
      toast.add({
        title: "Apple ID Unlinked",
        description: "Apple ID unlinked from your account successfully.",
        color: "green",
      });
    }
  } catch (err: any) {
    toast.add({
      title: "Failed to Unlink Apple ID",
      description: err.response?.data?.body?.message || err.message,
      color: "red",
    });
  } finally {
    oauthStatus.isUnbindingApple = false;
  }
};

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
  await fetchOAuthSettings();
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
        class="header-anim flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-12"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
            <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
            System Preferences
          </div>
          <h1 class="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Settings <span class="text-blue-600">.</span></h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium">Manage your account preferences and security.</p>
        </div>
        <UButton to="/dashboard" icon="i-heroicons-arrow-left" color="gray" variant="soft" class="rounded-2xl px-6 font-black">Dashboard</UButton>
      </Motion>
      
      <div class="w-full min-w-0">
        <!-- Main Content -->
        <Motion 
          :initial="{ opacity: 0, y: 30 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.8, delay: 0.2 }"
          class="content-anim"
        >
          <div class="bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl sm:rounded-[3rem] p-5 sm:p-10 shadow-xl shadow-gray-200/20 dark:shadow-none min-h-[500px]">
             
             <!-- Account Section -->
             <div class="space-y-10">
                <div class="space-y-2">
                   <h2 class="text-2xl font-black text-gray-900 dark:text-white">Profile Identity</h2>
                   <p class="text-gray-500 font-medium">Welcome back, <span class="text-blue-600 break-all">{{ userName }}</span>. Manage your account details here.</p>
                </div>

                <div class="grid grid-cols-1 gap-8">
                   <div class="space-y-2 min-w-0">
                      <label class="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Account Email</label>
                      <div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl text-gray-900 dark:text-white font-bold text-sm sm:text-base break-all select-all">{{ userEmail }}</div>
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
                      class="rounded-2xl px-6 sm:px-8 font-black w-full sm:w-auto justify-center text-sm sm:text-base" 
                      @click="requestPasswordReset" 
                    />
                 </div>

                 <!-- Connected Accounts -->
                 <div class="pt-8 border-t border-gray-100 dark:border-white/5 space-y-6">
                    <div class="space-y-1">
                       <h3 class="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                          <UIcon name="i-heroicons-link" class="w-5 h-5 text-blue-600" />
                          Connected Accounts
                       </h3>
                       <p class="text-gray-500 text-sm font-medium">Manage Google and Apple ID accounts linked to your FTraker profile.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <!-- Google Account Card -->
                       <div class="p-5 sm:p-6 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-white/5 rounded-3xl flex flex-col justify-between gap-5 transition-all hover:border-blue-500/30 min-w-0">
                          <div class="flex items-start justify-between gap-4 min-w-0">
                             <div class="flex items-center gap-3.5 min-w-0 flex-1">
                                <div class="w-12 h-12 rounded-2xl bg-white dark:bg-gray-700/60 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center shrink-0">
                                   <svg class="w-6 h-6" viewBox="0 0 24 24">
                                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                   </svg>
                                </div>
                                <div class="min-w-0 flex-1">
                                   <div class="flex items-center gap-2 flex-wrap">
                                      <h4 class="font-black text-gray-900 dark:text-white">Google Account</h4>
                                      <span
                                         v-if="oauthStatus.is_google_linked"
                                         class="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0"
                                      >
                                         Connected
                                      </span>
                                      <span
                                         v-else
                                         class="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0"
                                      >
                                         Not Linked
                                      </span>
                                   </div>
                                   <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 break-all">
                                      {{ oauthStatus.google_email || (oauthStatus.is_google_linked ? userEmail : "Link Google account for seamless login") }}
                                   </p>
                                </div>
                             </div>
                          </div>

                          <div>
                             <div v-if="oauthStatus.is_google_linked" class="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2.5 rounded-xl border border-emerald-500/20">
                                <UIcon name="i-heroicons-check-circle" class="w-4 h-4 shrink-0" />
                                <span class="break-words">Google account active and linked</span>
                             </div>
                             <div v-else class="flex items-center justify-start">
                                <button
                                   type="button"
                                   @click="bindGoogleAccount"
                                   :disabled="oauthStatus.isBindingGoogle"
                                   class="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
                                >
                                   <UIcon v-if="oauthStatus.isBindingGoogle" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin text-gray-500" />
                                   <svg v-else class="w-4 h-4" viewBox="0 0 24 24">
                                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                                   </svg>
                                   <span>{{ oauthStatus.isBindingGoogle ? "Connecting..." : "Connect Google" }}</span>
                                </button>
                             </div>
                          </div>
                       </div>

                       <!-- Apple ID Card -->
                       <div class="p-5 sm:p-6 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-white/5 rounded-3xl flex flex-col justify-between gap-5 transition-all hover:border-blue-500/30 min-w-0">
                          <div class="flex items-start justify-between gap-4 min-w-0">
                             <div class="flex items-center gap-3.5 min-w-0 flex-1">
                                <div class="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-sm flex items-center justify-center shrink-0">
                                   <svg class="w-6 h-6 fill-current" viewBox="0 0 170 170">
                                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.85-11.89-14.43-6.24-9.8-11.01-20.9-14.3-33.3-3.29-12.4-4.94-23.7-4.94-33.9 0-14.65 3.82-26.68 11.45-36.08 7.64-9.4 17.02-14.23 28.16-14.5 5.37.13 11.2 1.44 17.5 3.93 6.3 2.5 10.45 3.82 12.45 3.95 2.57-.27 7.02-1.74 13.35-4.41 6.33-2.67 11.96-3.87 16.89-3.6 12.55.8 22.86 5.57 30.93 14.3-10.98 6.64-16.32 15.7-16.02 27.18.3 9.4 3.95 17.3 10.95 23.7 4.1 3.73 8.84 6.38 14.22 7.95-2.3 6.8-5.06 13.6-8.28 20.4zM119.22 33.64c0-7.3 2.66-14.22 7.98-20.76 5.32-6.54 11.83-10.87 19.53-13-1.07 7.18-3.92 13.9-8.55 20.16-4.63 6.26-10.94 10.8-18.96 13.6z"/>
                                   </svg>
                                </div>
                                <div class="min-w-0 flex-1">
                                   <div class="flex items-center gap-2 flex-wrap">
                                      <h4 class="font-black text-gray-900 dark:text-white">Apple ID</h4>
                                      <span
                                         v-if="oauthStatus.is_apple_linked"
                                         class="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0"
                                      >
                                         Connected
                                      </span>
                                      <span
                                         v-else
                                         class="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0"
                                      >
                                         Not Connected
                                      </span>
                                   </div>
                                   <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 break-all">
                                      {{ oauthStatus.apple_email || (oauthStatus.is_apple_linked ? "Apple ID active and linked" : "Sign in quickly using your device Apple ID") }}
                                   </p>
                                </div>
                             </div>
                          </div>

                           <div>
                              <div v-if="oauthStatus.is_apple_linked" class="flex items-center justify-between gap-3">
                                 <div class="text-xs font-bold text-gray-400">
                                    Securely connected
                                 </div>
                                 <UButton
                                    @click="handleUnbindApple"
                                    :loading="oauthStatus.isUnbindingApple"
                                    color="red"
                                    variant="soft"
                                    icon="i-heroicons-link-slash"
                                    size="sm"
                                    class="rounded-xl font-black"
                                 >
                                    Unbind Apple
                                 </UButton>
                              </div>
                              <div v-else>
                                 <button
                                    type="button"
                                    @click="handleBindApple"
                                    :disabled="isAppleLoading"
                                    class="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black rounded-xl font-black text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                                 >
                                    <UIcon
                                       v-if="isAppleLoading"
                                       name="i-heroicons-arrow-path"
                                       class="w-4 h-4 animate-spin"
                                    />
                                    <svg
                                       v-else
                                       class="w-4 h-4 fill-current"
                                       viewBox="0 0 170 170"
                                    >
                                       <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.85-11.89-14.43-6.24-9.8-11.01-20.9-14.3-33.3-3.29-12.4-4.94-23.7-4.94-33.9 0-14.65 3.82-26.68 11.45-36.08 7.64-9.4 17.02-14.23 28.16-14.5 5.37.13 11.2 1.44 17.5 3.93 6.3 2.5 10.45 3.82 12.45 3.95 2.57-.27 7.02-1.74 13.35-4.41 6.33-2.67 11.96-3.87 16.89-3.6 12.55.8 22.86 5.57 30.93 14.3-10.98 6.64-16.32 15.7-16.02 27.18.3 9.4 3.95 17.3 10.95 23.7 4.1 3.73 8.84 6.38 14.22 7.95-2.3 6.8-5.06 13.6-8.28 20.4zM119.22 33.64c0-7.3 2.66-14.22 7.98-20.76 5.32-6.54 11.83-10.87 19.53-13-1.07 7.18-3.92 13.9-8.55 20.16-4.63 6.26-10.94 10.8-18.96 13.6z"/>
                                    </svg>
                                    <span>{{ isAppleLoading ? "Connecting..." : "Bind Apple ID" }}</span>
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
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
