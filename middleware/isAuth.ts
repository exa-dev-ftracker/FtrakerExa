import { useAuthSession } from "~/composables/useAuthSession";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const cookie = useCookie("jwt");

  // access token masih ada => lanjut
  if (cookie.value) {
    return;
  }

  // access token habis/hilang => coba refresh dulu sebelum dinyatakan logout
  const { restoreSession } = useAuthSession();
  const restored = await restoreSession();

  if (!restored) {
    return navigateTo("/login");
  }
});
