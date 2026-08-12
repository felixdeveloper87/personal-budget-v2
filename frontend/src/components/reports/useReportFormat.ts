import { useMemo } from 'react'
import { useI18n } from '../../i18n'
import type { ReportResponse, ReportTransactionItem } from '../../types'

function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function useReportFormat() {
  const { t, formatCurrency, formatDate, formatNumber, categoryLabel } = useI18n()

  return useMemo(() => {
    const date = (value?: string | null) => value
      ? formatDate(value, { day: '2-digit', month: 'short', year: 'numeric' })
      : '-'

    const dateTime = (value?: string | null) => value
      ? formatDate(value, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-'

    const count = (value: number, key: 'transaction' | 'record' | 'payment') =>
      t(
        `reports.${key}_${value === 1 ? 'one' : 'other'}`,
        { count: formatNumber(value) },
      )

    const accountMovement = (transaction: ReportTransactionItem): string | null => {
      const scheduled =
        transaction.status === 'PLANNED' ||
        transaction.status === 'PENDING' ||
        transaction.paymentDate > localDateKey()
      const method = transaction.paymentMethodName
        ? t(
            scheduled
              ? 'reports.movement.willBePaidWith'
              : 'reports.movement.paidWith',
            { method: transaction.paymentMethodName },
          )
        : null

      if (!transaction.accountName) return method

      const accountKey = transaction.type === 'INCOME'
        ? scheduled
          ? 'reports.movement.incomeScheduled'
          : 'reports.movement.incomePaid'
        : scheduled
          ? 'reports.movement.expenseScheduled'
          : 'reports.movement.expensePaid'
      const accountLabel = t(accountKey, { account: transaction.accountName })
      return method ? `${accountLabel} — ${method}` : accountLabel
    }

    const periodLabel = (report: ReportResponse) => {
      const referenceDate = report.referenceDate || report.startDate
      if (report.period === 'day') {
        return t('reports.period.daily', { date: date(referenceDate) })
      }
      if (report.period === 'week') {
        return t('reports.period.weekly', {
          start: date(report.startDate),
          end: date(report.endDate),
        })
      }
      if (report.period === 'year') {
        return t('reports.period.annual', {
          year: new Date(`${referenceDate}T00:00:00`).getFullYear(),
        })
      }
      return t('reports.period.monthly', {
        month: formatDate(referenceDate, { month: 'long', year: 'numeric' }),
      })
    }

    const insights = (report: ReportResponse): string[] => {
      if (report.transactionCount === 0) return [t('reports.insight.none')]
      const result = [
        report.balance >= 0
          ? t('reports.insight.positive', { amount: formatCurrency(report.balance) })
          : t('reports.insight.negative', { amount: formatCurrency(Math.abs(report.balance)) }),
      ]
      const topCategory = report.expenseCategories[0]
      if (topCategory) {
        result.push(t('reports.insight.category', {
          category: categoryLabel(topCategory.category),
          amount: formatCurrency(topCategory.amount),
          percentage: formatNumber(topCategory.percentage),
        }))
      }
      const topMethod = report.paymentMethods[0]
      if (topMethod) {
        result.push(t('reports.insight.method', {
          method: topMethod.name,
          amount: formatCurrency(topMethod.amount),
          percentage: formatNumber(topMethod.percentage),
        }))
      }
      if (report.installmentExpenseTotal > 0 || report.recurringExpenseTotal > 0) {
        result.push(t('reports.insight.commitments', {
          installments: formatCurrency(report.installmentExpenseTotal),
          recurring: formatCurrency(report.recurringExpenseTotal),
        }))
      }
      return result
    }

    return {
      accountMovement,
      categoryLabel,
      count,
      currency: (value: number) => formatCurrency(Number(value) || 0),
      date,
      dateTime,
      insights,
      number: (value: number) => formatNumber(Number(value) || 0),
      periodLabel,
    }
  }, [categoryLabel, formatCurrency, formatDate, formatNumber, t])
}
