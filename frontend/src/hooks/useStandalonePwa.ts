import { useEffect, useState } from 'react'

interface IOSNavigator extends Navigator {
  standalone?: boolean
}

function isStandalonePwa() {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || (window.navigator as IOSNavigator).standalone === true
}

/** True when the web app is running from an installed PWA window. */
export function useStandalonePwa() {
  const [isStandalone, setIsStandalone] = useState(isStandalonePwa)

  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)')
    const fullscreenQuery = window.matchMedia('(display-mode: fullscreen)')
    const update = () => setIsStandalone(isStandalonePwa())

    standaloneQuery.addEventListener('change', update)
    fullscreenQuery.addEventListener('change', update)

    return () => {
      standaloneQuery.removeEventListener('change', update)
      fullscreenQuery.removeEventListener('change', update)
    }
  }, [])

  return isStandalone
}
