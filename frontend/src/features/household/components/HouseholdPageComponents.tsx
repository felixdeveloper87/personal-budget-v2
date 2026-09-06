import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Badge, Box, Button, Flex, HStack, Icon, Text, useColorModeValue, usePrefersReducedMotion, type BoxProps } from '@chakra-ui/react'
import { useEd } from '../../../editorial'
import { useI18n } from '../../../i18n'
import { ChevronDown, ChevronRight } from '../../../components/ui/icons'

export function Surface({
  children,
  ...props
}: BoxProps) {
  const ed = useEd()
  const fallbackBg = useColorModeValue('white', 'gray.900')
  const fallbackBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  return (
    <Box
      bg={ed?.panel ?? fallbackBg}
      border="1px solid"
      borderColor={ed?.line ?? fallbackBorder}
      borderRadius="2xl"
      boxShadow={ed ? 'none' : 'sm'}
      {...props}
    >
      {children}
    </Box>
  )
}

type HouseholdSectionNavigationItem = {
  id: string
  label: string
}

/** A compact in-page navigator with a measured, gliding active pill. */
export function HouseholdSectionNavigation({
  ariaLabel,
  items,
}: {
  ariaLabel: string
  items: HouseholdSectionNavigationItem[]
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [activeId, setActiveId] = useState(items[0]?.id ?? '')
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([])
  const railRef = useRef<HTMLDivElement | null>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = items.findIndex((item) => item.id === activeId)
      const activeTab = tabsRef.current[activeIndex]
      if (!activeTab) return
      setIndicator({ left: activeTab.offsetLeft, width: activeTab.offsetWidth })
    }

    const frame = requestAnimationFrame(updateIndicator)
    const observer = typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(updateIndicator)
    if (railRef.current) observer?.observe(railRef.current)
    window.addEventListener('resize', updateIndicator)

    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', updateIndicator)
    }
  }, [activeId, items])

  const selectSection = (id: string) => {
    setActiveId(id)
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  return (
    <Box
      as="nav"
      aria-label={ariaLabel}
      overflowX="auto"
      overflowY="hidden"
      px={1.5}
      py={1.5}
      bg="var(--pb-surface-2)"
      border="1px solid var(--pb-hair)"
      borderRadius="16px"
      boxShadow="inset 0 1px 0 rgba(255,255,255,0.38), 0 8px 20px rgba(23,37,31,0.035)"
      css={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
    >
      <Box ref={railRef} position="relative" display="inline-flex" minW="max-content" gap={1.5}>
        <Box
          aria-hidden="true"
          position="absolute"
          top={0}
          bottom={0}
          left={`${indicator.left}px`}
          w={`${indicator.width}px`}
          border="1px solid rgba(22,132,97,0.16)"
          borderRadius="12px"
          bg="var(--pb-surface)"
          boxShadow="0 5px 14px rgba(23,37,31,0.08), inset 0 1px 0 rgba(255,255,255,0.45)"
          _after={{
            content: '""',
            position: 'absolute',
            left: '50%',
            bottom: '5px',
            transform: 'translateX(-50%)',
            w: '18px',
            h: '2px',
            borderRadius: 'full',
            bg: 'var(--pb-forest-2)',
          }}
          transition={prefersReducedMotion
            ? 'none'
            : 'left 0.42s cubic-bezier(0.65, 0, 0.35, 1), width 0.42s cubic-bezier(0.65, 0, 0.35, 1)'}
        />
        {items.map((item, index) => {
          const selected = item.id === activeId
          return (
            <Button
              key={item.id}
              ref={(element) => { tabsRef.current[index] = element }}
              position="relative"
              zIndex={1}
              minH="42px"
              px={{ base: 3.5, md: 4 }}
              borderRadius="12px"
              variant="unstyled"
              color={selected ? 'var(--pb-forest-2)' : 'var(--pb-ink-soft)'}
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              fontWeight={700}
              letterSpacing="0.08em"
              textTransform="uppercase"
              aria-current={selected ? 'location' : undefined}
              onClick={() => selectSection(item.id)}
              transition={prefersReducedMotion ? 'none' : 'color 0.2s ease'}
              _hover={{ color: selected ? 'var(--pb-forest)' : 'var(--pb-ink)' }}
              _focusVisible={{ outline: '2px solid var(--pb-forest)', outlineOffset: '-2px' }}
            >
              {item.label}
            </Button>
          )
        })}
      </Box>
    </Box>
  )
}

export function ActionRequiredBanner({
  ariaLabel,
  icon,
  accent,
  tint,
  count,
  title,
  detail,
  actionLabel,
  targetId,
  onAction,
}: {
  ariaLabel: string
  icon: ReactNode
  accent: string
  tint: string
  count: number
  title: string
  detail: string
  actionLabel: string
  targetId?: string
  onAction?: () => void
}) {
  const { formatNumber, t } = useI18n()
  return (
    <Flex
      role="region"
      aria-label={ariaLabel}
      direction={{ base: 'column', sm: 'row' }}
      align={{ base: 'stretch', sm: 'center' }}
      justify="space-between"
      gap={4}
      h="full"
      px={{ base: 3.5, sm: 4, md: 5 }}
      py={{ base: 3.5, md: 4 }}
      borderRadius={{ base: '16px', md: '18px' }}
      border="1px solid var(--pb-summary-line)"
      bg={tint}
      boxShadow="var(--pb-shadow)"
    >
      <HStack align="flex-start" spacing={3.5} minW={0}>
        <Flex
          w={11}
          h={11}
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="13px"
          bg="var(--pb-surface)"
          color={accent}
          border="1px solid var(--pb-summary-line)"
        >
          {icon}
        </Flex>
        <Box minW={0}>
          <HStack spacing={2} flexWrap="wrap">
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="9px"
              fontWeight={700}
              letterSpacing="0.14em"
              textTransform="uppercase"
              color={accent}
            >
              {t('household.common.actionRequired')}
            </Text>
            <Badge
              borderRadius="full"
              px={2}
              bg="var(--pb-surface)"
              color={accent}
              border="1px solid var(--pb-summary-line)"
              textTransform="none"
            >
              {formatNumber(count)}
            </Badge>
          </HStack>
          <Text
            mt={1}
            fontFamily="var(--pb-serif)"
            fontSize={{ base: 'lg', md: 'xl' }}
            fontWeight={500}
            lineHeight={1.15}
            color="var(--pb-ink)"
          >
            {title}
          </Text>
          <Text mt={1} color="var(--pb-ink-soft)" fontSize="sm" lineHeight={1.45}>
            {detail}
          </Text>
        </Box>
      </HStack>
      <Button
        flexShrink={0}
        h="42px"
        w={{ base: 'full', sm: 'auto' }}
        px={4}
        borderRadius="10px"
        bg={accent}
        color="var(--pb-on-accent)"
        rightIcon={(
          <Icon
            as={onAction ? ChevronRight : ChevronDown}
            boxSize={4}
            weight="bold"
          />
        )}
        onClick={() => {
          if (onAction) {
            onAction()
            return
          }
          if (targetId) {
            document.getElementById(targetId)?.scrollIntoView({ block: 'start' })
          }
        }}
        _hover={{ filter: 'brightness(0.96)', transform: 'translateY(-1px)' }}
        _active={{ transform: 'translateY(0)' }}
        _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-ink)' }}
      >
        {actionLabel}
      </Button>
    </Flex>
  )
}

