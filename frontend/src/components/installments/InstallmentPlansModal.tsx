import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Badge,
  Box,
  Collapse,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
  Switch,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { ChevronDown, CreditCard, Wallet, CheckCircle2 } from '../ui/icons'
import { useThemeColors } from '../../hooks/useThemeColors'
import InstallmentPlanCard, { isInstallmentPlanCompleted } from './InstallmentPlanCard'
import { InstallmentPlan } from '../../types'
import { ModalHeader, PremiumModal } from '../ui'

interface InstallmentPlansModalProps {
  isOpen: boolean
  onClose: () => void
  plans: InstallmentPlan[]
  onPlanDeleted: () => void
}

function formatCurrency(value: number) {
  return `£${value.toFixed(2)}`
}

export default function InstallmentPlansModal({
  isOpen,
  onClose,
  plans,
  onPlanDeleted,
}: InstallmentPlansModalProps) {
  const colors = useThemeColors()
  const [hideActiveList, setHideActiveList] = useState(false)

  useEffect(() => {
    if (!isOpen) setHideActiveList(false)
  }, [isOpen])

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const bodyBg = useColorModeValue('gray.50', '#0a0a0a')
  const panelBg = useColorModeValue('#ffffff', 'whiteAlpha.50')
  const panelBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const iconBg = useColorModeValue('teal.50', 'rgba(20,184,166,0.14)')
  const iconFg = useColorModeValue('teal.700', 'teal.300')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const sectionLabelColor = useColorModeValue('gray.500', 'gray.400')
  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const statBg = useColorModeValue('white', 'whiteAlpha.50')
  const statBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const heroBg = useColorModeValue(
    'linear-gradient(135deg, #071a2c 0%, #0f766e 48%, #22c55e 100%)',
    'linear-gradient(135deg, #07111f 0%, #0f766e 52%, #16a34a 100%)',
  )

  const { activePlans, pastPlans, activeTotal, remainingTotal, paidTotal } = useMemo(() => {
    const active: InstallmentPlan[] = []
    const past: InstallmentPlan[] = []
    let activeAmount = 0
    let remaining = 0
    let paid = 0
    const now = new Date()

    for (const plan of plans) {
      if (isInstallmentPlanCompleted(plan)) past.push(plan)
      else {
        active.push(plan)
        activeAmount += plan.totalAmount
      }

      for (const transaction of plan.transactions) {
        if (new Date(transaction.date) < now) paid += transaction.amount
        else remaining += transaction.amount
      }
    }
    return { activePlans: active, pastPlans: past, activeTotal: activeAmount, remainingTotal: remaining, paidTotal: paid }
  }, [plans])

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '5xl' }}
      header={
        <ModalHeader
          icon={CreditCard}
          title="Installment plans"
          caption="Spread a purchase across monthly installments"
          onClose={onClose}
          accent="blue"
          rightSlot={
            activePlans.length > 0 ? (
              <Badge colorScheme="teal" variant="subtle" px={3} py={1} borderRadius="full">
                {activePlans.length} active
              </Badge>
            ) : undefined
          }
        />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box flex="1" bg={bodyBg} p={{ base: 3, sm: 5, md: 6 }} overflowY="auto">
        {plans.length === 0 ? (
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
                <Icon as={CreditCard} boxSize={7} weight="duotone" />
              </Box>
              <VStack spacing={1}>
                <Text fontWeight={800} color={titleColor} fontSize="lg">
                  No installment plans yet
                </Text>
                <Text fontSize="sm" color={colors.text.secondary} maxW="420px">
                  Create split payments from Expense · Installments when you add a transaction.
                </Text>
              </VStack>
            </VStack>
          </Box>
        ) : (
          <VStack spacing={6} align="stretch">
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
                      <Icon as={CreditCard} boxSize={4} weight="duotone" />
                    </Box>
                    <Text fontSize="xs" fontWeight={800} textTransform="uppercase" color="whiteAlpha.800">
                      Outstanding on active plans
                    </Text>
                  </HStack>
                  <Text fontSize={{ base: '2xl', md: '4xl' }} fontWeight={900} lineHeight="1">
                    {formatCurrency(remainingTotal)}
                  </Text>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    Still due across installments that have not passed yet.
                  </Text>
                </VStack>
                <VStack align="flex-end" spacing={2} flexShrink={0}>
                  <Badge bg="whiteAlpha.200" color="white" borderRadius="full" px={3} py={1}>
                    {activePlans.length} active
                  </Badge>
                  {pastPlans.length > 0 && (
                    <Badge bg="blackAlpha.200" color="whiteAlpha.900" borderRadius="full" px={3} py={1}>
                      {pastPlans.length} in history
                    </Badge>
                  )}
                </VStack>
              </HStack>
            </Box>

            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={{ base: 2, md: 3 }}>
              <InstallmentStat
                icon={Wallet}
                label="Original active total"
                value={formatCurrency(activeTotal)}
                bg={statBg}
                borderColor={statBorder}
                titleColor={titleColor}
                captionColor={sectionLabelColor}
              />
              <InstallmentStat
                icon={CreditCard}
                label="Remaining"
                value={formatCurrency(remainingTotal)}
                bg={statBg}
                borderColor={statBorder}
                titleColor={titleColor}
                captionColor={sectionLabelColor}
              />
              <InstallmentStat
                icon={CheckCircle2}
                label="Already paid"
                value={formatCurrency(paidTotal)}
                bg={statBg}
                borderColor={statBorder}
                titleColor={titleColor}
                captionColor={sectionLabelColor}
              />
            </SimpleGrid>

            <PlansSection
              label="Active"
              caption={`${activePlans.length} active installment ${activePlans.length === 1 ? 'plan' : 'plans'}`}
              count={activePlans.length}
              emptyMessage="No active plans right now."
              plans={activePlans}
              variant="active"
              onDeleted={onPlanDeleted}
              labelColor={sectionLabelColor}
              dividerColor={dividerColor}
              showPlans={!hideActiveList}
              headerActions={
                activePlans.length > 0 ? (
                  <HStack spacing={{ base: 1.5, sm: 2 }} flexShrink={0} align="center">
                    <Text fontSize={{ base: '2xs', sm: 'xs' }} fontWeight={600} color={sectionLabelColor} display={{ base: 'none', sm: 'block' }}>
                      Hide active
                    </Text>
                    <Switch
                      size="sm"
                      colorScheme="teal"
                      isChecked={hideActiveList}
                      onChange={(e) => setHideActiveList(e.target.checked)}
                      aria-label="Hide active installment plans"
                    />
                  </HStack>
                ) : undefined
              }
            />

            {pastPlans.length > 0 && (
              <PlansSection
                label="History"
                caption={`${pastPlans.length} completed ${pastPlans.length === 1 ? 'plan' : 'plans'} · archived`}
                count={pastPlans.length}
                plans={pastPlans}
                variant="past"
                onDeleted={onPlanDeleted}
                labelColor={sectionLabelColor}
                dividerColor={dividerColor}
                collapsible
                defaultExpanded={false}
              />
            )}
          </VStack>
        )}
      </Box>
    </PremiumModal>
  )
}

