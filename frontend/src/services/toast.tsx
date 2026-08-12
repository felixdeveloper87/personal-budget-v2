import React from 'react'
import {
  Box,
  Button,
  CloseButton,
  HStack,
  Spinner,
  Text,
  VStack,
  createStandaloneToast,
  type ToastId,
  type ToastPosition,
} from '@chakra-ui/react'
import axios, { type AxiosError } from 'axios'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  Zap,
  type LucideIcon,
} from '../components/ui/icons'
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

const DEFAULT_POSITION: ToastPosition = 'top-right'
const DEDUPE_WINDOW_MS = 3500
const activeKeys = new Map<string, number>()

const { toast, ToastContainer } = createStandaloneToast({ theme })

const STATUS_TOKENS = {
  success: {
    icon: CheckCircle2,
    fg: 'var(--pb-income-2)',
    bg: 'var(--pb-tint-income)',
  },
  error: {
    icon: AlertCircle,
    fg: 'var(--pb-coral)',
    bg: 'var(--pb-tint-coral)',
  },
  warning: {
    icon: AlertTriangle,
    fg: 'var(--pb-gold)',
    bg: 'var(--pb-tint-gold)',
  },
  info: {
    icon: Zap,
    fg: 'var(--pb-forest-2)',
    bg: 'var(--pb-tint-green)',
  },
  loading: {
    icon: RefreshCw,
    fg: 'var(--pb-forest-2)',
    bg: 'var(--pb-tint-green)',
  },
} as const

type StatusToken = {
  icon: LucideIcon
  fg: string
  bg: string
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

function PremiumToast({
  id,
  title,
  description,
  status = 'info',
  isClosable = true,
  action,
}: AppToastOptions & { id: ToastId }) {
  const tokens = STATUS_TOKENS[status]
  const StatusIcon = tokens.icon as StatusToken['icon']
  const bg = 'var(--pb-surface)'
  const border = 'var(--pb-hair-2)'
  const titleColor = 'var(--pb-ink)'
  const descColor = 'var(--pb-ink-soft)'
  const actionBg = 'var(--pb-surface-2)'
  const actionHover = 'var(--pb-surface-3)'

  return (
    <Box
      role={status === 'error' || status === 'warning' ? 'alert' : 'status'}
      aria-live={status === 'error' || status === 'warning' ? 'assertive' : 'polite'}
      w={{ base: 'calc(100vw - 24px)', sm: '390px' }}
      maxW="390px"
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderRadius="xl"
      boxShadow="var(--pb-shadow-lift)"
      backdropFilter="blur(18px) saturate(145%)"
      overflow="hidden"
    >
      <HStack align="flex-start" spacing={3} p={4}>
        <Box
          w={9}
          h={9}
          borderRadius="lg"
          bg={tokens.bg}
          color={tokens.fg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          {status === 'loading' ? (
            <Spinner size="sm" thickness="2px" speed="0.75s" />
          ) : (
            <StatusIcon size={18} weight="duotone" aria-hidden="true" />
          )}
        </Box>

        <VStack align="stretch" spacing={2} minW={0} flex={1}>
          <Box minW={0}>
            <Text color={titleColor} fontSize="sm" fontWeight={750} lineHeight="1.25">
              {title}
            </Text>
            {description && (
              <Text color={descColor} fontSize="sm" lineHeight="1.45" mt={0.5}>
                {description}
              </Text>
            )}
          </Box>

          {action && (
            <Button
              alignSelf="flex-start"
              size="xs"
              h="28px"
              px={3}
              borderRadius="md"
              bg={actionBg}
              color={titleColor}
              fontWeight={700}
              onClick={() => {
                action.onClick()
                toast.close(id)
              }}
              _hover={{ bg: actionHover }}
            >
              {action.label}
            </Button>
          )}
        </VStack>

        {isClosable && (
          <CloseButton
            aria-label={translateNow('toast.dismiss')}
            size="sm"
            mt={-1}
            mr={-1}
            color={descColor}
            onClick={() => toast.close(id)}
          />
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
    render: ({ id }) => <PremiumToast {...options} id={id ?? options.id ?? buildKey(options)} />,
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
