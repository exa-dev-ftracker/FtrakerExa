import { ref } from "vue";

export const useAppleSignIn = () => {
  const router = useRouter();
  const config = useRuntimeConfig();
  const toast = useToast();
  const store = useDefaultStore();

  const appleClientId =
    (config.public.appleClientId as string) || "cloud.eka-dev.portfolio";

  const appleSignInError = ref<string | null>(null);
  const isAppleLoading = ref(false);

  const getCurrentOrigin = (): string => {
    if (import.meta.client && typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://eka-dev.cloud";
  };

  const loadAppleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (import.meta.server) return resolve();
      if ((window as any).AppleID) return resolve();

      const existing = document.getElementById("apple-auth-sdk");
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Apple ID SDK"))
        );
        return;
      }

      const script = document.createElement("script");
      script.id = "apple-auth-sdk";
      script.src =
        "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Apple ID SDK"));
      document.head.appendChild(script);
    });
  };

  const initAppleSDK = async () => {
    await loadAppleScript();
    if (typeof window === "undefined" || !(window as any).AppleID) {
      throw new Error("Apple ID SDK is not available");
    }

    const redirectUri = `${getCurrentOrigin()}/`;
    (window as any).AppleID.auth.init({
      clientId: appleClientId,
      scope: "name email",
      redirectURI: redirectUri,
      state: "apple_oauth_state",
      usePopup: true,
    });
  };

  // Sign in or Sign up with Apple (Login & Register pages)
  const signInWithApple = async () => {
    isAppleLoading.value = true;
    appleSignInError.value = null;

    try {
      await initAppleSDK();
      const authResponse = await (window as any).AppleID.auth.signIn();
      const idToken = authResponse?.authorization?.id_token;

      if (!idToken) {
        throw new Error("No identity token received from Apple");
      }

      const clientEmail = authResponse.user?.email || null;
      const clientName = authResponse.user?.name || null;

      const { $axios } = useNuxtApp();
      const res: any = await ($axios as any).post("/api/auth/apple", {
        identityToken: idToken,
        email: clientEmail,
        name: clientName,
      });

      const data = res.data || res;

      if (data.statusCode === 200 || data.statusCode === 201) {
        store.login(data.body.token);
        if (data.body.user) store.setUser(data.body.user);

        toast.add({
          title: data.statusCode === 201 ? "Welcome to FTraker! 🎉" : "Welcome back!",
          description:
            data.statusCode === 201
              ? "Account created with Apple ID."
              : "Logged in successfully with Apple ID.",
          color: "green",
        });

        const targetRoute =
          data.statusCode === 201 ? "/setup-password" : "/dashboard";
        await router.push(targetRoute);
        return true;
      } else {
        throw new Error(data.body?.message || "Apple authentication failed");
      }
    } catch (err: any) {
      if (err?.error === "popup_closed_by_user") {
        return false;
      }
      appleSignInError.value =
        err.response?.data?.body?.message ||
        err.message ||
        "Apple Sign-In failed";
      toast.add({
        title: "Apple Sign-In Failed",
        description: appleSignInError.value,
        color: "red",
      });
      return false;
    } finally {
      isAppleLoading.value = false;
    }
  };

  // Authorize Apple for binding in Settings
  const authorizeAppleForBinding = async (): Promise<{
    identityToken: string;
    email?: string | null;
  } | null> => {
    isAppleLoading.value = true;
    appleSignInError.value = null;

    try {
      await initAppleSDK();
      const authResponse = await (window as any).AppleID.auth.signIn();
      const idToken = authResponse?.authorization?.id_token;

      if (!idToken) {
        throw new Error("No identity token received from Apple");
      }

      const clientEmail = authResponse.user?.email || null;
      return {
        identityToken: idToken,
        email: clientEmail,
      };
    } catch (err: any) {
      if (err?.error === "popup_closed_by_user") {
        return null;
      }
      appleSignInError.value =
        err.message || err.error || "Apple authorization failed";
      toast.add({
        title: "Apple Binding Failed",
        description: appleSignInError.value,
        color: "red",
      });
      return null;
    } finally {
      isAppleLoading.value = false;
    }
  };

  return {
    signInWithApple,
    authorizeAppleForBinding,
    isAppleLoading,
    appleSignInError,
  };
};
