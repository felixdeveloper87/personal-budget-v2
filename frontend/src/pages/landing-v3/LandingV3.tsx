import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './LandingV3.css'
import {
  BENTO,
  CTA,
  FOOTER,
  HERO,
  MANIFESTO,
  MOCKUP,
  NAV_LINKS,
  TESTIMONIALS,
  TICKER,
} from './landingV3.config'

interface LandingV3Props {
  onGetStarted: () => void
}

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const CHART_PATH = 'M0,64 C40,60 60,26 110,36 C150,44 175,14 220,20 C260,25 285,6 330,10'

/* ========================================================================== */
/* Guilloché — n rotated ellipses in two counter-rotating groups               */
/* ========================================================================== */
function Guilloche({ n = 30, rx = 280, ry = 110, opacity = 0.5 }: {
  n?: number
  rx?: number
  ry?: number
  opacity?: number
}) {
  const ellipses = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => ({
        angle: (i / n) * 180,
        gold: i % 5 === 0,
        group: i % 2,
      })),
    [n],
  )
  const draw = (group: number) =>
    ellipses
      .filter((e) => e.group === group)
      .map((e, i) => (
        <ellipse
          key={i}
          cx="0"
          cy="0"
          rx={rx}
          ry={ry}
          transform={`rotate(${e.angle})`}
          stroke={e.gold ? 'var(--gold)' : 'var(--jade)'}
        />
      ))
  return (
    <div className="pbv3-guilloche" aria-hidden style={{ opacity }}>
      <svg viewBox="-300 -300 600 600" preserveAspectRatio="xMidYMid slice">
        <g className="spin">{draw(0)}</g>
        <g className="spinR">{draw(1)}</g>
      </svg>
    </div>
  )
}

/* ========================================================================== */
/* Bento micro-demos                                                           */
/* ========================================================================== */
function SearchDemo({ reduce }: { reduce: boolean }) {
  const [typed, setTyped] = useState(reduce ? BENTO.searchQuery : '')
  const [shown, setShown] = useState(reduce ? BENTO.searchResults.length : 0)
  const [meta, setMeta] = useState(reduce)

  useEffect(() => {
    if (reduce) return
    let timers: number[] = []
    const run = () => {
      setTyped('')
      setShown(0)
      setMeta(false)
      const q = BENTO.searchQuery
      // type letters
      for (let i = 1; i <= q.length; i++) {
        timers.push(window.setTimeout(() => setTyped(q.slice(0, i)), 140 * i))
      }
      const base = 140 * q.length + 200
      // cascade results
      BENTO.searchResults.forEach((_, i) => {
        timers.push(window.setTimeout(() => setShown(i + 1), base + i * 160))
      })
      timers.push(window.setTimeout(() => setMeta(true), base + BENTO.searchResults.length * 160))
      // restart
      timers.push(window.setTimeout(run, base + 2600))
    }
    run()
    return () => timers.forEach(clearTimeout)
  }, [reduce])

  return (
    <div className="pbv3-cell__demo">
      <div className="pbv3-search__box">
        <span>⌘K</span>
        <span>{typed}</span>
        {!reduce && <span className="pbv3-search__caret" />}
      </div>
      <div className="pbv3-search__results">
        {BENTO.searchResults.map((r, i) => (
          <span key={r} className={`pbv3-search__row${i < shown ? ' show' : ''}`}>
            {r}
          </span>
        ))}
      </div>
      <span className={`pbv3-search__meta${meta ? ' show' : ''}`}>{BENTO.searchMeta}</span>
    </div>
  )
}

function RecurringDemo({ reduce }: { reduce: boolean }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(
      () => setIdx((i) => (i + 1) % BENTO.recurringMonths.length),
      1600,
    )
    return () => clearInterval(id)
  }, [reduce])
  return (
    <div className="pbv3-cell__demo pbv3-recur">
      <span className="pbv3-recur__chip mono">{BENTO.recurringMonths[idx]}</span>
      <svg className="pbv3-recur__check" viewBox="0 0 24 24">
        <path d="M5 13l4 4L19 7" />
      </svg>
      <span className="pbv3-cell__hint">auto-repeats</span>
    </div>
  )
}

function ExportDemo({ reduce }: { reduce: boolean }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(
      () => setIdx((i) => (i + 1) % BENTO.exportFormats.length),
      1300,
    )
    return () => clearInterval(id)
  }, [reduce])
  return (
    <div className="pbv3-cell__demo">
      <div className="pbv3-export">{BENTO.exportFormats[idx]}</div>
    </div>
  )
}

