import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, HStack, Icon, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'

import { deletePaymentMethod, listPaymentMethods, listTransactions } from '../../api'
import type { PaymentMethod, Transaction } from '../../types'
import { buildCardStatements } from '../../utils/creditCardStatements'
import { BankLogo, ConfirmDeleteDialog, getBankMeta } from '../../components/ui'
import { ArrowLeft, CreditCard, Eye, EyeOff, Plus } from '../../components/ui/icons'
import CreditCardTile from '../../components/cards/CreditCardTile'
import CardFormModal from '../../components/cards/CardFormModal'
import StatementCard from '../../components/cards/StatementCard'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'

import '../dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../dashboard/components/motion'

const CARD_BALANCE_VISIBILITY_KEY = 'cards:hide-values'

type CardTotal = {
  total: number
  outstanding: number
  count: number
  nextPaymentAmount: number
  nextPaymentDate: Date | null
}

interface CardsPageProps {
  statementTarget?: { cardId: number; paymentDate: string } | null
  onStatementTargetHandled?: () => void
}

const isoDate = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`

export default function CardsPage({ statementTarget = null, onStatementTargetHandled }: CardsPageProps) {
  const { t } = useI18n()
  const [cards, setCards] = useState<PaymentMethod[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [openStatementKey, setOpenStatementKey] = useState<string | null>(null)
  const [formCard, setFormCard] = useState<PaymentMethod | null | undefined>(undefined)
  const [cardToDelete, setCardToDelete] = useState<PaymentMethod | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [hideValues, setHideValues] = useState(() => {
    try {
      return localStorage.getItem(CARD_BALANCE_VISIBILITY_KEY) === 'true'
    } catch {
      return false
    }
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [methods, txs] = await Promise.all([listPaymentMethods(), listTransactions()])
      setCards(methods.filter((method) => method.type === 'CREDIT_CARD'))
      setTransactions(txs)
    } catch (err) {
      ToastService.apiError(err, { title: t('cards.toast.loadFailed'), dedupeKey: 'cards-page-load-failed' })
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (loading || !statementTarget) return

    const card = cards.find((item) => item.id === statementTarget.cardId)
    if (card) {
      const statement = buildCardStatements(card, transactions).find(
        (item) => isoDate(item.paymentDate) === statementTarget.paymentDate,
      )
      setSelectedId(card.id)
      setOpenStatementKey(statement?.key ?? null)
    }
    onStatementTargetHandled?.()
  }, [cards, loading, onStatementTargetHandled, statementTarget, transactions])

  const toggleValues = () => {
    setHideValues((current) => {
      const next = !current
      try {
        localStorage.setItem(CARD_BALANCE_VISIBILITY_KEY, String(next))
      } catch {
        // Keep the preference for this session when storage is unavailable.
      }
      return next
    })
  }

  const selectedCard = useMemo(() => cards.find((card) => card.id === selectedId) ?? null, [cards, selectedId])
  const statements = useMemo(
    () => (selectedCard ? buildCardStatements(selectedCard, transactions) : []),
    [selectedCard, transactions],
  )

  const currentTotals = useMemo(() => {
    const totals = new Map<number, CardTotal>()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    for (const card of cards) {
      const cardStatements = buildCardStatements(card, transactions)
      const current = cardStatements.find((statement) => statement.status === 'open')
      // A statement continues to consume the card limit until its payment date.
      // `status` only describes whether the billing cycle has closed, so a closed
      // statement that is not due yet must still be counted here.
      const outstanding = cardStatements
        .filter((statement) => statement.paymentDate.getTime() >= today.getTime())
        .reduce((sum, statement) => sum + statement.total, 0)
      const next = cardStatements
        .filter((statement) => statement.paymentDate.getTime() >= today.getTime())
        .sort((a, b) => a.paymentDate.getTime() - b.paymentDate.getTime())[0]

      totals.set(card.id, {
        total: current?.total ?? 0,
        outstanding,
        count: cardStatements.length,
        nextPaymentAmount: next?.total ?? 0,
        nextPaymentDate: next?.paymentDate ?? null,
      })
    }
    return totals
  }, [cards, transactions])

  const overview = useMemo(() => {
    const datedPayments = Array.from(currentTotals.values())
      .filter((item) => item.nextPaymentDate !== null)
      .sort((a, b) => a.nextPaymentDate!.getTime() - b.nextPaymentDate!.getTime())

    return {
      used: Array.from(currentTotals.values()).reduce((sum, item) => sum + item.outstanding, 0),
      limit: cards.reduce((sum, card) => sum + Math.max(card.creditLimit ?? 0, 0), 0),
      cardsWithLimit: cards.filter((card) => (card.creditLimit ?? 0) > 0).length,
      nextPayment: datedPayments[0] ?? null,
    }
  }, [cards, currentTotals])

  const selectCard = (id: number) => {
    setSelectedId(id)
    const card = cards.find((item) => item.id === id)
    if (!card) return
    const cardStatements = buildCardStatements(card, transactions)
    const initial = cardStatements.find((statement) => statement.status === 'open') ?? cardStatements[0]
    setOpenStatementKey(initial?.key ?? null)
  }

  const confirmDelete = async () => {
    if (!cardToDelete) return
    setDeleting(true)
    try {
      await deletePaymentMethod(cardToDelete.id)
      ToastService.success({ title: t('cards.toast.deleted'), dedupeKey: `card-deleted:${cardToDelete.id}` })
      if (selectedId === cardToDelete.id) setSelectedId(null)
      setCardToDelete(null)
      await load()
    } catch (err) {
      ToastService.apiError(err, { title: t('cards.toast.deleteFailed'), dedupeKey: `card-delete-failed:${cardToDelete.id}` })
    } finally {
      setDeleting(false)
    }
  }

  const modals = (
    <>
      <CardFormModal isOpen={formCard !== undefined} card={formCard} onClose={() => setFormCard(undefined)} onSaved={load} />
      <ConfirmDeleteDialog
        isOpen={cardToDelete !== null}
        onClose={() => setCardToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title={t('cards.delete.title')}
        itemName={cardToDelete?.name}
        description={t('cards.delete.description')}
      />
    </>
  )

  if (loading) {
    return <CardsShell><Flex justify="center" py={20}><Spinner color="var(--pb-forest-2)" /></Flex></CardsShell>
  }

  if (selectedCard) {
    return (
      <CardsShell>
        <MotionBox variants={containerV} initial="hidden" animate="show">
          <VStack align="stretch" spacing={{ base: 4, md: 5 }}>
            <MotionBox variants={riseV}>
              <Button variant="ghost" size="sm" leftIcon={<Icon as={ArrowLeft} boxSize={4} />} onClick={() => setSelectedId(null)} color="var(--pb-ink-soft)" _hover={{ color: 'var(--pb-ink)', bg: 'var(--pb-surface-2)' }} pl={1}>
                {t('cards.action.all')}
              </Button>
            </MotionBox>

            <MotionBox variants={riseV}><CardFocus card={selectedCard} info={currentTotals.get(selectedCard.id)} hideValues={hideValues} /></MotionBox>
            <MotionBox variants={riseV}>
              <Flex justify="space-between" align="center" gap={3}>
                <SectionLabel>{t('cards.statements')}</SectionLabel>
                <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)">
                  {t('cards.availableCount', { count: statements.length })}
                </Text>
              </Flex>
            </MotionBox>

            {statements.length === 0 ? (
              <MotionBox variants={riseV}><EmptyState text={t('cards.empty.noCharges')} /></MotionBox>
            ) : (
              <MotionBox variants={riseV}>
                <VStack align="stretch" spacing="0.7rem">
                  {statements.map((statement) => (
                    <StatementCard key={statement.key} statement={statement} isOpen={openStatementKey === statement.key} hideValues={hideValues} onToggle={() => setOpenStatementKey((current) => current === statement.key ? null : statement.key)} />
                  ))}
                </VStack>
              </MotionBox>
            )}
          </VStack>
        </MotionBox>
        {modals}
      </CardsShell>
    )
  }

  return (
    <CardsShell>
      <MotionBox variants={containerV} initial="hidden" animate="show">
        <VStack align="stretch" spacing={{ base: 4, md: 5 }}>
          {cards.length === 0 ? (
            <MotionBox variants={riseV}>
              <EmptyState text={t('cards.empty.noCards')} onAdd={() => setFormCard(null)} />
            </MotionBox>
          ) : (
            <>
              <MotionBox variants={riseV}>
                <CardsOverview
                  overview={overview}
                  hideValues={hideValues}
                  onToggleHide={toggleValues}
                  onAddCard={() => setFormCard(null)}
                />
              </MotionBox>
              <MotionBox variants={riseV}>
                <SectionLabel>{t('cards.yourCards')}</SectionLabel>
              </MotionBox>
              <MotionBox variants={riseV}>
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="0.9rem">
                  {cards.map((card) => {
                    const info = currentTotals.get(card.id)
                    return <CreditCardTile key={card.id} card={card} currentTotal={info?.total ?? 0} usedCredit={info?.outstanding ?? 0} statementCount={info?.count ?? 0} nextPaymentAmount={info?.nextPaymentAmount ?? 0} nextPaymentDate={info?.nextPaymentDate ?? null} hideValues={hideValues} onSelect={() => selectCard(card.id)} onEdit={() => setFormCard(card)} onDelete={() => setCardToDelete(card)} />
                  })}
                </SimpleGrid>
              </MotionBox>
            </>
          )}
        </VStack>
      </MotionBox>
      {modals}
    </CardsShell>
  )
}

function CardsShell({ children }: { children: React.ReactNode }) {
  return <Box minH="100vh" w="full" maxW="appContent" mx="auto" px={{ base: 2, md: 4, lg: 6 }} py={{ base: 4, md: 7 }}>{children}</Box>
}

function ActionButton({ label, icon, primary, destructive, onClick }: { label: string; icon: typeof Plus; primary?: boolean; destructive?: boolean; onClick: () => void }) {
  return <Box as="button" type="button" onClick={onClick} flex={{ base: 1, sm: 'initial' }} display="inline-flex" alignItems="center" justifyContent="center" gap="0.45rem" whiteSpace="nowrap" fontSize="0.95rem" fontWeight={500} px="1.05rem" py="0.58rem" borderRadius="14px" transition="0.18s" color={destructive ? 'var(--pb-coral)' : primary ? 'var(--pb-on-accent)' : 'var(--pb-ink-soft)'} bg={primary ? 'var(--pb-forest-2)' : 'var(--pb-surface)'} border="1px solid" borderColor={primary ? 'transparent' : destructive ? 'var(--pb-tint-coral)' : 'var(--pb-hair)'} boxShadow={primary ? 'var(--pb-shadow)' : '0 1px 2px rgba(20,48,34,.05)'} _hover={{ transform: 'translateY(-1px)', bg: primary ? 'var(--pb-forest)' : destructive ? 'var(--pb-tint-coral)' : 'var(--pb-surface-2)', color: primary ? 'var(--pb-on-accent)' : destructive ? 'var(--pb-coral)' : 'var(--pb-ink)' }}><Icon as={icon} boxSize="1.08em" />{label}</Box>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)" pl="0.15rem">{children}</Text>
}

function EmptyState({ text, onAdd }: { text: string; onAdd?: () => void }) {
  const { t } = useI18n()
  return <Flex direction="column" align="center" py={14} px={6} textAlign="center" bg="var(--pb-surface)" border="1px dashed var(--pb-hair-2)" borderRadius="22px"><Flex w={14} h={14} align="center" justify="center" borderRadius="2xl" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" mb={3}><Icon as={CreditCard} boxSize={7} color="var(--pb-ink-faint)" weight="duotone" /></Flex><Text fontSize="md" fontWeight={500} color="var(--pb-ink)">{t('cards.empty.title')}</Text><Text fontSize="sm" color="var(--pb-ink-soft)" mt={1} maxW="390px">{text}</Text>{onAdd && <Box mt={5}><ActionButton label={t('cards.action.add')} icon={Plus} primary onClick={onAdd} /></Box>}</Flex>
}

function Metric({ label, value, note, emphasis, summary }: { label: string; value: string; note?: string; emphasis?: boolean; summary?: boolean }) {
  return (
    <Box minW={0}>
      <Text
        fontFamily="var(--pb-mono)"
        fontSize={summary ? '8.5px' : '10px'}
        letterSpacing="0.14em"
        textTransform="uppercase"
        color={summary ? 'var(--pb-summary-ink-faint)' : 'var(--pb-ink-faint)'}
        noOfLines={1}
      >
        {label}
      </Text>
      <Text
        className="num"
        fontSize={summary
          ? emphasis ? { base: '1.5rem', md: '1.8rem' } : { base: '1.15rem', md: '1.35rem' }
          : emphasis ? { base: '2rem', md: '2.3rem' } : '1.45rem'}
        fontWeight={500}
        lineHeight="1.1"
        letterSpacing="-0.025em"
        color={summary ? 'var(--pb-summary-ink)' : 'var(--pb-ink)'}
        mt="0.35rem"
        noOfLines={summary ? 1 : undefined}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </Text>
      {note && (
        <Text
          fontSize={summary ? '10px' : 'xs'}
          color={summary ? 'var(--pb-summary-ink-soft)' : 'var(--pb-ink-soft)'}
          mt="0.35rem"
          noOfLines={summary ? 2 : undefined}
        >
          {note}
        </Text>
      )}
    </Box>
  )
}

function CardsOverview({
  overview,
  hideValues,
  onToggleHide,
  onAddCard,
}: {
  overview: { used: number; limit: number; cardsWithLimit: number; nextPayment: CardTotal | null }
  hideValues: boolean
  onToggleHide: () => void
  onAddCard: () => void
}) {
  const { t, formatCurrency, formatDate } = useI18n()
  const available = Math.max(overview.limit - overview.used, 0)
  const utilisation = overview.limit > 0 ? Math.min(100, (overview.used / overview.limit) * 100) : 0
  return (
    <Box
      position="relative"
      overflow="hidden"
      bg="var(--pb-summary-petrol)"
      border="1px solid var(--pb-summary-line)"
      borderRadius="22px"
      boxShadow="var(--pb-shadow)"
      p={{ base: 3.5, sm: 'clamp(1.1rem, 2.4vw, 1.45rem)' }}
    >
      <Box position="absolute" inset={0} borderRadius="inherit" pointerEvents="none" boxShadow="inset 0 1px 0 rgba(255,255,255,.16)" />
      <Flex
        position="relative"
        zIndex={1}
        direction={{ base: 'column', sm: 'row' }}
        align={{ base: 'flex-start', sm: 'center' }}
        justify="space-between"
        gap="1rem"
        pb={{ base: 3, sm: 3.5 }}
        borderBottom="1px solid var(--pb-summary-line)"
      >
        <Box minW={0}>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10px"
            fontWeight={600}
            letterSpacing="0.18em"
            textTransform="uppercase"
            color="var(--pb-summary-ink-faint)"
          >
            {t('cards.overview.title')}
          </Text>
          <Text mt={1} fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-summary-ink-soft)">
            {t('cards.overview.subtitle')}
          </Text>
        </Box>
        <Flex gap={2} w={{ base: 'full', sm: 'auto' }} flexShrink={0}>
          <Button
            onClick={onAddCard}
            leftIcon={<Icon as={Plus} boxSize={4} />}
            flex={{ base: 1, sm: 'initial' }}
            h="36px"
            px={3}
            borderRadius="10px"
            color="var(--pb-summary-ink)"
            bg="var(--pb-summary-control)"
            border="1px solid var(--pb-summary-line)"
            fontFamily="var(--pb-mono)"
            fontSize="9px"
            fontWeight={600}
            letterSpacing="0.06em"
            textTransform="uppercase"
            _hover={{ borderColor: 'var(--pb-summary-ink-faint)', transform: 'translateY(-1px)' }}
          >
            {t('cards.action.add')}
          </Button>
          <Button
            aria-label={hideValues ? t('cards.action.showValues') : t('cards.action.hideValues')}
            aria-pressed={hideValues}
            title={hideValues ? t('cards.action.showValues') : t('cards.action.hideValues')}
            onClick={onToggleHide}
            leftIcon={<Icon as={hideValues ? Eye : EyeOff} boxSize={4} />}
            flex={{ base: 1, sm: 'initial' }}
            h="36px"
            px={3}
            borderRadius="10px"
            color="var(--pb-summary-ink-soft)"
            bg="var(--pb-summary-panel)"
            border="1px solid var(--pb-summary-line)"
            fontFamily="var(--pb-mono)"
            fontSize="9px"
            fontWeight={600}
            letterSpacing="0.06em"
            textTransform="uppercase"
            _hover={{ color: 'var(--pb-summary-ink)', borderColor: 'var(--pb-summary-ink-faint)' }}
          >
            {hideValues ? t('cards.action.show') : t('cards.action.hide')}
          </Button>
        </Flex>
      </Flex>
      <SimpleGrid
        position="relative"
        zIndex={1}
        columns={{ base: 2, lg: 4 }}
        spacing={{ base: 4, lg: 5 }}
        mt={{ base: 4, sm: 4.5 }}
      >
        <Metric
          label={t('cards.creditInUse')}
          value={hideValues ? '••••••' : formatCurrency(overview.used)}
          emphasis
          summary
        />
        <Metric
          label={t('cards.availableCredit')}
          value={hideValues ? '••••••' : overview.cardsWithLimit ? formatCurrency(available) : '—'}
          note={overview.cardsWithLimit
            ? t('cards.recordedLimitsUsed', { percentage: Math.round(utilisation) })
            : t('cards.addLimits')}
          summary
        />
        <Metric
          label={t('cards.cardsWithLimits')}
          value={String(overview.cardsWithLimit)}
          note={overview.cardsWithLimit ? t('cards.creditTracked') : t('cards.limitsNotSet')}
          summary
        />
        <Metric
          label={t('cards.nextPayment')}
          value={hideValues ? '••••••' : overview.nextPayment ? formatCurrency(overview.nextPayment.nextPaymentAmount) : '—'}
          note={overview.nextPayment?.nextPaymentDate
            ? t('cards.dueDateLower', { date: formatDate(overview.nextPayment.nextPaymentDate, { day: 'numeric', month: 'short' }) })
            : t('cards.nothingScheduled')}
          summary
        />
      </SimpleGrid>
    </Box>
  )
}

function CardFocus({ card, info, hideValues }: { card: PaymentMethod; info?: CardTotal; hideValues: boolean }) {
  const { t, formatCurrency, formatDate } = useI18n()
  const limit = card.creditLimit ?? 0
  const used = info?.outstanding ?? 0
  const available = Math.max(limit - used, 0)
  const utilised = limit > 0 ? Math.min(100, Math.max(0, (used / limit) * 100)) : 0
  const utilisationColour = utilised >= 90 ? 'var(--pb-coral-2)' : utilised >= 70 ? 'var(--pb-gold-2)' : 'var(--pb-income-2)'

  return (
    <Box overflow="hidden" borderRadius="22px" border="1px solid var(--pb-hair)" bg="var(--pb-surface)" boxShadow="var(--pb-shadow)">
      <Box
        position="relative"
        overflow="hidden"
        px="clamp(1.2rem, 3vw, 1.7rem)"
        py={{ base: 5, md: 6 }}
        bg="var(--pb-hero)"
        color="var(--pb-hero-ink)"
      >
        <Box position="absolute" w="280px" h="280px" border="1px solid var(--pb-hero-line)" borderRadius="full" right="-80px" top="-150px" />
        <Box position="absolute" w="190px" h="190px" border="1px solid var(--pb-hero-line)" borderRadius="full" right="20px" bottom="-145px" />
        <Flex position="relative" zIndex={1} justify="space-between" align="start" gap={4}>
          <HStack spacing={3} minW={0}>
            {getBankMeta(card.issuer) ? (
              <BankLogo issuer={card.issuer} size={46} borderRadius="14px" />
            ) : (
              <Flex w={11.5} h={11.5} flexShrink={0} align="center" justify="center" borderRadius="14px" bg="rgba(255,255,255,.16)" border="1px solid rgba(255,255,255,.18)">
                <Icon as={CreditCard} boxSize={6} weight="duotone" />
              </Flex>
            )}
            <Box minW={0}>
              <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.18em" textTransform="uppercase" opacity={0.7}>{t('cards.cardAccount')}</Text>
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={500} letterSpacing="-0.02em" noOfLines={1}>{card.name}</Text>
              <Text fontSize="sm" opacity={0.78} mt="1px">
                {t('cards.issuerAndClosingDay', {
                  issuer: card.issuer || t('cards.creditCard'),
                  day: card.statementClosingDay ?? '—',
                })}
              </Text>
            </Box>
          </HStack>
          <Box textAlign="right" flexShrink={0}>
            <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.15em" textTransform="uppercase" opacity={0.7}>{t('cards.currentStatement')}</Text>
            <Text className="num" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={500} lineHeight="1.15" letterSpacing="-0.025em" mt="0.25rem" style={{ fontVariantNumeric: 'tabular-nums' }}>{hideValues ? '••••••' : formatCurrency(info?.total ?? 0)}</Text>
          </Box>
        </Flex>
      </Box>

      <Box p="clamp(1.2rem, 3vw, 1.7rem)">
        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={{ base: 5, sm: 4 }}>
          <Metric
            label={t('cards.paymentDue')}
            value={hideValues ? '••••••' : info?.nextPaymentDate ? formatCurrency(info.nextPaymentAmount) : '—'}
            note={info?.nextPaymentDate
              ? t('cards.dueDateLower', { date: formatDate(info.nextPaymentDate, { day: 'numeric', month: 'short' }) })
              : t('cards.nothingScheduled')}
          />
          <Metric
            label={limit > 0 ? t('cards.availableCredit') : t('cards.creditLimit')}
            value={hideValues ? '••••••' : limit > 0 ? formatCurrency(available) : t('cards.notRecorded')}
            note={limit > 0
              ? t('cards.percentOfLimitInUse', { percentage: Math.round(utilised) })
              : t('cards.setLimit')}
          />
          <Metric label={t('cards.statementHistory')} value={String(info?.count ?? 0)} note={t('cards.cyclesAvailable')} />
        </SimpleGrid>

        {limit > 0 && (
          <Box mt={6} pt={5} borderTop="1px solid var(--pb-hair)">
            <Flex justify="space-between" align="baseline" mb={2} gap={3}>
              <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.14em" textTransform="uppercase" color="var(--pb-ink-faint)">{t('cards.creditUtilisation')}</Text>
              <Text fontSize="xs" color="var(--pb-ink-soft)" style={{ fontVariantNumeric: 'tabular-nums' }}>{hideValues ? '••••' : t('cards.amountOfLimit', { amount: formatCurrency(used), limit: formatCurrency(limit) })}</Text>
            </Flex>
            <Box h="7px" borderRadius="full" bg="var(--pb-surface-3)" overflow="hidden"><Box h="full" w={`${utilised}%`} borderRadius="full" bg={utilisationColour} transition="width .4s ease" /></Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
