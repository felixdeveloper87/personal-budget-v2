import { useMemo, useState, type KeyboardEvent } from 'react'
import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import type { TxnVM, TxView } from '../transactions.types'
import { fmtCurrency } from '../../dashboard/components/format'
import { groupKey, parseISO } from '../transactions.utils'
import './DailyChart.css'

export interface ChartDay {
  iso: string
  date: Date
}

interface DailyChartProps {
  days: ChartDay[]
  txns: TxnVM[]
  view: TxView
  selectedDay: string | null
  onSelectDay: (iso: string) => void
  hlRhythm: boolean
  hlMomentum: boolean
  rhythmWeekday: number | null
  monthLabel: string
  reduce: boolean
}

const VW = 720
const VH = 196
const AXIS_Y = 164
const TOP = 14
const USABLE = AXIS_Y - TOP // 150
const MAX_BAR_W = 14

const WD_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

export default function DailyChart({
  days,
  txns,
  view,
  selectedDay,
  onSelectDay,
  hlRhythm,
  hlMomentum,
  rhythmWeekday,
  monthLabel,
  reduce,
}: DailyChartProps) {
  const [hover, setHover] = useState<
    { iso: string; leftPct: number; inV: number; outV: number } | null
  >(null)

  // Per-day in/out totals, keyed by the active view axis (purchase date in
  // Behaviour, settlement date in Payments) so bars match the ledger grouping.
  const totals = useMemo(() => {
    const map = new Map<string, { in: number; out: number }>()
    for (const t of txns) {
      const key = groupKey(t, view)
      const cur = map.get(key) ?? { in: 0, out: 0 }
      if (t.type === 'in') cur.in += t.amount
      else cur.out += t.amount
      map.set(key, cur)
    }
    return map
  }, [txns, view])

  const n = Math.max(days.length, 1)
  const colW = VW / n
  const barW = Math.min(MAX_BAR_W, colW * 0.62)

  const max = useMemo(() => {
    let m = 0
    for (const d of days) {
      const v = totals.get(d.iso)
      if (v) m = Math.max(m, v.in + v.out)
    }
    return m || 1
  }, [days, totals])

  const scale = (v: number) => (v > 0 ? Math.max(3, (v / max) * USABLE * 0.95) : 0)

  const selectedIndex = selectedDay ? days.findIndex((d) => d.iso === selectedDay) : -1

  const onHit = (d: ChartDay, i: number) => {
    const v = totals.get(d.iso) ?? { in: 0, out: 0 }
    setHover({
      iso: d.iso,
      leftPct: ((i * colW + colW / 2) / VW) * 100,
      inV: v.in,
      outV: v.out,
    })
  }

  const onKey = (e: KeyboardEvent<SVGRectElement>, iso: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelectDay(iso)
    }
  }

  const svgClass = [
    'pb-chart-svg',
    hlRhythm && rhythmWeekday != null ? 'hl-tue' : '',
    hlMomentum ? 'hl-h2' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Box>
      <Box className="pb-chart-wrap">
        {hover && (
          <Box className="pb-chart-tip" style={{ left: `${hover.leftPct}%` }}>
            <div className="pb-chart-tip-head">
              {WD_SHORT[parseISO(hover.iso).getDay()]}{' '}
              {parseISO(hover.iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }).toUpperCase()}
            </div>
            <div className="pb-chart-tip-row in">
              <span>In</span>
              <span>{fmtCurrency(hover.inV, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="pb-chart-tip-row out">
              <span>Out</span>
              <span>{fmtCurrency(hover.outV, { minimumFractionDigits: 2 })}</span>
            </div>
          </Box>
        )}

        <svg
          className={svgClass}
          viewBox={`0 0 ${VW} ${VH}`}
          role="img"
          aria-label={`Daily income and spending for ${monthLabel}`}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="pb-tx-out" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c0563d" />
              <stop offset="100%" stopColor="#a8432e" />
            </linearGradient>
            <linearGradient id="pb-tx-in" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f9d74" />
              <stop offset="100%" stopColor="#2d6a4f" />
            </linearGradient>
          </defs>

          {/* Background bands */}
          <g aria-hidden>
            {days.map((d, i) => {
              const dom = d.date.getDate()
              const x = i * colW
              return (
                <g key={`band-${d.iso}`}>
                  {rhythmWeekday != null && d.date.getDay() === rhythmWeekday && (
                    <rect className="tue-band" x={x} y={TOP} width={colW} height={AXIS_Y - TOP} />
                  )}
                  {dom > 15 && (
                    <rect className="h2-band" x={x} y={TOP} width={colW} height={AXIS_Y - TOP} />
                  )}
                </g>
              )
            })}
          </g>

          {/* Day selection */}
          {selectedIndex >= 0 && (
            <rect
              className="pb-day-sel"
              x={selectedIndex * colW + 1}
              y={TOP}
              width={colW - 2}
              height={AXIS_Y - TOP}
              rx={4}
            />
          )}

          {/* Baselines */}
          <line className="pb-baseline" x1={0} y1={AXIS_Y} x2={VW} y2={AXIS_Y} />
          <line className="pb-baseline-eng" x1={0} y1={AXIS_Y} x2={VW} y2={AXIS_Y} />

          {/* Bars */}
          <g>
            {days.map((d, i) => {
              const v = totals.get(d.iso)
              if (!v || (v.in === 0 && v.out === 0)) return null
              const hOut = scale(v.out)
              const hIn = scale(v.in)
              const cx = i * colW + colW / 2
              const bx = cx - barW / 2
              const barStyle = reduce
                ? undefined
                : ({ animationDelay: `${i * 9}ms` } as const)
              const cls = reduce ? undefined : 'pb-bar'
              return (
                <g key={`bar-${d.iso}`}>
                  {hOut > 0 && (
                    <rect
                      className={cls}
                      style={barStyle}
                      x={bx}
                      y={AXIS_Y - hOut}
                      width={barW}
                      height={hOut}
                      rx={2.5}
                      fill="url(#pb-tx-out)"
                    />
                  )}
                  {hIn > 0 && (
                    <rect
                      className={cls}
                      style={barStyle}
                      x={bx}
                      y={AXIS_Y - hOut - hIn}
                      width={barW}
                      height={hIn}
                      rx={2.5}
                      fill="url(#pb-tx-in)"
                    />
                  )}
                </g>
              )
            })}
          </g>

          {/* Axis labels */}
          <g aria-hidden>
            {days.map((d, i) => {
              const dom = d.date.getDate()
              if (!(dom === 1 || dom % 5 === 0)) return null
              return (
                <text
                  key={`ax-${d.iso}`}
                  x={i * colW + colW / 2}
                  y={AXIS_Y + 16}
                  textAnchor="middle"
                  fontFamily="var(--pb-mono)"
                  fontSize="10"
                  fill="var(--pb-ink-faint)"
                >
                  {dom}
                </text>
              )
            })}
          </g>

          {/* Invisible hit targets (on top) */}
          <g>
            {days.map((d, i) => {
              const v = totals.get(d.iso) ?? { in: 0, out: 0 }
              return (
                <rect
                  key={`hit-${d.iso}`}
                  className="pb-hit"
                  x={i * colW}
                  y={0}
                  width={colW}
                  height={VH}
                  role="button"
                  tabIndex={0}
                  aria-label={`${WD_SHORT[d.date.getDay()]} ${d.date.getDate()}: in ${fmtCurrency(
                    v.in,
                  )}, out ${fmtCurrency(v.out)}. Click to filter.`}
                  onClick={() => onSelectDay(d.iso)}
                  onMouseEnter={() => onHit(d, i)}
                  onKeyDown={(e) => onKey(e, d.iso)}
                />
              )
            })}
          </g>
        </svg>
      </Box>

      {/* Legend */}
      <Flex align="center" gap="1rem" mt=".7rem" flexWrap="wrap">
        <HStack spacing="0.4rem">
          <Box w="10px" h="10px" borderRadius="2px" bgGradient="linear(to-b, #4f9d74, #2d6a4f)" />
          <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.06em" textTransform="uppercase" color="var(--pb-ink-faint)">
            Income
          </Text>
        </HStack>
        <HStack spacing="0.4rem">
          <Box w="10px" h="10px" borderRadius="2px" bgGradient="linear(to-b, #c0563d, #a8432e)" />
          <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.06em" textTransform="uppercase" color="var(--pb-ink-faint)">
            Spending
          </Text>
        </HStack>
        <Text fontFamily="var(--pb-serif)" fontStyle="italic" fontSize="12px" color="var(--pb-ink-faint)">
          Tap a day to see its transactions
        </Text>
      </Flex>
    </Box>
  )
}
