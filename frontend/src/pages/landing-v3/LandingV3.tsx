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
import './LandingV3.css'
import {
  FEATURE_CARDS,
  FINAL_CTA,
  FOOTER,
  HERO,
  HOUSEHOLD,
  NAV_LINKS,
  PLANNING,
  PRODUCT_TICKER,
  PROOF_POINTS,
  SNAPSHOT,
} from './landingV3.config'

interface LandingV3Props {
  onRequestAccess: () => void
  onSignIn: () => void
}

type FeatureKind = (typeof FEATURE_CARDS)[number]['kind']

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
          Clarity for your money
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

function HeroSnapshot() {
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
          <span>PERSONAL BUDGET / AUG</span>
        </div>
        <div className="pbv3-snapshot__body">
          <div className="pbv3-snapshot__label">{SNAPSHOT.availableLabel}</div>
          <div className="pbv3-snapshot__amount">{SNAPSHOT.available}</div>
          <div className="pbv3-snapshot__delta">{SNAPSHOT.delta}</div>
          <TrendChart compact />
          <div className="pbv3-snapshot__stats">
            <span>
              <small>Income</small>
              <b>{SNAPSHOT.income}</b>
            </span>
            <span>
              <small>Expenses</small>
              <b>{SNAPSHOT.expenses}</b>
            </span>
          </div>
        </div>
      </div>

      <div className="pbv3-floating-row pbv3-floating-row--transaction">
        <span className="pbv3-floating-row__icon">
          <Check size={15} strokeWidth={2} />
        </span>
        <span>
          <small>Transaction added</small>
          <b>Groceries</b>
        </span>
        <strong>−£42.80</strong>
      </div>

      <div className="pbv3-floating-row pbv3-floating-row--forecast">
        <span className="pbv3-floating-row__icon pbv3-floating-row__icon--gold">
          <CalendarClock size={15} strokeWidth={1.8} />
        </span>
        <span>
          <small>End-of-month forecast</small>
          <b>{SNAPSHOT.forecast}</b>
        </span>
      </div>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="pbv3-dashboard pbv3-reveal">
      <div className="pbv3-dashboard__chrome">
        <span className="pbv3-window-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="pbv3-dashboard__address">personalbudget.co.uk</span>
        <span className="pbv3-dashboard__demo-label">Illustrative demo</span>
      </div>

      <div className="pbv3-dashboard__layout">
        <aside className="pbv3-dashboard__rail" aria-hidden="true">
          <BrandSeal />
          {['Overview', 'Behaviour', 'Payments', 'Planning', 'Reports'].map((label, index) => (
            <span className={index === 0 ? 'is-active' : ''} key={label}>
              <i />
              {label}
            </span>
          ))}
          <span className="pbv3-dashboard__rail-bottom">
            <i />
            Account
          </span>
        </aside>

        <div className="pbv3-dashboard__main">
          <header className="pbv3-dashboard__heading">
            <div>
              <span className="pbv3-kicker">{SNAPSHOT.period}</span>
              <h3>{SNAPSHOT.greeting}, friend.</h3>
            </div>
            <div className="pbv3-period-tabs" aria-hidden="true">
              <span>Day</span>
              <span>Week</span>
              <span className="is-active">Month</span>
            </div>
          </header>

          <div className="pbv3-metrics">
            <article>
              <small>Income</small>
              <strong>{SNAPSHOT.income}</strong>
              <span className="is-positive">Money in</span>
            </article>
            <article>
              <small>Expenses</small>
              <strong>{SNAPSHOT.expenses}</strong>
              <span>Money out</span>
            </article>
            <article className="is-featured">
              <small>{SNAPSHOT.availableLabel}</small>
              <strong>{SNAPSHOT.available}</strong>
              <span className="is-positive">On track</span>
            </article>
          </div>

          <div className="pbv3-dashboard__content">
            <article className="pbv3-chart-card">
              <div className="pbv3-card-heading">
                <span>
                  <small>Cash flow</small>
                  <b>Your month at a glance</b>
                </span>
                <span className="pbv3-card-heading__value">+£2,287</span>
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
                  <small>Recent</small>
                  <b>Activity</b>
                </span>
                <span className="pbv3-card-link">View all</span>
              </div>
              <div className="pbv3-activity-list">
                {SNAPSHOT.transactions.map((transaction, index) => (
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
            {SNAPSHOT.categories.map((category) => (
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

function FeatureIcon({ kind }: { kind: FeatureKind }) {
  const props = { size: 20, strokeWidth: 1.7 }
  if (kind === 'search') return <Search {...props} />
  if (kind === 'commitments') return <CalendarClock {...props} />
  if (kind === 'reports') return <FileText {...props} />
  return <ShieldCheck {...props} />
}

function FeatureDemo({ kind }: { kind: FeatureKind }) {
  if (kind === 'search') {
    return (
      <div className="pbv3-mini-search" aria-hidden="true">
        <div>
          <Search size={14} />
          <span>groceries</span>
          <kbd>⌘ K</kbd>
        </div>
        <span>
          <i />
          Continente
          <b>−£42.80</b>
        </span>
        <span>
          <i />
          Lidl
          <b>−£31.24</b>
        </span>
      </div>
    )
  }

  if (kind === 'commitments') {
    return (
      <div className="pbv3-mini-calendar" aria-hidden="true">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <span className={index === 3 ? 'is-active' : ''} key={`${day}-${index}`}>
            {day}
            <i />
          </span>
        ))}
        <div>
          <CalendarClock size={15} />
          Spotify Family
          <b>£15.99</b>
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
          <span>Export report</span>
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
      <small>Private workspace</small>
    </div>
  )
}

function PlanningPreview() {
  return (
    <div className="pbv3-planning-card pbv3-reveal" aria-label="Illustrative planning preview">
      <div className="pbv3-planning-card__header">
        <span>
          <small>Projected balance</small>
          <strong>{SNAPSHOT.forecast}</strong>
        </span>
        <span className="pbv3-status-pill">
          <i />
          On track
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
        {PLANNING.months.map((month) => (
          <span className={month.active ? 'is-active' : ''} key={month.label}>
            <small>{month.label}</small>
            <b>{month.value}</b>
          </span>
        ))}
      </div>

      <div className="pbv3-planning-card__footer">
        <CalendarClock size={16} />
        <span>
          <small>Next commitment</small>
          <b>Rent · 01 Sep</b>
        </span>
        <strong>£900</strong>
      </div>
    </div>
  )
}

function HouseholdPreview() {
  const members = ['L', 'A', 'T', 'S', 'M']

  return (
    <div className="pbv3-household-card pbv3-reveal" aria-label="Illustrative Household preview">
      <div className="pbv3-household-card__top">
        <div>
          <small>Household</small>
          <strong>Riverside House</strong>
        </div>
        <div className="pbv3-avatars" aria-label="Five household members">
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
              <b>{HOUSEHOLD.bill.label}</b>
              <small>{HOUSEHOLD.bill.meta}</small>
            </span>
            <strong>{HOUSEHOLD.bill.amount}</strong>
          </div>
          <div>
            <span className="pbv3-shared-icon">
              <UsersRound size={16} />
            </span>
            <span>
              <b>{HOUSEHOLD.cleaning.label}</b>
              <small>{HOUSEHOLD.cleaning.meta}</small>
            </span>
            <strong>{HOUSEHOLD.cleaning.person}</strong>
          </div>
        </div>

        <div className="pbv3-settlement">
          <small>{HOUSEHOLD.balance.label}</small>
          <div className="pbv3-settlement__people">
            <span>A</span>
            <i>
              <ArrowRight size={18} />
            </i>
            <span>L</span>
          </div>
          <strong>{HOUSEHOLD.balance.amount}</strong>
          <p>
            {HOUSEHOLD.balance.from} owes {HOUSEHOLD.balance.to}
          </p>
          <button type="button" tabIndex={-1}>
            Settle balance
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LandingV3({ onRequestAccess, onSignIn }: LandingV3Props) {
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
      NAV_LINKS.forEach(({ id }) => {
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
  }, [])

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
        Skip to content
      </a>

      <nav
        className={`pbv3-nav${navElevated ? ' is-elevated' : ''}${navMenuOpen ? ' is-menu-open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="pbv3-shell pbv3-nav__inner">
          <a
            className="pbv3-nav__brand"
            href="#top"
            aria-label="Personal Budget home"
            onClick={() => setNavMenuOpen(false)}
          >
            <BrandLockup />
          </a>

          <div className="pbv3-nav__links" aria-label="Page sections">
            {NAV_LINKS.map((link, index) => (
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
            <button className="pbv3-nav__signin" type="button" onClick={onSignIn}>
              {HERO.signInCta}
            </button>
            <button className="pbv3-nav__cta" type="button" onClick={onRequestAccess}>
              <span>Request access</span>
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
              aria-label={navMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setNavMenuOpen((open) => !open)}
            >
              <span>Menu</span>
              {navMenuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>

          {navMenuOpen && (
            <div className="pbv3-nav-menu" id="pbv3-navigation-menu">
              <div className="pbv3-nav-menu__heading">
                <span>Explore Personal Budget</span>
                <small>Clarity for your money</small>
              </div>
              <div className="pbv3-nav-menu__links">
                {NAV_LINKS.map((link, index) => (
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
              <div className="pbv3-nav-menu__actions">
                <button
                  type="button"
                  onClick={() => {
                    setNavMenuOpen(false)
                    onSignIn()
                  }}
                >
                  {HERO.signInCta}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNavMenuOpen(false)
                    onRequestAccess()
                  }}
                >
                  Request access
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
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
                <span>{HERO.line1}</span>
                <em>{HERO.line2}</em>
              </h1>
              <p>{HERO.subtitle}</p>
              <div className="pbv3-hero__actions">
                <button className="pbv3-button" type="button" onClick={onRequestAccess}>
                  {HERO.primaryCta}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
                <a className="pbv3-button pbv3-button--ghost" href="#overview">
                  {HERO.secondaryCta}
                </a>
              </div>
              <div className="pbv3-access-note">
                <Check size={14} aria-hidden="true" />
                <span>{HERO.accessNote}</span>
              </div>
            </div>

            <HeroSnapshot />
          </div>

          <a className="pbv3-scroll-cue" href="#proof" aria-label="Scroll to learn more">
            <span>Scroll to read</span>
            <i />
          </a>
        </header>

        <section className="pbv3-proof" id="proof" aria-label="Product principles">
          <div className="pbv3-shell pbv3-proof__grid">
            {PROOF_POINTS.map((point) => (
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
              <span className="pbv3-eyebrow">01 — See</span>
              <h2 id="overview-title">
                From “I think” to <em>“I know.”</em>
              </h2>
              <p>
                A single place to understand what came in, what went out and what is still ahead.
              </p>
            </div>
            <DashboardPreview />
          </div>
        </section>

        <div className="pbv3-ticker" aria-hidden="true">
          <div className="pbv3-ticker__track">
            {[...PRODUCT_TICKER, ...PRODUCT_TICKER].map((item, index) => (
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
              <span className="pbv3-eyebrow">Useful by design</span>
              <h2 id="features-title">
                Less admin.<br />
                <em>More awareness.</em>
              </h2>
              <p>
                Small, practical tools do the quiet work, so the important part is easier to see.
              </p>
            </div>

            <div className="pbv3-feature-grid">
              {FEATURE_CARDS.map((feature, index) => (
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
              <span className="pbv3-eyebrow">{PLANNING.eyebrow}</span>
              <h2 id="planning-title">{PLANNING.title}</h2>
              <p>{PLANNING.copy}</p>
              <ul>
                {PLANNING.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Check size={15} aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <PlanningPreview />
          </div>
        </section>

        <section className="pbv3-manifesto" aria-label="Personal Budget manifesto">
          <div className="pbv3-shell">
            <BrandSeal />
            <p className="pbv3-reveal">
              Money is not the goal. <em>Clarity is.</em>
            </p>
          </div>
        </section>

        <section className="pbv3-household" id="household" aria-labelledby="household-title">
          <GuillocheField className="pbv3-household__guilloche" />
          <div className="pbv3-shell pbv3-household__grid">
            <div className="pbv3-household__copy pbv3-reveal">
              <span className="pbv3-eyebrow">{HOUSEHOLD.eyebrow}</span>
              <h2 id="household-title">{HOUSEHOLD.title}</h2>
              <p>{HOUSEHOLD.copy}</p>
              <ul>
                {HOUSEHOLD.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Check size={15} aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <HouseholdPreview />
          </div>
        </section>

        <section className="pbv3-final-cta" aria-labelledby="final-cta-title">
          <div className="pbv3-final-cta__media" aria-hidden="true" />
          <GuillocheField className="pbv3-final-cta__guilloche" />
          <div className="pbv3-shell pbv3-final-cta__inner pbv3-reveal">
            <span className="pbv3-eyebrow">{FINAL_CTA.eyebrow}</span>
            <h2 id="final-cta-title">{FINAL_CTA.title}</h2>
            <p>{FINAL_CTA.copy}</p>
            <button className="pbv3-button" type="button" onClick={onRequestAccess}>
              {FINAL_CTA.button}
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <small>{FINAL_CTA.note}</small>
          </div>
        </section>
      </main>

      <footer className="pbv3-footer">
        <div className="pbv3-shell">
          <BrandLockup footer />
          <div className="pbv3-footer__meta">
            <span>{FOOTER.tagline}</span>
            <span>{FOOTER.note}</span>
            <span>© {new Date().getFullYear()} Personal Budget</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
