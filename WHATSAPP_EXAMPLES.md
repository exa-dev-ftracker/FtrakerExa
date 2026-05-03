/**
 * WhatsApp Integration Example
 * 
 * This file contains complete examples of how to integrate WhatsApp messaging
 * into your transaction tracking application.
 */

// ============================================================================
// EXAMPLE 1: Frontend - Using WhatsApp Integration Component in a Settings Page
// ============================================================================

// File: pages/settings.vue
/*
<script setup lang="ts">
import { definePageMeta } from '#app'

definePageMeta({
  middleware: 'isAuth'
})

useHead({
  title: 'Settings - FTracker',
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <!-- WhatsApp Integration Section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <WhatsAppIntegration />
      </div>

      <!-- Other settings sections can go here -->
    </div>
  </div>
</template>
*/

// ============================================================================
// EXAMPLE 2: Backend - Standalone Message Processing
// ============================================================================

/*
import { 
  handleWhatsAppMessage, 
  isValidTransactionMessage, 
  formatResponseMessage 
} from '~/server/utils/whatsappHandler'
import Transaction from '~/server/model/transactions'

export async function processWhatsAppTransaction(
  senderJid: string,
  messageContent: string
): Promise<{ success: boolean; response: string }> {
  try {
    // Check if user and message should be processed
    const processingResult = await handleWhatsAppMessage({
      sender: senderJid,
      content: messageContent,
      timestamp: Date.now(),
    })

    if (!processingResult.shouldProcess) {
      return {
        success: false,
        response: '❌ Unable to process your message. Please ensure your WhatsApp number is registered.',
      }
    }

    // Validate message format
    const validation = isValidTransactionMessage(messageContent)
    if (!validation.isValid) {
      return {
        success: false,
        response: formatResponseMessage(false, '', undefined, undefined, validation.error),
      }
    }

    // Create transaction
    const transaction = new Transaction({
      user: processingResult.userId,
      type: validation.type,
      amount: validation.amount,
      description: validation.description,
      createdAt: new Date(),
    })

    await transaction.save()

    // Send success response
    const response = formatResponseMessage(
      true,
      validation.type || '',
      validation.amount,
      validation.description
    )

    return { success: true, response }
  } catch (error) {
    return {
      success: false,
      response: '❌ Error processing transaction. Please try again.',
    }
  }
}
*/

// ============================================================================
// EXAMPLE 3: API Endpoint - Custom Transaction via WhatsApp
// ============================================================================

/*
// File: server/api/whatsapp/message.post.ts
import { processWhatsAppTransaction } from '~/server/utils/whatsappHandler'

export default defineEventHandler(async (event) => {
  try {
    // In production, verify webhook signature from WhatsApp
    const body = await readBody<{
      from: string
      body: string
    }>(event)

    const { response } = await processWhatsAppTransaction(body.from, body.body)

    return {
      statusCode: 200,
      body: { message: response },
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: { message: 'Error processing message' },
    }
  }
})
*/

// ============================================================================
// EXAMPLE 4: Composable - Phone Number Management
// ============================================================================

/*
// File: composables/useWhatsAppSettings.ts
export const useWhatsAppSettings = () => {
  const jwt = useCookie('jwt')
  const phoneNumber = ref('')
  const chatbotEnabled = ref(false)
  const isLoading = ref(false)

  const loadSettings = async () => {
    try {
      isLoading.value = true
      const data = await $fetch('/api/user/settings', {
        headers: { 'Authorization': `Bearer ${jwt.value}` }
      })
      phoneNumber.value = data.body.phone_number || ''
      chatbotEnabled.value = data.body.chatbot_enabled || false
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      isLoading.value = false
    }
  }

  const updatePhoneNumber = async (newNumber: string) => {
    try {
      await $fetch('/api/user/phone', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${jwt.value}` },
        body: { phone_number: newNumber }
      })
      phoneNumber.value = newNumber
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  const toggleChatbot = async (enabled: boolean) => {
    try {
      await $fetch('/api/user/chatbot', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${jwt.value}` },
        body: { chatbot_enabled: enabled }
      })
      chatbotEnabled.value = enabled
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }

  return {
    phoneNumber,
    chatbotEnabled,
    isLoading,
    loadSettings,
    updatePhoneNumber,
    toggleChatbot,
  }
}
*/

// ============================================================================
// EXAMPLE 5: Nuxt Plugin - Auto-initialize WhatsApp Bot
// ============================================================================

/*
// File: server/plugins/whatsapp-init.ts
import { startWhatsAppBot, isBotConnected } from '~/server/utils/baileysBot'

export default defineNitroPlugin(async (nitroApp) => {
  // Store bot status for health checks
  nitroApp.payload = nitroApp.payload || {}
  nitroApp.payload.whatsappBot = {
    initialized: false,
    connected: false,
  }

  try {
    // Initialize the WhatsApp bot
    await startWhatsAppBot()
    nitroApp.payload.whatsappBot.initialized = true
    
    // Check connection status periodically
    setInterval(() => {
      nitroApp.payload.whatsappBot.connected = isBotConnected()
    }, 5000)

    console.log('✅ WhatsApp Bot initialized')
  } catch (error) {
    console.error('❌ WhatsApp Bot initialization failed:', error)
    nitroApp.payload.whatsappBot.initialized = false
  }
})
*/

// ============================================================================
// EXAMPLE 6: Health Check Endpoint - Monitor Bot Status
// ============================================================================

