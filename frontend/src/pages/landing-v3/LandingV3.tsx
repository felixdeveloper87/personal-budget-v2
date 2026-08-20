import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  ArrowRight,
  CalendarClock,
  Check,
  Download,
  FileText,
  LockKeyhole,
  Menu,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { guilloche } from '../../features/dashboard/components/guilloche'
import BrandMark from '../../components/brand/BrandMark'
import LanguageToggle from '../../components/layout/header/LanguageToggle'
import { useI18n } from '../../i18n'
import './LandingV3.css'
import {
  createLandingV3Config,
  type LandingFeatureKind,
  type LandingV3Content,
} from './landingV3.config'

interface LandingV3Props {
  onRequestAccess: () => void
  onSignIn: () => void
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reduced
}

function BrandSeal({ className = '' }: { className?: string }) {
  return <BrandMark className={`pbv3-seal ${className}`} />
}

function BrandLockup({ footer = false }: { footer?: boolean }) {
  const { t } = useI18n()

  return (
    <span className={`pbv3-brand${footer ? ' pbv3-brand--footer' : ''}`}>
      <BrandSeal />
      <span className="pbv3-brand__words">
        <span className="pbv3-brand__wordmark">
          <strong>Personal</strong>
          <em>Budget</em>
        </span>
        <small>
          <i aria-hidden="true" />
          {t('landing.brand.tagline')}
        </small>
      </span>
    </span>
  )
}

function GuillocheField({ className = '' }: { className?: string }) {
  const pathA = useMemo(() => guilloche(96, 31, 105), [])
  const pathB = useMemo(() => guilloche(94, 37, 88), [])

  return (
    <svg
      className={`pbv3-guilloche ${className}`}
      viewBox="-205 -205 410 410"
      aria-hidden="true"
    >
      <g>
        <path className="pbv3-guilloche__jade" d={pathA} />
        <path className="pbv3-guilloche__gold" d={pathB} />
      </g>
    </svg>
  )
}