interface InstallmentStatProps {
  icon: typeof Wallet
  label: string
  value: string
  bg: string
  borderColor: string
  titleColor: string
  captionColor: string
}

function InstallmentStat({
  icon,
  label,
  value,
  bg,
  borderColor,
  titleColor,
  captionColor,
}: InstallmentStatProps) {
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

interface PlansSectionProps {
  label: string
  caption: string
  count: number
  plans: InstallmentPlan[]
  variant: 'active' | 'past'
  onDeleted: () => void
  emptyMessage?: string
  labelColor: string
  dividerColor: string
  /** When set, section body can be shown or hidden via the header control. */
  collapsible?: boolean
  /** Initial expanded state when `collapsible` is true. Defaults to `true`. */
  defaultExpanded?: boolean
  /** When false with plans present, hides the card grid but keeps header (toggle target). Defaults to true. */
  showPlans?: boolean
  /** Extra controls on the header row (e.g. Hide active Switch). */
  headerActions?: ReactNode
}

function PlansSection({
  label,
  caption,
  count,
  plans,
  variant,
  onDeleted,
  emptyMessage,
  labelColor,
  dividerColor,
  collapsible = false,
  defaultExpanded = true,
  showPlans = true,
  headerActions,
}: PlansSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const chevronMuted = useColorModeValue('gray.400', 'gray.500')
  const titleRowColor = useColorModeValue('gray.900', 'gray.50')
  const emptyMessageBg = useColorModeValue('white', 'whiteAlpha.50')
  const panelId = `installment-section-${label.toLowerCase().replace(/\s+/g, '-')}`

  const isExpanded = collapsible ? expanded : true

  const headerBody = (
    <VStack align="flex-start" spacing={0}>
      <Text fontSize="xs" fontWeight={800} color={titleRowColor} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="xs" color={labelColor}>
        {caption}
      </Text>
    </VStack>
  )

  const countBadge = (
    <Badge borderRadius="full" px={2.5} py={1} colorScheme={variant === 'active' ? 'teal' : 'gray'}>
      {count}
    </Badge>
  )

  return (
    <Box>
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
              aria-label={isExpanded ? `Hide ${label}` : `Show ${label}`}
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
          {plans.length === 0 ? (
            emptyMessage && (
              <Box bg={emptyMessageBg} borderRadius="xl" p={4}>
                <Text fontSize="sm" color={labelColor}>
                  {emptyMessage}
                </Text>
              </Box>
            )
          ) : !showPlans ? null : (
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={{ base: 3, md: 5 }}
              w="full"
            >
              {plans.map((plan) => (
                <InstallmentPlanCard
                  key={plan.id}
                  plan={plan}
                  onDeleted={onDeleted}
                  variant={variant}
                />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}
