# WhatsApp Integration - Visual Architecture

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      FTRACKER APPLICATION                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER (Vue 3 + Nuxt)                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────┐          │
│  │              Header Component (Updated)                         │          │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │          │
│  │  │   FTracker   │  │  Logo Link   │  │  ⚙️ Settings Button ├──┼──┐       │
│  │  │     Logo     │  │   to /       │  │  (NEW Navigation)   │ │  │       │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘ │  │       │
│  └────────────────────────────────────────────────────────────────┘  │       │
│                                                                         │       │
│  Routes:                                                              │       │
│  ┌────────────────────┐                                              │       │
│  │  /                 │  Dashboard                                    │       │
│  │  /login            │  Login                                        │       │
│  │  /register         │  Register                                     │       │
│  │  /settings    ◄────┼──────────────────────────────────────────────┘       │
│  └────────────────────┘                                                      │
│                                                                               │
│  Settings Page (NEW - pages/settings.vue)                                   │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │  Settings                                                    │            │
│  │  ┌───────────────────────┐ ┌──────────────────────────────┐ │            │
│  │  │   Sidebar Nav         │ │   Main Content Area          │ │            │
│  │  │ ┌─────────────────────┤ │  ┌────────────────────────┐  │ │            │
│  │  │ │ WhatsApp Integ. ◄───┼─┼─→│ WhatsAppIntegration    │  │ │            │
│  │  │ │ Account Settings     │ │  │ Component (Connected)  │  │ │            │
│  │  │ └─────────────────────┤ │  └────────────────────────┘  │ │            │
│  │  └───────────────────────┘ └──────────────────────────────┘ │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                               │
│  WhatsAppIntegration Component                                               │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │  WhatsApp Integration                                        │            │
│  │  ┌─────────────────────────────────────────────────────────┤            │
│  │  │ Phone Number Input                                       │            │
│  │  │ [ +62 812-3456-789 ]                                     │            │
│  │  │ Formatted: +62 812-3456-789                              │            │
│  │  │ [Save Phone Number]                                      │            │
│  │  ├─────────────────────────────────────────────────────────┤            │
│  │  │ Enable WhatsApp Chatbot          [Toggle Switch: ON]   │            │
│  │  │ ✅ Chatbot enabled - Ready to receive messages           │            │
│  │  ├─────────────────────────────────────────────────────────┤            │
│  │  │ How to Use                                               │            │
│  │  │ 1. Register your WhatsApp number                         │            │
│  │  │ 2. Enable the chatbot                                    │            │
│  │  │ 3. Send: expense 50000 coffee                            │            │
│  │  │ 4. Transaction recorded automatically!                   │            │
│  │  └─────────────────────────────────────────────────────────┘            │
│  └─────────────────────────────────────────────────────────────┘            │
└──────────────────────────────────────────────────────────────────────────────┘

                                    ↕ API Calls
                              (JWT Authorization)

┌──────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND API LAYER (Nitro)                             │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Authentication Flow                                                         │
│  ┌────────────────────────────────────────────────────────────────┐         │
│  │ JWT Cookie from Request                                        │         │
│  │      ↓                                                         │         │
│  │ Validate JWT                                                   │         │
│  │      ↓                                                         │         │
│  │ Check Redis Session                                            │         │
│  │      ↓                                                         │         │
│  │ Get User ID from Session                                       │         │
│  │      ↓                                                         │         │
│  │ Proceed with Operation ✓                                       │         │
│  └────────────────────────────────────────────────────────────────┘         │
│                                                                               │
│  API Endpoints                                                               │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │                                                              │            │
│  │  POST /api/user/phone                                       │            │
│  │  ├─ Input: { phone_number: "628123456789" }                │            │
│  │  ├─ Normalize phone number                                 │            │
│  │  ├─ Validate format                                        │            │
│  │  ├─ Save to database                                       │            │
│  │  └─ Return: { phone_number: "628123456789" }               │            │
│  │                                                              │            │
│  │  PATCH /api/user/chatbot                                   │            │
│  │  ├─ Input: { chatbot_enabled: true }                       │            │
│  │  ├─ Check if phone exists                                  │            │
│  │  ├─ Update chatbot flag                                    │            │
│  │  └─ Return: { chatbot_enabled: true }                      │            │
│  │                                                              │            │
│  │  GET /api/user/settings                                    │            │
│  │  ├─ Query user by ID                                       │            │
│  │  ├─ Get phone_number and chatbot_enabled                   │            │
│  │  └─ Return: { phone_number, chatbot_enabled }              │            │
│  │                                                              │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                               │
│  Utility Functions (server/utils/)                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │ phoneValidator   │  │ whatsappHandler  │  │ baileysBot       │         │
│  │ ├─ Normalize     │  │ ├─ Process msg   │  │ ├─ Receive msg   │         │
│  │ ├─ Validate      │  │ ├─ Validate fmt  │  │ ├─ Create trans  │         │
│  │ └─ Format        │  │ └─ Format resp   │  │ └─ Send response │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
└──────────────────────────────────────────────────────────────────────────────┘

                                    ↕ Database
                                    ↕ Redis

