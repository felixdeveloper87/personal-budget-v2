import DashboardSection from '../components/DashboardSection'
import AllTransactionsCard from '../components/cards/AllTransactionsCard'
import TransactionList from '../components/TransactionList'
import { Transaction } from '../types'

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
  return (
    <DashboardSection title="All Transactions">
      <AllTransactionsCard
        title="All Transactions"
        count={transactions.length}
        filtered={hasFilters}
      >
        <TransactionList
          transactions={transactions}
          onTransactionDeleted={onRefresh}
        />
      </AllTransactionsCard>
    </DashboardSection>
  )
}
