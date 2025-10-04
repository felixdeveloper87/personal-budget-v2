import { useState, useCallback } from 'react'

export type PeriodType = 'day' | 'week' | 'month' | 'year'

export function usePeriodNavigator() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month')

  const onDateChange = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const onPeriodChange = useCallback((period: PeriodType) => {
    setSelectedPeriod(period)
  }, [])

  return {
    selectedDate,
    selectedPeriod,
    onDateChange,
    onPeriodChange,
  }
}