┌──────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE LAYER                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  MongoDB                          Redis                    WhatsApp API     │
│  ┌──────────────────────┐        ┌──────────────┐         ┌──────────────┐ │
│  │ Users Collection     │        │ JWT Sessions │         │  Baileys Bot │ │
│  │ ┌──────────────────┐ │        │              │         │              │ │
│  │ │ _id              │ │        │ Token: {     │         │ Send/Receive │ │
│  │ │ name             │ │        │   id,        │         │ Messages     │ │
│  │ │ email            │ │        │   email,     │         │              │ │
│  │ │ password         │ │        │   name       │         │ Automation   │ │
│  │ │ phone_number  ◄──┼─┼────────┼──────────────┼────────→│ Processing   │ │
│  │ │ chatbot_enabled◄──┼─┼────────┼──────────────┼────────→│              │ │
│  │ └──────────────────┘ │        │ }            │         │ (Optional)   │ │
│  │                      │        └──────────────┘         └──────────────┘ │
│  │ Transactions Coll.   │                                                    │
│  │ ┌──────────────────┐ │                                                    │
│  │ │ user (FK)    ◄───┼─┼────────── Created from WhatsApp                  │
│  │ │ amount           │ │           messages when chatbot                  │
│  │ │ type             │ │           is enabled                             │
│  │ │ description      │ │                                                    │
│  │ │ createdAt        │ │                                                    │
│  │ └──────────────────┘ │                                                    │
│  └──────────────────────┘                                                    │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Registration & Chatbot Activation Flow

```
START
  │
  ├─→ User Logs In
  │     │
  │     ├─→ JWT Token Generated
  │     └─→ Session Stored in Redis
  │
  ├─→ User Clicks Settings Icon
  │     │
  │     ├─→ Navigate to /settings
  │     ├─→ isAuth Middleware Checks JWT ✓
  │     └─→ Page Loads
  │
  ├─→ Settings Page Loads
  │     │
  │     ├─→ onMounted → Fetch Current Settings
  │     ├─→ GET /api/user/settings
  │     └─→ Display Phone (if exists) & Chatbot Status
  │
  ├─→ User Enters Phone Number
  │     │
  │     ├─→ Input: "+62 812-3456-789"
  │     ├─→ Format Preview: "+62 812-3456-789"
  │     └─→ User Sees Real-time Formatting
  │
  ├─→ User Clicks "Save Phone Number"
  │     │
  │     ├─→ POST /api/user/phone
  │     ├─→ Body: { phone_number: "+62 812-3456-789" }
  │     │
  │     ├─→ Backend:
  │     │     ├─ Validate JWT ✓
  │     │     ├─ Normalize: "628123456789"
  │     │     ├─ Validate Format ✓
  │     │     └─ Save to DB
  │     │
  │     └─→ Response: Success Toast
  │
  ├─→ User Clicks Chatbot Toggle
  │     │
  │     ├─→ PATCH /api/user/chatbot
  │     ├─→ Body: { chatbot_enabled: true }
  │     │
  │     ├─→ Backend:
  │     │     ├─ Validate JWT ✓
  │     │     ├─ Check Phone Exists ✓
  │     │     ├─ Update chatbot_enabled
  │     │     └─ Save to DB
  │     │
  │     └─→ Response: Success Toast
  │
  ├─→ User Returns to Dashboard
  │     │
  │     └─→ Settings Saved ✓
  │
  ├─→ User Sends WhatsApp Message
  │     │
  │     ├─→ Message: "expense 50000 coffee"
  │     ├─→ From: 628123456789
  │     │
  │     ├─→ Baileys Receives Message
  │     ├─→ Extract Phone Number
  │     ├─→ Query Database:
  │     │     ├─ Find User with phone_number: "628123456789"
  │     │     ├─ Check chatbot_enabled: true ✓
  │     │     └─ Return User ID
  │     │
  │     ├─→ Validate Message Format
  │     │     ├─ Type: "expense"
  │     │     ├─ Amount: 50000
  │     │     └─ Description: "coffee"
  │     │
  │     ├─→ Create Transaction
  │     │     ├─ user: [User ID]
  │     │     ├─ type: "expense"
  │     │     ├─ amount: 50000
  │     │     └─ description: "coffee"
  │     │
  │     ├─→ Send Response to WhatsApp
  │     │     └─ "✅ Expense recorded - Rp 50.000 - coffee"
  │     │
  │     └─→ Transaction Saved ✓
  │
  ├─→ User Views Dashboard
  │     │
  │     ├─→ Refresh Transactions
  │     ├─→ See New Entry: "coffee - Rp 50.000"
  │     └─→ Success! ✓
  │
  END
```

