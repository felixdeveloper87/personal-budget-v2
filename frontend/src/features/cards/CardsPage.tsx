import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Box, Button, Flex, Icon, Spinner, Text } from '@chakra-ui/react'

import { deletePaymentMethod, listPaymentMethods, listTransactions } from '../../api'
import type { PaymentMethod, Transaction } from '../../types'
import { buildCardStatements, type CardStatement } from '../../utils/creditCardStatements'
import { ConfirmDeleteDialog } from '../../components/ui'
import { AlertTriangle, ChevronLeft, CreditCard, Eye, EyeOff, Plus } from '../../components/ui/icons'
import CardFormModal from '../../components/cards/CardFormModal'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import NuHero from '../dashboard/components/NuHero'
import '../dashboard/theme/pb-tokens.css'
import { NU_SHEET_PB, NU_SHEET_WRAP } from '../dashboard/components/nu'
import CardRow from './components/CardRow'
import CardDetail, { CARD_LIMIT_WARNING_PCT } from './components/CardDetail'
import CardsTotalHero from './components/CardsTotalHero'

const CARD_BALANCE_VISIBILITY_KEY = 'cards:hide-values'

interface CardsPageProps {
  statementTarget?: { cardId: number; paymentDate: string } | null
  onStatementTargetHandled?: () => void
}

interface CardSnapshot {
  statements: CardStatement[]
  /** Total of the statement whose billing cycle is still open. */
  currentTotal: number
  /** Every statement not yet due — it keeps consuming the limit until paid. */
  outstanding: number
  nextPayment: { amount: number; date: Date } | null
}

