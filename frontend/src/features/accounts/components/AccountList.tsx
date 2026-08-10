import { VStack } from '@chakra-ui/react'
import type { FinancialAccount } from '../../../types'
import AccountCard from './AccountCard'

interface AccountListProps {
  accounts: FinancialAccount[]
  selectedId: number | null
  hideBalances: boolean
  onSelect: (id: number) => void
  onEdit: (account: FinancialAccount) => void
  onArchive: (account: FinancialAccount) => void
}

export default function AccountList({
  accounts,
  selectedId,
  hideBalances,
  onSelect,
  onEdit,
  onArchive,
}: AccountListProps) {
  return (
    <VStack align="stretch" spacing="0.7rem">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          selected={account.id === selectedId}
          hideBalances={hideBalances}
          onSelect={() => onSelect(account.id)}
          onEdit={() => onEdit(account)}
          onArchive={() => onArchive(account)}
        />
      ))}
    </VStack>
  )
}
