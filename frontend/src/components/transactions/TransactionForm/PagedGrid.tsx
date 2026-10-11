import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Box, Grid, HStack, type BoxProps } from '@chakra-ui/react'

/** Shared look for the form's option tiles (category, merchant, account, payment). */
export function tileStyle(selected: boolean): BoxProps {
  return {
    flex: 1,
    minW: 0,
    minH: '54px',
    px: 2.5,
    py: 1.5,
    display: 'flex',
    alignItems: 'center',
    textAlign: 'left',
    borderRadius: '15px',
    border: '1px solid',
    borderColor: selected ? '#820ad1' : 'var(--pb-hair)',
    bg: selected ? '#f3e8fc' : 'var(--pb-surface)',
    color: selected ? '#820ad1' : 'var(--pb-ink)',
    cursor: 'pointer',
    transition: 'border-color 0.18s ease, background 0.18s ease',
    _hover: { borderColor: '#820ad1', bg: selected ? '#f3e8fc' : '#f8f1fe' },
    _focusVisible: { outline: '2px solid #820ad1', outlineOffset: '2px' },
  }
}

const PAGE_SIZE = 6 // 2 columns × 3 rows

interface PagedGridProps<T> {
  items: ReadonlyArray<T>
  getKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  /** Page shown first (e.g. the one holding the current selection). */
  initialIndex?: number
  label: string
}

/** 2×3 grid pages in a horizontal snap carousel; the next page peeks in. */
export default function PagedGrid<T>({ items, getKey, renderItem, initialIndex = 0, label }: PagedGridProps<T>) {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += PAGE_SIZE) pages.push(items.slice(i, i + PAGE_SIZE))
  const multi = pages.length > 1
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)

  const pageStride = () => {
    const scroller = scrollerRef.current
    const first = scroller?.firstElementChild as HTMLElement | null
    return first ? first.offsetWidth + 8 : 1
  }

  const goTo = (index: number, behavior: ScrollBehavior = 'smooth') => {
    scrollerRef.current?.scrollTo({ left: index * pageStride(), behavior })
  }

  useEffect(() => {
    const start = Math.floor(Math.max(0, initialIndex) / PAGE_SIZE)
    if (start > 0) {
      goTo(start, 'auto')
      setPage(start)
    }
    // Only on mount: later selections shouldn't yank the carousel around.
  }, [])

  return (
    <Box>
      <Box
        ref={scrollerRef}
        role="group"
        aria-label={label}
        display="flex"
        gap={2}
        overflowX={multi ? 'auto' : 'visible'}
        onScroll={(event) => setPage(Math.round(event.currentTarget.scrollLeft / pageStride()))}
        sx={{
          scrollSnapType: 'x mandatory',
          overscrollBehaviorX: 'contain',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {pages.map((pageItems, index) => (
          <Grid
            key={index}
            flex={multi ? '0 0 calc(100% - 28px)' : '0 0 100%'}
            minW={0}
            templateColumns="repeat(2, minmax(0, 1fr))"
            gap={2}
            alignContent="start"
            sx={{ scrollSnapAlign: 'start' }}
          >
            {pageItems.map((item) => (
              <Box key={getKey(item)} minW={0} display="flex">
                {renderItem(item)}
              </Box>
            ))}
          </Grid>
        ))}
      </Box>

      {multi && (
        <HStack justify="center" spacing={1.5} mt={2.5}>
          {pages.map((_, index) => (
            <Box
              key={index}
              as="button"
              type="button"
              aria-label={`${index + 1} / ${pages.length}`}
              aria-current={index === page ? 'true' : undefined}
              onClick={() => goTo(index)}
              h="6px"
              w={index === page ? '18px' : '6px'}
              borderRadius="full"
              bg={index === page ? '#820ad1' : 'var(--pb-hair-2, #d4d4dd)'}
              transition="width 0.2s ease, background 0.2s ease"
            />
          ))}
        </HStack>
      )}
    </Box>
  )
}
