import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Badge,
  Box,
  Button,
  Collapse,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Switch,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { ArrowRight, CalendarClock, ChevronDown, Repeat, Wallet } from '../ui/icons'
import { ModalHeader, PremiumModal } from '../ui'
import { RecurringTransaction } from '../../types'
import RecurringTransactionCard from './RecurringTransactionCard'
import AccountAssignmentWizard, { type AssignableItem } from '../accounts/AccountAssignmentWizard'
import { useEditorialPalette } from '../../editorial'

interface RecurringTransactionsModalProps {
  isOpen: boolean
  onClose: () => void
  recurringTransactions: RecurringTransaction[]
  onChanged: () => void | Promise<void>
}

function formatCurrency(value: number) {
  return value < 0 ? `-£${Math.abs(value).toFixed(2)}` : `£${value.toFixed(2)}`
}

export default function RecurringTransactionsModal({
  isOpen,
  onClose,
  recurringTransactions,
  onChanged,
}: RecurringTransactionsModalProps) {
  const ed = useEditorialPalette()
  const [hideActiveList, setHideActiveList] = useState(false)

  useEffect(() => {
    if (!isOpen) setHideActiveList(false)
  }, [isOpen])

  const panelBg = useColorModeValue('#ffffff', 'whiteAlpha.50')
  const panelBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const statBg = useColorModeValue('white', 'whiteAlpha.50')
  const statBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const iconBg = useColorModeValue('teal.50', 'rgba(20,184,166,0.14)')
  const iconFg = useColorModeValue('teal.700', 'teal.300')
  const heroBg = useColorModeValue(
    'linear-gradient(135deg, #071a2c 0%, #0f766e 48%, #22c55e 100%)',
    'linear-gradient(135deg, #07111f 0%, #0f766e 52%, #16a34a 100%)',
  )

  const { activeItems, cancelledItems, activeNet, activeIncome, activeExpense } = useMemo(() => {
    const active: RecurringTransaction[] = []
    const cancelled: RecurringTransaction[] = []
    let income = 0
    let expense = 0

    for (const item of recurringTransactions) {
      if (item.active) {
        active.push(item)
        if (item.type === 'INCOME') income += item.amount
        else expense += item.amount
      } else {
        cancelled.push(item)
      }
    }

    active.sort((a, b) => b.amount - a.amount)
    cancelled.sort((a, b) => a.description.localeCompare(b.description))

    return {
      activeItems: active,
      cancelledItems: cancelled,
      activeNet: income - expense,
      activeIncome: income,
      activeExpense: expense,
    }
  }, [recurringTransactions])

  const wizard = useDisclosure()
  const assignmentItems = useMemo<AssignableItem[]>(
    () =>
      activeItems
        .filter((item) => !item.accountId)
        .map((item) => ({
          id: item.id,
          title: item.description,
          subtitle: item.category,
          amountLabel: `${item.type === 'INCOME' ? 'Income' : 'Expense'} · ${formatCurrency(item.amount)}`,
          metaLabel: `Day ${item.dayOfMonth}`,
        })),
    [activeItems],
  )

  const bannerBg = useColorModeValue('orange.50', 'rgba(249,115,22,0.14)')
  const bannerBorder = useColorModeValue('orange.200', 'rgba(249,115,22,0.35)')
  const bannerTitle = useColorModeValue('orange.800', 'orange.200')
  const bannerText = useColorModeValue('orange.700', 'orange.300')

  return (
    <>
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '5xl' }}
      header={
        <ModalHeader
          icon={CalendarClock}
          title="Fixed payments"
          caption="Salary, rent, bills, subscriptions"
          onClose={onClose}
          accent="blue"
          rightSlot={
            activeItems.length > 0 ? (
              <Badge colorScheme="teal" variant="subtle" px={3} py={1} borderRadius="full">
                {activeItems.length} active
              </Badge>
            ) : undefined
          }
        />
      }
    >
      <Box flex="1" bg={ed.bg} p={{ base: 3, sm: 5, md: 6 }} overflowY="auto">
        {recurringTransactions.length === 0 ? (
          <Box
            bg={panelBg}
            border="1px solid"
            borderColor={panelBorder}
            borderRadius="xl"
            p={{ base: 8, md: 12 }}
          >
            <VStack spacing={4} textAlign="center">
              <Box
                w={14}
                h={14}
                borderRadius="2xl"
                bg={iconBg}
                color={iconFg}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={Repeat} boxSize={7} weight="duotone" />
              </Box>
              <VStack spacing={1}>
                <Text fontWeight={800} color={titleColor} fontSize="lg">
                  No fixed expenses yet
                </Text>
                <Text fontSize="sm" color={captionColor} maxW="420px">
                  Create one from the Expense modal by enabling Repeat every month.
                </Text>
              </VStack>
            </VStack>
          </Box>
        ) : (
          <VStack align="stretch" spacing={6}>
            {assignmentItems.length > 0 && (
              <HStack
                bg={bannerBg}
                border="1px solid"
                borderColor={bannerBorder}
                borderRadius="xl"
                p={{ base: 3, md: 4 }}
                justify="space-between"
                align={{ base: 'flex-start', sm: 'center' }}
                spacing={4}
                flexWrap="wrap"
              >
                <HStack spacing={3} align="flex-start" minW={0}>
                  <Box
                    w={9}
                    h={9}
                    borderRadius="lg"
                    bg="whiteAlpha.500"
                    color={bannerTitle}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon as={Wallet} boxSize={5} weight="duotone" />
                  </Box>
                  <VStack align="flex-start" spacing={0} minW={0}>
                    <Text fontWeight={800} color={bannerTitle}>
                      {assignmentItems.length} active fixed payment{assignmentItems.length === 1 ? '' : 's'} without an account
                    </Text>
                    <Text fontSize="sm" color={bannerText}>
                      Associate each one with a current account so it moves the balance on its payment date.
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  colorScheme="orange"
                  rightIcon={<Icon as={ArrowRight} boxSize={4} />}
                  onClick={wizard.onOpen}
                  flexShrink={0}
                >
                  Associate now
                </Button>
              </HStack>
            )}
            <Box
              bg={heroBg}
              color="white"
              borderRadius="xl"
              p={{ base: 4, md: 6 }}
              boxShadow="0 18px 42px -24px rgba(15, 118, 110, 0.85)"
              overflow="hidden"
            >
              <HStack justify="space-between" align={{ base: 'flex-start', sm: 'center' }} spacing={4}>
                <VStack align="flex-start" spacing={1} minW={0}>
                  <HStack spacing={2}>
                    <Box
                      w={8}
                      h={8}
                      borderRadius="lg"
                      bg="whiteAlpha.200"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={Wallet} boxSize={4} weight="duotone" />
                    </Box>
                    <Text fontSize="xs" fontWeight={800} textTransform="uppercase" color="whiteAlpha.800">
                      Fixed monthly commitments
                    </Text>
                  </HStack>
                  <Text fontSize={{ base: '2xl', md: '4xl' }} fontWeight={900} lineHeight="1">
                    {formatCurrency(activeNet)}
                  </Text>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    Your predictable monthly money movement.
                  </Text>
                </VStack>
                <VStack align="flex-end" spacing={2} flexShrink={0}>
                  <Badge bg="whiteAlpha.200" color="white" borderRadius="full" px={3} py={1}>
                    {activeItems.length} active
                  </Badge>
                  {cancelledItems.length > 0 && (
                    <Badge bg="blackAlpha.200" color="whiteAlpha.900" borderRadius="full" px={3} py={1}>
                      {cancelledItems.length} cancelled
                    </Badge>
                  )}
                </VStack>
              </HStack>
            </Box>

            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={{ base: 2, md: 3 }}>
              <SummaryStat
                icon={Wallet}
                label="Monthly fixed net"
                value={formatCurrency(activeNet)}
                bg={statBg}
                borderColor={statBorder}
                titleColor={titleColor}
                captionColor={captionColor}
              />
              <SummaryStat
                icon={Repeat}
                label="Fixed income"
                value={formatCurrency(activeIncome)}
                bg={statBg}
                borderColor={statBorder}
                titleColor={titleColor}
                captionColor={captionColor}
              />
              <SummaryStat
                icon={CalendarClock}
                label="Fixed expenses"
                value={formatCurrency(activeExpense)}
                bg={statBg}
                borderColor={statBorder}
                titleColor={titleColor}
                captionColor={captionColor}
              />
            </SimpleGrid>

            <RecurringGroup
              title="Active"
              caption={`${activeItems.length} fixed payments sorted by amount`}
              items={activeItems}
              onChanged={onChanged}
              emptyMessage="No active fixed expenses right now."
              showItems={!hideActiveList}
              headerActions={
                activeItems.length > 0 ? (
                  <HStack spacing={{ base: 1.5, sm: 2 }} flexShrink={0} align="center">
                    <Text fontSize={{ base: '2xs', sm: 'xs' }} fontWeight={600} color={captionColor} display={{ base: 'none', sm: 'block' }}>
                      Hide active
                    </Text>
                    <Switch
                      size="sm"
                      colorScheme="teal"
                      isChecked={hideActiveList}
                      onChange={(e) => setHideActiveList(e.target.checked)}
                      aria-label="Hide active fixed payments"
                    />
                  </HStack>
                ) : undefined
              }
            />

            {cancelledItems.length > 0 && (
              <RecurringGroup
                title="Cancelled"
                caption={`${cancelledItems.length} stopped payments kept for reference`}
                items={cancelledItems}
                onChanged={onChanged}
                muted
                collapsible
                defaultExpanded={false}
              />
            )}
          </VStack>
        )}
      </Box>
    </PremiumModal>

    <AccountAssignmentWizard
      isOpen={wizard.isOpen}
      onClose={wizard.onClose}
      kind="recurring"
      items={assignmentItems}
      onAssigned={onChanged}
    />
    </>
  )
}

