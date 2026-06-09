import { useState, useCallback } from 'react'
import { PeriodType } from '../types'

export function usePeriodNavigator(initialTab: 'expenses' | 'incomes' = 'expenses') {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month')
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes'>(initialTab)

  const onDateChange = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const onPeriodChange = useCallback((period: PeriodType) => {
    setSelectedPeriod(period)
  }, [])

  const navigatePeriod = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    const offset = direction === 'next' ? 1 : -1

    switch (selectedPeriod) {
      case 'day':
        newDate.setDate(selectedDate.getDate() + offset)
        break
      case 'week':
        newDate.setDate(selectedDate.getDate() + offset * 7)
        break
      case 'month':
        newDate.setMonth(selectedDate.getMonth() + offset)
        break
      case 'year':
        newDate.setFullYear(selectedDate.getFullYear() + offset)
        break
    }

    setSelectedDate(newDate)
  }, [selectedDate, selectedPeriod])

  const goToToday = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

  const formatLabel = useCallback(() => {
    if (selectedPeriod === 'month') {
      return selectedDate.toLocaleString('en-GB', {
        month: 'short',
        year: 'numeric',
      }).toUpperCase()
    }
    if (selectedPeriod === 'day') {
      return selectedDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }
    if (selectedPeriod === 'week') {
      const start = new Date(selectedDate)
      const day = start.getDay()
      const diff = start.getDate() - day + (day === 0 ? -6 : 1)
      start.setDate(diff)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      const fmt = (d: Date) =>
        d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
      return `${fmt(start)} - ${fmt(end)}`
    }
    if (selectedPeriod === 'year') {
      return selectedDate.getFullYear().toString()
    }
    return 'Unknown Period'
  }, [selectedPeriod, selectedDate])

  return {
    selectedDate,
    selectedPeriod,
    activeTab,
    setActiveTab,
    onDateChange,
    onPeriodChange,
    navigatePeriod,
    goToToday,
    formatLabel,
  }
}
