<script setup lang="ts">
import {
    GoogleSignInButton,
    type CredentialResponse,
} from "vue3-google-signin";

useHead({
  title: 'FTraker - Login',
  meta: [
    { name: 'description', content: 'View your financial summary, including income and expenses.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})

const toast = useToast()
const router = useRouter()
const formData = reactive({
    email: '',
    password: '',
})
const store = useDefaultStore()
// handle success event
const handleLoginSuccess = (response: CredentialResponse) => {
    const { credential } = response;
    $fetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential })
    }).then((res: any) => {
        if (res.statusCode === 201) {
            store.login(res.body.token)
            return router.push('/')
        } else if (res.statusCode === 404) {
            return alert("User not found")
        } else {
            return alert("An error occurred while trying to sign in")
        }
    }).catch((err: any) => {
        console.error(err)
       if (err.statusCode === 404) {
            toast.add(
                {
                    title: 'User not found',
                    description: "Please register to continue",
                }
            )
            router.push('/register')
        } else {
            handleLoginError()
        }
    })
}



// handle an error event
const handleLoginError = () => {
    toast.add(
        {
          title : 'Login Failed',
           description : "An error occurred while trying to sign in",
        }
    )
};

const error = ref(false)

const submit = async () => {
    try {
        if (!formData.email || !formData.password) {
            error.value = true
            return
        }
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
            }),
        })
        if (res.ok) {
            const data = await res.json()
            const jwt = useCookie('jwt')
            jwt.value = data.body.token
            store.login(data.body.token)
            return router.push('/')
        } else {
            error.value = true
        }
    } catch (error) {
        console.error(error)
    }
}
</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex justify-center items-center p-4 animate-fade-in">
      <UNotifications />
      
      <div class="w-full max-w-md">
        <!-- Animated Background Shapes -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-10 dark:opacity-5"></div>
          <div class="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-200 to-purple-200 rounded-full blur-3xl opacity-10 dark:opacity-5"></div>
        </div>

        <!-- Main Card -->
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <!-- Gradient Header -->
          <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white text-center">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <span class="text-4xl">🔐</span>
            </div>
            <h1 class="text-3xl font-extrabold mb-2">Welcome Back!</h1>
            <p class="text-blue-100">Sign in to your FTracker account</p>
          </div>

          <!-- Form Section -->
          <form @submit.prevent="submit" class="p-8">
            <!-- Error Message -->
            <div v-if="error" class="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
              <p class="text-red-700 dark:text-red-200 font-medium">❌ Email or password is incorrect</p>
            </div>

            <!-- Email Input -->
            <div class="mb-6">
              <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📧 Email Address</label>
              <input 
                v-model="formData.email" 
                type="email"
                placeholder="you@example.com"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 outline-none" 
              />
            </div>

            <!-- Password Input -->
            <div class="mb-8">
              <label for="password" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🔑 Password</label>
              <input 
                v-model="formData.password" 
                type="password"
                placeholder="••••••••"
                class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 outline-none" 
              />
            </div>

            <!-- Sign In Button -->
            <button
              type="submit"
              class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 hover:scale-105 transform transition-all duration-300 mb-4"
            >
              ✨ Sign In
            </button>

            <!-- Divider -->
            <div class="relative mb-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t-2 border-gray-200 dark:border-gray-600"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <!-- Google Sign In -->
            <div class="flex justify-center mb-6">
              <GoogleSignInButton @success="handleLoginSuccess" @error="handleLoginError"></GoogleSignInButton>
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
