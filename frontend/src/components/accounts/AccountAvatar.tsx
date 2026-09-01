import type { FinancialAccount } from '../../types'
import { BankLogo, getBankMeta } from '../ui'
import { accountColor, monogram } from '../../features/accounts/data/accountVisual'
import MonogramTile from '../../features/accounts/components/MonogramTile'

interface AccountAvatarProps {
  account: FinancialAccount
  size?: number
}

/** Real bank logo when the institution is recognised; engraved monogram tile otherwise. */
export default function AccountAvatar({ account, size = 44 }: AccountAvatarProps) {
  if (getBankMeta(account.institution)) {
    return <BankLogo issuer={account.institution} size={size} borderRadius="12px" />
  }
  return <MonogramTile label={monogram(account)} color={accountColor(account)} size={size} />
}
