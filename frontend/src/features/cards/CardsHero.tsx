import { useId } from 'react'
import { ArrowUpRight, CalendarDays, Eye, EyeOff } from '../../components/ui/icons'
import { useI18n } from '../../i18n'

interface Props {
  count: number
  used: number
  limit: number
  hidden: boolean
  next: { cardName: string; amount: number; date: Date } | null
  onToggle: () => void
  onOpenPayment: () => void
}

function WalletArtwork() {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 200 150" fill="none" aria-hidden="true" className="cw-wallet-art">
      <defs>
        <linearGradient id={id + 'back'} x1="20" y1="5" x2="170" y2="100" gradientUnits="userSpaceOnUse"><stop stopColor="#ADC9C2" /><stop offset="1" stopColor="#6F9991" /></linearGradient>
        <linearGradient id={id + 'front'} x1="25" y1="45" x2="175" y2="130" gradientUnits="userSpaceOnUse"><stop stopColor="#E7DDC3" /><stop offset=".5" stopColor="#D4C39E" /><stop offset="1" stopColor="#B29E75" /></linearGradient>
      </defs>
      <circle cx="112" cy="75" r="67" stroke="#D5E8DF" strokeOpacity=".12" />
      <circle cx="112" cy="75" r="52" stroke="#D5E8DF" strokeOpacity=".08" />
      <rect x="37" y="16" width="139" height="86" rx="13" fill={'url(#' + id + 'back)'} transform="rotate(13 37 16)" />
      <path d="M55 34L138 53" stroke="#E4F0E9" strokeOpacity=".5" strokeWidth="2" />
      <rect x="16" y="59" width="148" height="91" rx="14" fill="#102B30" fillOpacity=".3" transform="rotate(-10 16 59)" />
      <rect x="17" y="50" width="148" height="91" rx="14" fill={'url(#' + id + 'front)'} transform="rotate(-10 17 50)" />
      <rect x="17.5" y="50.5" width="147" height="90" rx="13.5" stroke="#FFF5DD" strokeOpacity=".55" transform="rotate(-10 17 50)" />
      <path d="M35 67L73 60" stroke="#6F6147" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round" />
      <rect x="36" y="77" width="22" height="17" rx="4" fill="#F1E3B9" stroke="#9F8C63" transform="rotate(-10 36 77)" />
      <path d="M42 79L44 92M51 77L53 91" stroke="#9F8C63" strokeWidth=".7" />
      <circle cx="132" cy="111" r="10" fill="#7E6A46" fillOpacity=".65" /><circle cx="145" cy="109" r="10" fill="#F9EDD0" fillOpacity=".7" />
      <path d="M183 35V45M178 40H188M18 28V34M15 31H21" stroke="#DCCBA5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function CardsHero({ count, used, limit, hidden, next, onToggle, onOpenPayment }: Props) {
  const { t, formatCurrency, formatDate } = useI18n()
  const value = (amount: number) => hidden ? '••••••' : formatCurrency(amount)
  const percentage = limit > 0 ? Math.min(100, Math.max(0, used / limit * 100)) : 0
  return (
    <section className="cw-hero" aria-label={t('cards.overview.title')}>
      <div className="cw-hero-halo" />
      <div className="cw-hero-top">
        <div className="cw-hero-collection"><span className="cw-gold-dot" /><span className="cw-eyebrow">{t('cards.hero.wallet')}</span><span className="cw-hero-count">{t(count === 1 ? 'cards.count.one' : 'cards.count.other', { count })}</span></div>
        <button type="button" className="cw-hero-eye" aria-label={t(hidden ? 'cards.action.showValues' : 'cards.action.hideValues')} aria-pressed={hidden} onClick={onToggle}>{hidden ? <Eye size={19} /> : <EyeOff size={19} />}</button>
      </div>
      <div className="cw-hero-layout">
        <div className="cw-hero-story"><h2>{t('cards.hero.line1')}<br />{t('cards.hero.line2')}</h2><p>{t('cards.page.subtitle')}</p><WalletArtwork /></div>
        <div className="cw-hero-finance">
          <span className="cw-eyebrow">{t(limit > 0 ? 'cards.availableCredit' : 'cards.creditInUse')}</span>
          <div className="cw-hero-value">{value(limit > 0 ? Math.max(limit - used, 0) : used)}</div>
          <p className="cw-hero-note">{limit > 0 ? t('cards.hero.limitNote', { amount: value(limit) }) : t('cards.limitsNotSet')}</p>
          <div className="cw-usage-heading"><span>{t('cards.hero.used')} <strong>{value(used)}</strong></span><strong>{hidden ? '••' : limit > 0 ? Math.round(percentage) + '%' : '—'}</strong></div>
          <div className="cw-usage-track"><span style={{ width: hidden ? '0%' : percentage + '%', background: percentage >= 90 ? '#e8a08d' : '#d8c59b' }} /></div>
        </div>
      </div>
      {next ? <button type="button" className="cw-hero-payment" onClick={onOpenPayment}>
        <span className="cw-calendar"><CalendarDays size={23} /></span><span className="cw-payment-copy"><span className="cw-eyebrow">{t('cards.hero.next')} · {formatDate(next.date, { day: 'numeric', month: 'short' })}</span><strong>{next.cardName}</strong></span><strong className="cw-payment-amount">{value(next.amount)}</strong><ArrowUpRight size={20} />
      </button> : <div className="cw-hero-payment cw-hero-note">{t('cards.hero.noPayment')}</div>}
    </section>
  )
}
