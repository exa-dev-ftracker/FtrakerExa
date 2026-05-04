export default defineNuxtPlugin(() => {
  if (process.client) {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        }).catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
      });
    }

    // Handle app install prompt
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      console.log('PWA install prompt ready');
    });

    // Make deferredPrompt available globally if needed
    if (typeof window !== 'undefined') {
      (window as any).deferredPrompt = deferredPrompt;
    }

    // Handle online/offline status
    const handleOnline = () => {
      console.log('App came online');
      // You could emit an event or update store here
    };

    const handleOffline = () => {
      console.log('App went offline');
      // You could emit an event or update store here
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }
});
