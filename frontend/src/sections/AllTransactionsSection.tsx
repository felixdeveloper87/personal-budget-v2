import { TransactionList, TransactionListGrouped } from '../components'
import { Transaction } from '../types'
import { useState } from 'react'
import {
  Box,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Calendar, Filter, List, ReceiptText, RefreshCw } from '../components/ui/icons'

interface AllTransactionsSectionProps {
  transactions: Transaction[]
  hasFilters: boolean
  onRefresh: () => void
}

export default function AllTransactionsSection({
  transactions,
  hasFilters,
  onRefresh,
}: AllTransactionsSectionProps) {
  const [groupByMonth, setGroupByMonth] = useState(false)

  /* ── Surface tokens ── */
  const surface = useColorModeValue(
    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    'linear-gradient(135deg, rgba(18, 18, 22, 0.75) 0%, rgba(10, 10, 12, 0.85) 100%)',
  )
  const border = useColorModeValue('rgba(0, 0, 0, 0.06)', 'rgba(255, 255, 255, 0.04)')
  const headerBg = useColorModeValue(
    'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.8) 100%)',
    'linear-gradient(135deg, rgba(15, 15, 20, 0.6) 0%, rgba(10, 10, 14, 0.5) 100%)',
  )
  const headerBorder = useColorModeValue('rgba(0, 0, 0, 0.04)', 'rgba(255, 255, 255, 0.03)')

  /* ── Text tokens ── */
  const titleColor = useColorModeValue('gray.900', 'whiteAlpha.900')
  const subColor = useColorModeValue('gray.500', 'gray.400')

  /* ── Accent tokens ── */
  const accentGradient = useColorModeValue(
    'linear-gradient(135deg, #2563eb, #7c3aed)',
    'linear-gradient(135deg, #60a5fa, #a78bfa)',
  )
  const iconBoxBg = useColorModeValue('blue.50', 'rgba(59, 130, 246, 0.12)')
  const iconBoxColor = useColorModeValue('blue.600', 'blue.300')

  /* ── Tab tokens ── */
  const tabTrackBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const tabTrackBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const tabActiveText = useColorModeValue('blue.700', 'blue.100')
  const tabInactiveText = useColorModeValue('gray.600', 'gray.400')
  const tabActiveBg = useColorModeValue('white', 'whiteAlpha.200')
  const tabActiveShadow = useColorModeValue(
    '0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 12px rgba(37, 99, 235, 0.12)',
    '0 1px 3px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(96, 165, 250, 0.15)',
  )

  /* ── Filter badge tokens ── */
  const filterBg = useColorModeValue('orange.50', 'rgba(251, 146, 60, 0.12)')
  const filterBorder = useColorModeValue('orange.200', 'orange.700')
  const filterColor = useColorModeValue('orange.600', 'orange.300')

  /* ── Refresh button tokens ── */
  const refreshBg = useColorModeValue('white', 'whiteAlpha.100')
  const refreshBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const refreshColor = useColorModeValue('gray.600', 'gray.400')
  const refreshHoverBg = useColorModeValue('gray.50', 'whiteAlpha.200')
  const refreshHoverColor = useColorModeValue('gray.900', 'white')

  /* ── Count badge tokens ── */
  const countBg = useColorModeValue('blue.50', 'rgba(59, 130, 246, 0.12)')
  const countColor = useColorModeValue('blue.700', 'blue.300')
  const countBorder = useColorModeValue('blue.100', 'rgba(59, 130, 246, 0.25)')

  const cardShadow = useColorModeValue(
    '0 4px 16px -4px rgba(15, 23, 42, 0.06)',
    '0 4px 16px -4px rgba(0, 0, 0, 0.4)',
  )
  const tabHoverColor = useColorModeValue('gray.900', 'white')

  return (
    <Box
      w="full"
      borderRadius="2xl"
      bg={surface}
      border="1px solid"
      borderColor={border}
      overflow="hidden"
      boxShadow={cardShadow}
    >
      {/* ─── Header ─── */}
      <Box
        bg={headerBg}
        borderBottom="1px solid"
        borderBottomColor={headerBorder}
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 5 }}
        position="relative"
        overflow="hidden"
      >
        {/* Subtle top accent bar */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="2px"
          background={accentGradient}
          opacity={0.5}
        />

        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'flex-start', md: 'center' }}
          justify="space-between"
          gap={{ base: 4, md: 0 }}
        >
          {/* Left: icon + title + count */}
          <HStack spacing={3} align="center">
            <Flex
              w={{ base: 9, md: 10 }}
              h={{ base: 9, md: 10 }}
              align="center"
              justify="center"
              borderRadius="xl"
              bg={iconBoxBg}
              color={iconBoxColor}
              flexShrink={0}
            >
              <Icon as={ReceiptText} boxSize={5} weight="duotone" />
            </Flex>

            <VStack spacing={0} align="flex-start">
              <HStack spacing={2} align="center">
                <Heading
                  as="h1"
                  fontSize={{ base: 'lg', md: 'xl' }}
                  fontWeight={800}
                  color={titleColor}
                  letterSpacing="-0.02em"
                  lineHeight={1.1}
                >
                  Transactions
                </Heading>

                {/* Count pill */}
                <Box
                  px={2.5}
                  py={0.5}
                  borderRadius="full"
                  bg={countBg}
                  border="1px solid"
                  borderColor={countBorder}
                >
                  <Text fontSize="xs" fontWeight={800} color={countColor} lineHeight={1}>
                    {transactions.length}
                  </Text>
                </Box>

                {/* Filter badge */}
                {hasFilters && (
                  <HStack
                    spacing={1.5}
                    px={2.5}
                    py={0.5}
                    borderRadius="full"
                    bg={filterBg}
                    border="1px solid"
                    borderColor={filterBorder}
                  >
                    <Icon as={Filter} boxSize={3} color={filterColor} weight="bold" />
                    <Text fontSize="xs" fontWeight={700} color={filterColor} lineHeight={1}>
                      Filtered
                    </Text>
                  </HStack>
                )}
              </HStack>

              <Text
                fontSize="xs"
                fontWeight={500}
                color={subColor}
                display={{ base: 'none', sm: 'block' }}
              >
                Complete transaction history
              </Text>
            </VStack>
          </HStack>

          {/* Right: View toggle + Refresh */}
          <HStack spacing={2}>
            {/* View toggle — segmented control */}
            <HStack
              spacing={0.5}
              p={0.5}
              borderRadius="xl"
              bg={tabTrackBg}
              border="1px solid"
              borderColor={tabTrackBorder}
            >
              <ViewToggleButton
                icon={List}
                label="List"
                isActive={!groupByMonth}
                onClick={() => setGroupByMonth(false)}
                activeBg={tabActiveBg}
                activeShadow={tabActiveShadow}
                activeColor={tabActiveText}
                inactiveColor={tabInactiveText}
                hoverColor={tabHoverColor}
              />
              <ViewToggleButton
                icon={Calendar}
                label="Grouped"
                isActive={groupByMonth}
                onClick={() => setGroupByMonth(true)}
                activeBg={tabActiveBg}
                activeShadow={tabActiveShadow}
                activeColor={tabActiveText}
                inactiveColor={tabInactiveText}
                hoverColor={tabHoverColor}
              />
            </HStack>

            {/* Refresh */}
            <IconButton
              aria-label="Refresh transactions"
              icon={<Icon as={RefreshCw} boxSize={4} weight="bold" />}
              size="sm"
              variant="ghost"
              h="36px"
              w="36px"
              minW="36px"
              borderRadius="xl"
              bg={refreshBg}
              color={refreshColor}
              border="1px solid"
              borderColor={refreshBorder}
              transition="all 0.2s ease"
              _hover={{
                bg: refreshHoverBg,
                color: refreshHoverColor,
                transform: 'translateY(-1px)',
                boxShadow: 'sm',
                '& > svg': { transform: 'rotate(45deg)' },
              }}
              _active={{ transform: 'translateY(0)' }}
              sx={{ '& > svg': { transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)' } }}
              onClick={onRefresh}
            />
          </HStack>
        </Flex>
      </Box>

      {/* ─── Content ─── */}
      <Box px={{ base: 2, sm: 3, md: 4, lg: 5 }} py={{ base: 3, md: 4 }}>
        {transactions.length === 0 ? (
          <EmptyState />
        ) : groupByMonth ? (
          <TransactionListGrouped
            transactions={transactions}
            onTransactionDeleted={onRefresh}
          />
        ) : (
          <TransactionList
            transactions={transactions}
            onTransactionDeleted={onRefresh}
          />
        )}
      </Box>
    </Box>
  )
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

interface ViewToggleButtonProps {
  icon: any
  label: string
  isActive: boolean
  onClick: () => void
  activeBg: string
  activeShadow: string
  activeColor: string
  inactiveColor: string
  hoverColor: string
}

function ViewToggleButton({
  icon: IconComponent,
  label,
  isActive,
  onClick,
  activeBg,
  activeShadow,
  activeColor,
  inactiveColor,
  hoverColor,
}: ViewToggleButtonProps) {
  return (
    <Box
      as="button"
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      display="flex"
      alignItems="center"
      gap={1.5}
      px={3}
      py={1.5}
      borderRadius="lg"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : inactiveColor}
      fontWeight={isActive ? 700 : 600}
      fontSize="sm"
      boxShadow={isActive ? activeShadow : 'none'}
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{
        color: isActive ? activeColor : hoverColor,
      }}
    >
      <Icon as={IconComponent} boxSize={4} weight={isActive ? 'duotone' : 'regular'} />
      <Text as="span" lineHeight={1} display={{ base: 'none', sm: 'inline' }}>
        {label}
      </Text>
    </Box>
  )
}

function EmptyState() {
  const textColor = useColorModeValue('gray.500', 'gray.400')
  const iconColor = useColorModeValue('gray.300', 'gray.600')

  return (
    <VStack spacing={3} py={16} align="center">
      <Flex
        w={14}
        h={14}
        align="center"
        justify="center"
        borderRadius="2xl"
        bg={useColorModeValue('gray.50', 'whiteAlpha.50')}
      >
        <Icon as={ReceiptText} boxSize={7} color={iconColor} weight="duotone" />
      </Flex>
      <VStack spacing={1}>
        <Text fontSize="md" fontWeight={700} color={textColor}>
          No transactions yet
        </Text>
        <Text fontSize="sm" color={textColor} opacity={0.7} maxW="320px" textAlign="center">
          Your transaction history will appear here once you start adding entries.
        </Text>
      </VStack>
    </VStack>
  )
}
