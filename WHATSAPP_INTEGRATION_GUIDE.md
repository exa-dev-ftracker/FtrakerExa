# WhatsApp Integration Guide

## Overview

This feature allows users to register their WhatsApp phone numbers and enable automated transaction recording through WhatsApp messages via the Baileys library.

## Components

### 1. Database Schema Changes

**User Model Updates** (`server/model/users.ts`):
- `phone_number` (String, optional): Normalized WhatsApp phone number (e.g., 628123456789)
- `chatbot_enabled` (Boolean, default: false): Controls whether messages are processed

### 2. Backend API Endpoints

#### POST `/api/user/phone`
Save or update user's WhatsApp phone number.

**Request:**
```json
{
  "phone_number": "628123456789"
  // or "+62 812-3456-789"
  // or "0812-3456-789"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "body": {
    "message": "Phone number updated successfully",
    "phone_number": "628123456789"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid phone number format
- `401 Unauthorized`: No active session
- `500 Internal Server Error`: Server error

---

#### PATCH `/api/user/chatbot`
Enable or disable WhatsApp chatbot automation.

**Request:**
```json
{
  "chatbot_enabled": true
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "body": {
    "message": "WhatsApp chatbot enabled successfully",
    "chatbot_enabled": true
  }
}
```

**Requirements:**
- User must have a phone number registered first
- Returns `400` if phone_number is not set

---

#### GET `/api/user/settings`
Fetch user's current WhatsApp settings.

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "body": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "628123456789",
    "chatbot_enabled": true
  }
}
```

---

### 3. Frontend Component

**File:** `components/WhatsAppIntegration.vue`

Features:
- Phone number input with real-time formatting
- Chatbot toggle switch
- Status messages based on chatbot state
- Input validation
- Error handling with toast notifications
- Usage instructions
- Privacy information

**Usage in a page:**
```vue
<template>
  <div class="container mx-auto py-8">
    <WhatsAppIntegration />
  </div>
</template>
```

---

### 4. Utility Functions

#### Phone Number Validation (`server/utils/phoneValidator.ts`)

```typescript
// Normalize phone number to standard format
normalizePhoneNumber("+62 812-3456-789") 
// Returns: "628123456789"

// Validate phone number
isValidPhoneNumber("628123456789")
// Returns: true

// Extract phone from Baileys format
extractPhoneFromBaileys("628123456789@s.whatsapp.net")
// Returns: "628123456789"

// Format for display
formatPhoneNumber("628123456789")
// Returns: "+62 812-3456-789"
```

---

#### WhatsApp Message Handler (`server/utils/whatsappHandler.ts`)

```typescript
// Main message processing handler
const result = await handleWhatsAppMessage({
  sender: "628123456789@s.whatsapp.net",
  content: "expense 50000 coffee",
  timestamp: Date.now()
})

// Returns:
{
  shouldProcess: true,
  userId: "user_id_here",
  phoneNumber: "628123456789",
  reason: "Message will be processed"
}

// Validate transaction message format
const validation = isValidTransactionMessage("expense 50000 coffee")
// Returns: { isValid: true, type: "expense", amount: 50000, description: "coffee" }

// Format response message
const response = formatResponseMessage(true, "expense", 50000, "coffee")
// Returns: "✅ Expense recorded\n💰 Rp 50.000\n📝 coffee"
```

---

### 5. Message Format Specifications

Messages should follow these formats:

```
// Long format
expense 50000 coffee
income 1000000 salary

// Short format
e 25000 lunch
i 500000 freelance
```

**Components:**
- **Command**: `expense`/`e` or `income`/`i`
- **Amount**: Numeric value (currency unit as configured, e.g., IDR)
- **Description**: Any text describing the transaction

**Valid Examples:**
```
expense 50000 morning coffee
income 1500000 freelance project payment
e 25000 lunch
i 10000 bonus
```

**Invalid Examples:**
```
50000 coffee           // Missing command
expense coffee 50000   // Wrong order
e                      // Missing amount and description
```

---

## Installation & Setup

### 1. Install Baileys Library (Optional)

If you want to enable the WhatsApp bot:

```bash
npm install @whiskeysockets/baileys
```

### 2. Update Components

All components are already created:
- ✅ User model updated
- ✅ API endpoints created
- ✅ Frontend component created
- ✅ Message handler utilities created

### 3. Initialize WhatsApp Bot

Edit `server/plugins/whatsapp.ts` and uncomment the initialization:

```typescript
export default defineNitroPlugin(async (nitroApp) => {
  try {
    import { startWhatsAppBot } from '~/server/utils/baileysBot';
    await startWhatsAppBot();
    console.log('✅ WhatsApp bot initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize WhatsApp bot:', error);
  }
});
```

### 4. Create Auth Directory

Baileys stores authentication info in `auth_info_baileys/`:

```bash
mkdir -p auth_info_baileys
```

---

## Workflow

### User Registration Flow

```
1. User navigates to Settings/WhatsApp Integration page
   ↓
2. User enters phone number (+62 812-3456-789)
   ↓
3. Frontend calls POST /api/user/phone
   ↓
4. Backend validates and normalizes number (628123456789)
   ↓
5. Phone number is saved to database
   ↓
6. User enables chatbot toggle
   ↓
7. Frontend calls PATCH /api/user/chatbot
   ↓
8. Backend verifies phone exists and enables chatbot
```

### Message Processing Flow

