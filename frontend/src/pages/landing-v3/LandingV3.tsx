import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
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
import HeroScene from './HeroScene'
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
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return (
    <nav className={scrolled ? 'lp-nav is-scrolled' : 'lp-nav'} aria-label={t('landing.a11y.mainNavigation')}>
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

/** Mouse-only 3D tilt for a card: the card leans towards the pointer. */
const tiltHandlers = {
  onPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || window.matchMedia(reducedMotionQuery).matches) return
    const card = event.currentTarget
    const bounds = card.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    card.classList.add('is-tilting')
    card.style.setProperty('--tx', `${(x * 7).toFixed(2)}deg`)
    card.style.setProperty('--ty', `${(-y * 6).toFixed(2)}deg`)
  },
  onPointerLeave(event: PointerEvent<HTMLElement>) {
    const card = event.currentTarget
    card.classList.remove('is-tilting')
    card.style.setProperty('--tx', '0deg')
    card.style.setProperty('--ty', '0deg')
  },
}

/** Splits a headline into words so each one can flip up in 3D. */
function Words({ text, offset = 0 }: { text: string, offset?: number }) {
  return text.split(' ').map((word, i, words) => (
    <span key={i}>
      <span className="lp-word" style={{ '--w': offset + i } as CSSProperties}>{word}</span>
      {i < words.length - 1 ? ' ' : null}
    </span>
  ))
}

function Hero({ onRequestAccess }: Pick<LandingV3Props, 'onRequestAccess'>) {
  const { t } = useI18n()
  const latest = DEMO_MONTHS[DEMO_MONTHS.length - 1]
  const lead = t('landing.manifesto.lead')
  return (
    <header className="lp-hero">
      <div className="lp-shell lp-hero-inner">
        <div className="lp-hero-copy">
          <p className="lp-kicker"><span />{t('landing.hero.eyebrow')}</p>
          <h1 lang="en"><strong>
            <span><Words text={lead} /></span>{' '}
            <em><Words text={t('landing.manifesto.emphasis')} offset={lead.split(' ').length} /></em>
          </strong></h1>
          <p className="lp-intro">{t('landing.hero.subtitle')}</p>
          <div className="lp-hero-actions">
            <button type="button" className="lp-button" onClick={onRequestAccess}>
              {t('landing.hero.primaryCta')} <ArrowRight size={17} aria-hidden />
            </button>
            <a className="lp-text-link" href="#overview">{t('landing.hero.secondaryCta')} <ArrowDown size={15} aria-hidden /></a>
          </div>
        </div>
        <HeroScene>
          <HeroBalance balance={latest.income - latest.expenses} />
        </HeroScene>
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
        <div className="lp-section-copy" data-reveal>
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
        <div className="lp-chart-card lp-tilt" id="lp-month-preview" data-reveal
          style={{ '--reveal-i': 1 } as CSSProperties} {...tiltHandlers}>
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
      <article className="lp-feature lp-plan lp-tilt" id="planning" data-reveal {...tiltHandlers}>
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
      <article className="lp-feature lp-house lp-tilt" id="household" data-reveal
        style={{ '--reveal-i': 1 } as CSSProperties} {...tiltHandlers}>
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

/** Reveals [data-reveal] blocks as they scroll into view. Content stays visible
 * without JS: the hidden state only applies once data-reveal-ready is set. */
function useScrollReveal() {
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = rootRef.current
    if (!root || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        observer.unobserve(entry.target)
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: .12 })
    root.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element))
    root.setAttribute('data-reveal-ready', '')
    return () => observer.disconnect()
  }, [])
  return rootRef
}

export default function LandingV3({ onRequestAccess, onSignIn }: LandingV3Props) {
  const { t } = useI18n()
  const rootRef = useScrollReveal()
  useEffect(() => {
    const target = document.getElementById(window.location.hash.slice(1))
    target?.scrollIntoView({ block: 'start' })
  }, [])

  return (
    <LightMode>
      <EditorialProvider active>
        <div className="lp" id="top" style={landingStyle} ref={rootRef}>
          <a className="lp-skip" href="#main-content">{t('landing.a11y.skipContent')}</a>
          <Navigation onRequestAccess={onRequestAccess} onSignIn={onSignIn} />
          <main id="main-content">
            <Hero onRequestAccess={onRequestAccess} />
            <MonthlyOverview />
            <EverydayFeatures />
            <section className="lp-shell lp-invite" aria-labelledby="lp-invite-title" data-reveal>
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
