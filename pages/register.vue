<script setup lang="ts">
import {
    GoogleSignInButton,
    type CredentialResponse,
} from "vue3-google-signin";

useHead({
  title: 'FTraker - Register',
  meta: [
    { name: 'description', content: 'View your financial summary, including income and expenses.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})

const haveError = ref(false)
const toast = useToast()
const router = useRouter()
const store = useDefaultStore()
const isPasswordMode = ref(true)

const error = reactive<{
    name?: string,
    email?: string,
    password?: string,
    passwordConfirmation?: string
}>({})

const formData = reactive({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: ''
})

// Handle Google Sign Up
const handleGoogleSignUp = (response: CredentialResponse) => {
    const { credential } = response;
    $fetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential })
    }).then((res: any) => {
        if (res.statusCode === 201) {
            // New user from Google - redirect to set password
            store.login(res.body.token)
            toast.add({
                title: 'Welcome! 🎉',
                description: "Account created successfully",
            })
            router.push('/setup-password')
        } else if (res.statusCode === 200) {
            // Existing user
            store.login(res.body.token)
            router.push('/transactions')
        }
    }).catch((err: any) => {
        console.error(err)
        toast.add({
            title: 'Sign Up Failed',
            description: "An error occurred while trying to sign up with Google",
        })
    })
}

const handleGoogleError = () => {
    toast.add({
        title: 'Sign Up Failed',
        description: "An error occurred while trying to sign up with Google",
    })
}


const handleSubmit = () => {
    haveError.value = false

    if (formData.password !== formData.passwordConfirmation) {
        error.passwordConfirmation = 'Password confirmation does not match'
        haveError.value = true
    } else {
        error.passwordConfirmation = ''
    }

    if (formData.password.length < 6) {
        error.password = 'Password must be at least 6 characters'
        error.passwordConfirmation = 'Password must be at least 6 characters'
        haveError.value = true
    } else {
        error.password = ''
    }
    if (formData.name.length < 3) {
        error.name = 'Name must be at least 3 characters'
        haveError.value = true
    } else {
        error.name = ''
    }

    if (!testGmail(formData.email)) {
        error.email = 'Email must be a valid Gmail address'
        haveError.value = true
    } else {
        error.email = ''
    }

    if (!haveError.value) {
        const { passwordConfirmation, ...formdata } = formData
        $fetch('/api/users', {
            method: 'POST',
            body: JSON.stringify(formdata)
        }).then((res: any) => {
            if (res.statusCode === 201) {
                toast.add({
                    title: 'Account Created! 🎉',
                    description: 'Redirecting to login...'
                })
                router.push('/login')
            } else if (res.statusCode === 409) {
              toast.add({
                    title: 'Email already exists',
                    description: 'Please use a different email address'
                })
            } else {
                toast.add({
                    title: 'Error',
                    description: 'An error occurred while trying to register'
                })
            }
        }).catch((err) => {
          if (err.statusCode === 409) {
                toast.add({
                    title: 'Email already exists',
                    description: 'Please use a different email address'
                })
            } else if (err.statusCode === 400) {
                toast.add({
                    title: 'Bad Request',
                    description: 'Please fill all the fields correctly'
                })
            }else {
            toast.add({
                title: 'Error',
                description: 'An error occurred while trying to register'
            })
          }
        })
    }
}

</script>

