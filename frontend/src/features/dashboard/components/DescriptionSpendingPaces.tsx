import type { Transaction } from '../../../types'
import type { TransactionDateBasis } from '../../../utils/transactionDates'
import SpendingPaceCollection from './SpendingPaceCollection'

interface DescriptionSpendingPacesProps {
  transactions: Transaction[]
  selectedDate: Date
  dateBasis: TransactionDateBasis
  userId: number | null
}

export default function DescriptionSpendingPaces(props: DescriptionSpendingPacesProps) {
  return <SpendingPaceCollection {...props} dimension="description" />
}
