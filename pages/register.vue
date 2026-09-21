<script setup lang="ts">
useHead({
  title: "FTraker - Register",
  meta: [
    { name: "description", content: "Create your FTraker account today." },
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
const { signInWithGoogle, isGoogleLoading } = useGoogleSignIn();
const haveError = ref(false);
const isLoading = ref(false);
const isPasswordMode = ref(true);
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

const error = reactive<{
  name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
}>({});

const formData = reactive({
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
});

const handleSubmit = async () => {
  haveError.value = false;
  Object.keys(error).forEach((k) => ((error as any)[k] = ""));

  if (formData.password !== formData.passwordConfirmation) {
    error.passwordConfirmation = "Passwords do not match";
    haveError.value = true;
  }
  if (formData.password.length < 6) {
    error.password = "Min 6 characters";
    haveError.value = true;
  }
  if (formData.name.length < 3) {
    error.name = "Name too short";
    haveError.value = true;
  }
  if (!formData.email.includes("@")) {
    error.email = "Invalid email";
    haveError.value = true;
  }

  if (!haveError.value) {
    isLoading.value = true;
    try {
      const { passwordConfirmation, ...formdata } = formData;
      const res: any = await (useNuxtApp().$axios as any).post(
        "/api/users",
        formdata,
      );
      if (res.data?.statusCode === 201 || res.statusCode === 201) {
        toast.add({
          title: "Success! 🎉",
          description: "Account created.",
          color: "green",
        });
        return router.push("/login");
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description: err.data?.body?.message || "Registration failed",
        color: "red",
      });
    } finally {
      isLoading.value = false;
    }
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
          x: -50,
          y: -30,
        }"
        :transition="{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }"
        class="blob-1 absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 dark:bg-purple-600/5 rounded-full blur-[100px]"
      ></Motion>
      <Motion
        :initial="{ x: 0, y: 0 }"
        :animate="{
          x: 40,
          y: 20,
        }"
        :transition="{
          duration: 10,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: 1.0,
        }"
        class="blob-2 absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[100px]"
      ></Motion>
    </div>

    <div class="w-full max-w-[640px] relative z-10">
      <Motion
        :initial="{ opacity: 0, y: 60 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 1.0, ease: 'easeOut' }"
        class="reg-card bg-white dark:bg-gray-900/50 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <!-- Brand Header -->
        <div class="p-6 sm:p-10 pb-0 text-center">
          <NuxtLink to="/" class="inline-flex items-center gap-3 mb-8 group">
            <div
              class="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
            >
              <UIcon name="i-heroicons-wallet" class="w-6 h-6 text-white" />
            </div>
            <span
              class="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >FTraker</span
            >
          </NuxtLink>
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.4 }"
            class="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight"
            >Create account</Motion
          >
        </div>

        <div class="p-6 sm:p-10 space-y-6 sm:space-y-8">
          <Motion
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ delay: 0.6 }"
            class="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl"
          >
            <button
              @click="isPasswordMode = true"
              :class="[
                'flex-1 py-3 rounded-xl font-black text-sm transition-all',
                isPasswordMode
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                  : 'text-gray-500',
              ]"
            >
              Email & Password
            </button>
            <button
              @click="isPasswordMode = false"
              :class="[
                'flex-1 py-3 rounded-xl font-black text-sm transition-all',
                !isPasswordMode
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                  : 'text-gray-500',
              ]"
            >
              Google / Apple
            </button>
          </Motion>

          <template v-if="isPasswordMode">
            <form @submit.prevent="handleSubmit" class="space-y-6">
              <Motion
                :initial="{ opacity: 0, y: 10 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ delay: 0.7 }"
                class="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div class="space-y-2">
                  <label
                    class="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1"
                    >Full Name</label
                  >
                  <input
                    v-model="formData.name"
                    type="text"
                    placeholder="John Doe"
                    class="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium"
                  />
                  <p
                    v-if="error.name"
                    class="text-[10px] font-bold text-rose-500 ml-1"
                  >
                    {{ error.name }}
                  </p>
                </div>
                <div class="space-y-2">
                  <label
                    class="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1"
                    >Email</label
                  >
                  <input
                    v-model="formData.email"
                    type="email"
                    placeholder="john@gmail.com"
                    class="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium"
                  />
                  <p
                    v-if="error.email"
                    class="text-[10px] font-bold text-rose-500 ml-1"
                  >
                    {{ error.email }}
                  </p>
                </div>
              </Motion>

              <Motion
                :initial="{ opacity: 0, y: 10 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ delay: 0.8 }"
                class="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div class="space-y-2">
                  <label
                    class="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1"
                    >Password</label
                  >
                  <input
                    v-model="formData.password"
                    type="password"
                    placeholder="••••••••"
                    class="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium"
                  />
                  <p
                    v-if="error.password"
                    class="text-[10px] font-bold text-rose-500 ml-1"
                  >
                    {{ error.password }}
                  </p>
                </div>
                <div class="space-y-2">
                  <label
                    class="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1"
                    >Confirm</label
                  >
                  <input
                    v-model="formData.passwordConfirmation"
                    type="password"
                    placeholder="••••••••"
                    class="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium"
                  />
                  <p
                    v-if="error.passwordConfirmation"
                    class="text-[10px] font-bold text-rose-500 ml-1"
                  >
                    {{ error.passwordConfirmation }}
                  </p>
                </div>
              </Motion>

              <Motion
                :initial="{ opacity: 0, y: 10 }"
                :animate="{ opacity: 1, y: 0 }"
                :transition="{ delay: 0.9 }"
              >
                <UButton
                  type="submit"
                  block
                  size="xl"
                  color="primary"
                  :loading="isLoading"
                  class="rounded-2xl py-4 font-black text-lg shadow-xl shadow-blue-500/25"
                >
                  Create Account
                </UButton>
              </Motion>
            </form>
          </template>

          <template v-else>
            <Motion
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :transition="{ delay: 1.0 }"
              class="text-center space-y-6 py-4 max-w-sm mx-auto"
            >
              <p class="text-gray-500 dark:text-gray-400 font-medium text-sm">
                Use your Google or Apple account for a 1-click registration.
              </p>
              
              <div class="space-y-4">
                <button
                  type="button"
                  @click="() => signInWithGoogle(true)"
                  :disabled="isGoogleLoading || isAppleLoading"
                  class="w-full py-3.5 px-4 bg-white hover:bg-gray-50 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <UIcon
                    v-if="isGoogleLoading"
                    name="i-heroicons-arrow-path"
                    class="w-5 h-5 animate-spin text-gray-500"
                  />
                  <svg v-else class="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{{ isGoogleLoading ? "Connecting to Google..." : "Sign up with Google" }}</span>
                </button>

                <div class="relative py-2">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-200 dark:border-white/5"></div>
                  </div>
                  <div class="relative flex justify-center text-[10px] uppercase font-black text-gray-400">
                    <span class="bg-white dark:bg-[#0d1117] px-3">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  @click="signInWithApple"
                  :disabled="isAppleLoading || isGoogleLoading"
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
                  <span>{{ isAppleLoading ? "Connecting to Apple..." : "Sign up with Apple" }}</span>
                </button>
              </div>
            </Motion>
          </template>
        </div>

        <Motion
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :transition="{ delay: 1.1 }"
          class="p-6 sm:p-10 pt-0 text-center"
        >
          <p class="text-gray-500 dark:text-gray-400 font-bold">
            Already have an account?
            <NuxtLink
              to="/login"
              class="text-blue-600 hover:text-purple-600 transition-colors"
              >Sign in here</NuxtLink
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
