<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { $axios } = useNuxtApp();

const token = computed(() => route.query.token as string);
const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

useHead({
  title: "Reset Password - FTraker",
});

const submitReset = async () => {
  errorMessage.value = ""; // Clear previous errors

  if (!token.value) {
    errorMessage.value = "Invalid or missing token.";
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }
  if (password.value.length < 6) {
    errorMessage.value = "Password must be at least 6 characters.";
    return;
  }

  try {
    isLoading.value = true;
    await ($axios as any).post("/api/auth/reset-password", {
      token: token.value,
      newPassword: password.value,
    });
    toast.add({ title: "Success", description: "Your password has been successfully reset. You can now login.", color: "green" });
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (err: any) {
    console.error(err);
    errorMessage.value = err.response?.data?.statusMessage || "Failed to reset password. The link might have expired.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <UNotifications />
  <div class="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#020617] p-4">
    <div class="max-w-md w-full">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/5 p-8 rounded-3xl shadow-xl">
        <h1 class="text-2xl font-black text-center mb-2">Reset Password</h1>
        <p class="text-gray-500 text-center mb-8">Enter your new password below.</p>

        <form @submit.prevent="submitReset" class="space-y-6">
          <!-- Inline Error Message -->
          <div v-if="errorMessage" class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium text-center border border-red-100 dark:border-red-900/30">
            {{ errorMessage }}
          </div>

          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700 dark:text-gray-300">New Password</label>
            <UInput v-model="password" type="password" placeholder="••••••••" size="xl" required />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-bold text-gray-700 dark:text-gray-300">Confirm Password</label>
            <UInput v-model="confirmPassword" type="password" placeholder="••••••••" size="xl" required />
          </div>

          <UButton 
            type="submit" 
            color="primary" 
            block 
            size="xl" 
            class="font-bold rounded-xl"
            :loading="isLoading"
          >
            Reset Password
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>
