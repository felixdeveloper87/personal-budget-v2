import { useCallback, useEffect, useState } from 'react'
import { sendTestPush } from '../api'
import { disablePush, enablePush, getPushState, type PushState } from '../services/push'
import { ToastService } from '../services/toast'
import { translateNow } from '../i18n'

/** State and actions for this device's push notifications. */
export function usePushNotifications(active: boolean) {
  const [state, setState] = useState<PushState | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!active) return
    let cancelled = false
    void getPushState().then((next) => { if (!cancelled) setState(next) })
    return () => { cancelled = true }
  }, [active])

  const setEnabled = useCallback(async (enabled: boolean) => {
    setBusy(true)
    try {
      const next = enabled ? await enablePush() : await disablePush()
      setState(next)
      if (enabled && next === 'on') {
        ToastService.success({ title: translateNow('settings.push.enabledToast') })
      } else if (enabled && next === 'denied') {
        ToastService.warning({
          title: translateNow('settings.push.blockedTitle'),
          description: translateNow('settings.push.blocked'),
        })
      }
    } catch (error) {
      ToastService.apiError(error, { title: translateNow('settings.push.errorTitle') })
      setState(await getPushState())
    } finally {
      setBusy(false)
    }
  }, [])

  const sendTest = useCallback(async () => {
    setBusy(true)
    try {
      await sendTestPush()
      ToastService.info({ title: translateNow('settings.push.testSent') })
    } catch (error) {
      ToastService.apiError(error)
    } finally {
      setBusy(false)
    }
  }, [])

  return { state, busy, setEnabled, sendTest }
}
