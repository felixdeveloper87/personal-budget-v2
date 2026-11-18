import { useEffect, useState, type CSSProperties, type PointerEvent } from 'react'
import { LightMode, Menu, MenuButton, MenuItem, MenuList, VisuallyHidden } from '@chakra-ui/react'
import { animate } from 'framer-motion'
import {
  ArrowDown, ArrowDownLeft, ArrowRight, ArrowUpRight, CalendarDays, ChartNoAxesCombined,
  Eye, EyeOff, House, Menu as MenuIcon, TrendingUp, Wallet, Zap,
} from 'lucide-react'
import BrandMark from '../../components/brand/BrandMark'
import LanguageToggle from '../../components/layout/header/LanguageToggle'
import { EditorialProvider } from '../../editorial'
import { useI18n } from '../../i18n'
import { LIGHT_PALETTE, paletteCssVariables } from '../../palette'
import { DEMO_MONTHS } from './landingV3.config'
import './LandingV3.css'

interface LandingV3Props {
  onRequestAccess: () => void
  onSignIn: () => void
}

const landingStyle = { ...paletteCssVariables(LIGHT_PALETTE), colorScheme: 'light' } as CSSProperties
const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
const sections = [
  { id: 'overview', labelKey: 'landing.nav.overview' },
  { id: 'planning', labelKey: 'landing.product.planning' },
  { id: 'household', labelKey: 'landing.nav.household' },
] as const

function Navigation({ onRequestAccess, onSignIn }: LandingV3Props) {
  const { t } = useI18n()
  return (
    <nav className="lp-nav" aria-label={t('landing.a11y.mainNavigation')}>
      <div className="lp-shell lp-nav-inner">
        <a className="lp-brand" href="#top" aria-label={t('landing.a11y.home')}>
          <BrandMark variant="title" colorMode="light" size="100%" />
        </a>
        <div className="lp-nav-links">
          {sections.map(({ id, labelKey }) => <a key={id} href={`#${id}`}>{t(labelKey)}</a>)}
        </div>
        <div className="lp-nav-actions">
          <LanguageToggle />
          <button className="lp-signin" type="button" onClick={onSignIn}>{t('landing.hero.signInCta')}</button>
          <button className="lp-button lp-nav-cta" type="button" onClick={onRequestAccess}>
            {t('landing.nav.requestAccess')} <ArrowUpRight size={15} aria-hidden />
          </button>
          <div className="lp-nav-menu">
            <Menu placement="bottom-end">
              <MenuButton className="lp-menu-button" aria-label={t('landing.a11y.openNavigation')}>
                <MenuIcon size={21} aria-hidden />
              </MenuButton>
              <MenuList color="var(--lp-ink)" bg="white" shadow="lg" borderRadius="14px">
                {sections.map(({ id, labelKey }) => <MenuItem as="a" href={`#${id}`} key={id}>{t(labelKey)}</MenuItem>)}
                <MenuItem onClick={onRequestAccess}>{t('landing.nav.requestAccess')}</MenuItem>
              </MenuList>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  )
}

function HeroBalance({ balance }: { balance: number }) {
  const { t, formatCurrency } = useI18n()
  const [hidden, setHidden] = useState(false)
  const [amount, setAmount] = useState(() => window.matchMedia(reducedMotionQuery).matches ? balance : 0)

  useEffect(() => {
    const preference = window.matchMedia(reducedMotionQuery)
    if (preference.matches) {
      setAmount(balance)
      return
    }

    const count = animate(0, balance, {
      delay: .33,
      duration: 1.18,
      ease: [.16, 1, .3, 1],
      onUpdate: setAmount,
    })
    const finish = () => {
      count.stop()
      setAmount(balance)
    }
    preference.addEventListener('change', finish)
    return () => {
      preference.removeEventListener('change', finish)
      count.stop()
    }
  }, [balance])

  return (
    <div className="lp-balance-card">
      <div className="lp-balance-head">
        <Wallet size={15} aria-hidden /><span>{t('landing.snapshot.availableLabel')}</span>
        <button type="button" aria-label={t(hidden ? 'landing.mobile.showBalance' : 'landing.mobile.hideBalance')}
          aria-pressed={hidden} onClick={() => setHidden(!hidden)}>
          {hidden ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
        </button>
      </div>
      <strong aria-hidden="true">{hidden ? '••••••' : formatCurrency(amount)}</strong>
      {!hidden && <VisuallyHidden>{formatCurrency(balance)}</VisuallyHidden>}
      <small><i aria-hidden />{t('landing.snapshot.illustrativeDemo')}</small>
    </div>
  )
}

function moveCover(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== 'mouse') return
  const cover = event.currentTarget
  const bounds = cover.getBoundingClientRect()
  const x = (event.clientX - bounds.left) / bounds.width - .5
  const y = (event.clientY - bounds.top) / bounds.height - .5
  cover.style.setProperty('--lp-cover-x', `${x * 3}%`)
  cover.style.setProperty('--lp-cover-y', `${y * 3}%`)
}

