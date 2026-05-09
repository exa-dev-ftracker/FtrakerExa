export default defineNuxtPlugin(async (nuxtApp) => {
  const store = useDefaultStore();
  const tokenCookie = useCookie('jwt');

  // If we have a token but the user is not in store yet
  if (tokenCookie.value && !store.user) {
    try {
      const api = nuxtApp.$axios as any;
      const res = await api.get("/api/users/me");
      if (res.data?.body?.user) {
        store.login(tokenCookie.value);
        store.setUser(res.data.body.user);
      }
    } catch (err) {
      console.error("Auth plugin failed to fetch user:", err);
      // If token is invalid, clear it
      tokenCookie.value = null;
      store.logout();
    }
  }
});
