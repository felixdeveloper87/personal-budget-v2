import { useMemo, useState } from 'react'
import { Box, Button, Collapse, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import type { PaymentMethod } from '../../../types'
import type { CardStatement, StatementStatus } from '../../../utils/creditCardStatements'
import { CalendarCheck, ChevronDown, Clock, Lock, Settings } from '../../../components/ui/icons'
import MerchantLogo from '../../../components/ui/MerchantLogo'
import { useI18n } from '../../../i18n'
import { NuInfoRow as InfoRow, NuQuickAction as QuickAction, NuSection } from '../../dashboard/components/nu'
import Segmented from '../../dashboard/components/Segmented'
import CardAvatar from './CardAvatar'

const HISTORY_PAGE = 8
/** Usage at which the limit bar and hero warn the user. */
export const CARD_LIMIT_WARNING_PCT = 90

type StatementTab = 'current' | 'previous'

const STATUS_STYLE: Record<StatementStatus, { icon: typeof Lock; color: string; bg: string }> = {
  open: { icon: Clock, color: 'var(--nu-brand)', bg: 'var(--nu-brand-tint)' },
  closed: { icon: Lock, color: 'var(--pb-ink)', bg: 'var(--nu-surface)' },
  upcoming: { icon: CalendarCheck, color: 'var(--pb-ink-soft)', bg: 'var(--nu-surface)' },
}

interface CardDetailProps {
  card: PaymentMethod
  statements: CardStatement[]
  /** Sum of every statement not yet paid — what currently consumes the limit. */
  outstanding: number
  hideValues: boolean
  /** Statement (`CardStatement.key`) to show expanded on arrival, e.g. from the payments page. */
  initialStatementKey?: string | null
  onSettings: () => void
}

/** Body of the card page's white sheet — the current statement itself lives in the purple hero. */
export default function CardDetail({ card, statements, outstanding, hideValues, initialStatementKey = null, onSettings }: CardDetailProps) {
  const { t, formatCurrency, formatDate } = useI18n()
  const mask = (value: number) => (hideValues ? '••••••' : formatCurrency(value))
  const fullDate = (value: string) => formatDate(value, { day: '2-digit', month: 'long', year: 'numeric' })

  const { current, previous } = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    return {
      current: statements
        .filter((statement) => statement.paymentDate.getTime() >= today)
        .sort((a, b) => a.paymentDate.getTime() - b.paymentDate.getTime()),
      previous: statements
        .filter((statement) => statement.paymentDate.getTime() < today)
        .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime()),
    }
  }, [statements])

  const initialPreviousIndex = initialStatementKey
    ? previous.findIndex((statement) => statement.key === initialStatementKey)
    : -1
  const [tab, setTab] = useState<StatementTab>(initialPreviousIndex >= 0 ? 'previous' : 'current')
  const [historyLimit, setHistoryLimit] = useState(Math.max(HISTORY_PAGE, initialPreviousIndex + 1))
  const [openKey, setOpenKey] = useState<string | null>(
    initialStatementKey ?? current.find((statement) => statement.status === 'open')?.key ?? null,
  )

  const limit = card.creditLimit ?? 0
  const hasLimit = limit > 0
  const usage = hasLimit ? Math.min(100, Math.max(0, (outstanding / limit) * 100)) : 0
  const limitDanger = usage >= CARD_LIMIT_WARNING_PCT
  const available = Math.max(0, limit - outstanding)

  const items = tab === 'current' ? current : previous.slice(0, historyLimit)
  const total = tab === 'current' ? current.length : previous.length
  const dayLabel = (day?: number | null) => (day ? t('cards.detail.info.day', { day }) : '—')

  return (
    <Box>
      {/* Identity + round shortcuts */}
      <Box px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
        <Flex align="center" gap={3}>
          <CardAvatar card={card} size={44} />
          <Box minW={0} flex={1}>
            <Text fontSize="md" fontWeight={700} color="var(--pb-ink)" noOfLines={1}>{card.name}</Text>
            <Text mt="2px" fontSize="sm" color="var(--pb-ink-soft)" noOfLines={1}>
              {card.issuer || t('cards.creditCard')} · {t('cards.creditCard')}
            </Text>
          </Box>
        </Flex>
        <HStack mt={5} spacing={5} align="flex-start">
          <QuickAction icon={<Icon as={Settings} boxSize="20px" />} label={t('cards.detail.configure')} onClick={onSettings} />
        </HStack>
      </Box>

      {hasLimit && (
        <NuSection
          title={t('cards.detail.limit.title')}
          subtitle={t('cards.detail.limit.subtitle', { amount: mask(limit) })}
          action={(
            <Text
              flexShrink={0} px={3} py={1} borderRadius="full"
              bg={limitDanger ? 'var(--nu-negative-tint)' : 'var(--nu-brand-tint)'}
              color={limitDanger ? 'var(--nu-negative)' : 'var(--nu-brand)'}
              fontSize="sm" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {hideValues ? '••' : `${Math.round(usage)}%`}
            </Text>
          )}
        >
          <Box h="6px" borderRadius="full" bg="var(--nu-track)" overflow="hidden" maxW="560px">
            <Box h="full" w={`${hideValues ? 0 : usage}%`} borderRadius="full" bg={limitDanger ? 'var(--nu-negative)' : 'var(--nu-brand)'} transition="width .4s ease" />
          </Box>
          <Flex mt={2} justify="space-between" maxW="560px" fontSize="sm" color="var(--pb-ink-soft)">
            <Text>{t('cards.detail.limit.used', { amount: mask(outstanding) })}</Text>
            <Text>{t('cards.detail.limit.available', { amount: mask(available) })}</Text>
          </Flex>
        </NuSection>
      )}

      <NuSection title={t('cards.detail.info.title')}>
        <Box display="grid" gridTemplateColumns={{ base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }} columnGap={10}>
          <InfoRow label={t('cards.detail.info.issuer')} value={card.issuer || t('cards.creditCard')} />
          <InfoRow label={t('cards.detail.info.status')} value={card.active ? t('cards.detail.info.active') : t('cards.inactive')} />
          <InfoRow label={t('cards.detail.info.closingDay')} value={dayLabel(card.statementClosingDay)} />
          <InfoRow label={t('cards.detail.info.paymentDay')} value={dayLabel(card.paymentDay)} />
          <InfoRow label={t('cards.creditLimit')} value={hasLimit ? mask(limit) : t('cards.notRecorded')} />
          <InfoRow label={t('cards.detail.info.settlement')} value={card.settlementAccountName || t('cards.form.noAccountLinked')} />
          {card.createdAt && <InfoRow label={t('cards.detail.info.created')} value={fullDate(card.createdAt)} />}
        </Box>
      </NuSection>

      <NuSection
        title={t('cards.detail.statements.title')}
        subtitle={t('cards.detail.statements.caption')}
        action={(
          <Text
            flexShrink={0} minW="32px" textAlign="center" px={3} py={1} borderRadius="full" bg="var(--nu-brand-tint)" color="var(--nu-brand)"
            fontSize="sm" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {total}
          </Text>
        )}
      >
        <Segmented
          options={[
            { value: 'current', label: t('cards.detail.tab.current') },
            { value: 'previous', label: t('cards.detail.tab.previous') },
          ]}
          value={tab}
          onChange={setTab}
          mobileFullWidth
          aria-label={t('cards.detail.tabsAria')}
        />

        <Box mt={2} minH="96px">
          {items.length === 0 ? (
            <Box mt={2} bg="var(--nu-surface)" borderRadius="16px" p={6} textAlign="center">
              <Text fontSize="sm" color="var(--pb-ink-soft)">
                {tab === 'current' ? t('cards.detail.empty.current') : t('cards.detail.empty.previous')}
              </Text>
            </Box>
          ) : (
            items.map((statement) => (
              <StatementRow
                key={statement.key}
                statement={statement}
                expanded={openKey === statement.key}
                onToggle={() => setOpenKey((key) => (key === statement.key ? null : statement.key))}
                hideValues={hideValues}
              />
            ))
          )}
        </Box>

        {tab === 'previous' && previous.length > historyLimit && (
          <Flex mt={4} justify="center">
            <Button
              size="sm"
              variant="ghost"
              borderRadius="full"
              color="var(--nu-brand, #820ad1)"
              bg="var(--nu-brand-tint, #f3e8fc)"
              _hover={{ bg: '#ead6fa' }}
              onClick={() => setHistoryLimit((value) => value + HISTORY_PAGE)}
            >
              {t('cards.statements.more', { count: previous.length - historyLimit })}
            </Button>
          </Flex>
        )}
      </NuSection>
    </Box>
  )
}

