import { useCallback, useEffect, useMemo, useState } from 'react'
import { Spinner } from '@chakra-ui/react'

import { deletePaymentMethod, listPaymentMethods, listTransactions } from '../../api'
import type { PaymentMethod, Transaction } from '../../types'
import { buildCardStatements } from '../../utils/creditCardStatements'
import { ConfirmDeleteDialog } from '../../components/ui'
import { ArrowUpRight, CreditCard, Eye, EyeOff, Plus, Layers, PieChart, FileText } from '../../components/ui/icons'
import CreditCardTile from '../../components/cards/CreditCardTile'
import CardFormModal from '../../components/cards/CardFormModal'
import CardsHero from './CardsHero'
import CardsStatements from './CardsStatements'
import './cards.css'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'

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
  const { t } = useI18n()
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

  return (
    <div className="cards-workspace">
      <header className="cw-header">
        <div className="cw-brand"><span />Personal Budget</div>
        <button type="button" className="cw-icon-button" onClick={toggleValues} aria-label={t(hideValues ? 'cards.action.showValues' : 'cards.action.hideValues')} aria-pressed={hideValues}>{hideValues ? <Eye size={20} /> : <EyeOff size={20} />}</button>
      </header>
      <div className="cw-page-heading">
        <div><p className="cw-eyebrow">{t('cards.page.eyebrow')}</p><h1>{t('cards.page.title')}</h1><p className="cw-subtitle">{t('cards.page.subtitle')}</p></div>
        <div className="cw-heading-actions"><span className="cw-header-emblem" aria-hidden="true"><CreditCard size={30} /></span><button type="button" className="cw-primary" onClick={() => setFormCard(null)}><Plus size={19} />{t('cards.action.add')}</button></div>
      </div>
      <div className="cw-navigation" role="group" aria-label={t('nav.cards.label')}>
        {([{ id: 'overview', label: t('cards.tab.overview'), icon: PieChart }, { id: 'cards', label: t('cards.tab.cards'), icon: Layers, count: cards.length }, { id: 'statements', label: t('cards.statements'), icon: FileText, count: statements.length }] as const).map((tab) => <button type="button" key={tab.id} className={section === tab.id ? 'is-selected' : ''} aria-pressed={section === tab.id} onClick={() => navigate(tab.id)}><tab.icon size={19} />{tab.label}{'count' in tab && <span>{tab.count}</span>}</button>)}
      </div>
      <div className="cw-content">
        {loading ? <div className="cw-empty"><Spinner /><p>{t('common.loading')}</p></div>
          : error ? <div className="cw-empty"><p>{t('cards.toast.loadFailed')}</p><button type="button" className="cw-primary" onClick={() => void load()}>{t('cards.action.retry')}</button></div>
          : cards.length === 0 ? <div className="cw-empty"><CreditCard size={36} /><h2>{t('cards.empty.title')}</h2><p>{t('cards.empty.noCards')}</p><button type="button" className="cw-primary" onClick={() => setFormCard(null)}><Plus size={18} />{t('cards.action.add')}</button></div>
          : <>
            {section === 'overview' && <>
              <CardsHero count={cards.length} used={overview.used} limit={overview.limit} hidden={hideValues} next={nextPayment} onToggle={toggleValues} onOpenPayment={() => nextCard && selectCard(nextCard.id, nextPayment?.date)} />
              <div className="cw-section-heading"><p className="cw-eyebrow">{t('cards.shortcuts.title')}</p><h2>{t('cards.yourCards')}</h2></div>
              <div className="cw-shortcuts">
                <button type="button" onClick={() => navigate('cards')}><span className="cw-shortcut-icon"><Layers size={25} /></span><div><strong>{t('cards.yourCards')}</strong><p>{t('cards.shortcuts.cards')}</p><span className="cw-shortcut-link">{t('cards.shortcuts.viewCards', { count: cards.length })}<ArrowUpRight size={18} /></span></div></button>
                <button type="button" onClick={() => navigate('statements')}><span className="cw-shortcut-icon cw-shortcut-gold"><FileText size={25} /></span><div><strong>{t('cards.statements')}</strong><p>{t('cards.shortcuts.statements')}</p><span className="cw-shortcut-link">{t('cards.shortcuts.viewStatements', { count: statements.length })}<ArrowUpRight size={18} /></span></div></button>
              </div>
            </>}
            {section === 'cards' && <>
              <div className="cw-wallet-intro"><Layers size={26} /><div><h2>{t('cards.yourCards')}</h2><p>{t('cards.wallet.help')}</p></div><span>{cards.length}</span></div>
              <div className="cw-cards-grid">{cards.map((card) => { const info = currentTotals.get(card.id); return <CreditCardTile key={card.id} card={card} currentTotal={info?.total ?? 0} usedCredit={info?.outstanding ?? 0} statementCount={info?.count ?? 0} nextPaymentAmount={info?.nextPaymentAmount ?? 0} nextPaymentDate={info?.nextPaymentDate ?? null} hideValues={hideValues} onSelect={() => selectCard(card.id)} onEdit={() => setFormCard(card)} onDelete={() => setCardToDelete(card)} /> })}</div>
            </>}
            {section === 'statements' && <CardsStatements key={statementVersion} cards={cards} statements={statements} filter={selectedId} onFilter={setSelectedId} openId={openStatementKey} onToggle={(id) => setOpenStatementKey((current) => current === id ? null : id)} hidden={hideValues} />}
          </>}
      </div>
      {modals}
    </div>
  )
}
