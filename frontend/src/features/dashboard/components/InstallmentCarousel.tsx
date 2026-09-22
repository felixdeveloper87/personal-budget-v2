import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { ArrowUpRight, Rows3 } from 'lucide-react'
import type { InstallmentPlan } from '../../../types'
import { useI18n } from '../../../i18n'
import Panel from './Panel'

interface InstallmentCarouselProps {
  plans: InstallmentPlan[]
  selectedDate: Date
  onManage?: () => void
}

interface InstallmentMonth {
  count: number
  key: string
  label: string
  total: number
}

const MONTH_OFFSETS = [-3, -2, -1, 0, 1, 2, 3] as const
const CURRENT_MONTH_INDEX = 3

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export default function InstallmentCarousel({
  plans,
  selectedDate,
  onManage,
}: InstallmentCarouselProps) {
  const { t, formatCurrency, formatDate } = useI18n()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [activeMonth, setActiveMonth] = useState(CURRENT_MONTH_INDEX)

  const months = useMemo<InstallmentMonth[]>(() => {
    const buckets = MONTH_OFFSETS.map((offset) => {
      const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1)
      return {
        count: 0,
        key: monthKey(date),
        label: formatDate(date, { month: 'long', year: 'numeric' }),
        total: 0,
      }
    })
    const bucketByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))

    for (const plan of plans) {
      for (const installment of plan.transactions) {
        const bucket = bucketByKey.get(installment.date.slice(0, 7))
        if (!bucket) continue
        bucket.count += 1
        bucket.total += Number(installment.amount || 0)
      }
    }

    return buckets
  }, [formatDate, plans, selectedDate])

  const carouselStep = useCallback((): number => {
    const carousel = carouselRef.current
    if (!carousel) return 0
    const slides = carousel.querySelectorAll<HTMLElement>('[data-installment-month]')
    if (slides.length > 1) return slides[1].offsetLeft - slides[0].offsetLeft
    return slides[0]?.getBoundingClientRect().width ?? carousel.clientWidth
  }, [])

  const syncActiveMonth = useCallback(() => {
    const carousel = carouselRef.current
    if (!carousel) return
    const step = carouselStep()
    if (step <= 0) return
    setActiveMonth(Math.min(Math.max(Math.round(carousel.scrollLeft / step), 0), months.length - 1))
  }, [carouselStep, months.length])

  const scrollToMonth = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const carousel = carouselRef.current
    const slide = carousel?.querySelectorAll<HTMLElement>('[data-installment-month]')[index]
    if (!carousel || !slide) return
    carousel.scrollTo({ left: slide.offsetLeft, behavior })
  }, [])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const frame = window.requestAnimationFrame(() => {
      scrollToMonth(CURRENT_MONTH_INDEX, 'auto')
      setActiveMonth(CURRENT_MONTH_INDEX)
    })
    const observer = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(syncActiveMonth)
    observer?.observe(carousel)

    return () => {
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [months, scrollToMonth, syncActiveMonth])

  return (
    <VStack align="stretch" spacing={2.5} h="full">
      <Box
        ref={carouselRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={t('installments.statements.monthsAria')}
        display="flex"
        gap={3}
        overflowX="auto"
        overflowY="hidden"
        onScroll={syncActiveMonth}
        scrollBehavior="smooth"
        sx={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {months.map((month, index) => (
          <Box
            data-installment-month
            key={month.key}
            role="group"
            aria-label={`${index + 1} / ${months.length}: ${month.label}`}
            flex="0 0 100%"
            minW={0}
            scrollSnapAlign="start"
            scrollSnapStop="always"
          >
            <Panel h="full">
              <VStack align="stretch" spacing={3.5} h="full">
                <HStack justify="space-between" align="flex-start" spacing={3}>
                  <HStack spacing={2.5} minW={0}>
                    <HStack
                      w={8}
                      h={8}
                      justify="center"
                      borderRadius="10px"
                      bg="var(--pb-tint-green)"
                      color="var(--pb-forest-2)"
                      flexShrink={0}
                    >
                      <Rows3 size={15} strokeWidth={1.8} />
                    </HStack>
                    <VStack align="flex-start" spacing={0.5} minW={0}>
                      <Text
                        fontFamily="var(--pb-mono)"
                        fontSize="10.5px"
                        letterSpacing="0.17em"
                        textTransform="uppercase"
                        color="var(--pb-ink-faint)"
                      >
                        {t('dashboard.installments')}
                      </Text>
                      <Text fontFamily="var(--pb-serif)" fontSize="sm" fontWeight={500} color="var(--pb-ink-soft)" textTransform="capitalize" noOfLines={1}>
                        {month.label}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text fontFamily="var(--pb-mono)" fontSize="10px" color="var(--pb-ink-faint)" whiteSpace="nowrap">
                    {t(month.count === 1 ? 'installments.paymentCount.one' : 'installments.paymentCount.other', { count: month.count })}
                  </Text>
                </HStack>

                <HStack align="baseline" spacing={1.5}>
                  <Text
                    fontFamily="var(--pb-serif)"
                    fontSize="clamp(1.75rem, 3.2vw, 2.15rem)"
                    fontWeight={500}
                    lineHeight={1}
                    color="var(--pb-forest-2)"
                    style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
                  >
                    {formatCurrency(month.total)}
                  </Text>
                  <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.08em" color="var(--pb-ink-faint)">
                    {t('dashboard.perMonth')}
                  </Text>
                </HStack>

                <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-soft)" lineHeight={1.5}>
                  {t(month.count > 0 ? 'dashboard.installmentsMonthDescription' : 'dashboard.installmentsMonthEmpty', { month: month.label })}
                </Text>

                {onManage && (
                  <HStack justify="flex-end" mt="auto" pt={1}>
                    <Button
                      onClick={onManage}
                      variant="ghost"
                      size="xs"
                      h="26px"
                      px={0}
                      color="var(--pb-forest-2)"
                      fontFamily="var(--pb-mono)"
                      fontSize="10px"
                      letterSpacing="0.08em"
                      textTransform="uppercase"
                      rightIcon={<ArrowUpRight size={13} />}
                      _hover={{ bg: 'transparent', textDecoration: 'underline' }}
                    >
                      {t('dashboard.manage')}
                    </Button>
                  </HStack>
                )}
              </VStack>
            </Panel>
          </Box>
        ))}
      </Box>

      <HStack justify="center" spacing={2}>
        {months.map((month, index) => (
          <Box
            as="button"
            key={month.key}
            type="button"
            aria-label={month.label}
            aria-current={index === activeMonth ? 'true' : undefined}
            onClick={() => scrollToMonth(index)}
            h="7px"
            w={index === activeMonth ? '22px' : '7px'}
            borderRadius="full"
            bg={index === activeMonth ? 'var(--pb-forest-2)' : 'var(--pb-hair-2)'}
            transition="width 0.2s ease, background 0.2s ease"
          />
        ))}
      </HStack>
    </VStack>
  )
}