interface SummaryStatProps {
  icon: typeof Wallet
  label: string
  value: string
  bg: string
  borderColor: string
  titleColor: string
  captionColor: string
}

function SummaryStat({
  icon,
  label,
  value,
  bg,
  borderColor,
  titleColor,
  captionColor,
}: SummaryStatProps) {
  const chipBg = useColorModeValue('teal.50', 'rgba(20,184,166,0.14)')
  const chipFg = useColorModeValue('teal.700', 'teal.300')

  return (
    <Box bg={bg} border="1px solid" borderColor={borderColor} borderRadius="xl" p={{ base: 3, sm: 4 }}>
      <HStack spacing={{ base: 2, md: 3 }} align="center">
        <Box
          w={{ base: 8, md: 9 }}
          h={{ base: 8, md: 9 }}
          borderRadius="lg"
          bg={chipBg}
          color={chipFg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={{ base: 3.5, md: 4 }} weight="duotone" />
        </Box>
        <VStack align="flex-start" spacing={0} minW={0}>
          <Text fontSize={{ base: '2xs', md: 'xs' }} color={captionColor} noOfLines={1}>
            {label}
          </Text>
          <Text fontSize={{ base: 'sm', md: 'lg' }} fontWeight={800} color={titleColor} lineHeight="1.15" noOfLines={1}>
            {value}
          </Text>
        </VStack>
      </HStack>
    </Box>
  )
}

interface RecurringGroupProps {
  title: string
  caption: string
  items: RecurringTransaction[]
  onChanged: () => void | Promise<void>
  emptyMessage?: string
  muted?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
  showItems?: boolean
  headerActions?: ReactNode
}

function RecurringGroup({
  title,
  caption,
  items,
  onChanged,
  emptyMessage,
  muted,
  collapsible = false,
  defaultExpanded = true,
  showItems = true,
  headerActions,
}: RecurringGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const emptyBg = useColorModeValue('white', 'whiteAlpha.50')
  const chevronMuted = useColorModeValue('gray.400', 'gray.500')

  const isExpanded = collapsible ? expanded : true
  const panelId = `fixed-recurring-section-${title.toLowerCase().replace(/\s+/g, '-')}`

  const headerBody = (
    <VStack align="flex-start" spacing={0}>
      <Text fontSize="xs" fontWeight={800} color={titleColor} textTransform="uppercase">
        {title}
      </Text>
      <Text fontSize="xs" color={captionColor}>
        {caption}
      </Text>
    </VStack>
  )

  const countBadge = (
    <Badge borderRadius="full" px={2.5} py={1} colorScheme={muted ? 'gray' : 'teal'}>
      {items.length}
    </Badge>
  )

  const body =
    items.length === 0 ? (
      emptyMessage && (
        <Box bg={emptyBg} borderRadius="xl" p={4}>
          <Text fontSize="sm" color={captionColor}>
            {emptyMessage}
          </Text>
        </Box>
      )
    ) : !showItems ? null : (
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 3, md: 5 }}>
        {items.map((item) => (
          <RecurringTransactionCard
            key={item.id}
            recurringTransaction={item}
            onChanged={onChanged}
          />
        ))}
      </SimpleGrid>
    )

  return (
    <Box opacity={muted ? 0.82 : 1}>
      <HStack
        spacing={2}
        align="center"
        mb={3}
        pb={2}
        borderBottom="1px solid"
        borderColor={dividerColor}
      >
        {collapsible ? (
          <>
            <HStack
              as="button"
              type="button"
              flex={1}
              minW={0}
              spacing={2}
              align="center"
              justify="space-between"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              cursor="pointer"
              bg="transparent"
              border="none"
              p={0}
              textAlign="left"
              _focusVisible={{
                outline: '2px solid',
                outlineColor: 'teal.300',
                outlineOffset: '2px',
                borderRadius: 'md',
              }}
            >
              <HStack flex={1} minW={0} spacing={2} align="center">
                {headerBody}
                {countBadge}
              </HStack>
            </HStack>
            {headerActions}
            <IconButton
              aria-label={isExpanded ? `Hide ${title}` : `Show ${title}`}
              icon={
                <Icon
                  as={ChevronDown}
                  boxSize={5}
                  transition="transform 0.2s ease"
                  transform={isExpanded ? 'rotate(180deg)' : undefined}
                />
              }
              variant="ghost"
              size="sm"
              color={chevronMuted}
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={isExpanded}
              aria-controls={panelId}
            />
          </>
        ) : (
          <HStack flex={1} minW={0} justify="space-between" spacing={2} align="center">
            <HStack minW={0} spacing={2} align="center" flex={1}>
              {headerBody}
              {countBadge}
            </HStack>
            {headerActions}
          </HStack>
        )}
      </HStack>

      <Collapse in={isExpanded} animateOpacity>
        <Box id={panelId} role="region">
          {body}
        </Box>
      </Collapse>
    </Box>
  )
}
