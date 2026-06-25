const userPeers = new Map<string, Set<any>>();

export function addPeer(userId: string, peer: any) {
  if (!userPeers.has(userId)) {
    userPeers.set(userId, new Set());
  }
  userPeers.get(userId)!.add(peer);
}

export function removePeer(userId: string, peer: any) {
  const peers = userPeers.get(userId);
  if (!peers) return;
  peers.delete(peer);
  if (peers.size === 0) {
    userPeers.delete(userId);
  }
}

export function broadcastToUser(userId: string, event: string, data?: unknown) {
  const peers = userPeers.get(userId);
  if (!peers) return;
  const message = JSON.stringify({ event, data: data || null });
  for (const peer of peers) {
    try {
      peer.send(message);
    } catch {
      peers.delete(peer);
    }
  }
}
