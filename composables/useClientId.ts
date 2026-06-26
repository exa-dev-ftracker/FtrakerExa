let _clientId: string | null = null

export function getClientId(): string {
  if (!_clientId) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      _clientId = crypto.randomUUID()
    } else {
      _clientId = Math.random().toString(36).substring(2, 15)
    }
  }
  return _clientId
}
