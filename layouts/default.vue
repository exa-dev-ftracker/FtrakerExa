<script setup lang="ts">
const store = useDefaultStore();
const router = useRouter();
const cookie = ref<string | null>("");
const { $axios } = useNuxtApp();

const { data: jwtVal } = await useAsyncData("jwt", async () => {
  const jwt = useCookie("jwt");
  if (!jwt.value && !store.isAuth) {
    if (router.currentRoute.value.path !== '/' && !['/login', '/register'].includes(router.currentRoute.value.path)) {
      router.push("/login");
    }
  }
  return jwt.value || store.jwt || null;
});

if (jwtVal.value) {
  store.login(jwtVal.value);
  cookie.value = jwtVal.value;
}

await useAsyncData("user_me", async () => {
  if (cookie.value && !store.user) {
    try {
      const res = await ($axios as any).get("/api/users/me");
      if (res.data?.body?.user) {
        store.setUser(res.data.body.user);
        return res.data.body.user;
      }
    } catch (err) {
      console.error("Failed to fetch user in layout:", err);
      // If token is invalid, clear it
      useCookie("jwt").value = null;
      store.logout();
      if (router.currentRoute.value.path !== '/' && !['/login', '/register'].includes(router.currentRoute.value.path)) {
        router.push("/login");
      }
    }
  }
  return null;
});

const handleLogout = async () => {
  try {
    const res = await ($axios as any).post("/api/auth/logout", {
      token: store.jwt,
    });
    const data = res.data || res;
    if (data.statusCode === 200) {
      store.logout();
      return router.push("/login");
    }
  } catch (err: any) {
    console.error(err);
  }
};
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-[#030712] flex flex-col selection:bg-blue-500/30">
    <Header>
      <template v-if="!store.isAuth">
        <NuxtLink to="/login" v-if="router.currentRoute.value.path !== '/login'">
          <UButton label="Sign In" variant="ghost" color="gray" class="font-black rounded-xl" />
        </NuxtLink>
        <NuxtLink to="/register" v-if="router.currentRoute.value.path !== '/register'">
          <UButton label="Get Started" color="blue" class="font-black rounded-xl px-6 shadow-lg shadow-blue-500/20" />
        </NuxtLink>
      </template>
      <template v-else>
        <UButton @click="handleLogout" icon="i-heroicons-arrow-left-on-rectangle" color="gray" variant="ghost" class="rounded-xl" />
      </template>
    </Header>
    
    <main class="flex-grow">
      <slot />
    </main>

    <PWAInstallPrompt />
    <OfflineBanner />
  </div>
</template>

<style>
body {
  @apply antialiased text-gray-900 dark:text-white;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

::selection {
  background: rgba(59, 130, 246, 0.2);
}
</style>

