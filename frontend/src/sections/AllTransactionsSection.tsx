import DashboardSection from './DashboardSection'
import { AllTransactionsCard, TransactionList, TransactionListGrouped } from '../components'
import { Transaction } from '../types'
import { useState } from 'react'

interface AllTransactionsSectionProps {
  transactions: Transaction[]
  hasFilters: boolean
  onRefresh: () => void
}

export default function AllTransactionsSection({
  transactions,
  hasFilters,
  onRefresh,
}: AllTransactionsSectionProps) {
  const [groupByMonth, setGroupByMonth] = useState(false)

  return (
    <DashboardSection title="All Transactions">
      <AllTransactionsCard
        title="All Transactions"
        count={transactions.length}
        filtered={hasFilters}
        groupByMonth={groupByMonth}
        onGroupByMonthChange={setGroupByMonth}
      >
        {groupByMonth ? (
          <TransactionListGrouped
            transactions={transactions}
            onTransactionDeleted={onRefresh}
          />
        ) : (
          <TransactionList
            transactions={transactions}
            onTransactionDeleted={onRefresh}
          />
        )}
      </AllTransactionsCard>
    </DashboardSection>
  )
}
