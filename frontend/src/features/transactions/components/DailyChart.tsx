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
const VH = 182
const AXIS_Y = 148
const TOP = 16
const USABLE = AXIS_Y - TOP
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

  // Payments is an outflow-only lens — drop the income series entirely.
  const showIncome = view !== 'payments'

  const totals = useMemo(() => {
    const map = new Map<string, { in: number; out: number }>()
    for (const t of txns) {
      const key = groupKey(t, view)
      const current = map.get(key) ?? { in: 0, out: 0 }
      if (t.type === 'in') current.in += t.amount
      else current.out += t.amount
      map.set(key, current)
    }
    return map
  }, [txns, view])

  const n = Math.max(days.length, 1)
  const colW = VW / n

  const max = useMemo(() => {
    let maximum = 0
    for (const day of days) {
      const values = totals.get(day.iso)
      if (values) maximum = Math.max(maximum, showIncome ? values.in : 0, values.out)
    }
    return maximum || 1
  }, [days, totals])

  // Square-root scaling keeps low-volume days visible when the period contains
  // a single large transaction. The tooltip still exposes the exact values.
  const scale = (value: number) => (
    value > 0 ? Math.max(6, Math.sqrt(value / max) * USABLE * 0.94) : 0
  )

  const selectedIndex = selectedDay ? days.findIndex((day) => day.iso === selectedDay) : -1

  const onHit = (day: ChartDay, i: number) => {
    const values = totals.get(day.iso) ?? { in: 0, out: 0 }
    setHover({
      iso: day.iso,
      leftPct: ((i * colW + colW / 2) / VW) * 100,
      inV: values.in,
      outV: values.out,
    })
  }

  const onKey = (event: KeyboardEvent<SVGRectElement>, iso: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelectDay(iso)
    }
  }

  const svgClass = [
    'pb-chart-svg',
    hlRhythm && rhythmWeekday != null ? 'hl-tue' : '',
    hlMomentum ? 'hl-h2' : '',
  ].filter(Boolean).join(' ')

  return (
    <Box className="pb-chart-card">
      <Flex className="pb-chart-heading" justify="space-between" align={{ base: 'flex-start', sm: 'center' }} gap=".75rem" direction={{ base: 'column', sm: 'row' }}>
        <Box>
          <Text className="pb-chart-kicker">{showIncome ? 'Cash flow' : 'Outflow'}</Text>
          <Text className="pb-chart-caption">
            {showIncome ? 'Daily income and spending' : 'Daily payments by settlement date'}
          </Text>
        </Box>
        <Text className="pb-chart-instruction">Select a day to filter activity</Text>
      </Flex>

      <Box className="pb-chart-wrap">
        {hover && (
          <Box className="pb-chart-tip" style={{ left: `${hover.leftPct}%` }}>
            <div className="pb-chart-tip-head">
              {WD_SHORT[parseISO(hover.iso).getDay()]} {parseISO(hover.iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }).toUpperCase()}
            </div>
            {showIncome && <div className="pb-chart-tip-row in"><span>In</span><span>{fmtCurrency(hover.inV, { minimumFractionDigits: 2 })}</span></div>}
            <div className="pb-chart-tip-row out"><span>Out</span><span>{fmtCurrency(hover.outV, { minimumFractionDigits: 2 })}</span></div>
          </Box>
        )}

        <svg
          className={svgClass}
          viewBox={`0 0 ${VW} ${VH}`}
          role="img"
          aria-label={`${showIncome ? 'Daily income and spending' : 'Daily payments'} for ${monthLabel}`}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="pb-tx-out" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d84a39" /><stop offset="100%" stopColor="#c23a2c" /></linearGradient>
            <linearGradient id="pb-tx-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#29a25e" /><stop offset="100%" stopColor="#1f8a4f" /></linearGradient>
          </defs>

          <g aria-hidden>
            {days.map((day, i) => {
              const x = i * colW
              return (
                <g key={`band-${day.iso}`}>
                  {rhythmWeekday != null && day.date.getDay() === rhythmWeekday && <rect className="tue-band" x={x} y={TOP} width={colW} height={USABLE} />}
                  {day.date.getDate() > 15 && <rect className="h2-band" x={x} y={TOP} width={colW} height={USABLE} />}
                </g>
              )
            })}
            {[0.25, 0.5, 0.75].map((ratio) => <line key={ratio} className="pb-gridline" x1={0} y1={TOP + USABLE * ratio} x2={VW} y2={TOP + USABLE * ratio} />)}
          </g>

          {selectedIndex >= 0 && <rect className="pb-day-sel" x={selectedIndex * colW + 1} y={TOP} width={colW - 2} height={USABLE} rx={4} />}
          <line className="pb-baseline" x1={0} y1={AXIS_Y} x2={VW} y2={AXIS_Y} />

          <g>
            {days.map((day, i) => {
              const values = totals.get(day.iso)
              if (!values || ((!showIncome || values.in === 0) && values.out === 0)) return null
              const hOut = scale(values.out)
              const hIn = showIncome ? scale(values.in) : 0
              const x = i * colW + colW * 0.08
              const w = Math.max(2, colW * 0.84)
              const style = reduce ? undefined : ({ animationDelay: `${i * 9}ms` } as const)
              const cls = reduce ? undefined : 'pb-bar'
              return (
                <g key={`bar-${day.iso}`}>
                  {hOut > 0 && <rect className={cls} style={style} x={x} y={AXIS_Y - hOut} width={w} height={hOut} rx={2.5} fill="url(#pb-tx-out)" />}
                  {hIn > 0 && <rect className={cls} style={style} x={x} y={AXIS_Y - hOut - hIn} width={w} height={hIn} rx={2.5} fill="url(#pb-tx-in)" />}
                </g>
              )
            })}
          </g>

          <g aria-hidden>
            {days.map((day, i) => {
              const dom = day.date.getDate()
              if (!(dom === 1 || dom % 5 === 0)) return null
              return <text key={`ax-${day.iso}`} x={i * colW + colW / 2} y={AXIS_Y + 18} textAnchor="middle" fontFamily="var(--pb-mono)" fontSize="10" fill="var(--pb-ink-faint)">{dom}</text>
            })}
          </g>

          <g>
            {days.map((day, i) => {
              const values = totals.get(day.iso) ?? { in: 0, out: 0 }
              return <rect key={`hit-${day.iso}`} className="pb-hit" x={i * colW} y={0} width={colW} height={VH} role="button" tabIndex={0} aria-label={`${WD_SHORT[day.date.getDay()]} ${day.date.getDate()}: income ${fmtCurrency(values.in)}, spending ${fmtCurrency(values.out)}. Click to filter.`} onClick={() => onSelectDay(day.iso)} onMouseEnter={() => onHit(day, i)} onKeyDown={(event) => onKey(event, day.iso)} />
            })}
          </g>
        </svg>
      </Box>

      <Flex className="pb-chart-legend" align="center" gap="1rem" flexWrap="wrap">
        {showIncome && <HStack spacing="0.4rem"><Box w="10px" h="10px" borderRadius="2px" bgGradient="linear(to-b, #29a25e, #1f8a4f)" /><Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.06em" textTransform="uppercase" color="var(--pb-ink-faint)">Income</Text></HStack>}
        <HStack spacing="0.4rem"><Box w="10px" h="10px" borderRadius="2px" bgGradient="linear(to-b, #d84a39, #c23a2c)" /><Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.06em" textTransform="uppercase" color="var(--pb-ink-faint)">Spending</Text></HStack>
      </Flex>
    </Box>
  )
}
