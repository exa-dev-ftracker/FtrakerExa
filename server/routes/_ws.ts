import jwt from "jsonwebtoken";
import { addPeer, removePeer } from "~/server/utils/wsPeerManager";
import logger from "~/server/utils/logger";

export default defineWebSocketHandler({
  async open(peer) {
    const url = new URL(peer.url || "", "http://localhost");
    const token = url.searchParams.get("token");

    if (!token) {
      peer.send(JSON.stringify({ event: "error", data: "No token provided" }));
      peer.close();
      return;
    }

    try {
      const runTimeConfig = useRuntimeConfig();
      const decoded = jwt.verify(token, runTimeConfig.secretJwtKey as string) as { id: string };
      const redisUser = await useNitroApp().redis.get(token);

      if (!redisUser) {
        peer.send(JSON.stringify({ event: "error", data: "Session expired" }));
        peer.close();
        return;
      }

      const userData = JSON.parse(redisUser);
      addPeer(userData.id, peer);
      (peer as any)._userId = userData.id;

      logger.info(`WebSocket connected: user=${userData.id}`);
    } catch (err) {
      peer.send(JSON.stringify({ event: "error", data: "Invalid token" }));
      peer.close();
    }
  },

  async close(peer) {
    const userId = (peer as any)._userId;
    if (userId) {
      removePeer(userId, peer);
      logger.info(`WebSocket disconnected: user=${userId}`);
    }
  },
});
