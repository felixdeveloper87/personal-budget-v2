import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Bus, ShoppingBasket, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { useI18n } from '../../i18n'
import { DEMO_MONTHS } from './landingV3.config'

/*
 * Hero scene — an "exploded view" of the product: three glass panels (cash
 * flow, budgets, budget ring) float at different depths in one CSS 3D stage.
 * A cursor reads along the cash-flow curve, and every few seconds a new
 * transaction lands on top and visibly moves its budget bar and the ring.
 *
 * One requestAnimationFrame loop writes CSS variables and the cursor's
 * position directly, so React only re-renders when a transaction lands.
 * The whole scene is decorative (aria-hidden).
 *
 * World units are px inside a STAGE_W × STAGE_H stage scaled to fit the cover.
 */
const STAGE_W = 600
const STAGE_H = 540
const PLOT = { w: 352, h: 148, max: 2400 }

const latest = DEMO_MONTHS[DEMO_MONTHS.length - 1]
const series = [...latest.balances, latest.income - latest.expenses]
const POINTS = series.map((value, i) => ({
  x: (i / (series.length - 1)) * PLOT.w,
  y: PLOT.h - 6 - (value / PLOT.max) * (PLOT.h - 18),
}))

/** Catmull-Rom through every point, as cubic Béziers: a smooth curve that still hits each value. */
const LINE = POINTS.reduce((d, p, i) => {
  if (i === 0) return `M${p.x},${p.y.toFixed(1)}`
  const p0 = POINTS[i - 2] ?? POINTS[i - 1]
  const p1 = POINTS[i - 1]
  const p3 = POINTS[i + 1] ?? p
  const c1 = { x: p1.x + (p.x - p0.x) / 6, y: p1.y + (p.y - p0.y) / 6 }
  const c2 = { x: p.x - (p3.x - p1.x) / 6, y: p.y - (p3.y - p1.y) / 6 }
  return `${d} C${c1.x.toFixed(1)},${c1.y.toFixed(1)} ${c2.x.toFixed(1)},${c2.y.toFixed(1)} ${p.x},${p.y.toFixed(1)}`
}, '')
const AREA = `${LINE} L${PLOT.w},${PLOT.h} L0,${PLOT.h} Z`

interface Budget { category: string, icon: LucideIcon, spent: number, limit: number, tone: string }
const BUDGETS: Budget[] = [
  { category: 'Groceries', icon: ShoppingBasket, spent: 286, limit: 400, tone: '#712ab2' },
  { category: 'Transport', icon: Bus, spent: 92, limit: 150, tone: '#c0712b' },
  { category: 'Dining out', icon: UtensilsCrossed, spent: 118, limit: 200, tone: '#3d8a5c' },
]
// Transactions that land one by one; each adds to its budget row.
const ARRIVALS = [
  { budget: 0, amount: 24.6 },
  { budget: 1, amount: 12.4 },
  { budget: 2, amount: 18.9 },
]
const TOTAL_LIMIT = BUDGETS.reduce((sum, b) => sum + b.limit, 0)
const RING_R = 44

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const lerp = (from: number, to: number, t: number) => from + (to - from) * t
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

/** Running balance under the cursor, interpolated between the daily points. */
function valueAt(x: number) {
  const scaled = clamp(x / PLOT.w) * (series.length - 1)
  const i = Math.min(series.length - 2, Math.floor(scaled))
  return lerp(series[i], series[i + 1], scaled - i)
}

const layer = (z: number, float: number) => ({ '--z': `${z}px`, '--float': `${float}s` } as CSSProperties)

