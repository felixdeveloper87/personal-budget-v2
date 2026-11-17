import { useCallback, useEffect, useState } from 'react'
import { applyAccent, currentAccent, type AccentId } from '../accent'

/** The user's accent colour, kept in sync across every component using it. */
export function useAccent() {
  const [accent, setAccentState] = useState<AccentId>(currentAccent)

  useEffect(() => {
    const sync = () => setAccentState(currentAccent())
    window.addEventListener('pb-accent-change', sync)
    return () => window.removeEventListener('pb-accent-change', sync)
  }, [])

  const setAccent = useCallback((id: AccentId) => applyAccent(id), [])

  return { accent, setAccent }
}
