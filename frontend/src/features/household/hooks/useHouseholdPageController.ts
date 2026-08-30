import { useCallback, useEffect, useRef, useState } from 'react'
import { getHouseholdPage } from '../../../api'
import { useI18n } from '../../../i18n'
import { ToastService } from '../../../services/toast'
import type { HouseholdPageState } from '../../../types'

export type ApplyHouseholdAction = (
  key: string,
  action: () => Promise<HouseholdPageState>,
  success?: string,
) => Promise<boolean>

export function useHouseholdPageController() {
  const { t } = useI18n()
  const translateRef = useRef(t)
  translateRef.current = t
  const [page, setPage] = useState<HouseholdPageState | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadFailed(false)
    try {
      setPage(await getHouseholdPage())
    } catch (error) {
      setLoadFailed(true)
      ToastService.apiError(error, {
        title: translateRef.current('household.load.failedToast'),
        dedupeKey: 'household-load',
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const applyAction: ApplyHouseholdAction = async (key, action, success) => {
    setBusyAction(key)
    try {
      const next = await action()
      setPage(next)
      if (success) {
        ToastService.success({ title: success, dedupeKey: `household:${key}` })
      }
      return true
    } catch (error) {
      ToastService.apiError(error, {
        title: t('household.action.failedToast'),
        dedupeKey: `household:${key}:failed`,
      })
      return false
    } finally {
      setBusyAction(null)
    }
  }

  return {
    page,
    setPage,
    loading,
    loadFailed,
    busyAction,
    load,
    applyAction,
  }
}
