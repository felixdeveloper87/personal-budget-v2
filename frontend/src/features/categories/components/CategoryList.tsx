import { VStack } from '@chakra-ui/react'
import type { ComputedCategory, Side } from '../data/types'
import CategoryRow from './CategoryRow'

interface CategoryListProps {
  rows: ComputedCategory[]
  side: Side
  openIds: Set<string>
  activeCat: string | null
  onToggle: (id: string) => void
  onHover: (id: string | null) => void
}

export default function CategoryList({
  rows,
  side,
  openIds,
  activeCat,
  onToggle,
  onHover,
}: CategoryListProps) {
  return (
    <VStack align="stretch" spacing="0.5rem">
      {rows.map((cat) => (
        <CategoryRow
          key={cat.id}
          cat={cat}
          side={side}
          isOpen={openIds.has(cat.id)}
          isHot={activeCat === cat.id}
          onToggle={() => onToggle(cat.id)}
          onHover={onHover}
        />
      ))}
    </VStack>
  )
}
