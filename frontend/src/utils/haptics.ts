/** Short vibration on Android; a silent no-op where unsupported (iOS, desktop). */
export function haptic(durationMs = 8): void {
  try {
    navigator.vibrate?.(durationMs)
  } catch {
    // Haptics are an enhancement and may be unavailable or disabled.
  }
}