/* ========================================================================== */
/* Main                                                                        */
/* ========================================================================== */
export default function LandingV3({ onGetStarted }: LandingV3Props) {
  const reduce = useMemo(prefersReduced, [])

  const rootRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const tickerRef = useRef<HTMLDivElement>(null)
  const voicesARef = useRef<HTMLDivElement>(null)
  const voicesBRef = useRef<HTMLDivElement>(null)
  const mockupSectionRef = useRef<HTMLDivElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)
  const budgetsRef = useRef<HTMLDivElement>(null)

  const [pct, setPct] = useState(reduce ? 100 : 0)
  const [loaderDone, setLoaderDone] = useState(reduce)

  /* manifesto word tokens */
  const words = useMemo(() => {
    return MANIFESTO.split(/\s+/).map((w) => {
      const key = w.startsWith('*') && w.endsWith('*')
      return { text: key ? w.slice(1, -1) : w, key }
    })
  }, [])

  /* ----------------------------------------------------------- preloader -- */
  useEffect(() => {
    if (reduce) return
    let v = 0
    const id = window.setInterval(() => {
      v = Math.min(100, v + Math.ceil(Math.random() * 7))
      setPct(v)
      if (v >= 100) {
        clearInterval(id)
        window.setTimeout(() => setLoaderDone(true), 450)
      }
    }, 90)
    return () => clearInterval(id)
  }, [reduce])

  /* -------------------------------------------------- nav scrolled toggle -- */
  useEffect(() => {
    const onScroll = () => navRef.current?.classList.toggle('scrolled', window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ----------------------------------------------------- reveal on scroll -- */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const targets = root.querySelectorAll<HTMLElement>('.pbv3-reveal')
    if (reduce) {
      targets.forEach((t) => t.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { rootMargin: '-60px' },
    )
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [reduce])

  /* ----------------------------------------------- budget bars fill on IO -- */
  useEffect(() => {
    const el = budgetsRef.current
    if (!el) return
    const fills = el.querySelectorAll<HTMLElement>('.pbv3-mbudget__fill')
    const fill = () => fills.forEach((f) => (f.style.width = f.dataset.w ?? '0%'))
    if (reduce) {
      fill()
      return
    }
    const io = new IntersectionObserver(
      (es) => es.some((e) => e.isIntersecting) && (fill(), io.disconnect()),
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduce])

  /* ----------------------------------------- single master rAF loop -------- */
  useEffect(() => {
    if (reduce) return
    const ticker = tickerRef.current
    const rowA = voicesARef.current
    const rowB = voicesBRef.current
    const mockup = mockupRef.current
    const mockupSection = mockupSectionRef.current

    let sy = window.scrollY
    let lastSy = sy
    let velS = 0
    let scrub = 0
    let tx = 0
    let ax = 0
    let bx = 0

    const tickerHalf = ticker ? ticker.scrollWidth / 2 : 0
    const aHalf = rowA ? rowA.scrollWidth / 2 : 0
    const bHalf = rowB ? rowB.scrollWidth / 2 : 0
    bx = -bHalf

    const onScroll = () => (sy = window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })

    let raf = 0
    const vh = () => window.innerHeight
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

    const master = () => {
      // velocity (smoothed)
      const vel = sy - lastSy
      lastSy = sy
      velS += (vel - velS) * 0.1

      // ticker — base drift + velocity, skew with velocity
      if (ticker && tickerHalf) {
        tx -= 0.6 + Math.abs(velS) * 0.5
        if (tx <= -tickerHalf) tx += tickerHalf
        ticker.style.transform = `translateX(${tx}px) skewX(${velS * -0.25}deg)`
      }

      // testimonials — opposite directions, velocity-reactive
      if (rowA && aHalf) {
        ax -= 0.4 + velS * 0.3
        if (ax <= -aHalf) ax += aHalf
        if (ax > 0) ax -= aHalf
        rowA.style.transform = `translateX(${ax}px)`
      }
      if (rowB && bHalf) {
        bx += 0.4 + velS * 0.3
        if (bx >= 0) bx -= bHalf
        if (bx < -bHalf) bx += bHalf
        rowB.style.transform = `translateX(${bx}px)`
      }

      // scrub mockup upright
      if (mockup && mockupSection) {
        const r = mockupSection.getBoundingClientRect()
        const p = clamp(1 - (r.top - vh() * 0.15) / (vh() * 0.6), 0, 1)
        scrub += (p - scrub) * 0.1
        const rotX = 24 * (1 - scrub)
        const ty = 70 * (1 - scrub)
        const sc = 0.94 + 0.06 * scrub
        mockup.style.transform = `rotateX(${rotX}deg) translateY(${ty}px) scale(${sc})`
      }

      raf = requestAnimationFrame(master)
    }
    raf = requestAnimationFrame(master)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [reduce, loaderDone])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="pbv3" ref={rootRef}>
      {/* preloader */}
      {!loaderDone && (
        <div className={`pbv3-loader${pct >= 100 ? ' done' : ''}`} aria-hidden>
          <div className="pbv3-loader__num">
            {String(pct).padStart(2, '0')}
            <small>/100</small>
          </div>
          <div className="pbv3-loader__bar">
            <i style={{ width: `${pct}%` }} />
          </div>
          <div className="pbv3-loader__cap">loading clarity…</div>
        </div>
      )}

      {/* nav */}
      <nav className="pbv3-nav" ref={navRef}>
        <div className="shell">
          <div className="pbv3-brand">
            Personal <i>Budget</i>
          </div>
          <div className="pbv3-nav__links">
            {NAV_LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                data-cursor="View"
                onClick={(e) => {
                  e.preventDefault()
                  scrollTo(l.id)
                }}
              >
                {l.label}
              </a>
            ))}
            <button
              type="button"
              className="pbv3-btn pbv3-btn--sm"
              data-cursor={HERO.cursorCta}
              onClick={onGetStarted}
            >
              {HERO.primaryCta}
            </button>
          </div>
        </div>
      </nav>

      {/* hero */}
      <header className="pbv3-hero">
        <div className="pbv3-hero__guilloche">
          <Guilloche n={34} rx={300} ry={120} opacity={0.45} />
        </div>
        <div className="shell">
          <h1 className="pbv3-hero__title">
            <span className="row">
              <span style={{ animationDelay: '0.15s' }}>{HERO.line1}</span>
            </span>
            <span className="row">
              <span style={{ animationDelay: '0.3s' }}>
                {HERO.line2is} <span className="it">{HERO.line2accent}</span>
              </span>
            </span>
          </h1>
          <p className="pbv3-hero__sub">{HERO.subtitle}</p>
          <div className="pbv3-hero__cta">
            <button
              type="button"
              className="pbv3-btn"
              data-cursor={HERO.cursorCta}
              onClick={onGetStarted}
            >
              {HERO.primaryCta}
            </button>
            <button
              type="button"
              className="pbv3-btn pbv3-btn--ghost"
              data-cursor="Scroll"
              onClick={() => scrollTo('product')}
            >
              {HERO.secondaryCta}
            </button>
          </div>
        </div>
        <div className="pbv3-hero__scroll">scroll ↓</div>
      </header>

      {/* scroll-scrubbed mockup */}
      <section className="pbv3-mockup-section" id="product" ref={mockupSectionRef}>
        <div className="shell">
          <div className="pbv3-mockup" ref={mockupRef}>
            <div className="pbv3-mockup__frame">
              <div className="pbv3-mockup__bar">
                <i />
                <i />
                <i />
                <span className="mono">app.personalbudget.com</span>
              </div>
              <div className="pbv3-mockup__body">
                <div className="pbv3-mpanel">
                  <div className="pbv3-mpanel__label">{MOCKUP.balanceLabel}</div>
                  <div className="pbv3-mpanel__balance">{MOCKUP.balance}</div>
                  <div className="pbv3-mpanel__delta">{MOCKUP.delta}</div>
                  <div className="pbv3-chart">
                    <svg viewBox="0 0 330 80">
                      <path className="line" id="pbv3-chartline" d={CHART_PATH} />
                      <circle className="dot" r="3.2" cx="0" cy="0">
                        {!reduce && (
                          <animateMotion
                            dur="5s"
                            repeatCount="indefinite"
                            keyPoints="0;1;0"
                            keyTimes="0;0.5;1"
                            calcMode="linear"
                          >
                            <mpath href="#pbv3-chartline" />
                          </animateMotion>
                        )}
                      </circle>
                    </svg>
                  </div>
                  <div className="pbv3-mfeed">
                    {MOCKUP.feed.map((f) => (
                      <div className="pbv3-mfeed__row" key={f.label}>
                        <span>{f.label}</span>
                        <span className={`pbv3-mfeed__amount ${f.tone}`}>{f.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pbv3-mpanel" ref={budgetsRef}>
                  <div className="pbv3-mpanel__label">Budgets</div>
                  <div className="pbv3-mbudget" style={{ marginTop: '0.9rem' }}>
                    {MOCKUP.budgets.map((b) => (
                      <div className="pbv3-mbudget__row" key={b.label}>
                        <div className="top">
                          <span>{b.label}</span>
                          <span className="mono">{Math.round(b.value * 100)}%</span>
                        </div>
                        <div className="pbv3-mbudget__track">
                          <div
                            className="pbv3-mbudget__fill"
                            data-w={`${Math.round(b.value * 100)}%`}
                            style={{ '--final-w': `${Math.round(b.value * 100)}%` } as CSSProperties}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ticker */}
      <div className="pbv3-ticker" aria-hidden>
        <div className="pbv3-ticker__track" ref={tickerRef}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span className="pbv3-ticker__item" key={i}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* bento */}
      <section className="pbv3-section">
        <div className="shell">
          <div className="pbv3-reveal">
            <span className="pbv3-eyebrow">The product</span>
            <h2 className="pbv3-h2">
              Small tools that <span className="it">do the work.</span>
            </h2>
          </div>
          <div className="pbv3-bento">
            <div className="pbv3-cell pbv3-cell--wide pbv3-reveal">
              <div className="pbv3-cell__title">Search anything</div>
              <div className="pbv3-cell__hint">⌘K · instant</div>
              <SearchDemo reduce={reduce} />
            </div>
            <div className="pbv3-cell pbv3-reveal">
              <div className="pbv3-cell__title">Reports</div>
              <div className="pbv3-cell__hint">PDF export</div>
              <div className="pbv3-cell__demo pbv3-pdf">
                <span className="pl" />
                <span className="pl" />
                <span className="pl" />
                <span className="pl" />
              </div>
            </div>
            <div className="pbv3-cell pbv3-reveal">
              <div className="pbv3-cell__title">Recurring</div>
              <div className="pbv3-cell__hint">set once</div>
              <RecurringDemo reduce={reduce} />
            </div>
            <div className="pbv3-cell pbv3-reveal">
              <div className="pbv3-cell__title">Export</div>
              <div className="pbv3-cell__hint">your data, yours</div>
              <ExportDemo reduce={reduce} />
            </div>
            <div className="pbv3-cell pbv3-reveal">
              <div className="pbv3-cell__title">Private</div>
              <div className="pbv3-cell__hint">encrypted</div>
              <div className="pbv3-secure">
                <div className="pbv3-secure__guilloche">
                  <Guilloche n={16} rx={120} ry={50} opacity={0.5} />
                </div>
                <svg className="pbv3-secure__lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* manifesto */}
      <section className="pbv3-manifesto" id="manifesto">
        <div className="pbv3-manifesto__inner">
          <div className="shell">
            <p className="pbv3-manifesto__text">
              {words.map((w, i) => (
                <span key={i} className={`pbv3-mw${w.key ? ' key' : ''}`}>
                  {w.text}{' '}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* testimonials */}
      <section className="pbv3-voices" id="voices">
        <div className="shell" style={{ marginBottom: '2.5rem' }}>
          <span className="pbv3-eyebrow">Voices</span>
          <h2 className="pbv3-h2">
            Read like a magazine. <span className="it">Works like a spreadsheet.</span>
          </h2>
        </div>
        <div className="pbv3-voices__row" ref={voicesARef}>
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <figure className="pbv3-quote" key={`a${i}`}>
              <p>“{t.quote}”</p>
              <figcaption className="who">
                <b>{t.name}</b> · {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="pbv3-voices__row" ref={voicesBRef}>
          {[...TESTIMONIALS, ...TESTIMONIALS].reverse().map((t, i) => (
            <figure className="pbv3-quote" key={`b${i}`}>
              <p>“{t.quote}”</p>
              <figcaption className="who">
                <b>{t.name}</b> · {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="pbv3-section pbv3-cta">
        <div className="pbv3-cta__guilloche">
          <Guilloche n={30} rx={320} ry={130} opacity={0.4} />
        </div>
        <div className="shell">
          <span className="pbv3-eyebrow">{CTA.eyebrow}</span>
          <h2 className="pbv3-cta__title">{CTA.title}</h2>
          <p className="pbv3-cta__sub">{CTA.subtitle}</p>
          <button
            type="button"
            className="pbv3-btn pbv3-btn--pulse"
            data-cursor={HERO.cursorCta}
            onClick={onGetStarted}
          >
            {CTA.button}
          </button>
        </div>
      </section>

      {/* footer */}
      <footer className="pbv3-footer">
        <div className="pbv3-footer__word">{FOOTER.wordmark}</div>
        <div className="shell">
          <div className="pbv3-footer__meta">
            <span>{FOOTER.tagline}</span>
            <span className="mono">{FOOTER.note}</span>
            <span className="mono">© {new Date().getFullYear()} Personal Budget</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
