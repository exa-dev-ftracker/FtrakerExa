/**
 * CrashReporterService for Nuxt / Vue Web Client
 * Pure in-memory batching reporter for online web mode with Loki Ingress API
 */

export interface LogPayload {
  message: string;
  tag?: string;
  reason?: string;
  stackTrace?: string;
  fatal?: boolean;
  level?: string;
  timestamp?: string;
  data?: Record<string, any>;
  extra?: Record<string, any>;
  [key: string]: any;
}

export interface HttpErrorPayload {
  method: string;
  path: string;
  statusCode?: number;
  errorMessage?: string;
  responseBody?: any;
  durationMs?: number;
}

export interface LokiQueueEntry {
  timestamp_ns: string;
  level: string;
  tag: string;
  user_id: string;
  platform: string;
  environment: string;
  app: string;
  body: string;
}

const BATCH_FLUSH_INTERVAL_MS = 5000;
const BATCH_MAX_SIZE = 15;
const MAX_IN_MEMORY_QUEUE = 50;
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'authorization',
  'jwt',
  'creditcard',
  'pin',
  'access_token',
  'refresh_token',
];

export class CrashReporterService {
  private static _instance: CrashReporterService | null = null;

  private _lokiUrl: string = 'https://loki.eka-dev.cloud/loki/api/v1/push';
  private _appName: string = 'f-tracker-web';
  private _inMemoryQueue: LokiQueueEntry[] = [];
  private _flushTimer: any = null;
  private _isFlushing: boolean = false;
  private _isInitialized: boolean = false;

  private constructor() {}

  public static get instance(): CrashReporterService {
    if (!CrashReporterService._instance) {
      CrashReporterService._instance = new CrashReporterService();
    }
    return CrashReporterService._instance;
  }

  public get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  public get environment(): string {
    return this.isProduction ? 'production' : 'development';
  }

  public get lokiUrl(): string {
    return this._lokiUrl;
  }

