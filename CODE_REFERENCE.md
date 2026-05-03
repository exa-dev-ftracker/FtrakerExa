# WhatsApp Integration - Code Reference

## 🗂️ File Structure & Content Overview

---

## 📝 1. Modified Files

### `server/model/users.ts`

**Changes Made:**
- Added `phone_number?: string` field to User interface
- Added `chatbot_enabled: boolean` field with default false
- Updated schema with new field definitions

```typescript
// New interface fields:
phone_number?: string;
chatbot_enabled: boolean;

// New schema fields:
phone_number: { type: String, sparse: true },
chatbot_enabled: { type: Boolean, default: false },
```

---

## 🆕 2. Created API Endpoints

### `server/api/user/phone.post.ts`

**Purpose:** Save/update user's WhatsApp phone number

**Key Functions:**
- Extracts JWT from cookies
- Validates user session via Redis
- Normalizes phone number
- Saves to database
- Returns normalized number

**Request Body:**
```json
{ "phone_number": "string" }
```

**Response:**
```json
{
  "statusCode": 200,
  "body": {
    "message": "Phone number updated successfully",
    "phone_number": "628123456789"
  }
}
```

---

### `server/api/user/chatbot.patch.ts`

**Purpose:** Enable/disable WhatsApp chatbot

**Key Functions:**
- Validates JWT and session
- Checks if phone number exists
- Updates chatbot_enabled flag
- Logs status change

**Request Body:**
```json
{ "chatbot_enabled": boolean }
```

**Response:**
```json
{
  "statusCode": 200,
  "body": {
    "message": "WhatsApp chatbot enabled successfully",
    "chatbot_enabled": true
  }
}
```

**Validation:**
- Requires phone_number to be set first
- Returns 400 if phone not found

---

### `server/api/user/settings.get.ts`

**Purpose:** Fetch user's WhatsApp settings

**Response:**
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

## 🔧 3. Utility Functions

### `server/utils/phoneValidator.ts`

**Exported Functions:**

```typescript
normalizePhoneNumber(input: string): string | null
// Converts: "+62 812-3456-789" → "628123456789"
// Returns normalized number or null if invalid

isValidPhoneNumber(number: string): boolean
// Validates format: numeric, starts with 62, length 10-15

extractPhoneFromBaileys(baileysSender: string): string | null
// Converts: "628123456789@s.whatsapp.net" → "628123456789"

formatPhoneNumber(number: string): string
// Converts: "628123456789" → "+62 812-3456-789" (for display)
```

**Key Features:**
- Handles multiple input formats
- Validates country code (62)
- Checks phone length
- Error handling with null returns

---

### `server/utils/whatsappHandler.ts`

**Exported Functions:**

```typescript
async handleWhatsAppMessage(message: WhatsAppMessage): Promise<MessageProcessingResult>
// Main handler for incoming messages
// Returns: { shouldProcess: boolean, userId?: string, reason?: string }

isValidTransactionMessage(content: string): {
  isValid: boolean;
  type?: string;
  amount?: number;
  description?: string;
  error?: string;
}
// Validates message format: "expense 50000 coffee"

formatResponseMessage(
  success: boolean,
  type: string,
  amount?: number,
  description?: string,
  error?: string
): string
// Creates user-friendly response message
```

**Processing Logic:**
1. Extract phone from Baileys format
2. Find user in database
3. Check if user has chatbot enabled
4. Validate message format
5. Return processing result

---

## 🤖 4. Baileys Integration

### `server/utils/baileysBot.ts`

**Exported Functions:**

```typescript
async startWhatsAppBot(): Promise<any>
// Initialize Baileys socket
// Returns socket connection

async function handleIncomingMessage(m: any): Promise<void>
// Process incoming message
// Creates transaction if valid

async sendMessage(remoteJid: string, message: string): Promise<void>
// Send WhatsApp message

function isBotConnected(): boolean
// Check connection status

async stopWhatsAppBot(): Promise<void>
// Graceful shutdown
```

