<script setup lang="ts">
definePageMeta({
})

useHead({
  title: 'Settings - FTracker',
  meta: [
    { name: 'description', content: 'Manage your account settings and preferences.' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})

const router = useRouter()
const toast = useToast()
const activeTab = ref<'account'>('account')

const tabs = [
  // {
  //   label: 'WhatsApp Integration',
  //   icon: 'i-material-symbols-whatsapp',
  //   slot: 'whatsapp',
  // },
  {
    label: 'Account',
    icon: 'i-material-symbols-account-circle-outline-rounded',
    slot: 'account',
  },
]

// Load user account data
onMounted(async () => {
  try {
    const jwt = useCookie('jwt')
    const response = await $fetch('/api/user/settings', {
      headers: {
        'Authorization': `Bearer ${jwt.value}`,
        'Content-Type': 'application/json'
      }
    })

    if (response?.body && 'email' in response.body) {
      const userEmail = document.getElementById('userEmail')
      
      if (userEmail) {
        userEmail.textContent = response.body.email || 'Not available'
      }
    }
  } catch (error: any) {
    console.debug('Failed to load user data:', error?.data?.body?.message || error.message)
  }
})
</script>

<template>
    <section class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-4xl font-extrabold text-gray-900 dark:text-white">Settings</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Manage your account and preferences</p>
      </div>
      <UButton
        to="/"
        icon="i-material-symbols-arrow-back-rounded"
        color="gray"
        variant="ghost"
        label="Back"
      />
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar Navigation -->
      <aside class="lg:col-span-1">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-20">
          <nav class="space-y-2">
            <button
              v-for="tab in tabs"
              :key="tab.slot"
              @click="activeTab = tab.slot as any"
              class="w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-2"
              :class="[
                activeTab === tab.slot
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <UIcon :name="tab.icon" class="w-5 h-5" />
              {{ tab.label }}
            </button>
          </nav>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="lg:col-span-3">
        <!-- Account Settings Section -->
        <section class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h2>
          <div class="space-y-6">
            <!-- Profile Information -->
            <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
              <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600 dark:text-gray-400">Email:</span>
                    <span class="font-medium text-gray-900 dark:text-white" id="userEmail">Loading...</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security Settings -->
            <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security</h3>
              <UButton
                label="Change Password"
                icon="i-material-symbols-lock-outline"
                color="blue"
                @click="toast.add({ title: 'Coming Soon', description: 'Password change feature coming soon', color: 'blue' })"
              />
            </div>

            <!-- Notification Preferences -->
            <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
              <div class="space-y-4">
                <label class="flex items-center cursor-pointer">
                  <input type="checkbox" class="w-4 h-4 rounded" checked disabled />
                  <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">Email notifications for transactions</span>
                </label>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-red-900 dark:text-red-200 mb-3">Danger Zone</h3>
              <UButton
                label="Delete Account"
                icon="i-material-symbols-delete-outline"
                color="red"
                @click="toast.add({ title: 'Coming Soon', description: 'Account deletion feature coming soon', color: 'blue' })"
              />
            </div>
          </div>
        </section>
      </main>
    </section>
</template>

<style scoped>
/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

section {
  animation: slideIn 0.3s ease-out;
}
</style>

