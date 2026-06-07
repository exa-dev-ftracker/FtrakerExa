<script setup lang="ts">
const store = useDefaultStore();
const route = useRoute();

useSeoMeta({
  title: "FTraker - Finance Tracker",
  titleTemplate: "%s | FTraker",
  ogTitle: "FTraker - Finance Tracker",
  description:
    "Track your expenses, manage your income, and achieve your financial goals with FTraker. Your ultimate personal finance companion.",
  ogDescription:
    "Track your expenses, manage your income, and achieve your financial goals with FTraker. Your ultimate personal finance companion.",
  ogImage: "/android/launchericon-512x512.png",
  ogImageAlt: "FTraker Dashboard Preview",
  ogType: "website",
  ogSiteName: "FTraker",
  ogLocale: "en_US",
  twitterCard: "summary_large_image",
  twitterTitle: "FTraker - Finance Tracker",
  twitterDescription:
    "Track your expenses, manage your income, and achieve your financial goals with FTraker.",
  twitterImage: "/android/launchericon-512x512.png",
  twitterImageAlt: "FTraker Dashboard Preview",
  themeColor: "#ffffff",
  colorScheme: "light dark",
  author: "FTraker Team",
  creator: "FTraker Team",
  publisher: "FTraker Team",
  robots: "index, follow",
  keywords:
    "finance tracker, budget manager, expense tracker, income tracker, personal finance, money management, FTraker",
});

useHead({
  htmlAttrs: {
    lang: "en",
  },
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "FTraker",
        url: "https://ftraker.com",
        description:
          "Track your expenses, manage your income, and achieve your financial goals with FTraker.",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      }),
    },
  ],
});

onMounted(() => {
  // Check if mobile or running as PWA (standalone)
  // const isMobile = window.innerWidth <= 768;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes("android-app://");

  if (isStandalone && route.path === "/") {
    if (store.isAuth) {
      navigateTo("/dashboard");
    } else {
      navigateTo("/login");
    }
  }
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
