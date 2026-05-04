# PWA Implementation Guide

FTraker is now configured as a Progressive Web App (PWA). This allows users to install and use the app on their devices with offline support.

## What's Configured

### 1. **Manifest File** (`public/manifest.json`)

- Defines app metadata (name, icons, colors)
- Configures standalone display mode
- Includes maskable icons for adaptive icon support
- Specifies app screenshots

### 2. **Service Worker** (`public/sw.js`)

- Caches static assets for offline access
- Implements network-first strategy for API calls
- Cache-first strategy for assets
- Automatic cache cleanup on updates

### 3. **PWA Plugin** (`plugins/pwa.client.ts`)

- Registers service worker on app load
- Handles install prompt event
- Makes PWA install prompt globally available

### 4. **Install Prompt Component** (`components/PWAInstallPrompt.vue`)

- Shows installation prompt after 3 seconds of user interaction
- Allows users to install app directly from the app
- Responsive and user-friendly UI

### 5. **Updated Metadata** (`nuxt.config.ts`)

- Added viewport, theme color, and apple-specific meta tags
- Linked manifest file
- Configured for mobile compatibility

## Usage

### For Users

1. Open the app in a modern browser (Chrome, Edge, Firefox, Safari on iOS 16.4+)
2. An install prompt will appear after a few seconds of interaction
3. Click "Install" to add the app to their home screen
4. Use it like a native app

### For Development

- The app works offline after first load
- API calls are cached for offline access
- Changes to the service worker will be picked up on next reload

## To Replace Icons

Create icons and save them to `public/`:

- `icon-192x192.png` - App icon (192x192)
- `icon-512x512.png` - App icon (512x512)
- `icon-maskable-192x192.png` - Maskable icon (192x192)
- `icon-maskable-512x512.png` - Maskable icon (512x512)
- `apple-touch-icon.png` - Apple icon (180x180)
- `screenshot-540x720.png` - App screenshot
- `screenshot-1080x1920.png` - App screenshot

Update the paths in `public/manifest.json` if needed.

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 79+
- ✅ Opera 76+
- ✅ Safari 16.4+ (iOS)
- ✅ Samsung Internet 14+

## Features

- 📱 Install to home screen
- 📴 Offline functionality
- 💨 App-like performance
- 🔄 Automatic updates
- 🎨 Custom splash screen
