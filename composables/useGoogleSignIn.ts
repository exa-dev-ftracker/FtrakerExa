import { ref } from "vue";

export const useGoogleSignIn = () => {
  const router = useRouter();
  const config = useRuntimeConfig();
  const toast = useToast();
  const store = useDefaultStore();
  const { $axios } = useNuxtApp();

  const googleClientId =
    (config.public.google?.clientId as string) ||
    "897905079551-qu5rj92oq3ck03kbt9ohjkfaacpnn0ea.apps.googleusercontent.com";

  const isGoogleLoading = ref(false);
  const googleError = ref<string | null>(null);

  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (import.meta.server) return resolve();
      if ((window as any).google?.accounts?.oauth2) return resolve();

      const existing = document.getElementById("google-gsi-client");
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Google Identity Services SDK"))
        );
        return;
      }

      const script = document.createElement("script");
      script.id = "google-gsi-client";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Identity Services SDK"));
      document.head.appendChild(script);
    });
  };

  const getCodeClient = async (onCode: (code: string) => Promise<void>) => {
    await loadGoogleScript();
    if (typeof window === "undefined" || !(window as any).google?.accounts?.oauth2) {
      throw new Error("Google Identity Services is not available");
    }

    const client = (window as any).google.accounts.oauth2.initCodeClient({
      client_id: googleClientId,
      scope: "openid email profile",
      ux_mode: "popup",
      callback: async (response: any) => {
        if (response.code) {
          try {
            await onCode(response.code);
          } catch (err: any) {
            isGoogleLoading.value = false;
            console.error("Google OAuth failed:", err);
            googleError.value = err?.message || "Google sign in failed";
          }
        } else {
          isGoogleLoading.value = false;
        }
      },
      error_callback: () => {
        isGoogleLoading.value = false;
      },
    });

    return client;
  };

  // Sign in or Sign up with Google (Login & Register pages)
  const signInWithGoogle = async (isRegister: boolean = false) => {
    isGoogleLoading.value = true;
    googleError.value = null;

    try {
      const client = await getCodeClient(async (code: string) => {
        const res: any = await ($axios as any).post("/api/auth/google", { code });
        const data = res.data || res;

        if (data.statusCode === 200 || data.statusCode === 201) {
          store.login(data.body.token);
          if (data.body.user) store.setUser(data.body.user);
          toast.add({
            title: isRegister ? "Welcome! 🎉" : "Success",
            description: isRegister ? "Account created successfully!" : "Logged in successfully!",
            color: "green",
          });
          return router.push("/dashboard");
        } else {
          throw new Error(data.body?.message || "Google authentication failed");
        }
      });

      client?.requestCode();
    } catch (err: any) {
      isGoogleLoading.value = false;
      googleError.value = err.message || "Failed to initialize Google Sign In";
      toast.add({
        title: "Google Sign In Failed",
        description: googleError.value || "Could not connect to Google",
        color: "red",
      });
    }
  };

  // Authorize Google for account binding in Settings
  const authorizeGoogleForBinding = (): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const client = await getCodeClient(async (code: string) => {
          resolve(code);
        });
        client?.requestCode();
      } catch (err) {
        reject(err);
      }
    });
  };

  return {
    signInWithGoogle,
    authorizeGoogleForBinding,
    isGoogleLoading,
    googleError,
  };
};
