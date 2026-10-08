import { Text } from '@chakra-ui/react'
import { useI18n } from '../../i18n'
import type { HouseholdDebt, HouseholdMember } from '../../types'
import { NewsTicker } from './components/NewsTicker'

/** Debtor in purple, the people they owe in light red. */
const DEBTOR_COLOR = '#820ad1'
const CREDITOR_COLOR = '#e25555'

/**
 * CNN-style headline bar, one headline per member: "Priscila owes Vinicius,
 * Vagner and Leandro" or "Leandro doesn't owe anyone". Scrolls on a loop; opens the balances.
 */
export function HouseholdDebtTicker({ members, debts, onOpen }: {
  members: HouseholdMember[]
  debts: HouseholdDebt[]
  onOpen: () => void
}) {
  const { t } = useI18n()
  // "A, B and C" (no Intl.ListFormat in this TS lib).
  const list = (names: string[]) => names.length < 2
    ? names.join('')
    : `${names.slice(0, -1).join(', ')} ${t('household.ticker.and')} ${names[names.length - 1]}`
  const items = members.map((member) => {
    const creditors = debts.filter((debt) => debt.fromMemberId === member.id).map((debt) => debt.toMemberName)
    return { name: member.name, creditors: creditors.length ? list(creditors) : null }
  })
  const headlines = items.map(({ name, creditors }) => (
    <Text as="span" whiteSpace="nowrap" fontSize="sm">
      <Text as="b" fontWeight={800} color={DEBTOR_COLOR}>{name}</Text>
      {' '}
      {creditors ? (
        <>
          {t('household.ticker.owesTo')}{' '}
          <Text as="b" fontWeight={800} color={CREDITOR_COLOR}>{creditors}</Text>
        </>
      ) : (
        <Text as="span" color="var(--pb-ink-soft)">{t('household.ticker.owesNobody')}</Text>
      )}
    </Text>
  ))
  const summary = debts.length
    ? items.map(({ name, creditors }) => creditors
      ? `${name} ${t('household.ticker.owesTo')} ${creditors}`
      : `${name} ${t('household.ticker.owesNobody')}`).join('. ')
    : t('household.ticker.allSettled')

  return (
    <NewsTicker
      label={t('household.ticker.label')}
      headlines={debts.length ? headlines : []}
      emptyText={t('household.ticker.allSettled')}
      ariaLabel={`${t('household.ticker.label')}: ${summary}`}
      secondsPerItem={6}
      onClick={onOpen}
    />
  )
}