function Hero({ onRequestAccess }: Pick<LandingV3Props, 'onRequestAccess'>) {
  const { t } = useI18n()
  const latest = DEMO_MONTHS[DEMO_MONTHS.length - 1]
  return (
    <header className="lp-hero">
      <div className="lp-shell lp-hero-inner">
        <div className="lp-hero-copy">
          <p className="lp-kicker"><span />{t('landing.hero.eyebrow')}</p>
          <h1 lang="en"><strong><span>{t('landing.manifesto.lead')}</span> <em>{t('landing.manifesto.emphasis')}</em></strong></h1>
          <p className="lp-intro">{t('landing.hero.subtitle')}</p>
          <div className="lp-hero-actions">
            <button type="button" className="lp-button" onClick={onRequestAccess}>
              {t('landing.hero.primaryCta')} <ArrowRight size={17} aria-hidden />
            </button>
            <a className="lp-text-link" href="#overview">{t('landing.hero.secondaryCta')} <ArrowDown size={15} aria-hidden /></a>
          </div>
        </div>
        <div className="lp-cover" onPointerMove={moveCover}>
          <img src="/personal-budget-ledger-hero.webp" width="1200" height="1200" alt="" fetchPriority="high" />
          <HeroBalance balance={latest.income - latest.expenses} />
        </div>
      </div>
    </header>
  )
}

function MonthlyOverview() {
  const { t, formatCurrency, formatDate } = useI18n()
  const [index, setIndex] = useState(DEMO_MONTHS.length - 1)
  const month = DEMO_MONTHS[index]
  const balance = month.income - month.expenses
  const period = formatDate(month.start, { month: 'long', year: 'numeric' })
  const series = [...month.balances, balance]
  const chartX = (i: number) => 4 + (i / (series.length - 1)) * 552
  const chartY = (value: number) => 103 - (value / 3000) * 97
  const line = series.map((value, i) => `${i === 0 ? 'M' : 'L'}${chartX(i)},${chartY(value)}`).join(' ')

  return (
    <section className="lp-overview" id="overview" aria-labelledby="lp-overview-title">
      <div className="lp-shell lp-overview-layout">
        <div className="lp-section-copy">
          <p className="lp-kicker"><ChartNoAxesCombined size={17} aria-hidden />{t('landing.snapshot.cashFlow')}</p>
          <h2 id="lp-overview-title">{t('landing.overview.titleLead')} <em>{t('landing.overview.titleEmphasis')}</em></h2>
          <p>{t('landing.overview.copy')}</p>
          <div className="lp-months" role="group" aria-label={t('landing.overview.selectMonth')}>
            {DEMO_MONTHS.map((item, i) => (
              <button type="button" aria-pressed={i === index} aria-controls="lp-month-preview"
                key={item.start} onClick={() => setIndex(i)}>
                {formatDate(item.start, { month: 'short' })}
              </button>
            ))}
          </div>
        </div>
        <div className="lp-chart-card" id="lp-month-preview">
          <div className="lp-chart-heading">
            <p><span className="lp-demo-dot" />{t('landing.snapshot.illustrativeDemo')}</p>
            <span>{period}</span>
          </div>
          <div className="lp-chart-balance" aria-live="polite" aria-atomic="true">
            <span>{t('landing.snapshot.monthBalance')}</span>
            <strong>{formatCurrency(balance)}</strong>
          </div>
          <div className="lp-plot" aria-hidden="true">
            <svg key={month.start} viewBox="0 0 560 106" preserveAspectRatio="none">
              <defs><linearGradient id="lp-chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d1a0fe" stopOpacity=".31" />
                <stop offset="100%" stopColor="#d1a0fe" stopOpacity="0" />
              </linearGradient></defs>
              <path d={`${line} L556,106 L4,106 Z`} fill="url(#lp-chart-fill)" />
              <path className="lp-plot-line" d={line} fill="none" vectorEffect="non-scaling-stroke" pathLength="1" />
              <circle cx={556} cy={chartY(balance)} r="3.2" fill="#f4e4ff" />
            </svg>
            <div className="lp-axis"><span>01</span><span>15</span><span>{month.days}</span></div>
          </div>
          <dl className="lp-totals">
            <div><dt><ArrowDownLeft size={15} aria-hidden />{t('landing.snapshot.income')}</dt><dd>{formatCurrency(month.income)}</dd></div>
            <div><dt><ArrowUpRight size={15} aria-hidden />{t('landing.snapshot.expenses')}</dt><dd>{formatCurrency(month.expenses)}</dd></div>
          </dl>
        </div>
      </div>
    </section>
  )
}