/*
// File: server/api/admin/whatsapp-status.get.ts
export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, 'jwt')
    if (!token) {
      return { statusCode: 401, body: { message: 'Unauthorized' } }
    }

    // Check if admin (you can add role checking)
    const nitroApp = useNitroApp()
    const status = nitroApp.payload?.whatsappBot || {
      initialized: false,
      connected: false,
    }

    return {
      statusCode: 200,
      body: {
        whatsapp_bot: {
          initialized: status.initialized,
          connected: status.connected,
          timestamp: new Date().toISOString(),
        }
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: { message: (error as Error).message }
    }
  }
})
*/

// ============================================================================
// EXAMPLE 7: Database Migration for Existing Users
// ============================================================================

/*
// File: scripts/migrate-users.ts
// Run this once to add the new fields to existing users

import mongoose from 'mongoose'
import Users from '~/server/model/users'

async function migrateUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '')

    const result = await Users.updateMany(
      {},
      {
        $set: {
          phone_number: null,
          chatbot_enabled: false,
        }
      },
      { upsert: false }
    )

    console.log(`✅ Updated ${result.modifiedCount} users`)
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateUsers()
*/

// ============================================================================
// EXAMPLE 8: Testing the WhatsApp Integration
// ============================================================================

/*
// File: tests/whatsapp.test.ts
import { describe, it, expect } from 'vitest'
import {
  normalizePhoneNumber,
  isValidPhoneNumber,
  extractPhoneFromBaileys,
} from '~/server/utils/phoneValidator'
import {
  isValidTransactionMessage,
  formatResponseMessage,
} from '~/server/utils/whatsappHandler'

describe('Phone Validator', () => {
  it('normalizes phone numbers correctly', () => {
    expect(normalizePhoneNumber('+62 812-3456-789')).toBe('628123456789')
    expect(normalizePhoneNumber('0812-3456-789')).toBe('628123456789')
    expect(normalizePhoneNumber('628123456789')).toBe('628123456789')
  })

  it('validates phone numbers', () => {
    expect(isValidPhoneNumber('628123456789')).toBe(true)
    expect(isValidPhoneNumber('628')).toBe(false)
    expect(isValidPhoneNumber('328123456789')).toBe(false)
  })

  it('extracts from Baileys format', () => {
    expect(extractPhoneFromBaileys('628123456789@s.whatsapp.net')).toBe('628123456789')
    expect(extractPhoneFromBaileys('628123456789@g.us')).toBe(null)
  })
})

describe('Transaction Message Validator', () => {
  it('validates expense messages', () => {
    const result = isValidTransactionMessage('expense 50000 coffee')
    expect(result.isValid).toBe(true)
    expect(result.type).toBe('expense')
    expect(result.amount).toBe(50000)
    expect(result.description).toBe('coffee')
  })

  it('validates income messages', () => {
    const result = isValidTransactionMessage('income 1000000 salary')
    expect(result.isValid).toBe(true)
    expect(result.type).toBe('income')
    expect(result.amount).toBe(1000000)
  })

  it('supports short format', () => {
    const result = isValidTransactionMessage('e 25000 lunch')
    expect(result.isValid).toBe(true)
    expect(result.type).toBe('expense')
  })

  it('rejects invalid messages', () => {
    const result = isValidTransactionMessage('invalid message')
    expect(result.isValid).toBe(false)
    expect(result.error).toBeDefined()
  })
})

describe('Response Formatting', () => {
  it('formats success message', () => {
    const msg = formatResponseMessage(true, 'expense', 50000, 'coffee')
    expect(msg).toContain('✅')
    expect(msg).toContain('50.000')
    expect(msg).toContain('coffee')
  })

  it('formats error message', () => {
    const msg = formatResponseMessage(false, '', undefined, undefined, 'Invalid format')
    expect(msg).toContain('❌')
    expect(msg).toContain('Invalid format')
  })
})
*/

// ============================================================================
// EXAMPLE 9: Advanced - Batch Import Messages
// ============================================================================

/*
// File: server/api/admin/import-messages.post.ts
// For testing/bulk importing messages

import { handleWhatsAppMessage, isValidTransactionMessage } from '~/server/utils/whatsappHandler'
import Transaction from '~/server/model/transactions'

export default defineEventHandler(async (event) => {
  try {
    // Verify admin token
    const token = getCookie(event, 'jwt')
    if (!token) {
      return { statusCode: 401, body: { message: 'Unauthorized' } }
    }

    const body = await readBody<{
      messages: Array<{
        sender: string
        content: string
        timestamp: number
      }>
    }>(event)

    const results = []
    for (const msg of body.messages) {
      try {
        const processingResult = await handleWhatsAppMessage(msg)
        if (processingResult.shouldProcess) {
          const validation = isValidTransactionMessage(msg.content)
          if (validation.isValid) {
            const transaction = new Transaction({
              user: processingResult.userId,
              type: validation.type,
              amount: validation.amount,
              description: validation.description,
              createdAt: new Date(msg.timestamp * 1000),
            })
            await transaction.save()
            results.push({ success: true, sender: msg.sender })
          }
        }
      } catch (error) {
        results.push({ success: false, sender: msg.sender, error: (error as Error).message })
      }
    }

    return {
      statusCode: 200,
      body: {
        message: 'Batch import completed',
        results,
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: { message: (error as Error).message }
    }
  }
})
*/

// ============================================================================
// EXPORT FOR USE IN APPLICATION
// ============================================================================

export { }

// Use in your app:
// 1. Add WhatsAppIntegration component to settings page
// 2. Call POST /api/user/phone with normalized phone number
// 3. Call PATCH /api/user/chatbot to enable
// 4. Messages from registered numbers will be automatically processed
// 5. Transactions created automatically from WhatsApp messages

