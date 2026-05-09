<script setup lang="ts">
const store = useDefaultStore();
const toast = useToast();
const userEmail = computed(() => store.user?.email || "user@example.com");
const userName = computed(() => store.user?.name || "User");

useHead({
  title: "Settings - FTraker",
  meta: [{ name: "description", content: "Manage your account settings" }],
});

const fetchUser = async () => {
  try {
    const res: any = await (useNuxtApp().$axios as any).get("/api/users/me");
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
});
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] p-4 md:p-8">
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
                   <UButton label="Update Password" icon="i-heroicons-key" color="primary" size="xl" class="rounded-2xl px-8 font-black" @click="toast.add({ title: 'Secure Link Sent', description: 'Check your email for password reset instructions.', color: 'blue' })" />
                </div>
             </div>

          </div>
        </Motion>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
