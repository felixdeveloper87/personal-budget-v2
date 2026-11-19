import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { ArrowDownLeft } from 'lucide-react'
import { useI18n } from '../../i18n'
import { DEMO_MONTHS } from './landingV3.config'

/*
 * Hero 3D scene — a ledger on a lilac desk, stacks of coins and a glass lens
 * that magnifies the cash-flow line. Pure CSS 3D (preserve-3d) driven by one
 * requestAnimationFrame loop that only writes CSS variables, so React never
 * re-renders while it animates. The whole scene is decorative (aria-hidden).
 *
 * World units are px inside a 640×640 stage that is scaled to fit the cover.
 */
const WORLD = 640
const PAPER = { x: 58, y: 118, w: 480, h: 300 }
const CHART = { left: 34, right: 446, top: 44, bottom: 262 }
const LENS_R = 98
const MAG = 1.42
const COIN_T = 9
const COIN_LAYERS = 5

const latest = DEMO_MONTHS[DEMO_MONTHS.length - 1]
const series = [...latest.balances, latest.income - latest.expenses]
const POINTS = series.map((value, i) => ({
  x: CHART.left + (i / (series.length - 1)) * (CHART.right - CHART.left),
  y: CHART.bottom - (value / 2400) * (CHART.bottom - CHART.top),
}))
const LINE = POINTS.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
const GRID_ROWS = Array.from({ length: 7 }, (_, i) => CHART.top + i * ((CHART.bottom - CHART.top) / 6))
const GRID_COLS = Array.from({ length: 9 }, (_, i) => CHART.left + i * ((CHART.right - CHART.left) / 8))

const STACKS = [
  { x: 486, y: 452, count: 9, size: 94 },
  { x: 384, y: 524, count: 6, size: 88 },
  { x: 276, y: 572, count: 2, size: 76 },
]
// Rest position for the lens when nothing drives it: over the latest rise.
const LENS_REST = { x: PAPER.x + POINTS[9].x, y: PAPER.y + POINTS[9].y + 12 }

// Geometry shared with LandingV3.css, plus the resting pose (used as-is when
// motion is reduced or before the first frame).
const sceneGeometry = {
  '--world': `${WORLD}px`,
  '--paper-x': `${PAPER.x}px`, '--paper-y': `${PAPER.y}px`,
  '--paper-w': `${PAPER.w}px`, '--paper-h': `${PAPER.h}px`,
  '--lens-r': `${LENS_R}px`, '--mag': MAG,
  '--coin-t': `${COIN_T}px`, '--coin-step': `${COIN_T / COIN_LAYERS}px`,
  '--rx': '50deg', '--rz': '-27deg', '--lift': '0px',
  '--lx': `${LENS_REST.x}px`, '--ly': `${LENS_REST.y}px`, '--lz': '84px', '--ls': 1,
  '--px': 0, '--py': 0,
} as CSSProperties

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const lerp = (from: number, to: number, t: number) => from + (to - from) * t
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2

/** Point on the chart polyline at progress s (0..1), in paper coordinates. */
function pointOnLine(s: number) {
  const scaled = clamp(s) * (POINTS.length - 1)
  const i = Math.min(POINTS.length - 2, Math.floor(scaled))
  const f = scaled - i
  return { x: lerp(POINTS[i].x, POINTS[i + 1].x, f), y: lerp(POINTS[i].y, POINTS[i + 1].y, f) }
}

function Ledger() {
  return (
    <svg className="lp-ledger-sheet" viewBox={`0 0 ${PAPER.w} ${PAPER.h}`}>
      <g className="lp-ledger-grid">
        {GRID_ROWS.map(y => <line key={`r${y}`} x1={14} x2={PAPER.w - 14} y1={y} y2={y} />)}
        {GRID_COLS.map(x => <line key={`c${x}`} x1={x} x2={x} y1={20} y2={PAPER.h - 18} />)}
      </g>
      <path className="lp-ledger-line" d={LINE} pathLength={1} />
      {POINTS.map((p, i) => i % 2 === 1 || i === POINTS.length - 1
        ? <circle key={i} className={i === POINTS.length - 1 ? 'lp-ledger-dot is-last' : 'lp-ledger-dot'}
            cx={p.x} cy={p.y} r={i === POINTS.length - 1 ? 5.2 : 3.6} style={{ '--d': i } as CSSProperties} />
        : null)}
    </svg>
  )
}

function CoinStack({ x, y, count, size, order }: (typeof STACKS)[number] & { order: number }) {
  return (
    <div className="lp-stack" style={{
      '--size': `${size}px`, '--x': `${x - size / 2}px`, '--y': `${y - size / 2}px`, '--h': count,
    } as CSSProperties}>
      <div className="lp-stack-shadow" />
      {Array.from({ length: count }, (_, i) => (
        <div className="lp-coin" key={i} style={{ '--i': i, '--delay': `${0.55 + order * 0.16 + i * 0.075}s` } as CSSProperties}>
          {Array.from({ length: COIN_LAYERS }, (_, l) => (
            <i key={l} style={{ '--l': l } as CSSProperties} />
          ))}
          <b />
        </div>
      ))}
    </div>
  )
}

