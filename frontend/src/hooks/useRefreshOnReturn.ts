import { useEffect, useState } from 'react'
import { isStandalone, isUserBusy } from '../utils/pwa'

/** How long the installed app must stay in the background before its data reloads. */
const AWAY_THRESHOLD_MS = 2 * 60 * 1000

/**
 * Installed app only: returns a key that changes when the user comes back after
 * a while. Using it as a React `key` remounts the current page, and every page
 * fetches its data on mount, so the screen is fresh without a full reload.
 * It never fires while a dialog is open or the user is typing.
 */
export function useRefreshOnReturn(): number {
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!isStandalone()) return
    let hiddenAt: number | null = null

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()
        return
      }
      const awayFor = hiddenAt === null ? 0 : Date.now() - hiddenAt
      hiddenAt = null
      if (awayFor < AWAY_THRESHOLD_MS || isUserBusy()) return
      setRefreshKey((key) => key + 1)
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return refreshKey
}
