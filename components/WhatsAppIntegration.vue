<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const toast = useToast()

const phoneNumber = ref('')
const chatbotEnabled = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)

const formattedPhoneNumber = computed(() => {
  if (!phoneNumber.value) return ''

  // Remove all non-numeric characters
  const cleaned = phoneNumber.value.replace(/\D/g, '')

  // Format as: +62 812-3456-789
  if (cleaned.length >= 10) {
    const countryCode = cleaned.startsWith('62') ? cleaned.slice(0, 2) : '62'
    const mainNumber = cleaned.startsWith('62') ? cleaned.slice(2) : cleaned

    if (mainNumber.length >= 3) {
      const areaCode = mainNumber.slice(0, 3)
      const firstPart = mainNumber.slice(3, 7)
      const secondPart = mainNumber.slice(7)
      return `+${countryCode} ${areaCode}-${firstPart}${secondPart ? '-' + secondPart : ''}`
    }
  }

  return phoneNumber.value
})

const statusMessage = computed(() => {
  if (chatbotEnabled.value) {
    return '✅ Send your transaction messages to our WhatsApp bot to automatically record your expenses.'
  } else {
    return '⚠️ WhatsApp chatbot is currently disabled. Messages will not be processed.'
  }
})

// Load user's current settings
onMounted(async () => {
  try {
    isLoading.value = true
    const jwt = useCookie('jwt')

    // Fetch current user WhatsApp settings
    const settings = await $fetch('/api/user/settings', {
      headers: {
        'Authorization': `Bearer ${jwt.value}`,
        'Content-Type': 'application/json'
      }
    })

    if (settings?.body) {
      phoneNumber.value = settings.body.phone_number || ''
      chatbotEnabled.value = settings.body.chatbot_enabled || false
    }
  } catch (error: any) {
    // Settings not found or error - that's okay, user can set them
    console.debug('WhatsApp settings not loaded:', error?.data?.body?.message || error.message)
  } finally {
    isLoading.value = false
  }
})