const isoDate = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`

function cardIdFromPath() {
  const match = window.location.pathname.match(/^\/cards\/(\d+)\/?$/)
  return match ? Number(match[1]) : null
}

export default function CardsPage({ statementTarget = null, onStatementTargetHandled }: CardsPageProps) {
  const { t, locale } = useI18n()
  const [cards, setCards] = useState<PaymentMethod[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(cardIdFromPath)
  const [initialStatementKey, setInitialStatementKey] = useState<string | null>(null)
  const [formCard, setFormCard] = useState<PaymentMethod | null | undefined>(undefined)
  const [cardToDelete, setCardToDelete] = useState<PaymentMethod | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [detailVersion, setDetailVersion] = useState(0)
  const [hideValues, setHideValues] = useState(() => {
    try { return localStorage.getItem(CARD_BALANCE_VISIBILITY_KEY) === 'true' } catch { return false }
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [methods, txs] = await Promise.all([listPaymentMethods(), listTransactions()])
      setCards(methods.filter((method) => method.type === 'CREDIT_CARD'))
      setTransactions(txs)
      setLoaded(true)
    } catch (err) {
      setError(true)
      ToastService.apiError(err, { title: t('cards.toast.loadFailed'), dedupeKey: 'cards-page-load-failed' })
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    const handlePopState = () => { setSelectedId(cardIdFromPath()); setInitialStatementKey(null) }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name, locale)),
    [cards, locale],
  )

  const snapshots = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const map = new Map<number, CardSnapshot>()
    for (const card of cards) {
      const statements = buildCardStatements(card, transactions)
      const due = statements
        .filter((statement) => statement.paymentDate.getTime() >= today)
        .sort((a, b) => a.paymentDate.getTime() - b.paymentDate.getTime())
      map.set(card.id, {
        statements,
        currentTotal: statements.find((statement) => statement.status === 'open')?.total ?? 0,
        outstanding: due.reduce((sum, statement) => sum + statement.total, 0),
        nextPayment: due[0] ? { amount: due[0].total, date: due[0].paymentDate } : null,
      })
    }
    return map
  }, [cards, transactions])

  const overview = useMemo(() => {
    const all = Array.from(snapshots.values())
    const nextPayment = all
      .map((snapshot) => snapshot.nextPayment)
      .filter((payment): payment is NonNullable<CardSnapshot['nextPayment']> => payment !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0] ?? null
    return {
      used: all.reduce((sum, snapshot) => sum + snapshot.outstanding, 0),
      currentTotal: all.reduce((sum, snapshot) => sum + snapshot.currentTotal, 0),
      limit: cards.reduce((sum, card) => sum + Math.max(card.creditLimit ?? 0, 0), 0),
      nextPayment,
    }
  }, [cards, snapshots])

  const selectedCard = cards.find((card) => card.id === selectedId) ?? null
  const selectedSnapshot = selectedCard ? snapshots.get(selectedCard.id) ?? null : null
  const detailOpen = selectedId !== null

  const navigateToList = (replace = false) => {
    const state = { ...(window.history.state ?? {}), appPage: 'cards' }
    window.history[replace ? 'replaceState' : 'pushState'](state, '', '/cards')
    setSelectedId(null)
    setInitialStatementKey(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navigateToCard = useCallback((id: number, statementKey: string | null = null) => {
    window.history.pushState({ ...(window.history.state ?? {}), appPage: 'cards' }, '', `/cards/${id}`)
    setSelectedId(id)
    setInitialStatementKey(statementKey)
    setDetailVersion((version) => version + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Arriving from another page (e.g. payments) with a specific statement to open.
  useEffect(() => {
    if (!loaded || !statementTarget) return
    const card = cards.find((item) => item.id === statementTarget.cardId)
    if (card) {
      const statement = snapshots.get(card.id)?.statements.find(
        (item) => isoDate(item.paymentDate) === statementTarget.paymentDate,
      )
      navigateToCard(card.id, statement?.key ?? null)
    }
    onStatementTargetHandled?.()
  }, [cards, loaded, navigateToCard, onStatementTargetHandled, snapshots, statementTarget])

  const toggleValues = () => setHideValues((current) => {
    const next = !current
    try { localStorage.setItem(CARD_BALANCE_VISIBILITY_KEY, String(next)) } catch { /* session only */ }
    return next
  })

  const confirmDelete = async () => {
    if (!cardToDelete) return
    setDeleting(true)
    try {
      await deletePaymentMethod(cardToDelete.id)
      const deletedSelected = selectedId === cardToDelete.id
      setCardToDelete(null)
      if (deletedSelected) navigateToList(true)
      await load()
      ToastService.success({ title: t('cards.toast.deleted'), dedupeKey: `card-deleted:${cardToDelete.id}` })
    } catch (err) {
      ToastService.apiError(err, { title: t('cards.toast.deleteFailed'), dedupeKey: `card-delete-failed:${cardToDelete.id}` })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      <NuHero
        title={detailOpen ? (
          <Flex align="center" gap={3} minW={0}>
            <HeroIconButton label={t('cards.action.back')} onClick={() => navigateToList()}>
              <Icon as={ChevronLeft} boxSize="18px" />
            </HeroIconButton>
            <Text as="h1" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} letterSpacing="-0.01em" color="white" noOfLines={1}>
              {selectedCard?.name ?? t('cards.page.detailTitle')}
            </Text>
          </Flex>
        ) : t('nav.cards.label')}
        action={(
          <HeroIconButton
            label={hideValues ? t('cards.action.showValues') : t('cards.action.hideValues')}
            pressed={hideValues}
            onClick={toggleValues}
          >
            <Icon as={hideValues ? Eye : EyeOff} boxSize="18px" />
          </HeroIconButton>
        )}
      >
        {detailOpen ? (
          selectedCard && selectedSnapshot
            ? <CardHeroBalance card={selectedCard} snapshot={selectedSnapshot} hideValues={hideValues} />
            : null
        ) : (
          <CardsTotalHero
            cardCount={cards.length}
            used={overview.used}
            limit={overview.limit}
            currentTotal={overview.currentTotal}
            nextPayment={overview.nextPayment}
            hideValues={hideValues}
          />
        )}
      </NuHero>

      <Box {...NU_SHEET_WRAP}>
        <Box className="nu-dashboard" pb={NU_SHEET_PB} bg="var(--nu-page)" borderTopRadius="24px" borderBottomRadius={{ base: 0, md: '24px' }} overflow="hidden">
          {loading && !loaded ? (
            <Flex justify="center" py={24}><Spinner color="var(--nu-brand, #820ad1)" /></Flex>
          ) : error && !loaded ? (
            <Flex direction="column" align="center" py={16} px={6} textAlign="center">
              <Text fontSize="md" fontWeight={600} color="var(--pb-ink)">{t('cards.toast.loadFailed')}</Text>
              <Button mt={4} onClick={() => void load()} borderRadius="full" bg="var(--nu-brand, #820ad1)" color="white" _hover={{ bg: '#6f00b8' }}>{t('cards.action.retry')}</Button>
            </Flex>
          ) : detailOpen ? (
            selectedCard && selectedSnapshot ? (
              <CardDetail
                key={`${selectedCard.id}-${detailVersion}`}
                card={selectedCard}
                statements={selectedSnapshot.statements}
                outstanding={selectedSnapshot.outstanding}
                hideValues={hideValues}
                initialStatementKey={initialStatementKey}
                onSettings={() => setFormCard(selectedCard)}
              />
            ) : (
              <Flex direction="column" align="center" py={16}>
                <Text fontSize="lg" fontWeight={600} color="var(--pb-ink)">{t('cards.page.notFound')}</Text>
                <Button mt={4} onClick={() => navigateToList(true)} borderRadius="full" bg="var(--nu-brand, #820ad1)" color="white" _hover={{ bg: '#6f00b8' }}>{t('cards.action.back')}</Button>
              </Flex>
            )
          ) : (
            <Box px={{ base: 4, md: 6 }} py={{ base: 5, md: 6 }}>
              <Flex align="center" justify="space-between" gap={4} mb={3}>
                <Box>
                  <Text fontSize="xl" fontWeight={650} color="var(--pb-ink)">{t('cards.yourCards')}</Text>
                  <Text mt={0.5} fontSize="sm" color="var(--pb-ink-soft)">{t(cards.length === 1 ? 'cards.count.one' : 'cards.count.other', { count: cards.length })}</Text>
                </Box>
                <Button
                  onClick={() => setFormCard(null)}
                  leftIcon={<Icon as={Plus} boxSize={4} />}
                  h="40px"
                  px={4}
                  borderRadius="full"
                  bg="var(--nu-brand, #820ad1)"
                  color="white"
                  _hover={{ bg: '#6f00b8', transform: 'translateY(-1px)' }}
                >
                  {t('cards.action.add')}
                </Button>
              </Flex>
              {sortedCards.length > 0 ? (
                <Box borderTop="1px solid var(--pb-hair)" borderBottom="1px solid var(--pb-hair)">
                  {sortedCards.map((card) => (
                    <CardRow
                      key={card.id}
                      card={card}
                      currentTotal={snapshots.get(card.id)?.currentTotal ?? 0}
                      hideValues={hideValues}
                      onSelect={() => navigateToCard(card.id)}
                    />
                  ))}
                </Box>
              ) : (
                <EmptyState onAdd={() => setFormCard(null)} />
              )}
            </Box>
          )}
        </Box>
      </Box>

      <CardFormModal
        isOpen={formCard !== undefined}
        card={formCard}
        onClose={() => setFormCard(undefined)}
        onSaved={async () => { await load(); setDetailVersion((version) => version + 1) }}
        onDelete={(card) => { setFormCard(undefined); setCardToDelete(card) }}
      />
      <ConfirmDeleteDialog
        isOpen={cardToDelete !== null}
        onClose={() => setCardToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={deleting}
        title={t('cards.delete.title')}
        itemName={cardToDelete?.name}
        description={t('cards.delete.description')}
      />
    </Box>
  )
}

function HeroIconButton({ label, pressed, onClick, children }: { label: string; pressed?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <Flex
      as="button"
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      align="center"
      justify="center"
      flexShrink={0}
      w="36px"
      h="36px"
      borderRadius="full"
      bg="rgba(255,255,255,.16)"
      color="white"
      transition="background-color .15s ease"
      _hover={{ bg: 'rgba(255,255,255,.24)' }}
      _focusVisible={{ outline: '2px solid white', outlineOffset: '3px' }}
    >
      {children}
    </Flex>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const { t } = useI18n()
  return (
    <Flex direction="column" align="center" py={10} px={6} textAlign="center" bg="var(--nu-surface)" borderRadius="16px">
      <Flex w="44px" h="44px" align="center" justify="center" borderRadius="full" bg="var(--nu-brand-tint)" color="var(--nu-brand)" mb={3}><Icon as={CreditCard} boxSize="22px" /></Flex>
      <Text fontSize="md" fontWeight={650} color="var(--pb-ink)">{t('cards.empty.title')}</Text>
      <Text fontSize="sm" color="var(--pb-ink-soft)" mt={1} maxW="340px">{t('cards.empty.noCards')}</Text>
      <Button mt={5} onClick={onAdd} leftIcon={<Icon as={Plus} boxSize={4} />} borderRadius="full" bg="var(--nu-brand, #820ad1)" color="white" _hover={{ bg: '#6f00b8' }}>{t('cards.action.add')}</Button>
    </Flex>
  )
}

/** Purple-hero block for a single card: its open statement, like the account balance. */
function CardHeroBalance({ card, snapshot, hideValues }: { card: PaymentMethod; snapshot: CardSnapshot; hideValues: boolean }) {
  const { t, formatCurrency, formatDate } = useI18n()
  const limit = card.creditLimit ?? 0
  const usage = limit > 0 ? (snapshot.outstanding / limit) * 100 : 0
  const value = (amount: number) => (hideValues ? '••••••' : formatCurrency(amount))
  return (
    <Box mt={{ base: 3, md: 4 }}>
      <Text fontSize="sm" color="rgba(255,255,255,.8)">{t('cards.currentStatement')}</Text>
      <Text
        mt={0.5}
        fontSize={{ base: '2rem', md: '2.5rem' }}
        fontWeight={700}
        letterSpacing="-0.025em"
        lineHeight={1.1}
        color="white"
        noOfLines={1}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value(snapshot.currentTotal)}
      </Text>
      <Text mt={1} fontSize="sm" color="rgba(255,255,255,.75)" noOfLines={1}>
        {snapshot.nextPayment
          ? t('cards.detail.hero.next', {
            amount: value(snapshot.nextPayment.amount),
            date: formatDate(snapshot.nextPayment.date, { day: 'numeric', month: 'short' }),
          })
          : t('cards.closesPays', { closingDay: card.statementClosingDay ?? '—', paymentDay: card.paymentDay ?? '—' })}
      </Text>
      {!hideValues && usage >= CARD_LIMIT_WARNING_PCT && (
        <Flex mt={3} display="inline-flex" align="center" gap={1.5} px={3} py={1} borderRadius="full" bg="rgba(255,255,255,.16)" color="white">
          <Icon as={AlertTriangle} boxSize="13px" />
          <Text fontSize="xs" fontWeight={600}>{t('cards.detail.warning.limit')}</Text>
        </Flex>
      )}
    </Box>
  )
}
