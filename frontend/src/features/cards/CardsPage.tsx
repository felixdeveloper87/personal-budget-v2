import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { deletePaymentMethod } from '../../api'
import type { CardOverview, PaymentMethod } from '../../types'
import { parseLocalDate, toCardStatement, toIsoDay } from '../../utils/creditCardStatements'
import { ConfirmDeleteDialog } from '../../components/ui'
import { AlertTriangle, ChevronLeft, CreditCard, Eye, EyeOff, Plus } from '../../components/ui/icons'
import CardFormModal from '../../components/cards/CardFormModal'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import { useCardStatements, useCardsOverview, usePaymentMethods } from '../../queries/hooks'
import { PAGE_PATHS, cardPath } from '../../routes'
import NuHero from '../dashboard/components/NuHero'
import '../dashboard/theme/pb-tokens.css'
import { NU_SHEET_PB, NU_SHEET_WRAP } from '../dashboard/components/nu'
import CardRow from './components/CardRow'
import CardDetail, { CARD_LIMIT_WARNING_PCT } from './components/CardDetail'
import CardsTotalHero from './components/CardsTotalHero'
import ListSkeleton from '../../components/ui/ListSkeleton'

const CARD_BALANCE_VISIBILITY_KEY = 'cards:hide-values'

/** Server numbers for one card, with dates parsed for display. */
interface CardSnapshot {
  currentTotal: number
  outstanding: number
  nextPayment: { amount: number; date: Date } | null
}

const EMPTY_SNAPSHOT: CardSnapshot = { currentTotal: 0, outstanding: 0, nextPayment: null }

function toSnapshot(overview: CardOverview | undefined): CardSnapshot {
  if (!overview) return EMPTY_SNAPSHOT
  return {
    currentTotal: Number(overview.currentTotal),
    outstanding: Number(overview.outstanding),
    nextPayment: overview.nextPaymentDate
      ? { amount: Number(overview.nextPaymentAmount), date: parseLocalDate(overview.nextPaymentDate) }
      : null,
  }
}

export default function CardsPage() {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const { cardId } = useParams()
  const [searchParams] = useSearchParams()
  const parsedId = cardId ? Number(cardId) : NaN
  const selectedId = Number.isFinite(parsedId) ? parsedId : null
  const detailOpen = cardId !== undefined
  /** Payment date (yyyy-MM-dd) of a statement to open, e.g. from the payments page. */
  const statementParam = searchParams.get('statement')

  const methodsQuery = usePaymentMethods()
  const overviewQuery = useCardsOverview()
  const statementsQuery = useCardStatements(selectedId)

  const [formCard, setFormCard] = useState<PaymentMethod | null | undefined>(undefined)
  const [cardToDelete, setCardToDelete] = useState<PaymentMethod | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [detailVersion, setDetailVersion] = useState(0)
  const [hideValues, setHideValues] = useState(() => {
    try { return localStorage.getItem(CARD_BALANCE_VISIBILITY_KEY) === 'true' } catch { return false }
  })

  const loadError = methodsQuery.error ?? overviewQuery.error
  useEffect(() => {
    if (loadError) ToastService.apiError(loadError, { title: t('cards.toast.loadFailed'), dedupeKey: 'cards-page-load-failed' })
  }, [loadError, t])

  const cards = useMemo(
    () => (methodsQuery.data ?? []).filter((method) => method.type === 'CREDIT_CARD'),
    [methodsQuery.data],
  )
  const sortedCards = useMemo(
    () => [...cards].sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name, locale)),
    [cards, locale],
  )
  const snapshots = useMemo(() => {
    const map = new Map<number, CardSnapshot>()
    for (const item of overviewQuery.data ?? []) map.set(item.cardId, toSnapshot(item))
    return map
  }, [overviewQuery.data])

  const overview = useMemo(() => {
    const all = cards.map((card) => snapshots.get(card.id) ?? EMPTY_SNAPSHOT)
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

  const statements = useMemo(() => (statementsQuery.data ?? []).map(toCardStatement), [statementsQuery.data])
  const initialStatementKey = statementParam
    ? statements.find((statement) => toIsoDay(statement.paymentDate) === statementParam)?.key ?? null
    : null

  const selectedCard = cards.find((card) => card.id === selectedId) ?? null
  const selectedSnapshot = selectedCard ? snapshots.get(selectedCard.id) ?? EMPTY_SNAPSHOT : null

  const listLoading = methodsQuery.isPending || overviewQuery.isPending
  const listFailed = !methodsQuery.data && Boolean(loadError)

  const navigateToList = (replace = false) => navigate(PAGE_PATHS.cards, { replace })

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
      ToastService.success({ title: t('cards.toast.deleted'), dedupeKey: `card-deleted:${cardToDelete.id}` })
    } catch (err) {
      ToastService.apiError(err, { title: t('cards.toast.deleteFailed'), dedupeKey: `card-delete-failed:${cardToDelete.id}` })
    } finally {
      setDeleting(false)
    }
  }

  const retry = () => {
    void methodsQuery.refetch()
    void overviewQuery.refetch()
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
          {listLoading && !listFailed ? (
            <ListSkeleton withSummary />
          ) : listFailed ? (
            <Flex direction="column" align="center" py={16} px={6} textAlign="center">
              <Text fontSize="md" fontWeight={600} color="var(--pb-ink)">{t('cards.toast.loadFailed')}</Text>
              <Button mt={4} onClick={retry} borderRadius="full" bg="var(--nu-brand, #820ad1)" color="white" _hover={{ bg: '#6f00b8' }}>{t('cards.action.retry')}</Button>
            </Flex>
          ) : detailOpen ? (
            !selectedCard ? (
              <Flex direction="column" align="center" py={16}>
                <Text fontSize="lg" fontWeight={600} color="var(--pb-ink)">{t('cards.page.notFound')}</Text>
                <Button mt={4} onClick={() => navigateToList(true)} borderRadius="full" bg="var(--nu-brand, #820ad1)" color="white" _hover={{ bg: '#6f00b8' }}>{t('cards.action.back')}</Button>
              </Flex>
            ) : statementsQuery.isPending ? (
              <ListSkeleton withSummary />
            ) : (
              <CardDetail
                // Remount when arriving at another statement link so its initial tab/open row apply.
                key={`${selectedCard.id}-${statementParam ?? ''}-${detailVersion}`}
                card={selectedCard}
                statements={statements}
                outstanding={selectedSnapshot?.outstanding ?? 0}
                hideValues={hideValues}
                initialStatementKey={initialStatementKey}
                onSettings={() => setFormCard(selectedCard)}
              />
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
                      onSelect={() => navigate(cardPath(card.id))}
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
        onSaved={() => setDetailVersion((version) => version + 1)}
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
