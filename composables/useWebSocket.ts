const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_DELAY = 30000;

export const useWebSocket = () => {
  const store = useDefaultStore();
  const toast = useToast();

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  let isConnected = ref(false);

  function getWsUrl(): string | null {
    const jwt = useCookie("jwt").value;
    if (!jwt) return null;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/_ws?token=${jwt}`;
  }

  function connect() {
    if (!process.client) return;
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

    const url = getWsUrl();
    if (!url) return;

    ws = new WebSocket(url);

    ws.onopen = () => {
      isConnected.value = true;
      reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event && msg.event !== "error") {
          store.triggerRefresh();
          if (msg.event !== "pong") {
            const label = msg.event.replace(/[:.]/g, " ");
            toast.add({
              title: "Updated",
              description: `Data changed: ${label}`,
              color: "blue",
              icon: "i-heroicons-arrow-path",
            });
          }
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      isConnected.value = false;
      scheduleReconnect();
    };

    ws.onerror = () => {
      ws?.close();
    };
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    const store = useDefaultStore();
    if (!store.isAuth) return;

    const delay = Math.min(
      RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
      MAX_RECONNECT_DELAY
    );
    reconnectAttempts++;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      ws.onclose = null;
      ws.close();
      ws = null;
    }
    isConnected.value = false;
    reconnectAttempts = 0;
  }

  onUnmounted(() => {
    disconnect();
  });

  return {
    connect,
    disconnect,
    isConnected,
  };
};
