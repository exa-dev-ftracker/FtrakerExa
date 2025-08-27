export default defineNuxtRouteMiddleware(async (to, from) => {
    const runtimeConfig = useRuntimeConfig();
    const cookie = useCookie("jwt");
    if (!cookie.value) {
        return navigateTo("/login");
    }

    // contoh akses redis (pastikan dijalankan di server)
    if (import.meta.server) {
        const redis = useNitroApp().redis; // ambil dari plugin Nitro
        try {
            if (!redis.isOpen) {
                await redis.connect();
            }
        } catch (err) {
            console.error("Redis error:", err);
            // bisa set fallback, misal tetap biarkan login
        }
    }
});