export function HouseholdSectionHeader({
  eyebrow,
  title,
  description,
  accent,
  tint,
  stat,
}: {
  eyebrow: string
  title: string
  description: string
  accent: string
  tint: string
  stat: string
}) {
  return (
    <Flex
      direction={{ base: 'column', sm: 'row' }}
      align={{ base: 'stretch', sm: 'center' }}
      justify="space-between"
      gap={3}
      px={{ base: 3.5, sm: 4, md: 5 }}
      py={{ base: 3.5, md: 4 }}
      borderBottom="1px solid var(--pb-hair)"
      bg="var(--pb-surface)"
    >
      <Box minW={0}>
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="9px"
          fontWeight={600}
          letterSpacing="0.15em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
        >
          {eyebrow}
        </Text>
        <Text
          mt={0.5}
          fontFamily="var(--pb-serif)"
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight={500}
          lineHeight={1.1}
          color="var(--pb-ink)"
        >
          {title}
        </Text>
        <Text mt={0.5} color="var(--pb-ink-soft)" fontSize="xs">
          {description}
        </Text>
      </Box>
      <Text
        alignSelf={{ base: 'flex-start', sm: 'center' }}
        px={2.5}
        py={1.5}
        borderRadius="full"
        bg={tint}
        color={accent}
        border="1px solid var(--pb-hair)"
        fontFamily="var(--pb-mono)"
        fontSize="8px"
        fontWeight={700}
        letterSpacing="0.05em"
        textTransform="uppercase"
        whiteSpace="nowrap"
      >
        {stat}
      </Text>
    </Flex>
  )
}

export function HouseholdSectionCard({
  id,
  eyebrow,
  title,
  description,
  accent,
  tint,
  stat,
  actionLabel,
  actionAriaLabel,
  onOpen,
}: {
  id?: string
  eyebrow: string
  title: string
  description: string
  accent: string
  tint: string
  stat: string
  actionLabel: string
  actionAriaLabel: string
  onOpen: () => void
}) {
  return (
    <Box
      id={id}
      overflow="hidden"
      scrollMarginTop={id ? '90px' : undefined}
      bg="var(--pb-surface)"
      border="1px solid var(--pb-hair)"
      borderRadius={{ base: '18px', md: '22px' }}
      boxShadow="var(--pb-shadow)"
    >
      <HouseholdSectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        accent={accent}
        tint={tint}
        stat={stat}
      />
      <Box p={{ base: 3, md: 4 }} bg="var(--pb-surface-2)">
        <Button
          w="full"
          h={{ base: '48px', md: '52px' }}
          borderRadius="12px"
          bg="var(--pb-forest-2)"
          color="var(--pb-on-accent)"
          rightIcon={<Icon as={ChevronRight} boxSize={4} weight="bold" />}
          aria-label={actionAriaLabel}
          onClick={onOpen}
          _hover={{ bg: 'var(--pb-forest)', transform: 'translateY(-1px)' }}
          _active={{ transform: 'translateY(0)' }}
          _focusVisible={{ boxShadow: '0 0 0 2px var(--pb-forest)' }}
        >
          {actionLabel}
        </Button>
      </Box>
    </Box>
  )
}
