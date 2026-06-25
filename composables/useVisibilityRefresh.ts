const THRESHOLD = 10000;

export const useVisibilityRefresh = () => {
  const store = useDefaultStore();
  let lastHiddenAt = 0;

  if (process.client) {
    function handleVisibility() {
      if (document.hidden) {
        lastHiddenAt = Date.now();
      } else if (lastHiddenAt && Date.now() - lastHiddenAt > THRESHOLD) {
        store.triggerRefresh();
        lastHiddenAt = 0;
      }
    }

    function handleFocus() {
      if (lastHiddenAt && Date.now() - lastHiddenAt > THRESHOLD) {
        store.triggerRefresh();
      }
      lastHiddenAt = 0;
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    onUnmounted(() => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    });
  }
};
