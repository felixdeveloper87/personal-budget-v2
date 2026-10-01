import { SimpleGrid } from '@chakra-ui/react'
import type { FinancialAccount } from '../../../types'
import AccountCard from './AccountCard'

interface AccountListProps {
  accounts: FinancialAccount[]
  hideBalances: boolean
  onSelect: (id: number) => void
}

export default function AccountList({
  accounts,
  hideBalances,
  onSelect,
}: AccountListProps) {
  return (
    <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} spacing={{ base: 2.5, md: 4 }}>
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          hideBalances={hideBalances}
          onSelect={() => onSelect(account.id)}
        />
      ))}
    </SimpleGrid>
  )
}
