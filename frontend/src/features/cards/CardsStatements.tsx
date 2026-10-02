import { useState } from 'react'
import { BankLogo } from '../../components/ui'
import MerchantLogo from '../../components/ui/MerchantLogo'
import { ChevronDown, FileText } from '../../components/ui/icons'
import type { PaymentMethod } from '../../types'
import type { CardStatement } from '../../utils/creditCardStatements'
import { useI18n } from '../../i18n'

export type NamedStatement = { card: PaymentMethod; statement: CardStatement; id: string }

interface Props {
  cards: PaymentMethod[]
  statements: NamedStatement[]
  filter: number | null
  onFilter: (id: number | null) => void
  openId: string | null
  onToggle: (id: string) => void
  hidden: boolean
}

function StatementRow({ item, expanded, onToggle, hidden }: { item: NamedStatement; expanded: boolean; onToggle: () => void; hidden: boolean }) {
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()
  const { card, statement } = item
  const value = (amount: number) => hidden ? '••••••' : formatCurrency(amount)
  const days = new Map<string, typeof statement.transactions>()
  for (const transaction of statement.transactions) {
    const date = (transaction.transactionDate ?? transaction.paymentDate ?? transaction.dateTime).slice(0, 10)
    days.set(date, [...(days.get(date) ?? []), transaction])
  }
  return (
    <article className={'cw-statement' + (expanded ? ' is-expanded' : '')}>
      <button type="button" className="cw-statement-button" aria-expanded={expanded} aria-controls={'statement-' + item.id} onClick={onToggle}>
        <div className="cw-statement-identity"><BankLogo issuer={card.issuer} size={32} /><span>{card.name}</span><span className={'cw-status cw-status-' + statement.status}>{t(`cards.statementStatus.${statement.status}`)}</span></div>
        <h3>{formatDate(statement.closingDate, { month: 'long', year: 'numeric' })}</h3>
        <div className="cw-statement-value"><strong>{value(statement.total)}</strong><span className="cw-expand"><ChevronDown size={18} /></span></div>
        <div className="cw-statement-meta"><span>{t('cards.dueDate', { date: formatDate(statement.paymentDate, { day: 'numeric', month: 'short', year: 'numeric' }) })}</span><span>{t(statement.transactions.length === 1 ? 'cards.transactionCount.one' : 'cards.transactionCount.other', { count: statement.transactions.length })}</span></div>
      </button>
      <div id={'statement-' + item.id} hidden={!expanded} className="cw-statement-details">
        <div className="cw-cycle"><span className="cw-eyebrow">{t('cards.statementCycle')}</span><span>{formatDate(statement.periodStart, { day: 'numeric', month: 'short', year: 'numeric' })} – {formatDate(statement.closingDate, { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
        <h4>{t('cards.statements.purchases')}</h4>
        {[...days].map(([date, transactions]) => <div key={date}><p className="cw-purchase-day">{formatDate(date, { day: 'numeric', month: 'short' })}</p>{transactions.map((transaction, index) => <div key={transaction.id ?? index} className="cw-purchase"><MerchantLogo domain={transaction.merchantDomain} name={transaction.merchantName || transaction.description} size={34} fallbackMode="none" /><div className="cw-purchase-copy"><strong>{transaction.description}</strong><span>{categoryLabel(transaction.category)}</span></div><strong>{value(transaction.amount)}</strong></div>)}</div>)}
        <div className="cw-statement-total"><span>{t('cards.statements.total')}</span><strong>{value(statement.total)}</strong></div>
      </div>
    </article>
  )
}

export default function CardsStatements({ cards, statements, filter, onFilter, openId, onToggle, hidden }: Props) {
  const { t, formatCurrency, formatDate } = useI18n()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const [view, setView] = useState<'current' | 'history'>(() => {
    const target = statements.find((item) => item.id === openId)
    return target && target.statement.paymentDate.getTime() < today ? 'history' : 'current'
  })
  const [historyLimit, setHistoryLimit] = useState(() => {
    const previous = statements
      .filter((item) => (filter === null || item.card.id === filter) && item.statement.paymentDate.getTime() < today)
      .sort((a, b) => b.statement.paymentDate.getTime() - a.statement.paymentDate.getTime())
    return Math.max(8, previous.findIndex((item) => item.id === openId) + 1)
  })
  const filtered = statements.filter((item) => filter === null || item.card.id === filter)
  const current = filtered.filter((item) => item.statement.paymentDate.getTime() >= today).sort((a,b) => a.statement.paymentDate.getTime() - b.statement.paymentDate.getTime())
  const history = filtered.filter((item) => item.statement.paymentDate.getTime() < today).sort((a,b) => b.statement.paymentDate.getTime() - a.statement.paymentDate.getTime())
  const next = current[0]
  const groups = view === 'current' ? [
    { key: 'closed', items: current.filter((item) => item.statement.status === 'closed') },
    { key: 'open', items: current.filter((item) => item.statement.status === 'open') },
    { key: 'future', items: current.filter((item) => item.statement.status === 'upcoming') },
  ] : [{ key: 'previous', items: history.slice(0, historyLimit) }]
  return (
    <section>
      <div className="cw-statement-summary">
        <div className="cw-summary-heading"><span className="cw-eyebrow">{t('cards.statements.tracking')}</span><FileText size={22} /></div>
        <h2>{cards.find((card) => card.id === filter)?.name ?? t('cards.statements.all')}</h2>
        <div className="cw-summary-metrics"><div><span className="cw-eyebrow">{t('cards.statements.due')}</span><strong>{hidden ? '••••••' : formatCurrency(current.reduce((total,item) => total + item.statement.total, 0))}</strong><small>{t(current.length === 1 ? 'cards.statementCount.one' : 'cards.statementCount.other', { count: current.length })}</small></div><div><span className="cw-eyebrow">{t('cards.hero.next')}</span><strong>{next ? formatDate(next.statement.paymentDate, { day: 'numeric', month: 'short' }) : '—'}</strong><small>{next ? hidden ? '••••••' : formatCurrency(next.statement.total) : t('cards.nothingScheduled')}</small></div></div>
      </div>
      <p className="cw-filter-label cw-eyebrow">{t('cards.statements.filter')}</p>
      <div className="cw-filters" role="group" aria-label={t('cards.statements.filter')}>
        <button type="button" className={'cw-filter' + (filter === null ? ' is-selected' : '')} aria-pressed={filter === null} onClick={() => { onFilter(null); setHistoryLimit(8) }}>{t('cards.action.all')}</button>
        {cards.map((card) => <button type="button" key={card.id} className={'cw-filter' + (filter === card.id ? ' is-selected' : '')} aria-pressed={filter === card.id} onClick={() => { onFilter(card.id); setHistoryLimit(8) }}><BankLogo issuer={card.issuer} size={24} />{card.name}</button>)}
      </div>
      <div className="cw-history-tabs" role="group" aria-label={t('cards.statements')}>
        {(['current', 'history'] as const).map((tab) => <button type="button" key={tab} aria-pressed={view === tab} className={view === tab ? 'is-selected' : ''} onClick={() => setView(tab)}>{t(`cards.statements.${tab}`)}<span>{tab === 'current' ? current.length : history.length}</span></button>)}
      </div>
      {groups.filter((group) => group.items.length).map((group) => <section className="cw-statement-group" key={group.key}><div className="cw-group-heading"><h3>{t(`cards.statements.${group.key}`)}</h3><span>{group.key === 'previous' ? history.length : group.items.length}</span></div><p className="cw-group-description">{t(`cards.statements.${group.key}Help`)}</p><div className="cw-statements-grid">{group.items.map((item) => <StatementRow item={item} key={item.id} expanded={item.id === openId} onToggle={() => onToggle(item.id)} hidden={hidden} />)}</div></section>)}
      {(view === 'current' ? current : history).length === 0 && <div className="cw-empty"><FileText size={30} /><p>{t(view === 'current' ? 'cards.statements.emptyCurrent' : 'cards.statements.emptyHistory')}</p></div>}
      {view === 'history' && history.length > historyLimit && <button type="button" className="cw-more" onClick={() => setHistoryLimit((limit) => limit + 8)}>{t('cards.statements.more', { count: history.length - historyLimit })}</button>}
    </section>
  )
}
