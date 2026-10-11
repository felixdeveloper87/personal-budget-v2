import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Box, Button, Flex, IconButton, SimpleGrid, Text, type ButtonProps } from '@chakra-ui/react'
import { X } from './icons'
import { useI18n } from '../../i18n'

const NU = {
  brand: '#820ad1',
  brandDeep: '#6e08b3',
  brandSoft: '#f3e8fc',
  ink: '#1f1f24',
  inkSoft: '#6b6b76',
  surface: '#f5f5f8',
  danger: '#c2412d',
  dangerSoft: '#fbe7e3',
} as const

interface NuDetailSheetProps {
  open: boolean
  onClose: () => void
  ariaLabel: string
  /** Escape is ignored while a nested dialog (edit / confirm) is open. */
  escapeDisabled?: boolean
  /** Logo / icon shown in the white tile of the purple header. */
  media: ReactNode
  title: string
  caption?: string
  amountLabel: string
  amount: string
  /** Small pill next to the amount (status). */
  badge?: ReactNode
  /** Extra content at the bottom of the purple header (e.g. progress). */
  headerExtra?: ReactNode
  footer?: ReactNode
  children: ReactNode
}

/**
 * Nubank-style detail sheet for commitments (fixed payments, installment
 * plans): purple header with the amount, compact white body, sticky pill
 * actions. Bottom sheet on phones, content-height centred dialog above.
 */
export default function NuDetailSheet({
  open,
  onClose,
  ariaLabel,
  escapeDisabled = false,
  media,
  title,
  caption,
  amountLabel,
  amount,
  badge,
  headerExtra,
  footer,
  children,
}: NuDetailSheetProps) {
  const { t } = useI18n()
  const closeRef = useRef<HTMLButtonElement>(null)
  const lastFocused = useRef<Element | null>(null)

  // Escape to close + focus management.
  useEffect(() => {
    if (!open) return
    lastFocused.current = document.activeElement
    const timer = window.setTimeout(() => closeRef.current?.focus(), 40)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !escapeDisabled) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', onKey)
      if (lastFocused.current instanceof HTMLElement) lastFocused.current.focus()
    }
  }, [open, onClose, escapeDisabled])

  return createPortal(
    <Box position="fixed" inset={0} zIndex={1400} aria-hidden={!open} pointerEvents={open ? 'auto' : 'none'}>
      <Box
        position="absolute"
        inset={0}
        bg="rgba(20, 0, 40, 0.42)"
        backdropFilter="blur(3px)"
        opacity={open ? 1 : 0}
        transition="opacity 0.28s ease"
        onClick={onClose}
      />

      <Flex
        role="dialog"
        aria-modal={open ? 'true' : undefined}
        aria-label={ariaLabel}
        position="absolute"
        direction="column"
        overflow="hidden"
        bg="white"
        color={NU.ink}
        left={{ base: 0, sm: '50%' }}
        right={{ base: 0, sm: 'auto' }}
        bottom={{ base: 0, sm: 'auto' }}
        top={{ base: 'auto', sm: '50%' }}
        w={{ base: '100%', sm: 'min(440px, calc(100vw - 32px))' }}
        maxH={{ base: '88dvh', sm: 'min(680px, calc(100dvh - 48px))' }}
        borderRadius={{ base: '24px 24px 0 0', sm: '24px' }}
        boxShadow="0 40px 100px -40px rgba(40, 0, 70, 0.6)"
        opacity={open ? 1 : 0}
        transform={{
          base: open ? 'translateY(0)' : 'translateY(101%)',
          sm: open ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -46%) scale(0.97)',
        }}
        transition="transform 0.32s cubic-bezier(.2,.7,.2,1), opacity 0.22s ease"
      >
        {/* Purple header */}
        <Box position="relative" flexShrink={0} overflow="hidden" bg={NU.brand} color="white" px={5} pt={3} pb={5}>
          <Box
            aria-hidden="true"
            position="absolute"
            top="-110px"
            right="-90px"
            w="240px"
            h="240px"
            borderRadius="full"
            border="1px solid rgba(255,255,255,0.14)"
            boxShadow="0 0 0 40px rgba(255,255,255,0.03), 0 0 0 41px rgba(255,255,255,0.1)"
            pointerEvents="none"
          />
          <Flex justify="center" mb={2} display={{ base: 'flex', sm: 'none' }} aria-hidden="true">
            <Box w="40px" h="4px" borderRadius="full" bg="rgba(255,255,255,0.4)" />
          </Flex>

          <Flex position="relative" align="center" gap={3} pt={{ base: 0, sm: 2 }}>
            <Box
              w="44px"
              h="44px"
              flexShrink={0}
              display="grid"
              placeItems="center"
              overflow="hidden"
              borderRadius="14px"
              bg="white"
              color={NU.brand}
            >
              {media}
            </Box>
            <Box flex={1} minW={0}>
              <Text fontSize="lg" fontWeight={700} letterSpacing="-0.02em" lineHeight={1.2} noOfLines={1}>
                {title}
              </Text>
              {caption && (
                <Text fontSize="xs" color="rgba(255,255,255,0.8)" noOfLines={1}>
                  {caption}
                </Text>
              )}
            </Box>
            <IconButton
              ref={closeRef}
              aria-label={t('common.close')}
              icon={<X size={20} weight="bold" />}
              onClick={onClose}
              variant="ghost"
              w={9}
              h={9}
              minW={9}
              flexShrink={0}
              borderRadius="full"
              bg="rgba(255,255,255,0.12)"
              border="1px solid rgba(255,255,255,0.24)"
              color="white"
              _hover={{ bg: 'rgba(255,255,255,0.2)' }}
              _active={{ bg: 'rgba(255,255,255,0.16)' }}
              _focusVisible={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.55)' }}
            />
          </Flex>

          <Flex position="relative" mt={4} align="flex-end" justify="space-between" gap={3}>
            <Box minW={0}>
              <Text fontSize="xs" color="rgba(255,255,255,0.8)">
                {amountLabel}
              </Text>
              <Text
                fontSize="2rem"
                fontWeight={700}
                letterSpacing="-0.03em"
                lineHeight={1.1}
                noOfLines={1}
              >
                {amount}
              </Text>
            </Box>
            {badge}
          </Flex>

          {headerExtra && <Box position="relative" mt={4}>{headerExtra}</Box>}
        </Box>

        {/* Body */}
        <Box flex={1} minH={0} overflowY="auto" px={5} py={4} sx={{ overscrollBehavior: 'contain' }}>
          {children}
        </Box>

        {footer && (
          <Flex
            flexShrink={0}
            gap={2}
            px={5}
            pt={3}
            pb={{ base: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))', sm: 4 }}
            borderTop="1px solid #ececf1"
            bg="white"
          >
            {footer}
          </Flex>
        )}
      </Flex>
    </Box>,
    document.body,
  )
}