---

## 🎯 Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard (index.vue)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Header Component                                       │ │
│  │ ┌──────────────────────────┐    ┌──────────────────┐  │ │
│  │ │ FTracker Logo            │    │ ⚙️ Settings      │  │ │
│  │ │ (Link to /)              │    │ Button (Link to  │  │ │
│  │ │                          │    │ /settings)       │  │ │
│  │ └──────────────────────────┘    └────────┬─────────┘  │ │
│  │                                           │             │ │
│  │                                           ↓             │ │
│  │                          ┌────────────────────────────┐│ │
│  │                          │  /settings Page            ││ │
│  │                          │                            ││ │
│  │                          │  ┌──────────────────────┐  ││ │
│  │                          │  │ Settings Layout      │  ││ │
│  │                          │  │ ┌────────────────────┤  ││ │
│  │                          │  │ │ Sidebar Nav        │  ││ │
│  │                          │  │ │ - WhatsApp Integ.  │  ││ │
│  │                          │  │ │ - Account          │  ││ │
│  │                          │  │ └────────────────────┤  ││ │
│  │                          │  │ ┌────────────────────┐  ││ │
│  │                          │  │ │ Main Content       │  ││ │
│  │                          │  │ │                    │  ││ │
│  │                          │  │ │ WhatsApp Component │  ││ │
│  │                          │  │ │ - Phone Input      │  ││ │
│  │                          │  │ │ - Save Button      │  ││ │
│  │                          │  │ │ - Chatbot Toggle   │  ││ │
│  │                          │  │ │ - Instructions     │  ││ │
│  │                          │  └────────────────────────┘  ││ │
│  │                          └───────────────────────────────┘│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
User Input
    │
    ├─→ [Phone Number Input]
    │     │
    │     ├─→ Real-time Formatting
    │     │     input: "+62 812-3456-789"
    │     │     output: "+62 812-3456-789" (display)
    │     │
    │     └─→ Validation
    │           └─→ Must be numeric, start with 62, length 10-15
    │
    ├─→ [Save Button Click]
    │     │
    │     └─→ POST /api/user/phone
    │           │
    │           ├─→ Backend Validation
    │           │     ├─ JWT Validation
    │           │     ├─ Phone Normalization
    │           │     │   "+62 812-3456-789" → "628123456789"
    │           │     └─ Format Validation
    │           │
    │           └─→ Database Update
    │                 └─ Users.findByIdAndUpdate()
    │
    ├─→ [Chatbot Toggle Click]
    │     │
    │     └─→ PATCH /api/user/chatbot
    │           │
    │           ├─→ Backend Validation
    │           │     ├─ JWT Validation
    │           │     ├─ Phone Check (exists?)
    │           │     └─ Toggle Flag
    │           │
    │           └─→ Database Update
    │                 └─ Users.findByIdAndUpdate()
    │
    └─→ [Component Reload]
          │
          └─→ GET /api/user/settings
                │
                ├─→ Backend Query
                │     └─ Users.findById()
                │
                └─→ Component State Update
                      ├─ phoneNumber
                      └─ chatbotEnabled
```

---

## 🔐 Security Flow

```
Request Arrives
    │
    ├─→ Extract JWT from Cookie
    │     if (!jwt) return 401 Unauthorized
    │
    ├─→ Verify JWT Signature
    │     if (invalid) return 401 Unauthorized
    │
    ├─→ Get Session from Redis
    │     const userData = redis.get(jwt)
    │     if (!userData) return 401 Session Expired
    │
    ├─→ Extract User ID
    │     const user = JSON.parse(userData)
    │     const userId = user.id
    │
    ├─→ Validate Request Body
    │     - Phone format validation
    │     - Boolean type checking
    │     - Required fields checking
    │
    ├─→ Query Database with User ID
    │     - Ensure user owns the data
    │     - Prevent cross-user access
    │
    ├─→ Update/Create Record
    │     - Only for authenticated user
    │     - Linked to user ID
    │
    └─→ Return Response
          - Success message
          - Updated data
          - Proper status code
```

---

**Integration Architecture Complete! ✅**

This diagram shows how all components connect together to create a seamless WhatsApp integration experience.

