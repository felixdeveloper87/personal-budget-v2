/** Client-side JWT exp check (no signature verification — backend remains source of truth). */
export function isJwtExpired(token: string): boolean {
  if (!token) return true
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(payloadJson) as { exp?: number }
    if (typeof payload.exp !== 'number') return false
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

/** Dispatched after clearing storage on API 401 so AuthProvider clears React state without a reload. */
export const AUTH_SESSION_INVALID_EVENT = 'auth:session-invalid'