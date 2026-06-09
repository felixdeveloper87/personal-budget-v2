import { useMemo } from 'react'
import {
  Box,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useAuth } from '../../contexts/AuthContext'

export interface DashboardHeaderProps {
  income?: number
  expense?: number
}

/**
 * Returns a contextual greeting based on the current local time.
 * Memoised so the value stays stable across re-renders within the same hour.
 */
function useGreeting() {
  return useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 5) return 'Good night'
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])
}

/**
 * Pretty version of "today" — e.g. `Sunday, 26 April`.
 * Recomputed once per mount; the dashboard reloads anyway when data changes.
 */
function useTodayLabel() {
  return useMemo(
    () =>
      new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    [],
  )
}

function getFirstName(name?: string | null) {
  if (!name) return null
  const trimmed = name.trim()
  if (!trimmed) return null
  return trimmed.split(/\s+/)[0]
}

/**
 * Page header for the Dashboard — gives the user context (greeting + today's
 * date) before they land on the data sections.
 *
 * Intentionally calm: no gradients, no infinite animations, no decorative
 * blobs. Lets the content underneath breathe.
 */
function useFinancialStatus(income?: number, expense?: number) {
  return useMemo(() => {
    if (!income && !expense) return null
    const inc = income ?? 0
    const exp = expense ?? 0
    if (inc === 0 && exp === 0) return null
    const net = inc - exp
    if (net >= 0) return { label: 'On track', dot: 'green.400', text: 'green.600', textDark: 'green.300', bg: 'green.50', bgDark: 'rgba(34,197,94,0.12)', border: 'green.100', borderDark: 'rgba(34,197,94,0.25)' }
    if (Math.abs(net) < inc * 0.15) return { label: 'Watch spending', dot: 'amber.400', text: 'orange.600', textDark: 'orange.300', bg: 'orange.50', bgDark: 'rgba(251,146,60,0.12)', border: 'orange.100', borderDark: 'rgba(251,146,60,0.25)' }
    return { label: 'Over budget', dot: 'red.400', text: 'red.600', textDark: 'red.300', bg: 'red.50', bgDark: 'rgba(239,68,68,0.12)', border: 'red.100', borderDark: 'rgba(239,68,68,0.25)' }
  }, [income, expense])
}

export default function DashboardHeader({ income, expense }: DashboardHeaderProps) {
  const { user } = useAuth()
  const greeting = useGreeting()
  const todayLabel = useTodayLabel()
  const status = useFinancialStatus(income, expense)

  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const dateBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const dateBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const dateColor = useColorModeValue('gray.600', 'gray.300')
  const dotColor = useColorModeValue('green.500', 'green.300')

  const statusBg = useColorModeValue(status?.bg ?? 'transparent', status?.bgDark ?? 'transparent')
  const statusBorder = useColorModeValue(status?.border ?? 'transparent', status?.borderDark ?? 'transparent')
  const statusText = useColorModeValue(status?.text ?? 'gray.600', status?.textDark ?? 'gray.300')

  const firstName = getFirstName(user?.name)
  const headline = firstName ? `${greeting}, ${firstName}` : greeting

  return (
    <HStack
      w="full"
      align="center"
      justify="space-between"
      spacing={4}
      px={{ base: 1, sm: 2, md: 3 }}
      py={{ base: 1, md: 2 }}
    >
      <VStack align="flex-start" spacing={0.5} minW={0}>
        <Text
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight={700}
          color={titleColor}
          letterSpacing="-0.01em"
          noOfLines={1}
        >
          {headline}
        </Text>
        <Text
          fontSize={{ base: 'xs', md: 'sm' }}
          color={captionColor}
          fontWeight={500}
          noOfLines={1}
        >
          Monthly income and bills based on their payment dates.
        </Text>
      </VStack>

      <HStack spacing={2} flexShrink={0}>
        {status && (
          <HStack
            spacing={1.5}
            bg={statusBg}
            border="1px solid"
            borderColor={statusBorder}
            borderRadius="full"
            px={3}
            py={1.5}
            display={{ base: 'none', md: 'flex' }}
          >
            <Box w="6px" h="6px" borderRadius="full" bg={status.dot} />
            <Text fontSize="xs" fontWeight={600} color={statusText}>
              {status.label}
            </Text>
          </HStack>
        )}

        <HStack
          spacing={2}
          bg={dateBg}
          border="1px solid"
          borderColor={dateBorder}
          borderRadius="full"
          px={3}
          py={1.5}
          display={{ base: 'none', sm: 'flex' }}
        >
          <Box w="6px" h="6px" borderRadius="full" bg={dotColor} />
          <Text fontSize="xs" fontWeight={600} color={dateColor}>
            {todayLabel}
          </Text>
        </HStack>
      </HStack>
    </HStack>
  )
}
