let refreshing: Promise<boolean> | null = null;

export const useAuthSession = () => {
  const store = useDefaultStore();
  const jwt = useCookie("jwt");

  /**
   * Memastikan sesi valid:
   * 1. Kalau access token (`jwt`) masih ada => lanjut.
   * 2. Kalau habis/hilang => coba refresh dulu lewat refresh_token (httpOnly, 7 hari).
   * 3. Kalau refresh gagal => sesi tidak valid (biar yang manggil yang redirect ke login).
   */
  const restoreSession = async (): Promise<boolean> => {
    if (jwt.value) {
      store.login(jwt.value);
      return true;
    }

    // hindari refresh paralel (bisa bikin refresh token kebuang/revoke semua sesi)
    if (refreshing) return refreshing;

    refreshing = (async () => {
      try {
        // SSR: pakai useRequestFetch agar cookie ikut diteruskan
        const fetchFn = import.meta.server ? useRequestFetch() : $fetch;
        const res: any = await fetchFn("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        const token =
          jwt.value ||
          res?.body?.token ||
          res?.token ||
          res?.data?.body?.token ||
          res?.data?.token;

        if (token) {
          store.login(token);
          return true;
        }
      } catch (err) {
        // refresh gagal (refresh token invalid/expired) -> sesi tidak valid
        console.error("Session refresh failed:", err);
      } finally {
        refreshing = null;
      }
      return false;
    })();

    return refreshing;
  };

  return { restoreSession };
};