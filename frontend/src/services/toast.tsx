import React from 'react'
import {
  Box,
  HStack,
  Spinner,
  Text,
  createStandaloneToast,
  type ToastId,
  type ToastPosition,
} from '@chakra-ui/react'
import axios, { type AxiosError } from 'axios'
import {
  CheckIcon,
  ExclamationMarkIcon,
  InfoIcon,
  XIcon,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react'
import { X } from '../components/ui/icons'
import theme from '../theme'
import { getCurrentLocale, translateNow } from '../i18n'

type ToastStatus = 'success' | 'error' | 'warning' | 'info' | 'loading'

export interface AppToastAction {
  label: string
  onClick: () => void
}

export interface AppToastOptions {
  id?: ToastId
  title: string
  description?: string
  status?: ToastStatus
  duration?: number | null
  position?: ToastPosition
  isClosable?: boolean
  dedupeKey?: string
  action?: AppToastAction
}

interface ApiErrorMessage {
  title: string
  description: string
  status: Exclude<ToastStatus, 'loading'>
  dedupeKey: string
}

const DEFAULT_POSITION: ToastPosition = 'bottom'
const DEDUPE_WINDOW_MS = 3500
const activeKeys = new Map<string, number>()

const { toast, ToastContainer } = createStandaloneToast({ theme })

/* Nubank-style snackbar: a dark card with white copy, a round status badge
   and a lilac text action. It stays dark in both colour modes. */
const SNACKBAR = {
  bg: '#1f1f24',
  border: 'rgba(255, 255, 255, 0.08)',
  title: '#ffffff',
  description: 'rgba(255, 255, 255, 0.72)',
  action: '#d6b4f7',
  actionHover: 'rgba(214, 180, 247, 0.14)',
  close: 'rgba(255, 255, 255, 0.6)',
} as const

const STATUS_BADGE: Record<ToastStatus, { icon: PhosphorIcon | null; bg: string; fg: string }> = {
  success: { icon: CheckIcon, bg: '#820ad1', fg: '#ffffff' },
  error: { icon: XIcon, bg: '#e5484d', fg: '#ffffff' },
  warning: { icon: ExclamationMarkIcon, bg: '#f5b83d', fg: '#1f1f24' },
  info: { icon: InfoIcon, bg: '#820ad1', fg: '#ffffff' },
  loading: { icon: null, bg: 'rgba(255, 255, 255, 0.12)', fg: '#ffffff' },
}

function buildKey(options: AppToastOptions): string {
  return options.dedupeKey ?? `${options.status ?? 'info'}:${options.title}:${options.description ?? ''}`
}

function shouldShow(options: AppToastOptions): boolean {
  const key = buildKey(options)
  const now = Date.now()
  const lastShownAt = activeKeys.get(key)
  if (lastShownAt && now - lastShownAt < DEDUPE_WINDOW_MS) {
    return false
  }
  activeKeys.set(key, now)
  window.setTimeout(() => activeKeys.delete(key), DEDUPE_WINDOW_MS)
  return true
}

function NubankToast({
  id,
  title,
  description,
  status = 'info',
  isClosable = true,
  action,
}: AppToastOptions & { id: ToastId }) {
  const badge = STATUS_BADGE[status]
  const BadgeIcon = badge.icon
  const urgent = status === 'error' || status === 'warning'

  return (
    <Box
      role={urgent ? 'alert' : 'status'}
      aria-live={urgent ? 'assertive' : 'polite'}
      w={{ base: 'calc(100vw - 24px)', sm: 'auto' }}
      minW={{ sm: '320px' }}
      maxW={{ base: 'calc(100vw - 24px)', sm: '440px' }}
      bg={SNACKBAR.bg}
      border="1px solid"
      borderColor={SNACKBAR.border}
      borderRadius="16px"
      boxShadow="0 12px 32px -8px rgba(15, 10, 25, 0.45), 0 2px 6px rgba(15, 10, 25, 0.2)"
      fontFamily="var(--pb-serif)"
      overflow="hidden"
    >
      <HStack align="center" spacing={3} pl={4} pr={isClosable ? 2 : 4} py={3}>
        <Box
          w="28px"
          h="28px"
          borderRadius="full"
          bg={badge.bg}
          color={badge.fg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          {BadgeIcon ? (
            <BadgeIcon size={15} weight="bold" aria-hidden="true" />
          ) : (
            <Spinner size="xs" thickness="2px" speed="0.75s" />
          )}
        </Box>

        <Box minW={0} flex={1} py={0.5}>
          <Text color={SNACKBAR.title} fontSize="sm" fontWeight={600} lineHeight="1.35">
            {title}
          </Text>
          {description && (
            <Text color={SNACKBAR.description} fontSize="13px" lineHeight="1.4" mt={0.5}>
              {description}
            </Text>
          )}
        </Box>

        {action && (
          <Box
            as="button"
            type="button"
            flexShrink={0}
            px={2.5}
            h="32px"
            borderRadius="full"
            color={SNACKBAR.action}
            fontSize="sm"
            fontWeight={700}
            whiteSpace="nowrap"
            transition="background 0.15s ease"
            _hover={{ bg: SNACKBAR.actionHover }}
            _focusVisible={{ outline: 'none', boxShadow: `0 0 0 2px ${SNACKBAR.action}` }}
            onClick={() => {
              action.onClick()
              toast.close(id)
            }}
          >
            {action.label}
          </Box>
        )}

        {isClosable && (
          <Box
            as="button"
            type="button"
            aria-label={translateNow('toast.dismiss')}
            flexShrink={0}
            w="32px"
            h="32px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color={SNACKBAR.close}
            transition="background 0.15s ease, color 0.15s ease"
            _hover={{ bg: 'rgba(255, 255, 255, 0.1)', color: SNACKBAR.title }}
            _focusVisible={{ outline: 'none', boxShadow: `0 0 0 2px ${SNACKBAR.action}` }}
            onClick={() => toast.close(id)}
          >
            <XIcon size={16} weight="bold" aria-hidden="true" />
          </Box>
        )}
      </HStack>
    </Box>
  )
}

function show(options: AppToastOptions): ToastId | undefined {
  if (!shouldShow(options)) return undefined

  return toast({
    id: options.id,
    position: options.position ?? DEFAULT_POSITION,
    duration: options.duration === undefined ? durationFor(options.status ?? 'info') : options.duration,
    isClosable: options.isClosable ?? true,
    // Clears the iOS home indicator when the app runs installed as a PWA.
    containerStyle: { marginBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' },
    render: ({ id }) => <NubankToast {...options} id={id ?? options.id ?? buildKey(options)} />,
  })
}

function durationFor(status: ToastStatus): number | null {
  if (status === 'loading') return null
  if (status === 'success') return 2400
  if (status === 'warning') return 4200
  if (status === 'error') return 5200
  return 3600
}

function parseServerMessage(error: AxiosError): string | undefined {
  const data = error.response?.data
  if (!data || typeof data !== 'object') return undefined
  const body = data as { message?: unknown; error?: unknown }
  if (typeof body.message === 'string') return body.message
  if (typeof body.error === 'string') return body.error
  return undefined
}

export function getApiErrorMessage(error: unknown): ApiErrorMessage {
  if (!axios.isAxiosError(error)) {
    return {
      title: translateNow('error.unknown.title'),
      description: translateNow('error.unknown.description'),
      status: 'error',
      dedupeKey: 'unknown-error',
    }
  }

  if (!error.response) {
    return {
      title: translateNow('error.network.title'),
      description: translateNow('error.network.description'),
      status: 'error',
      dedupeKey: 'network-error',
    }
  }

  const status = error.response.status
  const serverMessage = parseServerMessage(error)
  // The current backend returns prose in English. Preserve its detail in the
  // English UI, but use reviewed local copy in Portuguese until the API exposes
  // language-neutral error codes.
  const displayServerMessage = getCurrentLocale() === 'en-GB' ? serverMessage : undefined

  if (status === 401) {
    return {
      title: translateNow('error.session.title'),
      description: translateNow('error.session.description'),
      status: 'warning',
      dedupeKey: 'http-401',
    }
  }

  if (status === 403) {
    return {
      title: translateNow('error.forbidden.title'),
      description: displayServerMessage ?? translateNow('error.forbidden.description'),
      status: 'warning',
      dedupeKey: `http-403:${serverMessage ?? ''}`,
    }
  }

  if (status === 404) {
    return {
      title: translateNow('error.notFound.title'),
      description: translateNow('error.notFound.description'),
      status: 'warning',
      dedupeKey: 'http-404',
    }
  }

  if (status === 409) {
    return {
      title: translateNow('error.conflict.title'),
      description: displayServerMessage ?? translateNow('error.conflict.description'),
      status: 'warning',
      dedupeKey: `http-409:${serverMessage ?? ''}`,
    }
  }

  if (status >= 500) {
    return {
      title: translateNow('error.server.title'),
      description: translateNow('error.server.description'),
      status: 'error',
      dedupeKey: `http-${status}`,
    }
  }

  return {
    title: translateNow('error.action.title'),
    description: displayServerMessage ?? translateNow('error.action.description'),
    status: 'error',
    dedupeKey: `http-${status}:${serverMessage ?? ''}`,
  }
}

export const ToastService = {
  show,
  success: (options: Omit<AppToastOptions, 'status'>) => show({ ...options, status: 'success' }),
  error: (options: Omit<AppToastOptions, 'status'>) => show({ ...options, status: 'error' }),
  warning: (options: Omit<AppToastOptions, 'status'>) => show({ ...options, status: 'warning' }),
  info: (options: Omit<AppToastOptions, 'status'>) => show({ ...options, status: 'info' }),
  loading: (options: Omit<AppToastOptions, 'status' | 'duration'>) =>
    show({ ...options, status: 'loading', duration: null, isClosable: options.isClosable ?? false }),
  apiError: (error: unknown, overrides?: Partial<AppToastOptions>) => {
    const message = getApiErrorMessage(error)
    return show({
      title: overrides?.title ?? message.title,
      description: overrides?.description ?? message.description,
      status: overrides?.status ?? message.status,
      duration: overrides?.duration,
      position: overrides?.position,
      isClosable: overrides?.isClosable,
      action: overrides?.action,
      dedupeKey: overrides?.dedupeKey ?? message.dedupeKey,
    })
  },
  close: (id: ToastId) => toast.close(id),
  closeAll: () => toast.closeAll(),
}

export function AppToastContainer() {
  return <ToastContainer />
}

export { X as DismissToastIcon }
