import DashboardSection from '../components/DashboardSection'
import { FormCard } from '../components/cards'
import TransactionForm from '../components/TransactionForm'
import { Transaction } from '../types'

interface AddTransactionSectionProps {
  transactions: Transaction[]
  onRefresh: () => void
}

export default function AddTransactionSection({ transactions, onRefresh }: AddTransactionSectionProps) {
  return (
    <DashboardSection title="Add Transaction">
      <FormCard>
        <TransactionForm
          transactions={transactions}
          onCreated={onRefresh}
          onTransactionDeleted={onRefresh}
        />
      </FormCard>
    </DashboardSection>
  )
}
