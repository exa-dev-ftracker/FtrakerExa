# WhatsApp Integration - Quick Start Guide

## ✅ What's Been Implemented

Your application now has complete WhatsApp integration with the following components:

### 📁 Files Created

1. **Database Model**
   - `server/model/users.ts` - Updated with `phone_number` and `chatbot_enabled` fields

2. **API Endpoints**
   - `server/api/user/phone.post.ts` - POST endpoint to save phone number
   - `server/api/user/chatbot.patch.ts` - PATCH endpoint to toggle chatbot
   - `server/api/user/settings.get.ts` - GET endpoint to fetch settings

3. **Utilities**
   - `server/utils/phoneValidator.ts` - Phone validation & normalization functions
   - `server/utils/whatsappHandler.ts` - Message processing logic
   - `server/utils/baileysBot.ts` - Baileys library integration example

4. **Frontend**
   - `components/WhatsAppIntegration.vue` - Complete UI component with forms, toggle, and instructions

5. **Server**
   - `server/plugins/whatsapp.ts` - Plugin to initialize WhatsApp bot

6. **Documentation**
   - `WHATSAPP_INTEGRATION_GUIDE.md` - Comprehensive documentation
   - `WHATSAPP_EXAMPLES.md` - Code examples and use cases

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Use the Frontend Component

Add the WhatsApp Integration component to your settings page:

```vue
<template>
  <div class="p-4">
    <WhatsAppIntegration />
  </div>
</template>
```

### Step 2: Test the APIs

The API endpoints are ready to use:

```bash
# Save a phone number
curl -X POST http://localhost:3000/api/user/phone \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=YOUR_JWT_TOKEN" \
  -d '{"phone_number": "+62 812-3456-789"}'

# Enable chatbot
curl -X PATCH http://localhost:3000/api/user/chatbot \
  -H "Content-Type: application/json" \
  -H "Cookie: jwt=YOUR_JWT_TOKEN" \
  -d '{"chatbot_enabled": true}'

# Get settings
curl http://localhost:3000/api/user/settings \
  -H "Cookie: jwt=YOUR_JWT_TOKEN"
```

### Step 3: Activate WhatsApp Bot (Optional)

To enable the WhatsApp bot for automatic message processing:

1. Install Baileys:
   ```bash
   npm install @whiskeysockets/baileys
   ```

2. Edit `server/plugins/whatsapp.ts` and uncomment the initialization

3. Create auth directory:
   ```bash
   mkdir -p auth_info_baileys
   ```

4. Restart your server - the bot will show a QR code in the terminal to scan

---

## 📱 Message Format

Users send transactions via WhatsApp like this:

```
expense 50000 coffee
income 1000000 salary
e 25000 lunch
i 500000 freelance
```

Format: `[command] [amount] [description]`

---

## 🔄 Flow Diagram

```
User Registration:
┌─────────────────┐
│ Open Settings   │
└────────┬────────┘
         │
┌────────▼────────┐
│ Enter Phone #   │
└────────┬────────┘
         │
┌────────▼────────────────────┐
│ POST /api/user/phone        │
│ (Validates & Normalizes)    │
└────────┬────────────────────┘
         │
┌────────▼────────┐
│ Enable Toggle   │
└────────┬────────┘
         │
┌────────▼───────────────────────┐
│ PATCH /api/user/chatbot        │
│ (Enable chatbot processing)    │
└────────┬───────────────────────┘
         │
┌────────▼────────────────────┐
│ Chatbot Ready!              │
│ Send: "expense 50000 food"  │
└─────────────────────────────┘
```

---

## 📚 Key Features

### ✨ Phone Number Handling
- Accepts multiple formats: `+62 812-3456-789`, `0812-3456-789`, `628123456789`
- Automatically normalizes to: `628123456789`
- Validates country code and length

### 🤖 Message Processing
- Checks if user exists and has chatbot enabled
- Validates message format
- Automatically creates transactions
- Sends response back to user

### 🔒 Security
- All endpoints require JWT authentication
- Phone number linked to user ID
- Session verification via Redis
- Message validation before processing

### 📊 Frontend Features
- Real-time phone number formatting
- Toggle switch for chatbot status
- Status messages (enabled/disabled)
- Usage instructions
- Privacy information

---

## 🧪 Testing

### Manual Test Scenario

1. **Register Phone Number**
   - Open WhatsApp Integration component
   - Enter: `+62 812-3456-789`
   - Click "Save Phone Number"
   - See success notification

