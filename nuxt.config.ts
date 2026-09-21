// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  app: {
    head: {
      title: "FTraker - Finance Tracker",
      htmlAttrs: {
        lang: "id",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Finance Tracker - Track your expenses and income with FTraker",
        },
        { name: "theme-color", content: "#ffffff" },
        { name: "mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        { name: "apple-mobile-web-app-title", content: "FTraker" },
        {
          name: "keywords",
          content:
            "finance tracker, expense tracker, pengatur keuangan, aplikasi keuangan, budget, personal finance, money management, FTraker",
        },
        { name: "author", content: "FTraker" },
      ],
      link: [
        { rel: "manifest", href: "/manifest.json" },
        { rel: "apple-touch-icon", href: "/ios/180.png" },
        { rel: "icon", href: "/favicon.ico" },
      ],
      script: [
        {
          src: "https://accounts.google.com/gsi/client",
          async: true,
          defer: true,
        },
        {
          src: "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js",
          async: true,
          defer: true,
        },
      ],
    },
  },
  googleSignIn: {
    clientId:
      process.env.NUXT_GOOGLE_CLIENT_ID ||
      "897905079551-qu5rj92oq3ck03kbt9ohjkfaacpnn0ea.apps.googleusercontent.com",
  },
  modules: [
    "@pinia/nuxt",
    "@nuxt/ui",
    "nuxt-vue3-google-signin",
    "motion-v/nuxt",
  ],
  motionV: {
    directives: true,
  },
  runtimeConfig: {
    secretJwtKey: process.env.NUXT_SECRETJWT,
    resendApiKey: process.env.RESEND_API_KEY || "",
    REDIS_URL: process.env.NUXT_REDIS_URL,
    MONGODB_URL: process.env.NUXT_MONGODB_URL,
    google: {
      clientId: process.env.NUXT_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
    },
    apple: {
      clientId: process.env.NUXT_APPLE_CLIENT_ID || "cloud.eka-dev.portfolio",
    },
    public: {
      google: {
        clientId: process.env.NUXT_GOOGLE_CLIENT_ID,
      },
      googleSignIn: {
        clientId:
          process.env.NUXT_GOOGLE_CLIENT_ID ||
          "897905079551-qu5rj92oq3ck03kbt9ohjkfaacpnn0ea.apps.googleusercontent.com",
      },
      appleClientId:
        process.env.NUXT_PUBLIC_APPLE_CLIENT_ID ||
        process.env.NUXT_APPLE_CLIENT_ID ||
        "cloud.eka-dev.portfolio",
    },
  },
  nitro: {
    experimental: {
      websocket: true,
    },
    routeRules: {
      "/**": {
        headers: {
          "Origin-Agent-Cluster": "?1",
          "Origin-Opener-Policy": "same-origin",
          "Referrer-Policy": "no-referrer-when-downgrade",
        },
      },
    },
  },
});
