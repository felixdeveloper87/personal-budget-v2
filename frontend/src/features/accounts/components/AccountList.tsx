import { Box } from '@chakra-ui/react'
import type { FinancialAccount } from '../../../types'
import AccountCard from './AccountCard'

interface AccountListProps {
  accounts: FinancialAccount[]
  hideBalances: boolean
  onSelect: (id: number) => void
}

export default function AccountList({ accounts, hideBalances, onSelect }: AccountListProps) {
  return (
    <Box borderTop="1px solid var(--pb-hair)" borderBottom="1px solid var(--pb-hair)">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          hideBalances={hideBalances}
          onSelect={() => onSelect(account.id)}
        />
      ))}
    </Box>
  )
}
