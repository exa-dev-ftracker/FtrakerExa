import { crashReporter } from '~/utils/crashReporter';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const lokiUrl =
    (config.public?.lokiUrl as string) ||
    'https://loki.eka-dev.cloud/loki/api/v1/push';

  // Initialize crash reporter on browser
  crashReporter.initialize({
    lokiUrl,
    appName: 'f-tracker-web',
  });

  // 1. Vue Framework Error Handler (Equivalent to Flutter Fatal Error)
  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    // Keep local console logging in dev mode
    console.error('🔥 [Vue Error]:', err, info);

    crashReporter.recordVueError(err, instance, info);
  };

  // 2. Uncaught Window Errors
  window.addEventListener('error', (event) => {
    // Ignore cross-origin script errors or empty errors
    if (!event.error && !event.message) return;

    crashReporter.recordError(event.error || new Error(event.message), {
      reason: `Uncaught window error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
      fatal: true,
      tag: 'WINDOW_ERROR',
      customData: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });

  // 3. Unhandled Promise Rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const errorObj = reason instanceof Error ? reason : new Error(String(reason));

    crashReporter.recordError(errorObj, {
      reason: 'Unhandled Promise Rejection',
      fatal: false,
      tag: 'UNHANDLED_REJECTION',
    });
  });

  return {
    provide: {
      crashReporter,
    },
  };
});
