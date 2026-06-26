import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Button, Flex, HStack, Icon, IconButton, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react'

import { deletePaymentMethod, listPaymentMethods, listTransactions } from '../../api'
import type { PaymentMethod, Transaction } from '../../types'
import { buildCardStatements } from '../../utils/creditCardStatements'
import { BankLogo, ConfirmDeleteDialog, getBankMeta } from '../../components/ui'
import { ArrowLeft, CreditCard, Eye, EyeOff, Pencil, Plus, Trash2 } from '../../components/ui/icons'
import CreditCardTile from '../../components/cards/CreditCardTile'
import CardFormModal from '../../components/cards/CardFormModal'
import StatementCard from '../../components/cards/StatementCard'
import { ToastService } from '../../services/toast'

import '../dashboard/theme/pb-tokens.css'
import { containerV, MotionBox, riseV } from '../dashboard/components/motion'

const CARD_BALANCE_VISIBILITY_KEY = 'cards:hide-values'
const money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })

type CardTotal = {
  total: number
  outstanding: number
  count: number
  nextPaymentAmount: number
  nextPaymentDate: Date | null
}

export default function CardsPage() {
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
      ToastService.apiError(err, { title: 'Could not load cards', dedupeKey: 'cards-page-load-failed' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

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
      ToastService.success({ title: 'Card deleted', dedupeKey: `card-deleted:${cardToDelete.id}` })
      if (selectedId === cardToDelete.id) setSelectedId(null)
      setCardToDelete(null)
      await load()
    } catch (err) {
      ToastService.apiError(err, { title: 'Could not delete card', dedupeKey: `card-delete-failed:${cardToDelete.id}` })
    } finally {
      setDeleting(false)
    }
  }

  const visibilityButton = (
    <IconButton
      aria-label={hideValues ? 'Show card values' : 'Hide card values'}
      title={hideValues ? 'Show card values' : 'Hide card values'}
      icon={<Icon as={hideValues ? Eye : EyeOff} boxSize={5} />}
      onClick={toggleValues}
      variant="ghost"
      borderRadius="11px"
      color="var(--pb-ink-soft)"
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      _hover={{ color: 'var(--pb-forest-2)', borderColor: 'var(--pb-hair-2)', bg: 'var(--pb-surface-2)' }}
    />
  )

  const modals = (
    <>
      <CardFormModal isOpen={formCard !== undefined} card={formCard} onClose={() => setFormCard(undefined)} onSaved={load} />
      <ConfirmDeleteDialog
        isOpen={cardToDelete !== null}
        onClose={() => setCardToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title="Delete card"
        itemName={cardToDelete?.name}
        description="Removes the card and its statement settings. Transactions are kept."
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
              <Button variant="ghost" size="sm" leftIcon={<Icon as={ArrowLeft} boxSize={4} />} onClick={() => setSelectedId(null)} color="var(--pb-ink-soft)" _hover={{ color: 'var(--pb-ink)', bg: 'var(--pb-surface-2)' }} mb={2} pl={1}>
                All cards
              </Button>
              <Flex w="full" minW={0} justify={{ base: 'stretch', sm: 'flex-end' }} px={{ base: 1, sm: 2 }}><Flex gap="0.6rem" w={{ base: 'full', sm: 'auto' }}>{visibilityButton}<ActionButton label="Edit" icon={Pencil} onClick={() => setFormCard(selectedCard)} /><ActionButton label="Delete" icon={Trash2} destructive onClick={() => setCardToDelete(selectedCard)} /></Flex></Flex>
            </MotionBox>

            <MotionBox variants={riseV}><CardFocus card={selectedCard} info={currentTotals.get(selectedCard.id)} hideValues={hideValues} /></MotionBox>
            <MotionBox variants={riseV}>
              <Flex justify="space-between" align="center" gap={3}>
                <SectionLabel>Statements</SectionLabel>
                <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.1em" textTransform="uppercase" color="var(--pb-ink-faint)">
                  {statements.length} available
                </Text>
              </Flex>
            </MotionBox>

            {statements.length === 0 ? (
              <MotionBox variants={riseV}><EmptyState text="No charges on this card yet." /></MotionBox>
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
          <MotionBox variants={riseV}>
            <Flex w="full" minW={0} justify={{ base: 'stretch', sm: 'flex-end' }} px={{ base: 1, sm: 2 }}><Flex gap="0.6rem" w={{ base: 'full', sm: 'auto' }}>{visibilityButton}<ActionButton label="Add card" icon={Plus} primary onClick={() => setFormCard(null)} /></Flex></Flex>
          </MotionBox>

          {cards.length === 0 ? (
            <MotionBox variants={riseV}><EmptyState text="No credit cards yet. Add your first card to start tracking statements." /></MotionBox>
          ) : (
            <>
              <MotionBox variants={riseV}><CardsOverview overview={overview} hideValues={hideValues} /></MotionBox>
              <MotionBox variants={riseV}><SectionLabel>Your cards</SectionLabel></MotionBox>
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
  return <Box as="button" type="button" onClick={onClick} flex={{ base: 1, sm: 'initial' }} display="inline-flex" alignItems="center" justifyContent="center" gap="0.45rem" whiteSpace="nowrap" fontSize="0.95rem" fontWeight={500} px="1.05rem" py="0.58rem" borderRadius="14px" transition="0.18s" color={destructive ? 'var(--pb-coral)' : primary ? '#f4f3ec' : 'var(--pb-ink-soft)'} bg={primary ? 'var(--pb-forest-2)' : 'var(--pb-surface)'} border="1px solid" borderColor={primary ? 'transparent' : destructive ? 'var(--pb-tint-coral)' : 'var(--pb-hair)'} boxShadow={primary ? '0 1px 2px rgba(15,23,42,.18), 0 8px 20px rgba(15,23,42,.12)' : '0 1px 2px rgba(15,23,42,.05)'} _hover={{ transform: 'translateY(-1px)', bg: primary ? 'var(--pb-forest)' : destructive ? 'var(--pb-tint-coral)' : 'var(--pb-surface-2)', color: primary ? '#f4f3ec' : destructive ? 'var(--pb-coral)' : 'var(--pb-ink)' }}><Icon as={icon} boxSize="1.08em" />{label}</Box>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text fontFamily="var(--pb-mono)" fontSize="10.5px" letterSpacing="0.2em" textTransform="uppercase" color="var(--pb-ink-faint)" pl="0.15rem">{children}</Text>
}

function EmptyState({ text }: { text: string }) {
  return <Flex direction="column" align="center" py={14} px={6} textAlign="center" bg="var(--pb-surface)" border="1px dashed var(--pb-hair-2)" borderRadius="22px"><Flex w={14} h={14} align="center" justify="center" borderRadius="2xl" bg="var(--pb-surface-2)" border="1px solid var(--pb-hair)" mb={3}><Icon as={CreditCard} boxSize={7} color="var(--pb-ink-faint)" weight="duotone" /></Flex><Text fontSize="md" fontWeight={500} color="var(--pb-ink)">No card activity</Text><Text fontSize="sm" color="var(--pb-ink-soft)" mt={1} maxW="390px">{text}</Text></Flex>
}

function Metric({ label, value, note, emphasis }: { label: string; value: string; note?: string; emphasis?: boolean }) {
  return <Box><Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.16em" textTransform="uppercase" color="var(--pb-ink-faint)">{label}</Text><Text className="num" fontSize={emphasis ? { base: '2rem', md: '2.3rem' } : '1.45rem'} fontWeight={500} lineHeight="1.1" letterSpacing="-0.025em" color="var(--pb-ink)" mt="0.35rem" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</Text>{note && <Text fontSize="xs" color="var(--pb-ink-soft)" mt="0.35rem">{note}</Text>}</Box>
}

function CardsOverview({ overview, hideValues }: { overview: { used: number; limit: number; cardsWithLimit: number; nextPayment: CardTotal | null }; hideValues: boolean }) {
  const available = Math.max(overview.limit - overview.used, 0)
  const utilisation = overview.limit > 0 ? Math.min(100, (overview.used / overview.limit) * 100) : 0
  return <Box position="relative" overflow="hidden" bg="linear-gradient(168deg, var(--pb-surface), var(--pb-surface-2))" border="1px solid var(--pb-hair)" borderRadius="22px" boxShadow="var(--pb-shadow)" p="clamp(1.2rem, 3vw, 1.7rem)"><Box position="absolute" inset={0} borderRadius="inherit" pointerEvents="none" boxShadow="inset 0 1px 0 rgba(255,255,255,.6)" /><SimpleGrid position="relative" zIndex={1} columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 5, lg: 4 }}><Metric label="Credit in use" value={hideValues ? '••••••' : money.format(overview.used)} emphasis /><Metric label="Available credit" value={hideValues ? '••••••' : overview.cardsWithLimit ? money.format(available) : '—'} note={overview.cardsWithLimit ? `${Math.round(utilisation)}% of recorded limits used` : 'Add limits to track availability'} /><Metric label="Cards with limits" value={String(overview.cardsWithLimit)} note={overview.cardsWithLimit ? 'available credit being tracked' : 'limits not set yet'} /><Metric label="Next payment" value={hideValues ? '••••••' : overview.nextPayment ? money.format(overview.nextPayment.nextPaymentAmount) : '—'} note={overview.nextPayment?.nextPaymentDate ? `due ${date.format(overview.nextPayment.nextPaymentDate)}` : 'nothing scheduled'} /></SimpleGrid></Box>
}

function CardFocus({ card, info, hideValues }: { card: PaymentMethod; info?: CardTotal; hideValues: boolean }) {
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
        bg="linear-gradient(125deg, var(--pb-forest) 0%, var(--pb-forest-2) 57%, var(--pb-line) 100%)"
        color="#f6f8fb"
      >
        <Box position="absolute" w="280px" h="280px" border="1px solid rgba(255,255,255,.16)" borderRadius="full" right="-80px" top="-150px" />
        <Box position="absolute" w="190px" h="190px" border="1px solid rgba(255,255,255,.11)" borderRadius="full" right="20px" bottom="-145px" />
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
              <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.18em" textTransform="uppercase" opacity={0.7}>Card account</Text>
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={500} letterSpacing="-0.02em" noOfLines={1}>{card.name}</Text>
              <Text fontSize="sm" opacity={0.78} mt="1px">{card.issuer || 'Credit card'} · closes on day {card.statementClosingDay}</Text>
            </Box>
          </HStack>
          <Box textAlign="right" flexShrink={0}>
            <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.15em" textTransform="uppercase" opacity={0.7}>Current statement</Text>
            <Text className="num" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={500} lineHeight="1.15" letterSpacing="-0.025em" mt="0.25rem" style={{ fontVariantNumeric: 'tabular-nums' }}>{hideValues ? '••••••' : money.format(info?.total ?? 0)}</Text>
          </Box>
        </Flex>
      </Box>

      <Box p="clamp(1.2rem, 3vw, 1.7rem)">
        <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={{ base: 5, sm: 4 }}>
          <Metric label="Payment due" value={hideValues ? '••••••' : info?.nextPaymentDate ? money.format(info.nextPaymentAmount) : '—'} note={info?.nextPaymentDate ? `due ${date.format(info.nextPaymentDate)}` : 'nothing scheduled'} />
          <Metric label={limit > 0 ? 'Available credit' : 'Credit limit'} value={hideValues ? '••••••' : limit > 0 ? money.format(available) : 'Not recorded'} note={limit > 0 ? `${Math.round(utilised)}% of limit in use` : 'Set a limit to track usage'} />
          <Metric label="Statement history" value={String(info?.count ?? 0)} note="cycles currently available" />
        </SimpleGrid>

        {limit > 0 && (
          <Box mt={6} pt={5} borderTop="1px solid var(--pb-hair)">
            <Flex justify="space-between" align="baseline" mb={2} gap={3}>
              <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.14em" textTransform="uppercase" color="var(--pb-ink-faint)">Credit utilisation</Text>
              <Text fontSize="xs" color="var(--pb-ink-soft)" style={{ fontVariantNumeric: 'tabular-nums' }}>{hideValues ? '••••' : `${money.format(used)} of ${money.format(limit)}`}</Text>
            </Flex>
            <Box h="7px" borderRadius="full" bg="var(--pb-surface-3)" overflow="hidden"><Box h="full" w={`${utilised}%`} borderRadius="full" bg={utilisationColour} transition="width .4s ease" /></Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