export default function HeroScene({ children }: { children?: ReactNode }) {
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()
  const coverRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<SVGPathElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)
  // How many ARRIVALS have landed; wraps to 0 to start the month again.
  const [landed, setLanded] = useState(0)

  const spent = BUDGETS.map((b, i) => b.spent + ARRIVALS
    .slice(0, landed).filter(a => a.budget === i).reduce((sum, a) => sum + a.amount, 0))
  const totalSpent = spent.reduce((sum, value) => sum + value, 0)
  const ringShare = totalSpent / TOTAL_LIMIT
  const arrival = landed > 0 ? ARRIVALS[landed - 1] : null
  const period = formatDate(latest.start, { month: 'short', year: 'numeric' })

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return
    let timer = 0
    const next = () => {
      setLanded(n => (n + 1) % (ARRIVALS.length + 1))
      timer = window.setTimeout(next, 3400)
    }
    timer = window.setTimeout(next, 2600)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const cover = coverRef.current
    const line = lineRef.current
    if (!cover || !line) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const set = (name: string, value: string) => cover.style.setProperty(name, value)

    const fit = () => {
      const { width, height } = cover.getBoundingClientRect()
      set('--fit', (Math.min(width / STAGE_W, height / STAGE_H) * 0.94).toFixed(4))
    }
    const resize = new ResizeObserver(fit)
    resize.observe(cover)
    fit()

    const length = line.getTotalLength()
    const pointer = { x: 0.5, y: 0.5, active: false }
    const state = { px: 0, py: 0 }
    const start = performance.now()
    let tip = ''
    let frame = 0
    let visible = true

    const render = (now: number, still: boolean) => {
      const time = still ? 99 : (now - start) / 1000
      const intro = easeOutCubic(clamp((time - 0.15) / 1.6))
      const rect = cover.getBoundingClientRect()
      const scroll = clamp(-rect.top / Math.max(rect.height, 1))

      const aimX = still ? 0 : pointer.active ? pointer.x * 2 - 1 : Math.sin(time * 0.3) * 0.45
      const aimY = still ? 0 : pointer.active ? pointer.y * 2 - 1 : Math.cos(time * 0.23) * 0.35
      state.px += (aimX - state.px) * (still ? 1 : 0.06)
      state.py += (aimY - state.py) * (still ? 1 : 0.06)

      set('--rx', `${(lerp(0, 13, intro) - state.py * 5).toFixed(3)}deg`)
      set('--ry', `${(lerp(0, -19, intro) + state.px * 9).toFixed(3)}deg`)
      set('--explode', (intro + scroll * 0.7).toFixed(3))
      set('--px', state.px.toFixed(3))
      set('--py', state.py.toFixed(3))

      // The cursor reads the curve back and forth, resting at month end when motion is reduced.
      const read = still ? 1 : 0.5 - 0.5 * Math.cos(Math.max(0, time - 1.4) * 0.42)
      const point = line.getPointAtLength(read * length)
      cursorRef.current?.style.setProperty('--cx', `${point.x.toFixed(1)}px`)
      cursorRef.current?.style.setProperty('--cy', `${point.y.toFixed(1)}px`)
      const label = formatCurrency(Math.round(valueAt(point.x)), { maximumFractionDigits: 0 })
      if (label !== tip && tipRef.current) tipRef.current.textContent = tip = label
    }

    const tick = (now: number) => {
      frame = 0
      if (reduced.matches) {
        render(now, true)
        return
      }
      render(now, false)
      if (visible) frame = requestAnimationFrame(tick)
    }
    const kick = () => { if (!frame) frame = requestAnimationFrame(tick) }

    const seen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) kick()
    })
    seen.observe(cover)

    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const bounds = cover.getBoundingClientRect()
      pointer.x = clamp((event.clientX - bounds.left) / bounds.width)
      pointer.y = clamp((event.clientY - bounds.top) / bounds.height)
      pointer.active = true
    }
    const leave = () => { pointer.active = false }
    cover.addEventListener('pointermove', move)
    cover.addEventListener('pointerleave', leave)
    reduced.addEventListener('change', kick)
    kick()

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      seen.disconnect()
      cover.removeEventListener('pointermove', move)
      cover.removeEventListener('pointerleave', leave)
      reduced.removeEventListener('change', kick)
    }
  }, [formatCurrency])

  const ArrivalIcon = arrival ? BUDGETS[arrival.budget].icon : null

  return (
    <div className="lp-cover lp-scene" ref={coverRef}>
      <div className="lp-scene-fit" aria-hidden="true" style={{ '--stage-w': `${STAGE_W}px`, '--stage-h': `${STAGE_H}px` } as CSSProperties}>
        <div className="lp-scene-stage">
          <div className="lp-scene-floor" />

          <div className="lp-panel lp-panel-flow" style={layer(-70, 7.4)}>
            <div className="lp-panel-head">
              <span><i style={{ background: '#712ab2' }} />{t('landing.snapshot.cashFlow')}</span>
              <small>{period}</small>
            </div>
            <div className="lp-flow-total">
              <strong>{formatCurrency(latest.income - latest.expenses)}</strong>
              <small>{t('landing.snapshot.monthBalance')}</small>
            </div>
            <div className="lp-flow-plot">
              <svg width={PLOT.w} height={PLOT.h} viewBox={`0 0 ${PLOT.w} ${PLOT.h}`}>
                <defs>
                  <linearGradient id="lp-flow-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8a46cf" stopOpacity=".26" />
                    <stop offset="100%" stopColor="#8a46cf" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[.25, .5, .75].map(f => <line key={f} className="lp-flow-grid" x1={0} x2={PLOT.w} y1={PLOT.h * f} y2={PLOT.h * f} />)}
                <path className="lp-flow-area" d={AREA} fill="url(#lp-flow-fill)" />
                <path className="lp-flow-line" d={LINE} pathLength={1} />
                {/* Unscaled copy for getPointAtLength (pathLength would skew the measurement). */}
                <path ref={lineRef} d={LINE} fill="none" stroke="none" />
              </svg>
              <div className="lp-flow-cursor" ref={cursorRef}>
                <b />
                <i />
                <span ref={tipRef} />
              </div>
            </div>
          </div>

          <div className="lp-panel lp-panel-budgets" style={layer(30, 8.6)}>
            <div className="lp-panel-head">
              <span><i style={{ background: '#c0712b' }} />{t('landing.scene.budgets')}</span>
              <small>{period}</small>
            </div>
            {BUDGETS.map(({ category, icon: Icon, limit, tone }, i) => (
              <div className={arrival?.budget === i ? 'lp-budget is-hit' : 'lp-budget'} key={category}
                style={{ '--tone': tone, '--share': clamp(spent[i] / limit) } as CSSProperties}>
                <span className="lp-budget-icon"><Icon size={14} strokeWidth={2.2} /></span>
                <div>
                  <p>
                    <span>{categoryLabel(category)}</span>
                    <small><b>{formatCurrency(spent[i], { maximumFractionDigits: 0 })}</b> / {formatCurrency(limit, { maximumFractionDigits: 0 })}</small>
                  </p>
                  <span className="lp-budget-bar"><i /></span>
                </div>
              </div>
            ))}
          </div>

          <div className="lp-panel lp-panel-ring" style={layer(110, 6.8)}>
            <div className="lp-ring-dial">
              <svg viewBox="0 0 112 112" width={112} height={112}>
                <circle className="lp-ring-track" cx={56} cy={56} r={RING_R} />
                <circle className="lp-ring-fill" cx={56} cy={56} r={RING_R} pathLength={100}
                  style={{ '--share': clamp(ringShare) } as CSSProperties} />
              </svg>
              <strong>{Math.round(ringShare * 100)}%</strong>
            </div>
            <small>{t('landing.scene.ofBudget')}</small>
          </div>

          {arrival && ArrivalIcon && (
            <div className="lp-arrival" key={landed} style={{ ...layer(170, 5.2), '--tone': BUDGETS[arrival.budget].tone } as CSSProperties}>
              <span><ArrivalIcon size={15} strokeWidth={2.2} /></span>
              <p>{categoryLabel(BUDGETS[arrival.budget].category)}<small>{t('landing.scene.justNow')}</small></p>
              <strong>−{formatCurrency(arrival.amount)}</strong>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