<template>
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex justify-center items-center p-4 animate-fade-in">
      <UNotifications />
      
      <div class="w-full max-w-2xl">
        <!-- Animated Background Shapes -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-10 dark:opacity-5"></div>
          <div class="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-200 to-purple-200 rounded-full blur-3xl opacity-10 dark:opacity-5"></div>
        </div>

        <!-- Main Card -->
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300">
          <!-- Gradient Header -->
          <div class="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 text-white text-center">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <span class="text-4xl">🚀</span>
            </div>
            <h1 class="text-3xl font-extrabold mb-2">Join FTracker!</h1>
            <p class="text-purple-100">Create your account and start tracking today</p>
          </div>

          <!-- Form Section -->
          <form @submit.prevent="handleSubmit" class="p-8">
            <!-- Google Sign Up Option -->
            <div class="mb-6">
              <div class="flex items-center gap-4 mb-6">
                <div class="flex-1 border-t-2 border-gray-200 dark:border-gray-600"></div>
                <span class="text-sm text-gray-600 dark:text-gray-400 font-medium px-2">Sign Up With</span>
                <div class="flex-1 border-t-2 border-gray-200 dark:border-gray-600"></div>
              </div>
              
              <div class="flex gap-4 mb-6">
                <button
                  type="button"
                  @click="isPasswordMode = true"
                  class="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300"
                  :class="isPasswordMode ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600'"
                >
                  📧 Email & Password
                </button>
                <button
                  type="button"
                  @click="isPasswordMode = false"
                  class="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                  :class="!isPasswordMode ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600'"
                >
                  <span>🔐 Google</span>
                </button>
              </div>
            </div>

            <!-- Email & Password Mode -->
            <template v-if="isPasswordMode">
            <!-- Name & Email Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label for="name" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">👤 Full Name</label>
                <input 
                  v-model="formData.name" 
                  id="name" 
                  type="text"
                  placeholder="John Doe"
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 outline-none"
                />
                <p v-if="error?.name" class="text-red-500 dark:text-red-400 text-sm mt-2">{{ error?.name }}</p>
              </div>

              <div>
                <label for="email" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📧 Email Address</label>
                <input 
                  v-model="formData.email" 
                  id="email" 
                  type="email"
                  placeholder="you@gmail.com"
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 outline-none"
                />
                <p v-if="error?.email" class="text-red-500 dark:text-red-400 text-sm mt-2">{{ error?.email }}</p>
              </div>
            </div>

            <!-- Password & Confirm Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label for="password" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🔑 Password</label>
                <input 
                  v-model="formData.password" 
                  id="password" 
                  type="password"
                  placeholder="••••••••"
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 outline-none"
                />
                <p v-if="error?.password" class="text-red-500 dark:text-red-400 text-sm mt-2">{{ error?.password }}</p>
              </div>

              <div>
                <label for="passwordConfirmation" class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">✅ Confirm Password</label>
                <input 
                  v-model="formData.passwordConfirmation" 
                  id="passwordConfirmation" 
                  type="password"
                  placeholder="••••••••"
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 outline-none"
                />
                <p v-if="error?.passwordConfirmation" class="text-red-500 dark:text-red-400 text-sm mt-2">{{ error?.passwordConfirmation }}</p>
              </div>
            </div>

            <!-- Create Account Button -->
            <button
              type="submit"
              class="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105 transform transition-all duration-300"
            >
              🎉 Create Account
            </button>
            </template>

            <!-- Google Sign Up Mode -->
            <template v-else>
              <div class="text-center mb-6">
                <p class="text-gray-700 dark:text-gray-300 mb-4 font-medium">Sign up with your Google account</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">You can set a password later if you prefer</p>
              </div>

              <div class="flex justify-center mb-6">
                <GoogleSignInButton @success="handleGoogleSignUp" @error="handleGoogleError"></GoogleSignInButton>
              </div>

              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p class="text-sm text-blue-700 dark:text-blue-300">
                  ✨ <strong>Quick & Easy:</strong> Sign up instantly with your Google account, then add a password anytime!
                </p>
              </div>
            </template>
          </form>

          <!-- Footer -->
          <div class="px-8 pb-8 text-center">
            <p class="text-gray-600 dark:text-gray-400">
              <NuxtLink
                to="/login" 
                class="font-bold text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
              >
                Sign in to your account
              </NuxtLink>
            </p>
          </div>
        </div>

        <!-- Bottom Text -->
        <div class="text-center mt-6 text-gray-600 dark:text-gray-400 text-sm">
          <p>💡 No credit card required • Start free today</p>
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