/** One statement: status circle · month + due date · total, expanding into its purchases. */
function StatementRow({ statement, expanded, onToggle, hideValues }: { statement: CardStatement; expanded: boolean; onToggle: () => void; hideValues: boolean }) {
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()
  const style = STATUS_STYLE[statement.status]
  const value = (amount: number) => (hideValues ? '••••••' : formatCurrency(amount))
  const panelId = `statement-${statement.key}`

  return (
    <Box borderBottom="1px solid var(--pb-hair)" _last={{ borderBottom: 'none' }}>
      <Flex
        as="button"
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        align="center"
        gap={3}
        w="full"
        minH="68px"
        py={3}
        textAlign="left"
        transition="background-color .15s ease"
        _hover={{ bg: 'rgba(130,10,209,.025)' }}
        _focusVisible={{ outline: 'none', boxShadow: 'inset 3px 0 0 var(--nu-brand, #820ad1)' }}
      >
        <Flex flexShrink={0} w="40px" h="40px" align="center" justify="center" borderRadius="full" color={style.color} bg={style.bg}>
          <Icon as={style.icon} boxSize="16px" />
        </Flex>

        <Box minW={0} flex={1}>
          <Text fontSize="15px" fontWeight={600} color="var(--pb-ink)" noOfLines={1} textTransform="capitalize">
            {formatDate(statement.closingDate, { month: 'long', year: 'numeric' })}
          </Text>
          <Text mt="2px" fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
            {t('cards.dueDate', { date: formatDate(statement.paymentDate, { day: 'numeric', month: 'short', year: 'numeric' }) })}
            {' · '}
            {t(statement.transactions.length === 1 ? 'cards.transactionCount.one' : 'cards.transactionCount.other', { count: statement.transactions.length })}
          </Text>
        </Box>

        <Flex direction="column" align="flex-end" gap={1} flexShrink={0}>
          <Text fontSize="15px" fontWeight={700} color="var(--pb-ink)" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {value(statement.total)}
          </Text>
          <Text px={2} py="1px" borderRadius="full" bg={style.bg} color={style.color} fontSize="10px" fontWeight={600}>
            {t(`cards.statementStatus.${statement.status}`)}
          </Text>
        </Flex>

        <Icon
          as={ChevronDown}
          boxSize="16px"
          color="var(--nu-brand, #820ad1)"
          flexShrink={0}
          transform={expanded ? 'rotate(180deg)' : undefined}
          transition="transform .2s ease"
        />
      </Flex>

      <Collapse in={expanded} animateOpacity>
        <Box id={panelId} mb={3} px={4} py={2} bg="var(--nu-surface)" borderRadius="16px">
          <Text py={2} fontSize="xs" color="var(--pb-ink-soft)">
            {t('cards.statementCycle')}:{' '}
            {formatDate(statement.periodStart, { day: 'numeric', month: 'short' })} – {formatDate(statement.closingDate, { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
          {statement.transactions.length === 0 ? (
            <Text py={3} fontSize="sm" color="var(--pb-ink-soft)">{t('cards.empty.noCharges')}</Text>
          ) : (
            statement.transactions.map((transaction, index) => (
              <Flex key={transaction.id ?? `${statement.key}-${index}`} align="center" gap={3} py={2.5} borderTop="1px solid var(--pb-hair)">
                <MerchantLogo
                  domain={transaction.merchantDomain}
                  name={transaction.merchantName || transaction.description}
                  size={32}
                  fallbackMode="none"
                />
                <Box minW={0} flex={1}>
                  <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{transaction.description}</Text>
                  <Text fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
                    {formatDate((transaction.transactionDate ?? transaction.paymentDate ?? transaction.dateTime).slice(0, 10), { day: 'numeric', month: 'short' })}
                    {' · '}
                    {categoryLabel(transaction.category)}
                  </Text>
                </Box>
                <Text flexShrink={0} fontSize="sm" fontWeight={600} color="var(--pb-ink)" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {value(transaction.amount)}
                </Text>
              </Flex>
            ))
          )}
          <Flex justify="space-between" py={2.5} borderTop="1px solid var(--pb-hair)" fontSize="sm" fontWeight={700} color="var(--pb-ink)">
            <Text>{t('cards.statements.total')}</Text>
            <Text sx={{ fontVariantNumeric: 'tabular-nums' }}>{value(statement.total)}</Text>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  )
}