  /**
   * Initialize CrashReporter on browser client
   */
  public initialize(config?: { lokiUrl?: string; appName?: string }) {
    if (!import.meta.client || this._isInitialized) return;

    if (config?.lokiUrl) {
      this._lokiUrl = config.lokiUrl;
    }
    if (config?.appName) {
      this._appName = config.appName;
    }

    this._isInitialized = true;

    // Start periodic background flush
    this._startBatchTimer();

    // Flush pending entries when tab is hidden or closing
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushImmediately();
      }
    });

    window.addEventListener('beforeunload', () => {
      this.flushImmediately();
    });
  }

  /**
   * Record Vue Component Error (equivalent to Flutter Fatal Error)
   */
  public recordVueError(err: unknown, instance?: any, info?: string) {
    const errorObj = err instanceof Error ? err : new Error(String(err));
    const componentName = instance?.$options?.name || instance?.$options?.__name || 'UnknownComponent';

    this.recordError(errorObj, {
      reason: info ? `Vue error in ${componentName} (${info})` : `Vue error in ${componentName}`,
      fatal: true,
      tag: 'VUE_FATAL',
      customData: {
        component: componentName,
        lifecycleHook: info,
      },
    });
  }

  /**
   * Record General Asynchronous or Caught Exceptions
   */
  public recordError(
    error: unknown,
    options?: {
      reason?: string;
      fatal?: boolean;
      tag?: string;
      customData?: Record<string, any>;
    }
  ) {
    const err = error instanceof Error ? error : new Error(String(err));
    const fatal = options?.fatal ?? false;
    const tag = options?.tag ?? 'ERROR';

    const payload: LogPayload = {
      message: err.message || String(err),
      reason: options?.reason || '',
      stackTrace: err.stack || '',
      fatal,
      tag,
      url: import.meta.client ? window.location.href : '',
      userAgent: import.meta.client ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
      data: this._sanitize(options?.customData),
    };

    this._dispatch({
      level: fatal ? 'CRITICAL' : 'ERROR',
      tag,
      body: payload,
      immediate: fatal,
    });
  }

  /**
   * Record Informational / Warning Logs
   */
  public recordLog(
    message: string,
    options?: {
      level?: 'INFO' | 'WARN' | 'DEBUG';
      tag?: string;
      extra?: Record<string, any>;
    }
  ) {
    const level = options?.level || 'INFO';
    const tag = options?.tag || 'APP';

    const payload: LogPayload = {
      message,
      tag,
      level,
      url: import.meta.client ? window.location.href : '',
      timestamp: new Date().toISOString(),
      extra: this._sanitize(options?.extra),
    };

    this._dispatch({
      level,
      tag,
      body: payload,
    });
  }

  /**
   * Record Network & Axios Failures
   */
  public recordHttpError(options: HttpErrorPayload) {
    const { method, path, statusCode, errorMessage, responseBody, durationMs } = options;

    // Prevent recursive loop if error was caused by Loki endpoint itself
    if (path.includes('/loki/api/v1/push')) {
      return;
    }

    const payload: LogPayload = {
      http_method: method.toUpperCase(),
      path,
      status_code: statusCode ?? 0,
      error: errorMessage || '',
      duration_ms: durationMs,
      response: this._sanitize(responseBody),
      url: import.meta.client ? window.location.href : '',
      timestamp: new Date().toISOString(),
    };

    const level = statusCode && statusCode >= 500 ? 'ERROR' : 'WARN';

    this._dispatch({
      level,
      tag: 'HTTP_API',
      body: payload,
    });
  }

  /**
   * Internal Dispatcher: Enqueues entry in memory and flushes periodically
   */
  private _dispatch(opts: {
    level: string;
    tag: string;
    body: LogPayload;
    immediate?: boolean;
  }) {
    if (!import.meta.client) return;

    let userId = 'anonymous';
    try {
      const nuxtApp = useNuxtApp();
      if (nuxtApp?.$pinia) {
        const store = useDefaultStore(nuxtApp.$pinia);
        if (store?.user?.id) {
          userId = String(store.user.id);
        }
      }
    } catch (_) {}

    // Precise timestamp in nanoseconds
    const timestampNs = `${Date.now()}000000`;

    const entry: LokiQueueEntry = {
      timestamp_ns: timestampNs,
      level: opts.level,
      tag: opts.tag,
      user_id: userId,
      platform: 'web',
      environment: this.environment,
      app: this._appName,
      body: JSON.stringify(opts.body),
    };

    // Prevent memory leaks: cap queue size
    if (this._inMemoryQueue.length >= MAX_IN_MEMORY_QUEUE) {
      this._inMemoryQueue.shift(); // Evict oldest
    }

    this._inMemoryQueue.push(entry);

    if (opts.immediate || this._inMemoryQueue.length >= BATCH_MAX_SIZE) {
      this.flushImmediately();
    }
  }

  /**
   * Start batch timer to flush logs periodically
   */
  private _startBatchTimer() {
    if (this._flushTimer) clearInterval(this._flushTimer);
    this._flushTimer = setInterval(() => {
      if (this._inMemoryQueue.length > 0) {
        this.flushImmediately();
      }
    }, BATCH_FLUSH_INTERVAL_MS);
  }

  /**
   * Flush in-memory queue immediately
   */
  public async flushImmediately(): Promise<void> {
    if (this._inMemoryQueue.length === 0 || this._isFlushing) return;

    const entriesToSend = [...this._inMemoryQueue];
    this._inMemoryQueue = [];
    this._isFlushing = true;

    try {
      await this._sendEntries(entriesToSend);
    } catch (e) {
      if (!this.isProduction) {
        console.warn('⚠️ [CrashReporter] Failed to send logs to Loki:', e);
      }
    } finally {
      this._isFlushing = false;
    }
  }

  /**
   * Send entries to Loki Ingress API
   * Formats into Low-Cardinality Loki stream labels
   */
  private async _sendEntries(entries: LokiQueueEntry[]): Promise<void> {
    if (entries.length === 0) return;

    // Safe low-cardinality label stream:
    // Only app, environment, and platform in labels!
    const values: [string, string][] = entries.map((entry) => [
      entry.timestamp_ns,
      entry.body,
    ]);

    const payload = {
      streams: [
        {
          stream: {
            app: this._appName,
            environment: this.environment,
            platform: 'web',
          },
          values,
        },
      ],
    };

    const payloadString = JSON.stringify(payload);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return;
    }

    const response = await fetch(this._lokiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payloadString,
      keepalive: true, // keeps connection alive during page navigation/closing
    });

    if (!response.ok) {
      throw new Error(`Loki push failed with status ${response.status}`);
    }
  }

  /**
   * Recursively redact sensitive keys (password, token, etc.)
   */
  private _sanitize(obj: any, depth = 0): any {
    if (depth > 4 || obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      try {
        const parsed = JSON.parse(obj);
        return this._sanitize(parsed, depth + 1);
      } catch (_) {
        return obj.length > 500 ? `${obj.slice(0, 500)}...[truncated]` : obj;
      }
    }

    if (Array.isArray(obj)) {
      return obj.slice(0, 10).map((item) => this._sanitize(item, depth + 1));
    }

    if (typeof obj === 'object') {
      const sanitized: Record<string, any> = {};
      for (const [key, val] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = SENSITIVE_KEYS.some((s) => lowerKey.includes(s));
        if (isSensitive) {
          sanitized[key] = '***REDACTED***';
        } else {
          sanitized[key] = this._sanitize(val, depth + 1);
        }
      }
      return sanitized;
    }

    return obj;
  }
}

export const crashReporter = CrashReporterService.instance;