function EverydayFeatures() {
  const { t, formatCurrency, formatDate } = useI18n()
  const members = ['L', 'A', 'T', 'S', 'M']
  const bill = 100
  const shortMonth = formatDate('2026-09-01', { month: 'short' })
  return (
    <section className="lp-shell lp-features" id="features" aria-label={t('landing.nav.features')}>
      <article className="lp-feature lp-plan" id="planning">
        <p className="lp-kicker"><CalendarDays size={17} aria-hidden />{t('landing.product.planning')}</p>
        <h2>{t('landing.planning.title')}</h2>
        <p>{t('landing.planning.copy')}</p>
        <div className="lp-agenda">
          {[{ day: '01', label: t('landing.planning.rent'), amount: 900 }, { day: '04', label: t('landing.planning.internet'), amount: 35 }].map(item => (
            <div className="lp-payment" key={item.day}>
              <span className="lp-date"><b>{item.day}</b><small>{shortMonth}</small></span>
              <span>{item.label}</span><strong>{formatCurrency(item.amount)}</strong>
            </div>
          ))}
        </div>
      </article>
      <article className="lp-feature lp-house" id="household">
        <p className="lp-kicker"><House size={17} aria-hidden />{t('landing.nav.household')}</p>
        <h2>{t('landing.household.title')}</h2>
        <p>{t('landing.household.copy')}</p>
        <div className="lp-receipt">
          <div className="lp-bill">
            <span className="lp-bill-icon"><Zap size={20} aria-hidden /></span>
            <span>{t('landing.household.preview.electricity')}</span><strong>{formatCurrency(bill)}</strong>
          </div>
          <div className="lp-split">
            <div className="lp-avatars" role="img" aria-label={t('landing.a11y.householdMembers', { count: members.length })}>
              {members.map(member => <i key={member}>{member}</i>)}
            </div>
            <b>{t('landing.household.preview.each', { amount: formatCurrency(bill / members.length) })}</b>
          </div>
        </div>
      </article>
    </section>
  )
}

export default function LandingV3({ onRequestAccess, onSignIn }: LandingV3Props) {
  const { t } = useI18n()
  useEffect(() => {
    const target = document.getElementById(window.location.hash.slice(1))
    target?.scrollIntoView({ block: 'start' })
  }, [])

  return (
    <LightMode>
      <EditorialProvider active>
        <div className="lp" id="top" style={landingStyle}>
          <a className="lp-skip" href="#main-content">{t('landing.a11y.skipContent')}</a>
          <Navigation onRequestAccess={onRequestAccess} onSignIn={onSignIn} />
          <main id="main-content">
            <Hero onRequestAccess={onRequestAccess} />
            <MonthlyOverview />
            <EverydayFeatures />
            <section className="lp-shell lp-invite" aria-labelledby="lp-invite-title">
              <span className="lp-invite-icon"><TrendingUp size={27} aria-hidden /></span>
              <div><h2 id="lp-invite-title">{t('landing.finalCta.title')}</h2><p>{t('landing.finalCta.note')}</p></div>
              <button className="lp-button" type="button" onClick={onRequestAccess}>{t('landing.hero.primaryCta')} <ArrowRight size={16} aria-hidden /></button>
            </section>
          </main>
          <footer className="lp-shell lp-footer">
            <a href="#top" className="lp-brand" aria-label={t('landing.a11y.home')}><BrandMark variant="title" colorMode="light" size="100%" /></a>
            <small>{t('landing.footer.copyright', { year: new Date().getFullYear() })}</small>
          </footer>
        </div>
      </EditorialProvider>
    </LightMode>
  )
}