function TrendChart({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={`pbv3-trend${compact ? ' pbv3-trend--compact' : ''}`}
      viewBox="0 0 460 150"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={compact ? 'pbv3-area-compact' : 'pbv3-area'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        className="pbv3-trend__area"
        fill={`url(#${compact ? 'pbv3-area-compact' : 'pbv3-area'})`}
        d="M0 126 C45 122 54 88 96 94 C135 99 157 63 204 72 C254 82 266 36 316 46 C356 54 382 19 460 22 L460 150 L0 150 Z"
      />
      <path
        className="pbv3-trend__line"
        pathLength="1"
        d="M0 126 C45 122 54 88 96 94 C135 99 157 63 204 72 C254 82 266 36 316 46 C356 54 382 19 460 22"
      />
      <circle className="pbv3-trend__dot" cx="460" cy="22" r="5" />
    </svg>
  )
}

function HeroSnapshot({ snapshot }: { snapshot: LandingV3Content['snapshot'] }) {
  const { t, formatCurrency } = useI18n()

  return (
    <div className="pbv3-hero-stage" aria-hidden="true">
      <div className="pbv3-hero-stage__halo" />
      <div className="pbv3-snapshot">
        <div className="pbv3-snapshot__top">
          <span className="pbv3-window-dots">
            <i />
            <i />
            <i />
          </span>
          <span>{t('landing.snapshot.windowTitle')}</span>
        </div>
        <div className="pbv3-snapshot__body">
          <div className="pbv3-snapshot__label">{snapshot.availableLabel}</div>
          <div className="pbv3-snapshot__amount">{snapshot.available}</div>
          <div className="pbv3-snapshot__delta">{snapshot.delta}</div>
          <TrendChart compact />
          <div className="pbv3-snapshot__stats">
            <span>
              <small>{t('landing.snapshot.income')}</small>
              <b>{snapshot.income}</b>
            </span>
            <span>
              <small>{t('landing.snapshot.expenses')}</small>
              <b>{snapshot.expenses}</b>
            </span>
          </div>
        </div>
      </div>

      <div className="pbv3-floating-row pbv3-floating-row--transaction">
        <span className="pbv3-floating-row__icon">
          <Check size={15} strokeWidth={2} />
        </span>
        <span>
          <small>{t('landing.snapshot.transactionAdded')}</small>
          <b>{t('landing.snapshot.transaction.groceries')}</b>
        </span>
        <strong>−{formatCurrency(42.8)}</strong>
      </div>

      <div className="pbv3-floating-row pbv3-floating-row--forecast">
        <span className="pbv3-floating-row__icon pbv3-floating-row__icon--gold">
          <CalendarClock size={15} strokeWidth={1.8} />
        </span>
        <span>
          <small>{t('landing.snapshot.forecastLabel')}</small>
          <b>{snapshot.forecast}</b>
        </span>
      </div>
    </div>
  )
}

function DashboardPreview({ snapshot }: { snapshot: LandingV3Content['snapshot'] }) {
  const { t, formatCurrency } = useI18n()
  const railItems = [
    t('landing.nav.overview'),
    t('landing.product.behaviour'),
    t('landing.product.payments'),
    t('landing.product.planning'),
    t('landing.product.reports'),
  ]

  return (
    <div className="pbv3-dashboard pbv3-reveal">
      <div className="pbv3-dashboard__chrome">
        <span className="pbv3-window-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="pbv3-dashboard__address">personalbudget.co.uk</span>
        <span className="pbv3-dashboard__demo-label">
          {t('landing.snapshot.illustrativeDemo')}
        </span>
      </div>

      <div className="pbv3-dashboard__layout">
        <aside className="pbv3-dashboard__rail" aria-hidden="true">
          <BrandSeal />
          {railItems.map((label, index) => (
            <span className={index === 0 ? 'is-active' : ''} key={label}>
              <i />
              {label}
            </span>
          ))}
          <span className="pbv3-dashboard__rail-bottom">
            <i />
            {t('landing.product.account')}
          </span>
        </aside>

        <div className="pbv3-dashboard__main">
          <header className="pbv3-dashboard__heading">
            <div>
              <span className="pbv3-kicker">{snapshot.period}</span>
              <h3>{snapshot.greeting}</h3>
            </div>
            <div className="pbv3-period-tabs" aria-hidden="true">
              <span>{t('landing.snapshot.day')}</span>
              <span>{t('landing.snapshot.week')}</span>
              <span className="is-active">{t('landing.snapshot.month')}</span>
            </div>
          </header>

          <div className="pbv3-metrics">
            <article>
              <small>{t('landing.snapshot.income')}</small>
              <strong>{snapshot.income}</strong>
              <span className="is-positive">{t('landing.snapshot.moneyIn')}</span>
            </article>
            <article>
              <small>{t('landing.snapshot.expenses')}</small>
              <strong>{snapshot.expenses}</strong>
              <span>{t('landing.snapshot.moneyOut')}</span>
            </article>
            <article className="is-featured">
              <small>{snapshot.availableLabel}</small>
              <strong>{snapshot.available}</strong>
              <span className="is-positive">{t('landing.snapshot.onTrack')}</span>
            </article>
          </div>

          <div className="pbv3-dashboard__content">
            <article className="pbv3-chart-card">
              <div className="pbv3-card-heading">
                <span>
                  <small>{t('landing.snapshot.cashFlow')}</small>
                  <b>{t('landing.snapshot.monthAtGlance')}</b>
                </span>
                <span className="pbv3-card-heading__value">
                  +{formatCurrency(2287, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="pbv3-chart-grid">
                <i />
                <i />
                <i />
                <i />
              </div>
              <TrendChart />
              <div className="pbv3-chart-days" aria-hidden="true">
                <span>01</span>
                <span>08</span>
                <span>15</span>
                <span>22</span>
                <span>31</span>
              </div>
            </article>

            <article className="pbv3-activity-card">
              <div className="pbv3-card-heading">
                <span>
                  <small>{t('landing.snapshot.recent')}</small>
                  <b>{t('landing.snapshot.activity')}</b>
                </span>
                <span className="pbv3-card-link">{t('landing.snapshot.viewAll')}</span>
              </div>
              <div className="pbv3-activity-list">
                {snapshot.transactions.map((transaction, index) => (
                  <div
                    className="pbv3-activity-row"
                    style={{ '--row-delay': `${index * 120}ms` } as CSSProperties}
                    key={transaction.label}
                  >
                    <span className={`pbv3-activity-row__mark is-${transaction.tone}`} />
                    <span>
                      <b>{transaction.label}</b>
                      <small>{transaction.meta}</small>
                    </span>
                    <strong className={`is-${transaction.tone}`}>{transaction.amount}</strong>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="pbv3-budget-row">
            {snapshot.categories.map((category) => (
              <div key={category.label}>
                <span>
                  <b>{category.label}</b>
                  <small>{category.value}%</small>
                </span>
                <i>
                  <b
                    style={{ '--budget-width': `${category.value}%` } as CSSProperties}
                  />
                </i>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureIcon({ kind }: { kind: LandingFeatureKind }) {
  const props = { size: 20, strokeWidth: 1.7 }
  if (kind === 'search') return <Search {...props} />
  if (kind === 'commitments') return <CalendarClock {...props} />
  if (kind === 'reports') return <FileText {...props} />
  return <ShieldCheck {...props} />
}

function FeatureDemo({ kind }: { kind: LandingFeatureKind }) {
  const { t, formatCurrency } = useI18n()

  if (kind === 'search') {
    return (
      <div className="pbv3-mini-search" aria-hidden="true">
        <div>
          <Search size={14} />
          <span>{t('landing.feature.demo.searchTerm')}</span>
          <kbd>⌘ K</kbd>
        </div>
        <span>
          <i />
          Continente
          <b>−{formatCurrency(42.8)}</b>
        </span>
        <span>
          <i />
          Lidl
          <b>−{formatCurrency(31.24)}</b>
        </span>
      </div>
    )
  }

  if (kind === 'commitments') {
    return (
      <div className="pbv3-mini-calendar" aria-hidden="true">
        {[
          t('landing.day.monday.short'),
          t('landing.day.tuesday.short'),
          t('landing.day.wednesday.short'),
          t('landing.day.thursday.short'),
          t('landing.day.friday.short'),
          t('landing.day.saturday.short'),
          t('landing.day.sunday.short'),
        ].map((day, index) => (
          <span className={index === 3 ? 'is-active' : ''} key={`${day}-${index}`}>
            {day}
            <i />
          </span>
        ))}
        <div>
          <CalendarClock size={15} />
          Spotify Family
          <b>{formatCurrency(15.99)}</b>
        </div>
      </div>
    )
  }

  if (kind === 'reports') {
    return (
      <div className="pbv3-mini-report" aria-hidden="true">
        <div className="pbv3-mini-report__page">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div>
          <Download size={15} />
          <span>{t('landing.feature.demo.exportReport')}</span>
          <b>PDF</b>
        </div>
      </div>
    )
  }

  return (
    <div className="pbv3-mini-private" aria-hidden="true">
      <BrandSeal />
      <span>
        <LockKeyhole size={18} />
      </span>
      <small>{t('landing.feature.demo.privateWorkspace')}</small>
    </div>
  )
}

function PlanningPreview({
  planning,
  snapshot,
}: {
  planning: LandingV3Content['planning']
  snapshot: LandingV3Content['snapshot']
}) {
  const { t, formatCurrency } = useI18n()

  return (
    <div
      className="pbv3-planning-card pbv3-reveal"
      aria-label={t('landing.a11y.planningPreview')}
    >
      <div className="pbv3-planning-card__header">
        <span>
          <small>{t('landing.planning.preview.projectedBalance')}</small>
          <strong>{snapshot.forecast}</strong>
        </span>
        <span className="pbv3-status-pill">
          <i />
          {t('landing.snapshot.onTrack')}
        </span>
      </div>

      <div className="pbv3-forecast-bars" aria-hidden="true">
        {[44, 57, 52, 68, 76, 71, 86, 82, 94].map((height, index) => (
          <span
            className={index === 8 ? 'is-last' : ''}
            style={{ '--forecast-height': `${height}%` } as CSSProperties}
            key={index}
          />
        ))}
        <i className="pbv3-forecast-line" />
      </div>

      <div className="pbv3-planning-months">
        {planning.months.map((month) => (
          <span className={month.active ? 'is-active' : ''} key={month.label}>
            <small>{month.label}</small>
            <b>{month.value}</b>
          </span>
        ))}
      </div>

      <div className="pbv3-planning-card__footer">
        <CalendarClock size={16} />
        <span>
          <small>{t('landing.planning.preview.nextCommitment')}</small>
          <b>{t('landing.planning.preview.rentDate')}</b>
        </span>
        <strong>{formatCurrency(900, { maximumFractionDigits: 0 })}</strong>
      </div>
    </div>
  )
}

function HouseholdPreview({ household }: { household: LandingV3Content['household'] }) {
  const { t } = useI18n()
  const members = ['L', 'A', 'T', 'S', 'M']

  return (
    <div
      className="pbv3-household-card pbv3-reveal"
      aria-label={t('landing.a11y.householdPreview')}
    >
      <div className="pbv3-household-card__top">
        <div>
          <small>{t('landing.household.preview.label')}</small>
          <strong>{t('landing.household.preview.name')}</strong>
        </div>
        <div
          className="pbv3-avatars"
          aria-label={t('landing.a11y.householdMembers', { count: members.length })}
        >
          {members.map((member, index) => (
            <span style={{ '--avatar-index': index } as CSSProperties} key={member}>
              {member}
            </span>
          ))}
        </div>
      </div>

      <div className="pbv3-household-card__grid">
        <div className="pbv3-shared-list">
          <div>
            <span className="pbv3-shared-icon">£</span>
            <span>
              <b>{household.bill.label}</b>
              <small>{household.bill.meta}</small>
            </span>
            <strong>{household.bill.amount}</strong>
          </div>
          <div>
            <span className="pbv3-shared-icon">
              <UsersRound size={16} />
            </span>
            <span>
              <b>{household.cleaning.label}</b>
              <small>{household.cleaning.meta}</small>
            </span>
            <strong>{household.cleaning.person}</strong>
          </div>
        </div>

        <div className="pbv3-settlement">
          <small>{household.balance.label}</small>
          <div className="pbv3-settlement__people">
            <span>A</span>
            <i>
              <ArrowRight size={18} />
            </i>
            <span>L</span>
          </div>
          <strong>{household.balance.amount}</strong>
          <p>
            {t('landing.household.preview.owes', {
              from: household.balance.from,
              to: household.balance.to,
            })}
          </p>
          <button type="button" tabIndex={-1}>
            {t('landing.household.preview.settle')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LandingV3({ onRequestAccess, onSignIn }: LandingV3Props) {
  const { t, formatCurrency } = useI18n()
  const content = useMemo(
    () => createLandingV3Config(t, formatCurrency),
    [formatCurrency, t],
  )
  const {
    featureCards,
    finalCta,
    footer,
    hero,
    household,
    navLinks,
    planning,
    productTicker,
    proofPoints,
    snapshot,
  } = content
  const rootRef = useRef<HTMLDivElement>(null)
  const navToggleRef = useRef<HTMLButtonElement>(null)
  const reducedMotion = useReducedMotion()
  const [navElevated, setNavElevated] = useState(false)
  const [navMenuOpen, setNavMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const update = () => {
      setNavElevated(window.scrollY > 24)

      const activationLine = window.innerHeight * 0.36
      let nextActive = ''
      navLinks.forEach(({ id }) => {
        const section = document.getElementById(id)
        if (!section) return
        const bounds = section.getBoundingClientRect()
        if (bounds.top <= activationLine && bounds.bottom > activationLine) {
          nextActive = id
        }
      })
      setActiveSection(nextActive)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [navLinks])

  useEffect(() => {
    if (!navMenuOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setNavMenuOpen(false)
      window.requestAnimationFrame(() => navToggleRef.current?.focus())
    }
    const closeAtDesktop = () => {
      if (window.innerWidth > 1080) setNavMenuOpen(false)
    }

    window.addEventListener('keydown', closeOnEscape)
    window.addEventListener('resize', closeAtDesktop)
    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('resize', closeAtDesktop)
    }
  }, [navMenuOpen])

  useEffect(() => {
    const targetId = decodeURIComponent(window.location.hash.slice(1))
    if (!targetId) return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'auto', block: 'start' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const targets = root.querySelectorAll<HTMLElement>('.pbv3-reveal')

    if (reducedMotion) {
      targets.forEach((target) => target.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [reducedMotion])

  const handleHeroPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reducedMotion || !window.matchMedia('(pointer: fine)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    rootRef.current?.style.setProperty('--hero-x', `${x * 16}px`)
    rootRef.current?.style.setProperty('--hero-y', `${y * 12}px`)
  }

  const resetHeroPointer = () => {
    rootRef.current?.style.setProperty('--hero-x', '0px')
    rootRef.current?.style.setProperty('--hero-y', '0px')
  }

  return (
    <div className="pbv3" ref={rootRef}>
      <a className="pbv3-skip-link" href="#main-content">
        {t('landing.a11y.skipContent')}
      </a>

      <nav
        className={`pbv3-nav${navElevated ? ' is-elevated' : ''}${navMenuOpen ? ' is-menu-open' : ''}`}
        aria-label={t('landing.a11y.mainNavigation')}
      >
        <div className="pbv3-shell pbv3-nav__inner">
          <a
            className="pbv3-nav__brand"
            href="#top"
            aria-label={t('landing.a11y.home')}
            onClick={() => setNavMenuOpen(false)}
          >
            <BrandLockup />
          </a>

          <div className="pbv3-nav__links" aria-label={t('landing.a11y.pageSections')}>
            {navLinks.map((link, index) => (
              <a
                className={activeSection === link.id ? 'is-active' : ''}
                href={`#${link.id}`}
                aria-current={activeSection === link.id ? 'location' : undefined}
                key={link.id}
              >
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <b>{link.label}</b>
              </a>
            ))}
          </div>

          <div className="pbv3-nav__actions">
            <LanguageToggle />
            <button className="pbv3-nav__signin" type="button" onClick={onSignIn}>
              {hero.signInCta}
            </button>
            <button className="pbv3-nav__cta" type="button" onClick={onRequestAccess}>
              <span>{t('landing.nav.requestAccess')}</span>
              <i aria-hidden="true">
                <ArrowRight size={15} />
              </i>
            </button>
            <button
              ref={navToggleRef}
              className="pbv3-nav__menu-toggle"
              type="button"
              aria-controls="pbv3-navigation-menu"
              aria-expanded={navMenuOpen}
              aria-label={
                navMenuOpen
                  ? t('landing.a11y.closeNavigation')
                  : t('landing.a11y.openNavigation')
              }
              onClick={() => setNavMenuOpen((open) => !open)}
            >
              <span>{t('landing.nav.menu')}</span>
              {navMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>

          {navMenuOpen && (
            <div className="pbv3-nav-menu" id="pbv3-navigation-menu">
              <div className="pbv3-nav-menu__heading">
                <span>{t('landing.nav.explore')}</span>
                <small>{t('landing.brand.tagline')}</small>
              </div>
              <div className="pbv3-nav-menu__links">
                {navLinks.map((link, index) => (
                  <a
                    className={activeSection === link.id ? 'is-active' : ''}
                    href={`#${link.id}`}
                    aria-current={activeSection === link.id ? 'location' : undefined}
                    onClick={() => setNavMenuOpen(false)}
                    key={link.id}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <b>{link.label}</b>
                    <ArrowRight size={16} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main id="main-content">
        <header
          className="pbv3-hero"
          id="top"
          onPointerMove={handleHeroPointerMove}
          onPointerLeave={resetHeroPointer}
        >
          <div className="pbv3-hero__media" aria-hidden="true">
            <img
              src="/personal-budget-ledger-hero.webp"
              alt=""
              width="1792"
              height="1024"
              decoding="async"
              fetchPriority="high"
            />
          </div>
          <div className="pbv3-hero__wash" aria-hidden="true" />
          <GuillocheField className="pbv3-hero__guilloche" />

          <div className="pbv3-shell pbv3-hero__grid">
            <div className="pbv3-hero__copy">
              <h1>
                <span>{hero.line1}</span>
                <em>{hero.line2}</em>
              </h1>
              <p>{hero.subtitle}</p>
              <div className="pbv3-hero__actions">
                <button className="pbv3-button" type="button" onClick={onRequestAccess}>
                  {hero.primaryCta}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
                <a className="pbv3-button pbv3-button--ghost" href="#overview">
                  {hero.secondaryCta}
                </a>
              </div>
              <div className="pbv3-access-note">
                <Check size={14} aria-hidden="true" />
                <span>{hero.accessNote}</span>
              </div>
            </div>

            <HeroSnapshot snapshot={snapshot} />
          </div>

          <a
            className="pbv3-scroll-cue"
            href="#proof"
            aria-label={t('landing.a11y.scrollToLearn')}
          >
            <span>{t('landing.hero.scrollCue')}</span>
            <i />
          </a>
        </header>

        <section
          className="pbv3-proof"
          id="proof"
          aria-label={t('landing.a11y.productPrinciples')}
        >
          <div className="pbv3-shell pbv3-proof__grid">
            {proofPoints.map((point) => (
              <article className="pbv3-reveal" key={point.number}>
                <span>{point.number}</span>
                <div>
                  <h2>{point.title}</h2>
                  <p>{point.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pbv3-overview" id="overview" aria-labelledby="overview-title">
          <div className="pbv3-shell">
            <div className="pbv3-section-heading pbv3-reveal">
              <span className="pbv3-eyebrow">{t('landing.overview.eyebrow')}</span>
              <h2 id="overview-title">
                {t('landing.overview.titleLead')} <em>{t('landing.overview.titleEmphasis')}</em>
              </h2>
              <p>{t('landing.overview.copy')}</p>
            </div>
            <DashboardPreview snapshot={snapshot} />
          </div>
        </section>

        <div className="pbv3-ticker" aria-hidden="true">
          <div className="pbv3-ticker__track">
            {[...productTicker, ...productTicker].map((item, index) => (
              <span key={`${item}-${index}`}>
                {item}
                <i>✦</i>
              </span>
            ))}
          </div>
        </div>

        <section className="pbv3-features" id="features" aria-labelledby="features-title">
          <div className="pbv3-shell">
            <div className="pbv3-section-heading pbv3-section-heading--split pbv3-reveal">
              <span className="pbv3-eyebrow">{t('landing.features.eyebrow')}</span>
              <h2 id="features-title">
                {t('landing.features.titleLead')}<br />
                <em>{t('landing.features.titleEmphasis')}</em>
              </h2>
              <p>{t('landing.features.copy')}</p>
            </div>

            <div className="pbv3-feature-grid">
              {featureCards.map((feature, index) => (
                <article
                  className={`pbv3-feature-card pbv3-feature-card--${feature.kind} pbv3-reveal`}
                  style={{ '--feature-delay': `${index * 70}ms` } as CSSProperties}
                  key={feature.title}
                >
                  <div className="pbv3-feature-card__top">
                    <span className="pbv3-feature-card__icon">
                      <FeatureIcon kind={feature.kind} />
                    </span>
                    <span>{feature.eyebrow}</span>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                  <FeatureDemo kind={feature.kind} />
                  <div className="pbv3-feature-card__meta">{feature.meta}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pbv3-planning" aria-labelledby="planning-title">
          <div className="pbv3-shell pbv3-planning__grid">
            <div className="pbv3-planning__copy pbv3-reveal">
              <span className="pbv3-eyebrow">{planning.eyebrow}</span>
              <h2 id="planning-title">{planning.title}</h2>
              <p>{planning.copy}</p>
              <ul>
                {planning.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Check size={15} aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <PlanningPreview planning={planning} snapshot={snapshot} />
          </div>
        </section>

        <section className="pbv3-manifesto" aria-label={t('landing.a11y.manifesto')}>
          <div className="pbv3-shell">
            <BrandSeal />
            <p className="pbv3-reveal">
              {t('landing.manifesto.lead')} <em>{t('landing.manifesto.emphasis')}</em>
            </p>
          </div>
        </section>

        <section className="pbv3-household" id="household" aria-labelledby="household-title">
          <GuillocheField className="pbv3-household__guilloche" />
          <div className="pbv3-shell pbv3-household__grid">
            <div className="pbv3-household__copy pbv3-reveal">
              <span className="pbv3-eyebrow">{household.eyebrow}</span>
              <h2 id="household-title">{household.title}</h2>
              <p>{household.copy}</p>
              <ul>
                {household.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Check size={15} aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <HouseholdPreview household={household} />
          </div>
        </section>

        <section className="pbv3-final-cta" aria-labelledby="final-cta-title">
          <div className="pbv3-final-cta__media" aria-hidden="true" />
          <GuillocheField className="pbv3-final-cta__guilloche" />
          <div className="pbv3-shell pbv3-final-cta__inner pbv3-reveal">
            <span className="pbv3-eyebrow">{finalCta.eyebrow}</span>
            <h2 id="final-cta-title">{finalCta.title}</h2>
            <p>{finalCta.copy}</p>
            <button className="pbv3-button" type="button" onClick={onRequestAccess}>
              {finalCta.button}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <small>{finalCta.note}</small>
          </div>
        </section>
      </main>

      <footer className="pbv3-footer">
        <div className="pbv3-shell">
          <BrandLockup footer />
          <div className="pbv3-footer__meta">
            <span>{footer.tagline}</span>
            <span>{footer.note}</span>
            <span>{t('landing.footer.copyright', { year: new Date().getFullYear() })}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
