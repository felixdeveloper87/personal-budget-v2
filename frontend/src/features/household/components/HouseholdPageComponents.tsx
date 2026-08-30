import { type ReactNode } from 'react'
import { Badge, Box, Button, Flex, HStack, Icon, Text, useColorModeValue, type BoxProps } from '@chakra-ui/react'
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
  icon,
  accent,
  tint,
  stat,
}: {
  eyebrow: string
  title: string
  description: string
  icon: ReactNode
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
      <HStack spacing={3} minW={0}>
        <Flex
          w={{ base: 10, md: 11 }}
          h={{ base: 10, md: 11 }}
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="13px"
          bg={tint}
          color={accent}
          border="1px solid var(--pb-hair)"
        >
          {icon}
        </Flex>
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
      </HStack>
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
  icon,
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
  icon: ReactNode
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
        icon={icon}
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
