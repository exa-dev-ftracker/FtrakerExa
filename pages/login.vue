<script setup lang="ts">
import {
  GoogleSignInButton,
  type CredentialResponse,
} from "vue3-google-signin";

useHead({
  title: "FTraker - Login",
  meta: [
    {
      name: "description",
      content: "View your financial summary, including income and expenses.",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});

const toast = useToast();
const router = useRouter();
const formData = reactive({
  email: "",
  password: "",
});
const store = useDefaultStore();
const isLoading = ref(false);
const error = ref(false);
const errorMessage = ref("");

// handle success event
const handleLoginSuccess = async (response: CredentialResponse) => {
  isLoading.value = true;
  try {
    const { credential } = response;
    const res: any = await (useNuxtApp().$axios as any).post(
      "/api/auth/google",
      { credential },
    );
    const data = res.data || res;

    if (data.statusCode === 200 || data.statusCode === 201) {
      store.login(data.body.token);
      const message =
        data.statusCode === 201
          ? "Account created successfully!"
          : "Logged in successfully!";
      toast.add({
        title: "Success",
        description: message,
        color: "green",
      });
      return router.push("/transactions");
    } else if (data.statusCode === 401) {
      toast.add({
        title: "Authentication Failed",
        description: data.body?.message || "Email not verified",
        color: "red",
      });
    } else if (data.statusCode === 404) {
      toast.add({
        title: "Account Not Found",
        description: "Please register to continue",
        color: "red",
      });
      return router.push("/register");
    } else {
      throw new Error(
        data.body?.message || "An error occurred while trying to sign in",
      );
    }
  } catch (err: any) {
    console.error("Google login error:", err);
    toast.add({
      title: "Login Failed",
      description:
        err.data?.body?.message ||
        err.message ||
        "An error occurred while trying to sign in",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

// handle an error event
const handleLoginError = () => {
  toast.add({
    title: "Login Failed",
    description: "Google Sign In was cancelled or failed",
    color: "red",
  });
};

const submit = async () => {
  try {
    // Validation
    if (!formData.email || !formData.password) {
      error.value = true;
      errorMessage.value = "Please enter both email and password";
      return;
    }

    if (!formData.email.includes("@")) {
      error.value = true;
      errorMessage.value = "Please enter a valid email address";
      return;
    }

    isLoading.value = true;
    error.value = false;
    errorMessage.value = "";

    const res = await (useNuxtApp().$axios as any).post("/api/auth/login", {
      email: formData.email,
      password: formData.password,
    });

    const data = res.data || res;

    if (data.statusCode === 200) {
      const jwt = useCookie("jwt");
      jwt.value = data.body.token;
      store.login(data.body.token);

      toast.add({
        title: "Welcome!",
        description: `Logged in as ${formData.email}`,
        color: "green",
      });

      return router.push("/transactions");
    } else {
      // Better error messages based on status code
      let message = "Login failed";

      if (data.statusCode === 401) {
        message = data.body?.message || "Email or password is incorrect";
      } else if (data.statusCode === 400) {
        message = data.body?.message || "Please check your email and password";
      } else if (data.statusCode === 404) {
        message = "Account not found. Please register first";
      } else {
        message = data.body?.message || "An error occurred. Please try again";
      }

      error.value = true;
      errorMessage.value = message;

      toast.add({
        title: "Login Failed",
        description: message,
        color: "red",
      });
    }
  } catch (err: any) {
    console.error("Login error:", err);
    error.value = true;
    errorMessage.value =
      "Network error. Please check your connection and try again";

    toast.add({
      title: "Connection Error",
      description: "Failed to connect to server. Please try again",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex justify-center items-center p-4 animate-fade-in"
  >
    <UNotifications />

    <div class="w-full max-w-md">
      <!-- Animated Background Shapes -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-10 dark:opacity-5"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-200 to-purple-200 rounded-full blur-3xl opacity-10 dark:opacity-5"
        ></div>
      </div>

      <!-- Main Card -->
      <div
        class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300"
      >
        <!-- Gradient Header -->
        <div
          class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white text-center"
        >
          <div
            class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
          >
            <span class="text-4xl">🔐</span>
          </div>
          <h1 class="text-3xl font-extrabold mb-2">Welcome Back!</h1>
          <p class="text-blue-100">Sign in to your FTracker account</p>
        </div>

        <!-- Form Section -->
        <form @submit.prevent="submit" class="p-8">
          <!-- Error Message -->
          <div
            v-if="error"
            class="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl"
          >
            <div class="flex items-start gap-3">
              <span class="text-lg">⚠️</span>
              <div>
                <p class="text-red-700 dark:text-red-200 font-semibold">
                  Login Failed
                </p>
                <p class="text-red-600 dark:text-red-300 text-sm mt-1">
                  {{ errorMessage }}
                </p>
              </div>
            </div>
          </div>

          <!-- Email Input -->
          <div class="mb-6">
            <label
              for="email"
              class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
              >📧 Email Address</label
            >
            <input
              v-model="formData.email"
              type="email"
              :disabled="isLoading"
              placeholder="you@example.com"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <!-- Password Input -->
          <div class="mb-8">
            <label
              for="password"
              class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
              >🔑 Password</label
            >
            <input
              v-model="formData.password"
              type="password"
              :disabled="isLoading"
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <!-- Sign In Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transform transition-all duration-300 mb-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
          >
            <span v-if="!isLoading">✨ Sign In</span>
            <span v-else class="flex items-center gap-2">
              <svg
                class="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          </button>

          <!-- Divider -->
          <div class="relative mb-6">
            <div class="absolute inset-0 flex items-center">
              <div
                class="w-full border-t-2 border-gray-200 dark:border-gray-600"
              ></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span
                class="px-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                >Or continue with</span
              >
            </div>
          </div>

          <!-- Google Sign In -->
          <div class="flex justify-center mb-6">
            <div :class="{ 'opacity-50 pointer-events-none': isLoading }">
              <GoogleSignInButton
                @success="handleLoginSuccess"
                @error="handleLoginError"
              ></GoogleSignInButton>
            </div>
          </div>
        </form>

        <!-- Footer -->
        <div class="px-8 pb-8 text-center">
          <p class="text-gray-600 dark:text-gray-400">
            Don't have an account?
            <NuxtLink
              to="/register"
              class="font-bold text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Create one now
            </NuxtLink>
          </p>
        </div>
      </div>

      <!-- Bottom Text -->
      <div class="text-center mt-6 text-gray-600 dark:text-gray-400 text-sm">
        <p>💡 Demo: Use any email with password</p>
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
