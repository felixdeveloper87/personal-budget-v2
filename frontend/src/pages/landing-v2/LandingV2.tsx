import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import './LandingV2.css'
import {
  BARS,
  CTA,
  DONUT,
  FEATURES,
  FEED_SAMPLES,
  FOOTER,
  HERO,
  HERO_CARD,
  HERO_PILLS,
  NAV_LINKS,
  STATS,
  TICKER,
} from './landingV2.config'

interface LandingV2Props {
  onGetStarted: () => void
}

const BRAND_WORD = 'Personal Budget'

/** Generic number counter with a cubic ease-out, shared by the stats block. */
function animateNum(
  el: HTMLElement,
  target: number,
  fmt: (n: number) => string,
  dur = 1500,
) {
  const start = performance.now()
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / dur)
    const eased = 1 - (1 - p) ** 3
    el.textContent = fmt(Math.round(target * eased))
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

interface FeedRow {
  key: number
  label: string
  amount: string
  tone: 'mint' | 'gold' | 'muted'
}

export default function LandingV2({ onGetStarted }: LandingV2Props) {
  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  /* ---------------------------------------------------------------- refs -- */
  const rootRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const goldBlobRef = useRef<HTMLDivElement>(null)
  const mintBlobRef = useRef<HTMLDivElement>(null)
  const dustRef = useRef<HTMLCanvasElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const donutRef = useRef<HTMLDivElement>(null)
  const barsRef = useRef<HTMLDivElement>(null)

  /* --------------------------------------------------------------- state -- */
  const [curtainUp, setCurtainUp] = useState(reduceMotion)
  const [loaderGone, setLoaderGone] = useState(reduceMotion)
  const [feed, setFeed] = useState<FeedRow[]>(() =>
    FEED_SAMPLES.slice(0, 4).map((s, i) => ({ key: i, ...s })),
  )

  /* donut geometry — deterministic, computed once */
  const donutSegs = useMemo(() => {
    const C = 2 * Math.PI * 54
    let acc = 0
    return DONUT.map((d) => {
      const frac = d.value / 100
      const arc = frac * C
      const startDeg = acc * 360
      acc += frac
      return { ...d, arc, startDeg, C }
    })
  }, [])

  /* ------------------------------------------------------------ preloader -- */
  useEffect(() => {
    if (reduceMotion) return
    const t1 = window.setTimeout(() => setCurtainUp(true), 1500)
    const t2 = window.setTimeout(() => setLoaderGone(true), 2500)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [reduceMotion])

  /* ----------------------------------------- scroll: nav, progress, parallax */
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const y = window.scrollY
        const docH = document.documentElement.scrollHeight - window.innerHeight
        navRef.current?.classList.toggle('scrolled', y > 12)
        if (progressRef.current) {
          progressRef.current.style.transform = `scaleX(${docH > 0 ? y / docH : 0})`
        }
        if (!reduceMotion) {
          if (goldBlobRef.current)
            goldBlobRef.current.style.transform = `translateY(${y * 0.12}px)`
          if (mintBlobRef.current)
            mintBlobRef.current.style.transform = `translateY(${y * -0.08}px)`
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduceMotion])

  /* ------------------------------------------------- reveal-on-scroll (IO) -- */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const targets = root.querySelectorAll<HTMLElement>('.pbv2-reveal, .pbv2-feature')
    if (reduceMotion) {
      targets.forEach((el) => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '-60px' },
    )
    targets.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [reduceMotion])

  /* --------------------------------------------- feature icons: self-draw -- */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    root
      .querySelectorAll<SVGPathElement>('.pbv2-feature__icon path')
      .forEach((p) => {
        const len = Math.ceil(p.getTotalLength() || 120)
        p.style.setProperty('--len', String(len))
      })
  }, [])

  /* ----------------------------------------------------- stats counters IO -- */
  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const run = () => {
      el.querySelectorAll<HTMLElement>('.pbv2-stat__num').forEach((node) => {
        const target = Number(node.dataset.target ?? '0')
        const prefix = node.dataset.prefix ?? ''
        const suffix = node.dataset.suffix ?? ''
        if (reduceMotion) {
          node.textContent = `${prefix}${target}${suffix}`
          return
        }
        animateNum(node, target, (n) => `${prefix}${n}${suffix}`)
      })
    }
    if (reduceMotion) {
      run()
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run()
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduceMotion])

  /* ------------------------------------------------------ donut draw on IO -- */
  useEffect(() => {
    const el = donutRef.current
    if (!el) return
    const circles = el.querySelectorAll<SVGCircleElement>('circle[data-arc]')
    const draw = () =>
      circles.forEach((c) => {
        c.style.strokeDashoffset = '0'
      })
    if (reduceMotion) {
      draw()
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          draw()
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduceMotion])

  /* -------------------------------------------------------- bars grow on IO -- */
  useEffect(() => {
    const el = barsRef.current
    if (!el) return
    const fills = el.querySelectorAll<HTMLElement>('.pbv2-bar__fill')
    const grow = () =>
      fills.forEach((f) => {
        f.style.height = f.dataset.h ?? '0%'
      })
    if (reduceMotion) {
      grow()
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          grow()
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduceMotion])

  /* ----------------------------------------------------------- live feed -- */
  useEffect(() => {
    if (reduceMotion) return
    let n = FEED_SAMPLES.length
    const id = window.setInterval(() => {
      const sample = FEED_SAMPLES[Math.floor(Math.random() * FEED_SAMPLES.length)]
      setFeed((prev) => [{ key: n++, ...sample }, ...prev].slice(0, 6))
    }, 2800)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  /* ------------------------------------------------- gold dust particles -- */
  useEffect(() => {
    const canvas = dustRef.current
    if (!canvas || reduceMotion) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vy: Math.random() * 0.4 + 0.12,
      vx: (Math.random() - 0.5) * 0.2,
      a: Math.random(),
      tw: Math.random() * 0.04 + 0.01,
    }))

    let raf = 0
    const loop = () => {
      ctx.clearRect(0, 0, w, h)
      particles.forEach((p) => {
        p.y -= p.vy
        p.x += p.vx
        p.a += p.tw
        if (p.y < -5) {
          p.y = h + 5
          p.x = Math.random() * w
        }
        const alpha = 0.25 + Math.abs(Math.sin(p.a)) * 0.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(232, 197, 122, ${alpha})`
        ctx.fill()
      })
      raf = requestAnimationFrame(loop)
    }
    loop()
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [reduceMotion])

  /* ---------------------------------------------- 3D tilt + magnetic (hover) */
  useEffect(() => {
    if (reduceMotion) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const root = rootRef.current
    if (!root) return
    const cleanups: Array<() => void> = []

    // tilt
    root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
      const strength = Number(el.dataset.tilt) || 10
      const onMove = (ev: MouseEvent) => {
        const r = el.getBoundingClientRect()
        const px = (ev.clientX - r.left) / r.width - 0.5
        const py = (ev.clientY - r.top) / r.height - 0.5
        el.style.transform = `rotateY(${px * strength}deg) rotateX(${-py * strength}deg)`
      }
      const onLeave = () => {
        el.style.transform = ''
      }
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      })
    })

    // magnetic
    root.querySelectorAll<HTMLElement>('.pbv2-magnetic').forEach((el) => {
      const onMove = (ev: MouseEvent) => {
        const r = el.getBoundingClientRect()
        const x = ev.clientX - r.left - r.width / 2
        const y = ev.clientY - r.top - r.height / 2
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`
      }
      const onLeave = () => {
        el.style.transform = ''
      }
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      })
    })

    return () => cleanups.forEach((fn) => fn())
  }, [reduceMotion])

  /* --------------------------------------------------------------- helpers */
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="pbv2" ref={rootRef}>
      {!reduceMotion && <canvas className="pbv2-dust" ref={dustRef} aria-hidden />}
      <div className="pbv2-progress" ref={progressRef} aria-hidden />

      {/* ───────────────────────── Preloader ───────────────────────── */}
      {!loaderGone && (
        <div className={`pbv2-loader${curtainUp ? ' done' : ''}`} aria-hidden>
          <div className="pbv2-loader__word">
            {BRAND_WORD.split('').map((ch, i) => (
              <span key={i} style={{ animationDelay: `${0.2 + i * 0.045}s` }}>
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
          </div>
          <div className="pbv2-loader__bar" />
        </div>
      )}

      {/* ─────────────────────────── Nav ───────────────────────────── */}
      <nav className="pbv2-nav" ref={navRef}>
        <div className="shell">
          <div className="pbv2-brand">
            <span className="pbv2-brand__mark">P</span>
            Personal Budget
          </div>
          <div className="pbv2-nav__links">
            {NAV_LINKS.map((l, i) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                style={{ animationDelay: `${0.25 + i * 0.08}s` }}
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
              className="pbv2-btn pbv2-btn--gold pbv2-btn--sm pbv2-nav__cta"
              onClick={onGetStarted}
            >
              <span className="pbv2-btn__shine" />
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* ────────────────────────── Hero ───────────────────────────── */}
      <header className="pbv2-hero">
        <div className="pbv2-blob pbv2-blob--gold" ref={goldBlobRef} aria-hidden />
        <div className="pbv2-blob pbv2-blob--mint" ref={mintBlobRef} aria-hidden />
        <div className="shell">
          <div>
            <span className="pbv2-eyebrow pbv2-hero__eyebrow">{HERO.eyebrow}</span>
            <h1 className="pbv2-hero__title">
              {HERO.lines.map((line, i) => {
                const at = line.indexOf(HERO.accentWord)
                return (
                  <span className="pbv2-hero__line" key={i}>
                    <span style={{ animationDelay: `${0.55 + i * 0.12}s` }}>
                      {at === -1 ? (
                        line
                      ) : (
                        <>
                          {line.slice(0, at)}
                          <span className="pbv2-gold">{HERO.accentWord}</span>
                        </>
                      )}
                    </span>
                  </span>
                )
              })}
            </h1>
            <p className="pbv2-hero__sub">{HERO.subtitle}</p>
            <div className="pbv2-hero__cta">
              <button
                type="button"
                className="pbv2-btn pbv2-btn--gold pbv2-magnetic"
                onClick={onGetStarted}
              >
                <span className="pbv2-btn__shine" />
                {HERO.primaryCta}
              </button>
              <button
                type="button"
                className="pbv2-btn pbv2-btn--ghost"
                onClick={() => scrollTo('dashboard')}
              >
                {HERO.secondaryCta}
              </button>
            </div>
          </div>

          {/* 3D card stage */}
          <div className="pbv2-stage">
            <div className="pbv2-card-tilt" data-tilt="14">
              <div className="pbv2-card">
                <div className="pbv2-card__top">
                  <span>{HERO_CARD.brand}</span>
                  <span className="pbv2-card__tier">{HERO_CARD.tier}</span>
                </div>
                <div className="pbv2-card__chip" />
                <div className="pbv2-card__number">{HERO_CARD.number}</div>
                <div className="pbv2-card__bottom">
                  <div>
                    <div className="pbv2-card__label">{HERO_CARD.holder}</div>
                    <div className="pbv2-card__value">{HERO_CARD.valid}</div>
                  </div>
                  <div className="pbv2-card__balance">
                    <div className="pbv2-card__label">{HERO_CARD.balanceLabel}</div>
                    <b>{HERO_CARD.balance}</b>
                  </div>
                </div>
              </div>
            </div>

            {HERO_PILLS.map((p) => (
              <div className={`pbv2-pill pbv2-pill--${p.tone}`} key={p.id}>
                <span className="pbv2-pill__label">{p.label}</span>
                <span className="pbv2-pill__amount">{p.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ────────────────────────── Ticker ─────────────────────────── */}
      <div className="pbv2-ticker" aria-hidden>
        <div className="pbv2-ticker__track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span className="pbv2-ticker__item" key={i}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ───────────────────────── Features ────────────────────────── */}
      <section className="pbv2-section" id="features">
        <div className="shell">
          <div className="pbv2-reveal">
            <span className="pbv2-eyebrow">What you get</span>
            <h2 className="pbv2-h2">
              Built to make the picture <span className="pbv2-gold">obvious.</span>
            </h2>
          </div>
          <div className="pbv2-features__grid">
            {FEATURES.map((f) => (
              <article className="pbv2-feature" data-tilt="8" key={f.id}>
                <div className="pbv2-feature__inner">
                  <div className="pbv2-feature__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path d={f.icon} />
                    </svg>
                  </div>
                  <h3 className="pbv2-feature__title">{f.title}</h3>
                  <p className="pbv2-feature__desc">{f.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────── Dashboard ────────────────────────── */}
      <section className="pbv2-section" id="dashboard">
        <div className="shell">
          <div className="pbv2-reveal">
            <span className="pbv2-eyebrow">Your month, at a glance</span>
            <h2 className="pbv2-h2">
              One transaction. <span className="pbv2-gold">Everything follows.</span>
            </h2>
          </div>

          <div className="pbv2-dash">
            {/* bars */}
            <div className="pbv2-panel pbv2-reveal" ref={barsRef}>
              <div className="pbv2-panel__head">
                <span className="pbv2-panel__title">Spending this week</span>
                <span className="pbv2-panel__meta">£312.40</span>
              </div>
              <div className="pbv2-bars">
                {BARS.map((b, i) => (
                  <div className="pbv2-bar" key={i}>
                    <div
                      className="pbv2-bar__fill"
                      data-h={`${Math.round(b.value * 100)}%`}
                      style={
                        { '--final-h': `${Math.round(b.value * 100)}%` } as CSSProperties
                      }
                    />
                    <span className="pbv2-bar__label">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* donut */}
            <div className="pbv2-panel pbv2-reveal" ref={donutRef}>
              <div className="pbv2-panel__head">
                <span className="pbv2-panel__title">Where it goes</span>
                <span className="pbv2-panel__meta">£1,950</span>
              </div>
              <div className="pbv2-donut">
                <svg width="120" height="120" viewBox="0 0 130 130">
                  <circle cx="65" cy="65" r="54" stroke="rgba(245,242,234,0.06)" />
                  {donutSegs.map((s, i) => (
                    <circle
                      key={i}
                      cx="65"
                      cy="65"
                      r="54"
                      stroke={s.color}
                      data-arc
                      style={{
                        strokeDasharray: `${s.arc} ${s.C}`,
                        strokeDashoffset: reduceMotion ? 0 : s.arc,
                        transform: `rotate(${s.startDeg}deg)`,
                        transformOrigin: '65px 65px',
                      }}
                    />
                  ))}
                </svg>
                <div className="pbv2-donut__legend">
                  {DONUT.map((d) => (
                    <div className="pbv2-legend-row" key={d.label}>
                      <span className="pbv2-dot" style={{ background: d.color }} />
                      {d.label}
                      <b>{d.value}%</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* live feed */}
          <div className="pbv2-panel pbv2-reveal" style={{ marginTop: '1.4rem' }}>
            <div className="pbv2-panel__head">
              <span className="pbv2-panel__title">Recent activity</span>
              <span className="pbv2-live">Live</span>
            </div>
            <div className="pbv2-feed">
              {feed.map((row) => (
                <div className="pbv2-feed__row" key={row.key}>
                  <span className="pbv2-feed__label">{row.label}</span>
                  <span className={`pbv2-feed__amount ${row.tone}`}>{row.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Stats ───────────────────────────── */}
      <section className="pbv2-section" id="stats">
        <div className="shell">
          <div className="pbv2-stats__grid" ref={statsRef}>
            {STATS.map((s) => (
              <div className="pbv2-stat pbv2-reveal" key={s.id}>
                <div
                  className="pbv2-stat__num"
                  data-target={s.value}
                  data-prefix={s.prefix}
                  data-suffix={s.suffix}
                >
                  {`${s.prefix}0${s.suffix}`}
                </div>
                <div className="pbv2-stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────── CTA ────────────────────────────── */}
      <section className="pbv2-section pbv2-cta">
        <div className="pbv2-cta__glow" aria-hidden />
        <div className="shell">
          <div className="pbv2-reveal" style={{ display: 'inline-block' }}>
            <span className="pbv2-eyebrow">{CTA.eyebrow}</span>
            <h2 className="pbv2-cta__title">{CTA.title}</h2>
            <p className="pbv2-cta__sub">{CTA.subtitle}</p>
            <div className="pbv2-cta__btn-wrap">
              {!reduceMotion && <span className="pbv2-cta__ring" aria-hidden />}
              <button
                type="button"
                className="pbv2-btn pbv2-btn--gold pbv2-magnetic"
                onClick={onGetStarted}
              >
                <span className="pbv2-btn__shine" />
                {CTA.button}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Footer ──────────────────────────── */}
      <footer className="pbv2-footer">
        <div className="pbv2-footer__marquee" aria-hidden>
          <div className="pbv2-footer__track">
            {[0, 1, 2].map((i) => (
              <span className="pbv2-footer__word" key={i}>
                {FOOTER.wordmark}
              </span>
            ))}
          </div>
        </div>
        <div className="shell">
          <div className="pbv2-footer__meta">
            <span>{FOOTER.tagline}</span>
            <span className="mono">{FOOTER.note}</span>
            <span className="mono">© {new Date().getFullYear()} Personal Budget</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