function Lens() {
  return (
    <>
      <div className="lp-lens-shadow">
        <i className="lp-lens-shadow-ring" />
        <i className="lp-lens-shadow-handle" />
      </div>
      <div className="lp-lens">
        <div className="lp-lens-view">
          <div className="lp-lens-content"><Ledger /></div>
        </div>
        <div className="lp-lens-handle"><i /><b /></div>
        <i className="lp-lens-rim" style={{ '--z': 0 } as CSSProperties} />
        <i className="lp-lens-rim" style={{ '--z': 1 } as CSSProperties} />
        <i className="lp-lens-rim" style={{ '--z': 2 } as CSSProperties} />
        <i className="lp-lens-glass" />
      </div>
    </>
  )
}

export default function HeroScene({ children }: { children?: ReactNode }) {
  const { t, formatCurrency } = useI18n()
  const coverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cover = coverRef.current
    if (!cover) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const set = (name: string, value: string) => cover.style.setProperty(name, value)

    const fit = () => {
      const { width, height } = cover.getBoundingClientRect()
      set('--fit', (Math.max(width, height * 1.08) / (WORLD * 1.02)).toFixed(4))
    }
    const resize = new ResizeObserver(fit)
    resize.observe(cover)
    fit()

    const pointer = { x: 0.5, y: 0.5, active: false, last: -Infinity }
    const state = { lx: LENS_REST.x, ly: LENS_REST.y, px: 0, py: 0 }
    const start = performance.now()
    let frame = 0
    let visible = true

    const render = (now: number, still: boolean) => {
      const time = still ? 99 : (now - start) / 1000
      const intro = easeOutCubic(clamp((time - 0.05) / 1.7))
      const lensIn = easeOutBack(clamp((time - 0.45) / 1.25))
      const rect = cover.getBoundingClientRect()
      const scroll = clamp(-rect.top / Math.max(rect.height, 1))
      const idle = still || !pointer.active || now - pointer.last > 2600

      let tx = LENS_REST.x
      let ty = LENS_REST.y
      if (!still && idle && time > 1.6) {
        // Glide back and forth along the cash-flow line, like reading it.
        // Phase π/6 starts the glide where the lens already rests (s = .75).
        const s = (Math.sin((time - 1.6) * 0.26 + Math.PI / 6) + 1) / 2
        const p = pointOnLine(0.12 + s * 0.84)
        tx = PAPER.x + p.x
        ty = PAPER.y + p.y + 14
      } else if (!idle) {
        tx = PAPER.x + CHART.left + pointer.x * (CHART.right - CHART.left)
        ty = PAPER.y + CHART.top + pointer.y * (CHART.bottom - CHART.top)
      }
      const follow = still ? 1 : idle ? 0.03 : 0.085
      state.lx += (tx - state.lx) * follow
      state.ly += (ty - state.ly) * follow

      const aimX = still ? 0 : idle ? Math.sin(time * 0.37) * 0.35 : pointer.x * 2 - 1
      const aimY = still ? 0 : idle ? Math.cos(time * 0.29) * 0.25 : pointer.y * 2 - 1
      state.px += (aimX - state.px) * (still ? 1 : 0.05)
      state.py += (aimY - state.py) * (still ? 1 : 0.05)

      set('--rx', `${(lerp(14, 50, intro) - state.py * 4.5 + scroll * 14).toFixed(3)}deg`)
      set('--rz', `${(lerp(-6, -27, intro) + state.px * 5).toFixed(3)}deg`)
      set('--lift', `${(lerp(-60, 0, intro)).toFixed(2)}px`)
      set('--lx', `${state.lx.toFixed(2)}px`)
      set('--ly', `${state.ly.toFixed(2)}px`)
      set('--lz', `${(lerp(340, 84, lensIn) + Math.sin(time * 1.2) * 6 + scroll * 120).toFixed(2)}px`)
      set('--ls', lerp(0.55, 1, clamp(lensIn * 1.4)).toFixed(3))
      set('--px', state.px.toFixed(3))
      set('--py', state.py.toFixed(3))
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
      const rect = cover.getBoundingClientRect()
      pointer.x = clamp((event.clientX - rect.left) / rect.width)
      pointer.y = clamp((event.clientY - rect.top) / rect.height)
      pointer.active = true
      pointer.last = performance.now()
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
  }, [])

  return (
    <div className="lp-cover lp-scene" ref={coverRef} style={sceneGeometry}>
      <div className="lp-scene-fit" aria-hidden="true">
        <div className="lp-scene-table">
          <div className="lp-ledger"><Ledger /></div>
          {STACKS.map((stack, order) => <CoinStack key={order} order={order} {...stack} />)}
          <Lens />
        </div>
      </div>
      <div className="lp-scene-light" aria-hidden="true" />
      <div className="lp-scene-chip" aria-hidden="true">
        <span><ArrowDownLeft size={15} /></span>
        <div><small>{t('landing.snapshot.income')}</small><strong>{formatCurrency(latest.income)}</strong></div>
      </div>
      {children}
    </div>
  )
}