2. **Enable Chatbot**
   - Click toggle switch
   - See "Send your transaction messages..." message
   - Confirm enabled status

3. **Send WhatsApp Message**
   - From WhatsApp at the registered number
   - Send: `expense 50000 morning coffee`
   - Wait for bot response with checkmark

4. **Check Transaction**
   - Go to Transactions page
   - See new expense entry: "morning coffee - Rp 50.000"

---

## 📋 Endpoint Reference

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/user/phone` | Save phone number | ✅ JWT |
| PATCH | `/api/user/chatbot` | Toggle chatbot | ✅ JWT |
| GET | `/api/user/settings` | Get settings | ✅ JWT |

---

## ⚙️ Configuration

### Environment Variables

Add to your `.env` if needed:

```env
# WhatsApp Configuration (Optional)
WHATSAPP_BOT_ENABLED=true
WHATSAPP_BOT_TIMEOUT=30000
```

### MongoDB Schema Changes

The User model now includes:

```typescript
phone_number: String (nullable, sparse index)
chatbot_enabled: Boolean (default: false)
```

---

## 🔍 File Structure

```
server/
├── api/
│   └── user/
│       ├── phone.post.ts        ← New: Save phone
│       ├── chatbot.patch.ts     ← New: Toggle chatbot
│       └── settings.get.ts      ← New: Get user settings
├── model/
│   └── users.ts                 ← Modified: Added fields
├── utils/
│   ├── phoneValidator.ts        ← New: Phone utilities
│   ├── whatsappHandler.ts       ← New: Message handler
│   └── baileysBot.ts            ← New: Bot integration
└── plugins/
    └── whatsapp.ts              ← New: Bot initialization

components/
└── WhatsAppIntegration.vue      ← New: Frontend UI

WHATSAPP_INTEGRATION_GUIDE.md    ← Documentation
WHATSAPP_EXAMPLES.md            ← Code examples
```

---

## 🐛 Troubleshooting

### "Phone number invalid"
- Check format: must be `+62...` or `0...` or `628...`
- Must be 10-15 digits
- Must be Indonesian number (country code 62)

### "Chatbot is disabled, enable it first"
- User needs to enable the toggle first
- Phone number must be registered before toggle works

### "User not found when sending message"
- Verify phone number is saved correctly
- Check that chatbot_enabled is true
- Ensure message is from the registered number

### "Message format not recognized"
- Must follow: `expense 50000 description`
- Or shorthand: `e 50000 description`
- Description cannot be empty
- Amount must be numeric

---

## 📖 Next Steps

1. **Integrate Component**
   - Add `<WhatsAppIntegration />` to your settings page

2. **Test APIs**
   - Use the provided curl examples
   - Verify phone storage and chatbot toggle

3. **Enable Bot (Optional)**
   - Install Baileys
   - Uncomment bot initialization
   - Scan QR code

4. **Monitor**
   - Check logs in `logs/` directory
   - Monitor transaction creation
   - Track API usage

---

## 💡 Tips & Best Practices

1. **Phone Number Format**
   - Always start with country code (62 for Indonesia)
   - Don't include spaces or special characters in storage
   - Display formatted for user readability

2. **Message Validation**
   - Be flexible with input (both long and short formats)
   - Send helpful error messages
   - Include format examples in error responses

3. **Security**
   - Always verify JWT token
   - Check user ownership of phone number
   - Validate before creating transactions
   - Log all API activity

4. **User Experience**
   - Show clear success/error messages
   - Provide usage instructions
   - Make setup process simple (3 steps)
   - Allow easy enable/disable

---

## 📞 Support & Documentation

- Full guide: `WHATSAPP_INTEGRATION_GUIDE.md`
- Code examples: `WHATSAPP_EXAMPLES.md`
- API reference: See documentation files
- Example composable usage in `WHATSAPP_EXAMPLES.md`

---

## ✅ Checklist for Implementation

- [ ] Files created and verified
- [ ] User model updated
- [ ] API endpoints tested
- [ ] Frontend component displayed
- [ ] Phone validation working
- [ ] Database migrations completed (if needed)
- [ ] WhatsApp bot installed (optional)
- [ ] QR code scanned for bot (if enabled)
- [ ] Test message sent
- [ ] Transaction created automatically
- [ ] Settings page displays component

---

**Ready to go! Your WhatsApp integration is fully implemented. 🎉**

