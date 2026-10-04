import { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, Flex, Skeleton, Spinner, Text } from '@chakra-ui/react'

import { deletePaymentMethod, listPaymentMethods, listTransactions } from '../../api'
import type { PaymentMethod, Transaction } from '../../types'
import { buildCardStatements } from '../../utils/creditCardStatements'
import { ConfirmDeleteDialog } from '../../components/ui'
import { ArrowUpRight, CalendarDays, CreditCard, Eye, EyeOff, Plus, Layers, PieChart, FileText } from '../../components/ui/icons'
import CreditCardTile from '../../components/cards/CreditCardTile'
import CardFormModal from '../../components/cards/CardFormModal'
import CardsStatements from './CardsStatements'
import './cards.css'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import NuHero from '../dashboard/components/NuHero'

import '../dashboard/theme/pb-tokens.css'


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
  const { t, formatCurrency, formatDate } = useI18n()
  const [cards, setCards] = useState<PaymentMethod[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [section, setSection] = useState<'overview' | 'cards' | 'statements'>('overview')
  const [statementVersion, setStatementVersion] = useState(0)
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
    setError(false)
    try {
      const [methods, txs] = await Promise.all([listPaymentMethods(), listTransactions()])
      setCards(methods.filter((method) => method.type === 'CREDIT_CARD'))
      setTransactions(txs)
    } catch (err) {
      setError(true)
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
      setOpenStatementKey(statement ? card.id + "-" + statement.key : null)
      setSection("statements")
      setStatementVersion((current) => current + 1)
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

  const statements = useMemo(() => cards.flatMap((card) => buildCardStatements(card, transactions).map((statement) => ({ card, statement, id: card.id + "-" + statement.key }))), [cards, transactions])

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
    const datedPayments = Array.from(currentTotals.entries()).map(([cardId, info]) => ({ ...info, cardId }))
      .filter((item) => item.nextPaymentDate !== null)
      .sort((a, b) => a.nextPaymentDate!.getTime() - b.nextPaymentDate!.getTime())

    return {
      used: Array.from(currentTotals.values()).reduce((sum, item) => sum + item.outstanding, 0),
      limit: cards.reduce((sum, card) => sum + Math.max(card.creditLimit ?? 0, 0), 0),
      cardsWithLimit: cards.filter((card) => (card.creditLimit ?? 0) > 0).length,
      nextPayment: datedPayments[0] ?? null,
    }
  }, [cards, currentTotals])

  const selectCard = (id: number, paymentDate?: Date) => {
    setSelectedId(id)
    const card = cards.find((item) => item.id === id)
    if (!card) return
    const cardStatements = buildCardStatements(card, transactions)
    const initial = (paymentDate
      ? cardStatements.find((statement) => isoDate(statement.paymentDate) === isoDate(paymentDate))
      : cardStatements.find((statement) => statement.status === 'open')) ?? cardStatements[0]
    setOpenStatementKey(initial ? id + "-" + initial.key : null)
    setSection("statements")
    setStatementVersion((current) => current + 1)
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

  const nextCard = cards.find((card) => card.id === overview.nextPayment?.cardId)
  const nextPayment = overview.nextPayment && nextCard && overview.nextPayment.nextPaymentDate
    ? { cardName: nextCard.name, amount: overview.nextPayment.nextPaymentAmount, date: overview.nextPayment.nextPaymentDate }
    : null

  const navigate = (next: typeof section) => {
    if (next === 'statements') setSelectedId(null)
    setSection(next)
  }

  const availableCredit = Math.max(overview.limit - overview.used, 0)
  const creditUsage = overview.limit > 0
    ? Math.min(100, Math.max(0, overview.used / overview.limit * 100))
    : 0
  const visibleValue = (amount: number) => hideValues ? '••••••' : formatCurrency(amount)

  return (
    <Box>
      <NuHero
        title={t('nav.cards.label')}
        action={(
          <button
            type="button"
            className="cw-nu-eye"
            onClick={toggleValues}
            aria-label={t(hideValues ? 'cards.action.showValues' : 'cards.action.hideValues')}
            aria-pressed={hideValues}
          >
            {hideValues ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        )}
        decoration={<Box className="cw-nu-orbit" aria-hidden="true" />}
      >
        <Flex mt={{ base: 3, md: 4 }} direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'flex-end' }} justify="space-between" gap={{ base: 4, md: 8 }}>
          <Box minW={0}>
            <Text fontSize="sm" color="rgba(255,255,255,0.78)">
              {t(overview.limit > 0 ? 'cards.availableCredit' : 'cards.creditInUse')}
            </Text>
            {loading ? (
              <Skeleton mt={1} h="44px" maxW="240px" borderRadius="10px" startColor="rgba(255,255,255,0.18)" endColor="rgba(255,255,255,0.3)" />
            ) : (
              <Text mt={0.5} fontSize={{ base: '2rem', md: '2.5rem' }} fontWeight={700} letterSpacing="-0.025em" lineHeight={1.1} color="white" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {visibleValue(overview.limit > 0 ? availableCredit : overview.used)}
              </Text>
            )}
            <Text mt={1} fontSize="sm" color="rgba(255,255,255,0.78)">
              {overview.limit > 0
                ? t('cards.amountOfLimit', { amount: visibleValue(overview.used), limit: visibleValue(overview.limit) })
                : t('cards.limitsNotSet')}
            </Text>
            {overview.limit > 0 && (
              <Box mt={3} maxW="360px" h="4px" borderRadius="full" bg="rgba(255,255,255,0.2)" overflow="hidden">
                <Box h="full" w={hideValues ? '0%' : `${creditUsage}%`} borderRadius="full" bg="white" transition="width .35s ease" />
              </Box>
            )}
          </Box>

          <button type="button" className="cw-nu-add" onClick={() => setFormCard(null)}>
            <Plus size={18} />
            {t('cards.action.add')}
          </button>
        </Flex>
      </NuHero>

      <Box maxW="appContent" mx="auto" px={{ base: 0, md: 4, lg: 6 }} mt="-24px" pb={{ base: 0, md: 7 }} position="relative">
        <Box className="cards-workspace nu-cards" bg="var(--nu-page)" borderTopRadius="24px" borderBottomRadius={{ base: 0, md: '24px' }} overflow="hidden">
          <div className="cw-navigation" role="group" aria-label={t('nav.cards.label')}>
            {([{ id: 'overview', label: t('cards.tab.overview'), icon: PieChart }, { id: 'cards', label: t('cards.tab.cards'), icon: Layers, count: cards.length }, { id: 'statements', label: t('cards.statements'), icon: FileText, count: statements.length }] as const).map((tab) => <button type="button" key={tab.id} className={section === tab.id ? 'is-selected' : ''} aria-pressed={section === tab.id} onClick={() => navigate(tab.id)}><tab.icon size={18} />{tab.label}{'count' in tab && <span>{tab.count}</span>}</button>)}
          </div>
          <div className="cw-content">
            {loading ? <div className="cw-empty"><Spinner color="var(--nu-brand)" /><p>{t('common.loading')}</p></div>
              : error ? <div className="cw-empty"><p>{t('cards.toast.loadFailed')}</p><button type="button" className="cw-primary" onClick={() => void load()}>{t('cards.action.retry')}</button></div>
              : cards.length === 0 ? <div className="cw-empty"><CreditCard size={36} /><h2>{t('cards.empty.title')}</h2><p>{t('cards.empty.noCards')}</p><button type="button" className="cw-primary" onClick={() => setFormCard(null)}><Plus size={18} />{t('cards.action.add')}</button></div>
              : <>
                {section === 'overview' && <>
                  <button type="button" className="cw-nu-payment" disabled={!nextPayment} onClick={() => nextCard && selectCard(nextCard.id, nextPayment?.date)}>
                    <span className="cw-nu-payment-icon"><CalendarDays size={20} /></span>
                    <span className="cw-nu-payment-copy">
                      <small>{t('cards.hero.next')}</small>
                      <strong>{nextPayment ? nextPayment.cardName : t('cards.hero.noPayment')}</strong>
                      {nextPayment && <span>{t('cards.dueDate', { date: formatDate(nextPayment.date, { day: 'numeric', month: 'short' }) })}</span>}
                    </span>
                    {nextPayment && <><strong className="cw-nu-payment-value">{visibleValue(nextPayment.amount)}</strong><ArrowUpRight size={18} /></>}
                  </button>
                  <div className="cw-section-heading"><p className="cw-eyebrow">{t('cards.shortcuts.title')}</p><h2>{t('cards.yourCards')}</h2></div>
                  <div className="cw-shortcuts">
                    <button type="button" onClick={() => navigate('cards')}><span className="cw-shortcut-icon"><Layers size={22} /></span><div><strong>{t('cards.yourCards')}</strong><p>{t('cards.shortcuts.cards')}</p><span className="cw-shortcut-link">{t('cards.shortcuts.viewCards', { count: cards.length })}<ArrowUpRight size={17} /></span></div></button>
                    <button type="button" onClick={() => navigate('statements')}><span className="cw-shortcut-icon"><FileText size={22} /></span><div><strong>{t('cards.statements')}</strong><p>{t('cards.shortcuts.statements')}</p><span className="cw-shortcut-link">{t('cards.shortcuts.viewStatements', { count: statements.length })}<ArrowUpRight size={17} /></span></div></button>
                  </div>
                </>}
                {section === 'cards' && <>
                  <div className="cw-wallet-intro"><div><p className="cw-eyebrow">{t(cards.length === 1 ? 'cards.count.one' : 'cards.count.other', { count: cards.length })}</p><h2>{t('cards.yourCards')}</h2><p>{t('cards.wallet.help')}</p></div></div>
                  <div className="cw-cards-grid">{cards.map((card) => { const info = currentTotals.get(card.id); return <CreditCardTile key={card.id} card={card} currentTotal={info?.total ?? 0} usedCredit={info?.outstanding ?? 0} statementCount={info?.count ?? 0} nextPaymentAmount={info?.nextPaymentAmount ?? 0} nextPaymentDate={info?.nextPaymentDate ?? null} hideValues={hideValues} onSelect={() => selectCard(card.id)} onEdit={() => setFormCard(card)} onDelete={() => setCardToDelete(card)} /> })}</div>
                </>}
                {section === 'statements' && <CardsStatements key={statementVersion} cards={cards} statements={statements} filter={selectedId} onFilter={setSelectedId} openId={openStatementKey} onToggle={(id) => setOpenStatementKey((current) => current === id ? null : id)} hidden={hideValues} />}
              </>}
          </div>
        </Box>
      </Box>
      {modals}
    </Box>
  )
}
