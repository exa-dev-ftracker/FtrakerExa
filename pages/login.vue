<script setup lang="ts">
import {
  GoogleSignInButton,
  type CredentialResponse,
} from "vue3-google-signin";

useHead({
  title: "FTraker - Login",
  meta: [
    { name: "description", content: "Sign in to your FTraker account." },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});

definePageMeta({
  layout: false,
});

const toast = useToast();
const router = useRouter();
const store = useDefaultStore();
const { signInWithApple, isAppleLoading } = useAppleSignIn();
const isLoading = ref(false);
const error = ref(false);
const errorMessage = ref("");
const accessToken = useCookie("jwt");

if (accessToken.value) {
  navigateTo("/dashboard");
} else {
  const { restoreSession } = useAuthSession();
  restoreSession().then((restored) => {
    if (restored) {
      navigateTo("/dashboard");
    }
  });
}

const formData = reactive({
  email: "",
  password: "",
});

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
      if (data.body.user) store.setUser(data.body.user);
      toast.add({
        title: "Success",
        description: "Logged in successfully!",
        color: "green",
      });
      return router.push("/dashboard");
    } else {
      throw new Error(data.body?.message || "Authentication failed");
    }
  } catch (err: any) {
    toast.add({
      title: "Login Failed",
      description: err.message,
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const handleLoginError = () => {
  toast.add({
    title: "Login Failed",
    description: "Google Sign In failed",
    color: "red",
  });
};

const submit = async () => {
  if (!formData.email || !formData.password) {
    error.value = true;
    errorMessage.value = "Email and password are required";
    return;
  }

  isLoading.value = true;
  error.value = false;

  try {
    const res = await (useNuxtApp().$axios as any).post(
      "/api/auth/login",
      formData,
    );
    const data = res.data || res;

    if (data.statusCode === 200) {
      store.login(data.body.token);
      if (data.body.user) store.setUser(data.body.user);
      toast.add({
        title: "Welcome back!",
        description: "Successfully logged in.",
        color: "green",
      });
      return router.push("/dashboard");
    } else {
      error.value = true;
      errorMessage.value = data.body?.message || "Invalid credentials";
    }
  } catch (err: any) {
    error.value = true;
    errorMessage.value = "Something went wrong. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden"
  >
    <UNotifications />

    <!-- Animated Background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <Motion
        :initial="{ x: 0, y: 0 }"
        :animate="{
          x: 50,
          y: 30,
        }"
        :transition="{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }"
        class="blob-1 absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[100px]"
      ></Motion>
      <Motion
        :initial="{ x: 0, y: 0 }"
        :animate="{
          x: -40,
          y: -20,
        }"
        :transition="{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: 1.0,
        }"
        class="blob-2 absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 dark:bg-purple-600/5 rounded-full blur-[100px]"
      ></Motion>
    </div>

    <div class="w-full max-w-[480px] relative z-10">
      <Motion
        :initial="{ opacity: 0, y: 60 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 1.0, ease: 'easeOut' }"
        class="login-card bg-white dark:bg-gray-900/50 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <!-- Brand Header -->
        <div class="p-6 sm:p-10 pb-0 text-center">
          <NuxtLink to="/" class="inline-flex items-center gap-3 mb-8 group">
            <div
              class="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
            >
              <UIcon name="i-heroicons-wallet" class="w-7 h-7 text-white" />
            </div>
            <span
              class="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >FTraker</span
            >
          </NuxtLink>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.4 }"
            class="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight"
            >Welcome back!</Motion
          >
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.5 }"
            class="text-gray-500 dark:text-gray-400 font-medium"
            >Continue your financial journey today.</Motion
          >
        </div>

        <div class="p-6 sm:p-10 space-y-6">
          <!-- Error Alert -->
          <Motion
            v-if="error"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.55 }"
            class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-3"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-5 h-5 text-rose-500 flex-shrink-0"
            />
            <p class="text-sm font-bold text-rose-600 dark:text-rose-400">
              {{ errorMessage }}
            </p>
          </Motion>

          <form @submit.prevent="submit" class="space-y-5">
            <Motion
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ delay: 0.6 }"
              class="space-y-2"
            >
              <label
                class="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1"
                >Email Address</label
              >
              <input
                v-model="formData.email"
                type="email"
                placeholder="name@example.com"
                class="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 dark:text-white font-medium"
              />
            </Motion>

            <Motion
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ delay: 0.7 }"
              class="space-y-2"
            >
              <div class="flex justify-between items-center ml-1">
                <label
                  class="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest"
                  >Password</label
                >
                <a
                  href="#"
                  class="text-xs font-bold text-blue-600 hover:text-purple-600 transition-colors"
                  >Forgot Password?</a
                >
              </div>
              <input
                v-model="formData.password"
                type="password"
                placeholder="••••••••"
                class="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 dark:text-white font-medium"
              />
            </Motion>

            <Motion
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ delay: 0.8 }"
            >
              <UButton
                type="submit"
                block
                size="xl"
                color="primary"
                :loading="isLoading"
                class="rounded-2xl py-4 font-black text-lg shadow-xl shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Sign In
              </UButton>
            </Motion>
          </form>

          <Motion
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :transition="{ delay: 0.9 }"
            class="relative py-4"
          >
            <div class="absolute inset-0 flex items-center">
              <div
                class="w-full border-t border-gray-200 dark:border-white/5"
              ></div>
            </div>
            <div
              class="relative flex justify-center text-xs uppercase font-black text-gray-400"
            >
              <span class="bg-white dark:bg-[#0d1117] px-4"
                >Or continue with</span
              >
            </div>
          </Motion>

          <Motion
            :initial="{ opacity: 0, scale: 0.95 }"
            :animate="{ opacity: 1, scale: 1 }"
            :transition="{ delay: 1.0 }"
            class="space-y-3"
          >
            <div class="flex justify-center">
              <GoogleSignInButton
                @success="handleLoginSuccess"
                @error="handleLoginError"
              />
            </div>

            <button
              type="button"
              @click="signInWithApple"
              :disabled="isAppleLoading || isLoading"
              class="w-full py-3.5 px-4 bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <UIcon
                v-if="isAppleLoading"
                name="i-heroicons-arrow-path"
                class="w-5 h-5 animate-spin"
              />
              <svg
                v-else
                class="w-5 h-5 fill-current"
                viewBox="0 0 170 170"
              >
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.66-7.85-11.89-14.43-6.24-9.8-11.01-20.9-14.3-33.3-3.29-12.4-4.94-23.7-4.94-33.9 0-14.65 3.82-26.68 11.45-36.08 7.64-9.4 17.02-14.23 28.16-14.5 5.37.13 11.2 1.44 17.5 3.93 6.3 2.5 10.45 3.82 12.45 3.95 2.57-.27 7.02-1.74 13.35-4.41 6.33-2.67 11.96-3.87 16.89-3.6 12.55.8 22.86 5.57 30.93 14.3-10.98 6.64-16.32 15.7-16.02 27.18.3 9.4 3.95 17.3 10.95 23.7 4.1 3.73 8.84 6.38 14.22 7.95-2.3 6.8-5.06 13.6-8.28 20.4zM119.22 33.64c0-7.3 2.66-14.22 7.98-20.76 5.32-6.54 11.83-10.87 19.53-13-1.07 7.18-3.92 13.9-8.55 20.16-4.63 6.26-10.94 10.8-18.96 13.6z"/>
              </svg>
              <span>{{ isAppleLoading ? "Connecting to Apple..." : "Sign in with Apple" }}</span>
            </button>
          </Motion>
        </div>

        <Motion
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ delay: 1.1 }"
          class="p-6 sm:p-10 pt-0 text-center"
        >
          <p class="text-gray-500 dark:text-gray-400 font-bold">
            New here?
            <NuxtLink
              to="/register"
              class="text-blue-600 hover:text-purple-600 transition-colors"
              >Create an account</NuxtLink
            >
          </p>
        </Motion>
      </Motion>
    </div>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

body {
  font-family: "Plus Jakarta Sans", sans-serif;
}
</style>
