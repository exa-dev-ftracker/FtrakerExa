<script setup lang="ts">
const store = useDefaultStore();
const route = useRoute();

onMounted(() => {
  // Check if mobile or running as PWA (standalone)
  // const isMobile = window.innerWidth <= 768;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                     || (window.navigator as any).standalone 
                     || document.referrer.includes('android-app://');

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
