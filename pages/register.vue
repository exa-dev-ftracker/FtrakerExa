<script setup lang="ts">
import { GoogleSignInButton, type CredentialResponse } from "vue3-google-signin";

useHead({
  title: "FTraker - Register",
  meta: [
    { name: "description", content: "Create your FTraker account today." },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
});

const toast = useToast();
const router = useRouter();
const store = useDefaultStore();
const haveError = ref(false);
const isLoading = ref(false);
const isLoadingGoogle = ref(false);
const isPasswordMode = ref(true);

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

const handleGoogleSignUp = async (response: CredentialResponse) => {
  isLoadingGoogle.value = true;
  try {
    const { credential } = response;
    const res: any = await (useNuxtApp().$axios as any).post("/api/auth/google", { credential });
    const data = res.data || res;

    if (data.statusCode === 201 || data.statusCode === 200) {
      store.login(data.body.token);
      toast.add({ title: "Welcome! 🎉", description: "Account ready.", color: "green" });
      return router.push(data.statusCode === 201 ? "/setup-password" : "/dashboard");
    }
  } catch (err: any) {
    toast.add({ title: "Failed", description: err.message, color: "red" });
  } finally {
    isLoadingGoogle.value = false;
  }
};

const handleGoogleError = () => {
  toast.add({ title: "Failed", description: "Google Sign Up failed", color: "red" });
};

const handleSubmit = async () => {
  haveError.value = false;
  Object.keys(error).forEach(k => (error as any)[k] = "");

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
      const res: any = await (useNuxtApp().$axios as any).post("/api/users", formdata);
      if (res.data?.statusCode === 201 || res.statusCode === 201) {
        toast.add({ title: "Success! 🎉", description: "Account created.", color: "green" });
        return router.push("/login");
      }
    } catch (err: any) {
      toast.add({ title: "Error", description: err.data?.body?.message || "Registration failed", color: "red" });
    } finally {
      isLoading.value = false;
    }
  }
};
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#030712] flex items-center justify-center p-6 relative overflow-hidden">
    <UNotifications />

    <!-- Animated Background -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <Motion 
        :initial="{ x: 0, y: 0 }"
        :animate="{ 
          x: -50, 
          y: -30 
        }"
        :transition="{ 
          duration: 8, 
          repeat: Infinity, 
          repeatType: 'reverse', 
          ease: 'easeInOut' 
        }"
        class="blob-1 absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 dark:bg-purple-600/5 rounded-full blur-[100px]"
      ></Motion>
      <Motion 
        :initial="{ x: 0, y: 0 }"
        :animate="{ 
          x: 40, 
          y: 20 
        }"
        :transition="{ 
          duration: 10, 
          repeat: Infinity, 
          repeatType: 'reverse', 
          ease: 'easeInOut',
          delay: 1.0
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
        <div class="p-10 pb-0 text-center">
           <NuxtLink to="/" class="inline-flex items-center gap-3 mb-8 group">
              <div class="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <UIcon name="i-heroicons-wallet" class="w-6 h-6 text-white" />
              </div>
              <span class="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FTraker</span>
           </NuxtLink>
           <Motion 
              :initial="{ opacity: 0, y: 20 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ delay: 0.4 }"
              class="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight"
            >Create account</Motion>
        </div>

        <div class="p-10 space-y-8">
           <Motion 
              :initial="{ opacity: 0, y: 10 }"
              :animate="{ opacity: 1, y: 0 }"
              :transition="{ delay: 0.6 }"
              class="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl"
            >
              <button @click="isPasswordMode = true" :class="['flex-1 py-3 rounded-xl font-black text-sm transition-all', isPasswordMode ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500']">Email & Password</button>
              <button @click="isPasswordMode = false" :class="['flex-1 py-3 rounded-xl font-black text-sm transition-all', !isPasswordMode ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-500']">Google Account</button>
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
                       <label class="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1">Full Name</label>
                       <input v-model="formData.name" type="text" placeholder="John Doe" class="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium" />
                       <p v-if="error.name" class="text-[10px] font-bold text-rose-500 ml-1">{{ error.name }}</p>
                    </div>
                    <div class="space-y-2">
                       <label class="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1">Email</label>
                       <input v-model="formData.email" type="email" placeholder="john@gmail.com" class="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium" />
                       <p v-if="error.email" class="text-[10px] font-bold text-rose-500 ml-1">{{ error.email }}</p>
                    </div>
                 </Motion>

                 <Motion 
                    :initial="{ opacity: 0, y: 10 }"
                    :animate="{ opacity: 1, y: 0 }"
                    :transition="{ delay: 0.8 }"
                    class="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div class="space-y-2">
                       <label class="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1">Password</label>
                       <input v-model="formData.password" type="password" placeholder="••••••••" class="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium" />
                       <p v-if="error.password" class="text-[10px] font-bold text-rose-500 ml-1">{{ error.password }}</p>
                    </div>
                    <div class="space-y-2">
                       <label class="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest ml-1">Confirm</label>
                       <input v-model="formData.passwordConfirmation" type="password" placeholder="••••••••" class="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-white/5 rounded-2xl focus:border-blue-500 outline-none text-gray-900 dark:text-white font-medium" />
                       <p v-if="error.passwordConfirmation" class="text-[10px] font-bold text-rose-500 ml-1">{{ error.passwordConfirmation }}</p>
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
                  class="text-center space-y-6 py-4"
                >
                 <p class="text-gray-500 dark:text-gray-400 font-medium">Use your Google account for a 1-click registration.</p>
                 <div class="flex justify-center scale-125">
                    <GoogleSignInButton @success="handleGoogleSignUp" @error="handleGoogleError" />
                 </div>
              </Motion>
           </template>
        </div>

         <Motion 
           :initial="{ opacity: 0 }"
           :animate="{ opacity: 1 }"
           :transition="{ delay: 1.1 }"
           class="p-10 pt-0 text-center"
         >
           <p class="text-gray-500 dark:text-gray-400 font-bold">
              Already have an account? 
              <NuxtLink to="/login" class="text-blue-600 hover:text-purple-600 transition-colors">Sign in here</NuxtLink>
           </p>
        </Motion>
      </Motion>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
body { font-family: 'Plus Jakarta Sans', sans-serif; }
</style>
