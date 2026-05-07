<script setup lang="ts">
useHead({
  title: "FTracker - Set Your Password",
  meta: [
    {
      name: "description",
      content: "Complete your account setup by setting a password.",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});

const toast = useToast();
const router = useRouter();
const store = useDefaultStore();

const formData = reactive({
  password: "",
  passwordConfirmation: "",
});

const isLoading = ref(false);
const error = reactive({
  password: "",
  passwordConfirmation: "",
});

const handleSubmit = async () => {
  error.password = "";
  error.passwordConfirmation = "";

  if (formData.password !== formData.passwordConfirmation) {
    error.passwordConfirmation = "Passwords do not match";
    return;
  }

  if (formData.password.length < 6) {
    error.password = "Password must be at least 6 characters";
    return;
  }

  isLoading.value = true;

  try {
    const res = await (useNuxtApp().$axios as any).post("/api/user/password", {
      password: formData.password,
    });
    const data = res.data || res;

    if (data.statusCode === 200) {
      toast.add({
        title: "Password Set! ✅",
        description: "Your password has been saved successfully",
      });
      router.push("/transactions");
    }
  } catch (err: any) {
    console.error(err);
    toast.add({
      title: "Error",
      description: "Failed to set password. Please try again.",
    });
  } finally {
    isLoading.value = false;
  }
};

const handleSkip = () => {
  router.push("/transactions");
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex justify-center items-center p-4 animate-fade-in"
  >
    <UNotifications />

    <div class="w-full max-w-md">
      <!-- Animated Background Shapes -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full blur-3xl opacity-10 dark:opacity-5"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200 to-green-200 rounded-full blur-3xl opacity-10 dark:opacity-5"
        ></div>
      </div>

      <!-- Main Card -->
      <div
        class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <!-- Gradient Header -->
        <div
          class="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-8 text-white text-center"
        >
          <div
            class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
          >
            <span class="text-4xl">🔐</span>
          </div>
          <h1 class="text-3xl font-extrabold mb-2">Secure Your Account</h1>
          <p class="text-green-100">Set a password to complete your setup</p>
        </div>

        <!-- Form Section -->
        <form @submit.prevent="handleSubmit" class="p-8">
          <!-- Info Box -->
          <div
            class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6"
          >
            <p class="text-sm text-green-700 dark:text-green-300">
              ✨ <strong>Optional but recommended:</strong> Set a password to
              add extra security to your account. You can skip this for now and
              set it later.
            </p>
          </div>

          <!-- Password Input -->
          <div class="mb-6">
            <label
              for="password"
              class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
              >🔑 Password</label
            >
            <input
              v-model="formData.password"
              id="password"
              type="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 outline-none"
            />
            <p
              v-if="error.password"
              class="text-red-500 dark:text-red-400 text-sm mt-2"
            >
              {{ error.password }}
            </p>
          </div>

          <!-- Confirm Password Input -->
          <div class="mb-8">
            <label
              for="passwordConfirmation"
              class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
              >✅ Confirm Password</label
            >
            <input
              v-model="formData.passwordConfirmation"
              id="passwordConfirmation"
              type="password"
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 outline-none"
            />
            <p
              v-if="error.passwordConfirmation"
              class="text-red-500 dark:text-red-400 text-sm mt-2"
            >
              {{ error.passwordConfirmation }}
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button
              type="button"
              @click="handleSkip"
              class="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300"
            >
              ⏭️ Skip for Now
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-green-500/50 hover:scale-105 transform transition-all duration-300 disabled:opacity-50"
            >
              {{ isLoading ? "⏳ Setting..." : "✅ Set Password" }}
            </button>
          </div>
        </form>

        <!-- Footer -->
        <div
          class="px-8 pb-8 text-center border-t border-gray-200 dark:border-gray-700"
        >
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-4">
            You can update this anytime in your
            <NuxtLink
              to="/settings"
              class="font-bold text-green-600 dark:text-green-400 hover:text-emerald-600"
            >
              account settings
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Bottom Text -->
      <div class="text-center mt-6 text-gray-600 dark:text-gray-400 text-sm">
        <p>🎉 Welcome to FTracker!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}
</style>
