import axios, { AxiosError, type AxiosInstance } from "axios";
import { getClientId } from "~/composables/useClientId";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  // ✅ AMAN: dipanggil di dalam plugin
  const headers = import.meta.server ? useRequestHeaders(["cookie"]) : {};

  // Use useCookie for consistent cookie handling (server sets cookie named `jwt`)
  const tokenCookie = useCookie("jwt", {
    maxAge: 900, // 15 minutes
    path: "/",
    sameSite: "strict",
    secure: import.meta.env.PROD,
  });

  // 🔄 AUTO BASEURL - mengikuti parent domain
  let baseURL: string = (config.public?.apiBaseUrl as string) || "/";
  if (import.meta.client && typeof window !== "undefined") {
    // Client-side: gunakan window.location.origin (otomatis ngikutin domain saat ini)
    baseURL = window.location.origin;
  } else if (import.meta.server) {
    // Server-side: gunakan host dari request headers
    const host = useRequestHeaders(["host"]).host || config.public?.apiBaseUrl;
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    baseURL = `${protocol}://${host}`;
  }

  const api: AxiosInstance = axios.create({
    baseURL: baseURL,
    withCredentials: true,
  });

  let isRefreshing = false;
  let refreshPromise: Promise<void> | null = null;

  // =========================
  // REQUEST INTERCEPTOR
  // =========================
  api.interceptors.request.use((config) => {
    // SSR: forward cookie
    if (import.meta.server) {
      config.withCredentials = true;
      if (headers.cookie) {
        config.headers = config.headers || {};
        // Axios expects "Cookie" header to be passed through
        const headersObj = config.headers as any;
        headersObj.Cookie = headers.cookie;
      }
    } else {
      // Client: Authorization + clientId
      const token = tokenCookie.value;
      if (token) {
        config.headers = config.headers || {};
        const headersObj = config.headers as any;
        headersObj.Authorization = `Bearer ${token}`;
        headersObj["x-client-id"] = getClientId();
      }
    }

    return config;
  });

  // =========================
  // RESPONSE INTERCEPTOR
  // =========================
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest: any = error.config;

      if (
        error.response?.status !== 401 ||
        originalRequest?._retry ||
        originalRequest?.url?.includes("/api/auth/refresh")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;

          refreshPromise = api
            .post(
              "/api/auth/refresh",
              {},
              {
                withCredentials: true,
              },
            )
            .then((res) => {
              // adapt to your backend response shape
              tokenCookie.value =
                res.data?.data?.access_token ||
                res.data?.access_token ||
                res.data?.body?.token ||
                tokenCookie.value;
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        await refreshPromise;

        const token = tokenCookie.value;
        if (token) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        // 🔁 retry request asli
        return api(originalRequest);
      } catch (err) {
        if (import.meta.client) {
          const currentPath = window.location.pathname;
          if (
            currentPath !== "/" &&
            !["/login", "/register"].includes(currentPath)
          ) {
            navigateTo("/login");
          }
        }
        return Promise.reject(err);
      }
    },
  );

  return {
    provide: {
      axios: api,
    },
  };
});