// Save phone number
const savePhoneNumber = async () => {
  try {
    if (!phoneNumber.value.trim()) {
      toast.add({
        title: 'Validation Error',
        description: 'Please enter a phone number',
        color: 'red'
      })
      return
    }

    isSaving.value = true
    const jwt = useCookie('jwt')

    const response = await $fetch('/api/user/phone', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt.value}`,
        'Content-Type': 'application/json'
      },
      body: {
        phone_number: phoneNumber.value
      }
    })

    toast.add({
      title: 'Success',
      description: 'Phone number saved successfully',
      color: 'green'
    })
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.data?.body?.message || 'Failed to save phone number',
      color: 'red'
    })
  } finally {
    isSaving.value = false
  }
}

// Toggle chatbot
const toggleChatbot = async () => {
  try {
    if (!phoneNumber.value.trim()) {
      toast.add({
        title: 'Info',
        description: 'Please register a phone number first',
        color: 'blue'
      })
      return
    }

    // Toggle value optimistically
    const newValue = !chatbotEnabled.value
    chatbotEnabled.value = newValue
    
    isSaving.value = true
    const jwt = useCookie('jwt')

    const response = await $fetch('/api/user/chatbot', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${jwt.value}`,
        'Content-Type': 'application/json'
      },
      body: {
        chatbot_enabled: newValue
      }
    })

    const status = newValue ? 'enabled' : 'disabled'
    toast.add({
      title: 'Success',
      description: `WhatsApp chatbot ${status}`,
      color: 'green'
    })
  } catch (error: any) {
    chatbotEnabled.value = !chatbotEnabled.value
    toast.add({
      title: 'Error',
      description: error?.data?.body?.message || 'Failed to update chatbot status',
      color: 'red'
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-2xl">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        WhatsApp Integration
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Connect your WhatsApp number and enable chatbot automation to record expenses automatically.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <!-- Settings Form -->
    <div v-else class="space-y-8">
      <!-- Phone Number Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <label class="block text-sm font-medium text-gray-900 dark:text-white mb-4">
          WhatsApp Phone Number
        </label>

        <div class="space-y-2">
          <input
            v-model="phoneNumber"
            type="text"
            placeholder="Enter your phone number (e.g., +62 812-3456-789 or 628123456789)"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="isSaving"
          />

          <p v-if="phoneNumber" class="text-sm text-gray-600 dark:text-gray-400">
            Formatted: <span class="font-mono font-semibold">{{ formattedPhoneNumber }}</span>
          </p>

          <p class="text-xs text-gray-500 dark:text-gray-400">
            💡 Tip: Enter your WhatsApp number with country code (62 for Indonesia).
            It will be normalized to: 628123456789
          </p>
        </div>

        <button
          @click="savePhoneNumber"
          :disabled="isSaving || !phoneNumber"
          class="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
        >
          {{ isSaving ? 'Saving...' : 'Save Phone Number' }}
        </button>
      </div>

      <!-- Chatbot Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Enable WhatsApp Chatbot
            </label>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Automatically process transaction messages from WhatsApp
            </p>
          </div>

          <!-- Toggle Switch -->
          <button
            @click="toggleChatbot"
            :disabled="isSaving || !phoneNumber"
            class="relative inline-flex h-8 w-14 items-center rounded-full transition"
            :class="chatbotEnabled ? 'bg-green-600' : 'bg-gray-300'"
            role="switch"
            :aria-checked="chatbotEnabled"
          >
            <span
              class="inline-block h-6 w-6 transform rounded-full bg-white transition"
              :class="chatbotEnabled ? 'translate-x-7' : 'translate-x-1'"
            />
          </button>
        </div>

        <!-- Status Message -->
        <div
          class="mt-4 p-4 rounded-lg"
          :class="chatbotEnabled
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'"
        >
          <p
            class="text-sm font-medium"
            :class="chatbotEnabled
              ? 'text-green-800 dark:text-green-200'
              : 'text-yellow-800 dark:text-yellow-200'"
          >
            {{ statusMessage }}
          </p>
        </div>
      </div>

      <!-- How to Use Section -->
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-6 border border-blue-200 dark:border-blue-800">
        <h3 class="font-semibold text-gray-900 dark:text-white mb-4">
          How to Use
        </h3>

        <div class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div class="flex gap-3">
            <span class="font-bold text-blue-600 dark:text-blue-400">1.</span>
            <span>Register your WhatsApp number and enable the chatbot</span>
          </div>

          <div class="flex gap-3">
            <span class="font-bold text-blue-600 dark:text-blue-400">2.</span>
            <span>Send a message to our WhatsApp bot in one of these formats:</span>
          </div>

          <div class="ml-8 space-y-2 font-mono text-xs">
            <div class="text-gray-600 dark:text-gray-400">
              <span class="text-green-600 dark:text-green-400">expense</span> 50000 coffee
            </div>
            <div class="text-gray-600 dark:text-gray-400">
              <span class="text-green-600 dark:text-green-400">income</span> 1000000 salary
            </div>
            <div class="text-gray-600 dark:text-gray-400">
              <span class="text-green-600 dark:text-green-400">e</span> 25000 lunch
            </div>
          </div>

          <div class="flex gap-3">
            <span class="font-bold text-blue-600 dark:text-blue-400">3.</span>
            <span>Your transaction will be automatically recorded and added to your tracker</span>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-6 border border-red-200 dark:border-red-800">
        <h3 class="font-semibold text-red-900 dark:text-red-200 mb-2">
          Privacy & Security
        </h3>
        <ul class="text-sm text-red-800 dark:text-red-300 space-y-1 list-disc list-inside">
          <li>Your phone number is encrypted and stored securely</li>
          <li>Only messages from your registered number are processed</li>
          <li>You can disable the chatbot at any time</li>
          <li>Your transaction data remains private</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Any additional scoped styles can go here */
</style>

