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
  useColorModeValue,
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
    fg: 'green.500',
    bgLight: 'rgba(16, 185, 129, 0.10)',
    bgDark: 'rgba(16, 185, 129, 0.16)',
  },
  error: {
    icon: AlertCircle,
    fg: 'red.500',
    bgLight: 'rgba(239, 68, 68, 0.10)',
    bgDark: 'rgba(239, 68, 68, 0.16)',
  },
  warning: {
    icon: AlertTriangle,
    fg: 'orange.500',
    bgLight: 'rgba(245, 158, 11, 0.12)',
    bgDark: 'rgba(245, 158, 11, 0.18)',
  },
  info: {
    icon: Zap,
    fg: 'blue.500',
    bgLight: 'rgba(37, 99, 235, 0.10)',
    bgDark: 'rgba(96, 165, 250, 0.16)',
  },
  loading: {
    icon: RefreshCw,
    fg: 'blue.500',
    bgLight: 'rgba(37, 99, 235, 0.10)',
    bgDark: 'rgba(96, 165, 250, 0.16)',
  },
} as const

type StatusToken = {
  icon: LucideIcon
  fg: string
  bgLight: string
  bgDark: string
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
  const bg = useColorModeValue('rgba(255,255,255,0.96)', 'rgba(10,10,10,0.94)')
  const border = useColorModeValue('rgba(15,23,42,0.10)', 'rgba(255,255,255,0.12)')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const descColor = useColorModeValue('gray.600', 'gray.400')
  const iconBg = useColorModeValue(tokens.bgLight, tokens.bgDark)
  const actionBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const actionHover = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')

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
      boxShadow="0 24px 70px -30px rgba(0,0,0,0.42), 0 10px 28px -18px rgba(0,0,0,0.32)"
      backdropFilter="blur(18px) saturate(145%)"
      overflow="hidden"
    >
      <HStack align="flex-start" spacing={3} p={4}>
        <Box
          w={9}
          h={9}
          borderRadius="lg"
          bg={iconBg}
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
            aria-label="Dismiss notification"
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
      title: 'Something went wrong',
      description: 'We could not complete that action. Please try again.',
      status: 'error',
      dedupeKey: 'unknown-error',
    }
  }

  if (!error.response) {
    return {
      title: 'Connection problem',
      description: 'Check your internet connection and try again.',
      status: 'error',
      dedupeKey: 'network-error',
    }
  }

  const status = error.response.status
  const serverMessage = parseServerMessage(error)

  if (status === 401) {
    return {
      title: 'Session expired',
      description: 'Please sign in again to continue.',
      status: 'warning',
      dedupeKey: 'http-401',
    }
  }

  if (status === 403) {
    return {
      title: 'Access restricted',
      description: serverMessage ?? 'You do not have permission to perform this action.',
      status: 'warning',
      dedupeKey: `http-403:${serverMessage ?? ''}`,
    }
  }

  if (status === 404) {
    return {
      title: 'Item not found',
      description: 'This record may have been moved or deleted.',
      status: 'warning',
      dedupeKey: 'http-404',
    }
  }

  if (status === 409) {
    return {
      title: 'Could not save changes',
      description: serverMessage ?? 'This conflicts with another update. Refresh and try again.',
      status: 'warning',
      dedupeKey: `http-409:${serverMessage ?? ''}`,
    }
  }

  if (status >= 500) {
    return {
      title: 'Service temporarily unavailable',
      description: 'Our server could not complete the request. Please try again in a moment.',
      status: 'error',
      dedupeKey: `http-${status}`,
    }
  }

  return {
    title: 'Could not complete action',
    description: serverMessage ?? 'Please review the information and try again.',
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