**Features:**
- Connection management
- QR code authentication
- Message reception
- Automatic transaction creation
- Response sending

---

### `server/plugins/whatsapp.ts`

**Purpose:** Initialize WhatsApp bot on server start

**Current State:** Disabled (with instructions for enabling)

**To Enable:**
```typescript
import { startWhatsAppBot } from '~/server/utils/baileysBot';
await startWhatsAppBot();
```

---

## 🎨 5. Frontend Component

### `components/WhatsAppIntegration.vue`

**Data Properties:**
```typescript
phoneNumber: string          // User's phone input
chatbotEnabled: boolean      // Chatbot status
isLoading: boolean           // Loading state
isSaving: boolean            // Save state
formattedPhoneNumber: string // Display format
statusMessage: string        // Status text
```

**Methods:**
```typescript
savePhoneNumber(): void
// POST /api/user/phone with validation

toggleChatbot(): void
// PATCH /api/user/chatbot with error handling
```

**Features:**
- Real-time phone formatting
- Toggle switch UI
- Status messages
- Error handling
- Usage instructions
- Privacy information

**Sections:**
1. Phone number input with formatting preview
2. Chatbot toggle with status
3. How to use guide
4. Security/privacy info

---

## 📋 6. Type Definitions

### In `server/utils/whatsappHandler.ts`:

```typescript
interface WhatsAppMessage {
  sender: string;
  content: string;
  timestamp: number;
}

interface MessageProcessingResult {
  shouldProcess: boolean;
  userId?: string;
  reason?: string;
  phoneNumber?: string;
}
```

---

## 🔐 7. Security Layers

### Authentication
- JWT token validation on all endpoints
- Redis session verification
- Cookie-based token extraction

### Validation
- Phone number format validation
- Country code verification
- Message format validation
- User ownership verification

### Error Handling
- Secure error messages
- No sensitive data in responses
- Proper HTTP status codes
- Detailed logging

---

## 📊 8. Database Schema

### User Model Changes

```typescript
{
  // Existing fields...
  
  // New fields:
  phone_number: {
    type: String,
    sparse: true  // Allows multiple users without number
  },
  
  chatbot_enabled: {
    type: Boolean,
    default: false
  }
}
```

---

## 🔄 9. Data Flow Diagrams

### API Request Flow (Phone Save)

```
Frontend Request
    ↓
Extract JWT from Cookie
    ↓
Verify JWT → Redis
    ↓
Parse Request Body
    ↓
Normalize Phone Number
    ↓
Validate Phone Format
    ↓
Update Database
    ↓
Return Success/Error
```

### Message Processing Flow

```
Baileys Message Received
    ↓
Extract Sender Phone
    ↓
Normalize Phone Number
    ↓
Query Database
    ↓
Found? + Enabled? + Valid Format?
    ↓ YES
Create Transaction
    ↓
Send Response
    ↓
Update Frontend
```

---

## 📝 10. Error Codes

### HTTP Status Codes

| Code | Scenario |
|------|----------|
| 200 | Success |
| 400 | Invalid input (bad phone format) |
| 401 | Unauthorized (no JWT) |
| 404 | User not found |
| 500 | Server error |

### Custom Error Messages

```
"Phone number updated successfully"
"Invalid phone number. Must start with country code (62)."
"Unauthorized"
"Session expired"
"Please register your WhatsApp phone number first"
"User not found"
"WhatsApp chatbot enabled successfully"
"Invalid format. Use: 'expense 50000 description'"
```

---

## 🧪 11. Testing Points

### Unit Tests (phoneValidator.ts)
```typescript
✓ normalizePhoneNumber('+62 812-3456-789')
✓ isValidPhoneNumber('628123456789')
✓ extractPhoneFromBaileys('628123456789@s.whatsapp.net')
✓ formatPhoneNumber('628123456789')
```

