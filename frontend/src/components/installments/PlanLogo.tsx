import MerchantLogo from '../ui/MerchantLogo'
import { CommitmentLogo } from '../../features/commitments/components/nuCommitments'
import { findMerchantDomain } from '../transactions/TransactionForm/ExpenseQuickAdd'

interface PlanLogoProps {
  /** Plan title — the merchant name picked when the purchase was registered. */
  name: string
  category?: string
  size?: number
}

/** Merchant logo for an installment plan; known brands / banks / initials as fallback. */
export default function PlanLogo({ name, category, size = 42 }: PlanLogoProps) {
  const domain = findMerchantDomain(name)
  if (domain) return <MerchantLogo name={name} category={category} domain={domain} size={size} borderRadius="50%" />
  return <CommitmentLogo name={name} category={category} size={size} />
}