/** Status pill for the purple header. */
export function NuSheetBadge({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'muted' }) {
  return (
    <Text
      as="span"
      flexShrink={0}
      px={3}
      py={1}
      borderRadius="full"
      bg={tone === 'light' ? 'white' : 'rgba(255,255,255,0.16)'}
      color={tone === 'light' ? NU.brand : 'white'}
      fontSize="xs"
      fontWeight={700}
      whiteSpace="nowrap"
    >
      {children}
    </Text>
  )
}

/** Compact 2-column facts grid (label over value) — keeps the sheet short. */
export function NuFacts({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <SimpleGrid columns={2} spacing={2}>
      {items.map((item) => (
        <Box key={item.label} minW={0} px={3} py={2.5} borderRadius="14px" bg={NU.surface}>
          <Text fontSize="xs" color={NU.inkSoft} noOfLines={1}>
            {item.label}
          </Text>
          <Text mt={0.5} fontSize="sm" fontWeight={700} noOfLines={2} lineHeight={1.25}>
            {item.value}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  )
}

/** Pill buttons for the sheet footer and nested dialogs. */
export function nuButtonProps(variant: 'primary' | 'danger' | 'ghost'): ButtonProps {
  const base: ButtonProps = { h: '48px', borderRadius: 'full', fontSize: 'sm', fontWeight: 700 }
  if (variant === 'primary') {
    return {
      ...base,
      bg: NU.brand,
      color: 'white',
      _hover: { bg: NU.brandDeep },
      _active: { bg: NU.brandDeep },
    }
  }
  if (variant === 'danger') {
    return {
      ...base,
      bg: NU.dangerSoft,
      color: NU.danger,
      _hover: { bg: '#f8d9d2' },
      _active: { bg: '#f8d9d2' },
    }
  }
  return {
    ...base,
    bg: 'transparent',
    color: NU.inkSoft,
    _hover: { bg: NU.surface },
    _active: { bg: NU.surface },
  }
}

export function NuSheetButton({ tone, ...props }: ButtonProps & { tone: 'primary' | 'danger' | 'ghost' }) {
  return <Button {...nuButtonProps(tone)} {...props} />
}

export { NU as NU_SHEET_COLORS }