### Integration Tests (API)
```typescript
✓ POST /api/user/phone with valid number
✓ PATCH /api/user/chatbot after phone set
✓ GET /api/user/settings
✓ Invalid phone rejection
✓ Session expiry handling
```

### End-to-End Tests
```typescript
✓ User registration flow
✓ WhatsApp message processing
✓ Transaction creation
✓ Response sending
```

---

## 📚 12. Import Examples

### In Backend Files

```typescript
// Phone validation
import { 
  normalizePhoneNumber, 
  isValidPhoneNumber 
} from "~/server/utils/phoneValidator"

// Message handling
import { 
  handleWhatsAppMessage,
  isValidTransactionMessage 
} from "~/server/utils/whatsappHandler"

// Model
import Users from "~/server/model/users"
import Transaction from "~/server/model/transactions"

// Utilities
import logger from "~/server/utils/logger"
```

### In Frontend Files

```vue
<script setup lang="ts">
const toast = useToast()
const router = useRouter()
const jwt = useCookie('jwt')
</script>

<template>
  <WhatsAppIntegration />
</template>
```

---

## 🚀 13. Configuration Points

### Environment Variables (Optional)

```env
# In .env file
WHATSAPP_BOT_ENABLED=true
WHATSAPP_BOT_TIMEOUT=30000
WHATSAPP_LOG_LEVEL=info
```

### Runtime Config (nuxt.config.ts)

```typescript
// Can add if needed:
export default defineNuxtConfig({
  runtimeConfig: {
    whatsappBotEnabled: process.env.WHATSAPP_BOT_ENABLED === 'true',
  }
})
```

---

## 💾 14. Database Migrations

### For New Installation
No migration needed - fields default to null/false

### For Existing Users

```bash
# Optional: Add indexes
db.users.createIndex({ "phone_number": 1 }, { sparse: true })
```

---

## 🔍 15. Logging Points

### API Endpoints Log

```
INFO: User [ID] updated phone number to [number]
WARN: Invalid phone number format: [input]
ERROR: Error updating phone number: [error]
DEBUG: No user found for phone number: [number]
```

### Message Handler Log

```
INFO: Received message from [JID]: [content]
DEBUG: Processing WhatsApp message from user [ID]
WARN: Invalid phone number format from Baileys: [sender]
INFO: Processing WhatsApp message from user [ID]
ERROR: Error in WhatsApp message handler: [error]
```

---

## 📊 16. Response Examples

### Successful Phone Update
```json
{
  "statusCode": 200,
  "body": {
    "message": "Phone number updated successfully",
    "phone_number": "628123456789"
  }
}
```

### Chatbot Enabled
```json
{
  "statusCode": 200,
  "body": {
    "message": "WhatsApp chatbot enabled successfully",
    "chatbot_enabled": true
  }
}
```

### Error: Invalid Phone
```json
{
  "statusCode": 400,
  "body": {
    "message": "Invalid phone number. Must start with country code (62) and be numeric."
  }
}
```

---

## ✅ 17. Checklist for Verification

- [ ] All files created (check file listing)
- [ ] User model has new fields
- [ ] API endpoints are accessible
- [ ] Frontend component loads
- [ ] Phone validation works
- [ ] API authentication verified
- [ ] Error handling functional
- [ ] Database operations working
- [ ] Logging appears in logs
- [ ] Documentation complete

---

## 🎯 18. Next Steps

1. **Immediate:**
   - Review code structure
   - Test API endpoints
   - Verify database changes

2. **Short-term:**
   - Add to settings page
   - Test frontend component
   - Verify end-to-end flow

3. **Medium-term:**
   - Enable Baileys bot (optional)
   - Configure environment
   - Deploy to production

4. **Long-term:**
   - Monitor performance
   - Gather user feedback
   - Implement enhancements

---

This completes the WhatsApp integration implementation! 🎉

