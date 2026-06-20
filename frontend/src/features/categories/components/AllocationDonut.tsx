import { Box, Text, VStack } from '@chakra-ui/react'
import { gbp } from '../data/format'
import type { ComputedCategory, Side } from '../data/types'

/** SVG arc path between two angles for a donut segment. */
function arc(cx: number, cy: number, rO: number, rI: number, a0: number, a1: number): string {
  const pt = (r: number, a: number): [string, string] => [
    (cx + r * Math.cos(a)).toFixed(2),
    (cy + r * Math.sin(a)).toFixed(2),
  ]
  const large = a1 - a0 > Math.PI ? 1 : 0
  const [x0, y0] = pt(rO, a0)
  const [x1, y1] = pt(rO, a1)
  const [x2, y2] = pt(rI, a1)
  const [x3, y3] = pt(rI, a0)
  return `M${x0} ${y0} A${rO} ${rO} 0 ${large} 1 ${x1} ${y1} L${x2} ${y2} A${rI} ${rI} 0 ${large} 0 ${x3} ${y3} Z`
}

interface AllocationDonutProps {
  rows: ComputedCategory[]
  total: number
  side: Side
  periodLabel: string
  activeCat: string | null
  onActive: (id: string | null) => void
  onSegmentClick: (id: string) => void
}

export default function AllocationDonut({
  rows,
  total,
  side,
  periodLabel,
  activeCat,
  onActive,
  onSegmentClick,
}: AllocationDonutProps) {
  const cx = 120
  const cy = 120
  const rO = 100
  const rI = 62

  let angle = -Math.PI / 2
  const segments = rows.map((c) => {
    const a1 = angle + (c.amount / total) * 2 * Math.PI
    const d = arc(cx, cy, rO, rI, angle, a1)
    angle = a1
    return { id: c.id, d, color: c.color }
  })

  const active = activeCat ? rows.find((c) => c.id === activeCat) ?? null : null

  return (
    <Box position="relative" w="min(280px, 78vw)" mx="auto" mt="0.2rem">
      <Box
        as="svg"
        viewBox="0 0 240 240"
        role="img"
        aria-label={`${side} distribution by category`}
        display="block"
        w="100%"
        h="auto"
        overflow="visible"
      >
        <g>
          {segments.map((s) => (
            <path
              key={s.id}
              d={s.d}
              fill={s.color}
              stroke="var(--pb-paper)"
              strokeWidth={1.6}
              style={{
                cursor: 'pointer',
                opacity: activeCat && activeCat !== s.id ? 0.3 : 1,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={() => onActive(s.id)}
              onMouseLeave={() => onActive(null)}
              onClick={() => onSegmentClick(s.id)}
            />
          ))}
        </g>
        {/* Gold dashed rim */}
        <circle cx={cx} cy={cy} r={106} fill="none" stroke="var(--pb-gold)" strokeWidth={1.4} strokeDasharray=".5 5" opacity={0.4} />
        {/* Hole */}
        <circle cx={cx} cy={cy} r={58} fill="var(--pb-surface)" stroke="var(--pb-hair)" />
      </Box>

      {/* Centre overlay */}
      <VStack
        position="absolute"
        inset={0}
        align="center"
        justify="center"
        spacing={0}
        textAlign="center"
        pointerEvents="none"
        px="22%"
      >
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="9px"
          letterSpacing="0.12em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
          mb="0.3rem"
          maxW="13ch"
          lineHeight="1.25"
          noOfLines={2}
        >
          {active ? active.name : `Total · ${side === 'expense' ? 'Spending' : 'Income'}`}
        </Text>
        <Text
          className="num"
          fontSize="1.45rem"
          fontWeight={500}
          lineHeight="1"
          color="var(--pb-ink)"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {gbp(active ? active.amount : total)}
        </Text>
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="9px"
          letterSpacing="0.06em"
          color="var(--pb-ink-faint)"
          mt="0.3rem"
        >
          {active ? `${active.pct.toFixed(1)}% · ${active.shownCount} txns` : periodLabel}
        </Text>
      </VStack>
    </Box>
  )
}
