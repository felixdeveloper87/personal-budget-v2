import { useEffect, useState } from 'react'
import { getReport } from '../api'
import type { PeriodType, ReportResponse } from '../types'

interface UseReportState {
  report: ReportResponse | null
  isLoading: boolean
  error: unknown
}

/**
 * Fetches a report for a period/date using the existing backend endpoint.
 * Presentation-only: the frontend never recomputes financial figures.
 */
export function useReport(period: PeriodType, date: Date): UseReportState {
  const [state, setState] = useState<UseReportState>({
    report: null,
    isLoading: true,
    error: null,
  })

  // Use the date's epoch as a stable dependency.
  const dateKey = date.getTime()

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    getReport(period, date)
      .then((data) => {
        if (active) setState({ report: data, isLoading: false, error: null })
      })
      .catch((err) => {
        if (active) setState({ report: null, isLoading: false, error: err })
      })

    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, dateKey])

  return state
}