```
WhatsApp Message Arrives
   ↓
Baileys captures message
   ↓
Extract sender phone (628123456789@s.whatsapp.net)
   ↓
Extract and normalize phone (628123456789)
   ↓
Look up user in database
   ↓
Is user found? ──NO──→ Ignore message
   ↓ YES
Is chatbot_enabled true? ──NO──→ Send info message, ignore
   ↓ YES
Validate message format
   ↓
Valid? ──NO──→ Send error with format help
   ↓ YES
Create transaction
   ↓
Send success confirmation
```

---

## API Examples

### Save Phone Number (cURL)

```bash
curl -X POST http://localhost:3000/api/user/phone \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=YOUR_JWT_TOKEN" \
  -d '{
    "phone_number": "+62 812-3456-789"
  }'
```

### Enable Chatbot (cURL)

```bash
curl -X PATCH http://localhost:3000/api/user/chatbot \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=YOUR_JWT_TOKEN" \
  -d '{
    "chatbot_enabled": true
  }'
```

### Get User Settings (cURL)

```bash
curl -X GET http://localhost:3000/api/user/settings \
  -H "Cookie: jwt=YOUR_JWT_TOKEN"
```

---

## Frontend Integration Example

### In a Settings Page

```vue
<script setup lang="ts">
definePageMeta({
  middleware: 'isAuth'
})
</script>

<template>
  <div class="p-4">
    <WhatsAppIntegration />
  </div>
</template>
```

### Loading Settings in Component

```vue
<script setup lang="ts">
const jwt = useCookie('jwt')
const { data: settings } = await useAsyncData('whatsapp-settings', async () => {
  return await $fetch('/api/user/settings', {
    headers: { 'Authorization': `Bearer ${jwt.value}` }
  })
})
</script>
```

---

## Error Handling

### Phone Number Validation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Empty phone number | No input provided | Enter a phone number |
| Invalid format | Contains invalid characters | Use format: +62 812-3456-789 |
| Wrong country code | Doesn't start with 62 | Ensure it's Indonesian number (62) |
| Too short/long | Not 10-15 digits | Check number length |

### Chatbot Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Phone not registered | User tried to enable without number | Register phone first |
| Session expired | JWT token expired | Log in again |
| User not found | Phone doesn't match any user | Register and verify number |

---

## Security Considerations

1. **Phone Number Storage**
   - Stored in plaintext (can be encrypted if needed)
   - Normalized to prevent duplicates

2. **Message Validation**
   - Only processes messages from registered phones
   - Checks chatbot_enabled flag before processing
   - Validates message format

3. **User Authentication**
   - All endpoints require valid JWT
   - Redis session verification
   - User ID binding

4. **Transaction Creation**
   - Transaction linked to specific user
   - Only authenticated users can trigger

---

## Testing

### Manual Testing Checklist

- [ ] Register phone number via UI
- [ ] Phone number is normalized correctly
- [ ] Chatbot toggle requires phone number
- [ ] Can enable/disable chatbot
- [ ] Send valid transaction message to WhatsApp
- [ ] Message is processed and transaction created
- [ ] Send invalid message format
- [ ] Receive error message with format help
- [ ] Disable chatbot
- [ ] Send message - should not process
- [ ] Enable chatbot again
- [ ] Message processes successfully

### Unit Test Examples

```typescript
// Test phone normalization
test('normalizePhoneNumber', () => {
  expect(normalizePhoneNumber('+62 812-3456-789')).toBe('628123456789')
  expect(normalizePhoneNumber('0812-3456-789')).toBe('628123456789')
})

// Test transaction validation
test('isValidTransactionMessage', () => {
  const result = isValidTransactionMessage('expense 50000 coffee')
  expect(result.isValid).toBe(true)
  expect(result.type).toBe('expense')
  expect(result.amount).toBe(50000)
})
```

---

## Troubleshooting

### Bot not receiving messages

1. Check if Baileys is properly authenticated
2. Verify QR code was scanned
3. Check if phone number is registered
4. Verify chatbot_enabled is true
5. Check server logs for errors

### Messages not processing

1. Verify phone number format (should be 628123456789)
2. Check message format matches specification
3. Verify user exists in database
4. Check if chatbot_enabled is true
5. Review logs in `logs/error.log`

### Phone number validation fails

1. Ensure country code (62) is included
2. Remove spaces and dashes
3. Remove + symbol
4. Verify it's a valid Indonesian number

---

## Future Enhancements

- [ ] Support multiple country codes
- [ ] Message templates for quick transactions
- [ ] Expense categorization via WhatsApp
- [ ] Reminders and notifications
- [ ] Monthly summaries via WhatsApp
- [ ] Receipt attachment processing
- [ ] Multi-user group chat support

---

## Files Created/Modified

### Created Files:
- `server/utils/phoneValidator.ts` - Phone validation utilities
- `server/utils/whatsappHandler.ts` - Message handling logic
- `server/utils/baileysBot.ts` - Baileys integration example
- `server/api/user/phone.post.ts` - Phone registration endpoint
- `server/api/user/chatbot.patch.ts` - Chatbot toggle endpoint
- `server/api/user/settings.get.ts` - Settings fetch endpoint
- `server/plugins/whatsapp.ts` - Bot initialization plugin
- `components/WhatsAppIntegration.vue` - Frontend component

### Modified Files:
- `server/model/users.ts` - Added phone_number and chatbot_enabled fields

---

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs in `logs/` directory
3. Check console output for error messages
4. Verify all files are created correctly

