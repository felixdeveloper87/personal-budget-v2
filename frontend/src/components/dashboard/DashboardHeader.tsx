import { useMemo } from 'react'
import {
  Box,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useAuth } from '../../contexts/AuthContext'

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
export default function DashboardHeader() {
  const { user } = useAuth()
  const greeting = useGreeting()
  const todayLabel = useTodayLabel()

  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const dateBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const dateBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const dateColor = useColorModeValue('gray.600', 'gray.300')
  const dotColor = useColorModeValue('green.500', 'green.300')

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
          Here&apos;s what&apos;s happening with your money today.
        </Text>
      </VStack>

      <HStack
        spacing={2}
        bg={dateBg}
        border="1px solid"
        borderColor={dateBorder}
        borderRadius="full"
        px={3}
        py={1.5}
        display={{ base: 'none', sm: 'flex' }}
        flexShrink={0}
      >
        <Box w="6px" h="6px" borderRadius="full" bg={dotColor} />
        <Text fontSize="xs" fontWeight={600} color={dateColor}>
          {todayLabel}
        </Text>
      </HStack>
    </HStack>
  )
}
