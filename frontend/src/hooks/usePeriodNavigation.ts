import { useState } from 'react'
import { PeriodType } from '../types'

export const usePeriodNavigation = (
  selectedPeriod: PeriodType,
  selectedDate: Date,
  onDateChange: (date: Date) => void,
  onPeriodChange: (period: PeriodType) => void
) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes'>('expenses')

  const navigatePeriod = (direction: 'prev' | 'next') => {
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

    onDateChange(newDate)
  }

  const goToToday = () => onDateChange(new Date())

  const formatLabel = () => {
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
  }

  return {
    activeTab,
    setActiveTab,
    navigatePeriod,
    goToToday,
    formatLabel,
  }
}
