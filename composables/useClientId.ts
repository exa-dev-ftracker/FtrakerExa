let _clientId: string | null = null

export function getClientId(): string {
  if (!_clientId) {
    _clientId = crypto.randomUUID()
  }
  return _clientId
}
