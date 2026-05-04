export const useOnline = () => {
  const isOnline = ref<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  if (process.client) {
    // Listen for online/offline events
    const handleOnline = () => {
      isOnline.value = true;
      console.log('📡 App is online');
    };

    const handleOffline = () => {
      isOnline.value = false;
      console.log('📡 App is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check (every 10 seconds)
    const checkInterval = setInterval(() => {
      const actualOnline = navigator.onLine;
      if (actualOnline !== isOnline.value) {
        isOnline.value = actualOnline;
      }
    }, 10000);

    onUnmounted(() => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkInterval);
    });
  }

  return {
    isOnline,
  };
};
