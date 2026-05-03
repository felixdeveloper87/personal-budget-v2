import { useMemo, useState } from 'react'
import {
  Badge,
  Box,
  Collapse,
  HStack,
  Icon,
  IconButton,
  SimpleGrid,
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

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const bodyBg = useColorModeValue('gray.50', '#0a0a0a')
  const emptyChipBg = useColorModeValue('blue.50', 'whiteAlpha.100')
  const emptyChipFg = useColorModeValue('blue.600', 'blue.300')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const sectionLabelColor = useColorModeValue('gray.500', 'gray.400')
  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const statBg = useColorModeValue('white', 'whiteAlpha.50')
  const statBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const heroBg = useColorModeValue(
    'linear-gradient(135deg, #0b1220 0%, #4338ca 52%, #38bdf8 100%)',
    'linear-gradient(135deg, #080b16 0%, #3730a3 52%, #0ea5e9 100%)',
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
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
      header={
        <ModalHeader
          icon={CreditCard}
          title="Installment plans"
          caption="Track your ongoing payment plans"
          onClose={onClose}
          accent="blue"
          rightSlot={
            activePlans.length > 0 ? (
              <Badge
                colorScheme="blue"
                variant="subtle"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight={600}
              >
                {activePlans.length} active
              </Badge>
            ) : undefined
          }
        />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box flex="1" bg={bodyBg} p={{ base: 4, sm: 5, md: 6 }} overflowY="auto">
        {plans.length === 0 ? (
          <VStack spacing={4} py={16} align="center" textAlign="center">
            <Box
              w={14}
              h={14}
              borderRadius="2xl"
              bg={emptyChipBg}
              color={emptyChipFg}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <CreditCard size={26} strokeWidth={2} />
            </Box>
            <VStack spacing={1} maxW="380px">
              <Text fontSize="lg" fontWeight={700} color={titleColor}>
                No installment plans yet
              </Text>
              <Text fontSize="sm" color={colors.text.secondary}>
                Create installment expenses in the form to see them here.
              </Text>
            </VStack>
          </VStack>
        ) : (
          <VStack spacing={6} align="stretch">
            <Box
              bg={heroBg}
              color="white"
              borderRadius="xl"
              p={{ base: 5, md: 6 }}
              boxShadow="0 18px 42px -24px rgba(67, 56, 202, 0.85)"
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
                      <CreditCard size={17} weight="duotone" />
                    </Box>
                    <Text fontSize="xs" fontWeight={800} textTransform="uppercase" color="whiteAlpha.800">
                      Active installment balance
                    </Text>
                  </HStack>
                  <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight={900} lineHeight="1">
                    {formatCurrency(remainingTotal)}
                  </Text>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    Upcoming payments across all active plans.
                  </Text>
                </VStack>
                <Badge bg="whiteAlpha.200" color="white" borderRadius="full" px={3} py={1}>
                  {activePlans.length} active
                </Badge>
              </HStack>
            </Box>

            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
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
              count={activePlans.length}
              emptyMessage="No active plans right now."
              plans={activePlans}
              variant="active"
              onDeleted={onPlanDeleted}
              labelColor={sectionLabelColor}
              dividerColor={dividerColor}
            />

            {pastPlans.length > 0 && (
              <PlansSection
                label="History"
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
  const chipBg = useColorModeValue('blue.50', 'rgba(59,130,246,0.14)')
  const chipFg = useColorModeValue('blue.700', 'blue.300')

  return (
    <Box bg={bg} border="1px solid" borderColor={borderColor} borderRadius="xl" p={4}>
      <HStack spacing={3} align="center">
        <Box
          w={9}
          h={9}
          borderRadius="lg"
          bg={chipBg}
          color={chipFg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={4} weight="duotone" />
        </Box>
        <VStack align="flex-start" spacing={0} minW={0}>
          <Text fontSize="xs" color={captionColor} noOfLines={1}>
            {label}
          </Text>
          <Text fontSize="lg" fontWeight={800} color={titleColor} lineHeight="1.15" noOfLines={1}>
            {value}
          </Text>
        </VStack>
      </HStack>
    </Box>
  )
}

interface PlansSectionProps {
  label: string
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
}

function PlansSection({
  label,
  count,
  plans,
  variant,
  onDeleted,
  emptyMessage,
  labelColor,
  dividerColor,
  collapsible = false,
  defaultExpanded = true,
}: PlansSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const chevronMuted = useColorModeValue('gray.400', 'gray.500')
  const panelId = `installment-section-${label.toLowerCase().replace(/\s+/g, '-')}`

  const isExpanded = collapsible ? expanded : true

  const headerContent = (
    <HStack spacing={3} align="center" flex={1} minW={0}>
      <Text
        fontSize="xs"
        fontWeight={700}
        color={labelColor}
        textTransform="uppercase"
        letterSpacing="0.06em"
      >
        {label}
      </Text>
      <Text fontSize="xs" color={labelColor} fontWeight={500}>
        {count}
      </Text>
    </HStack>
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
              spacing={0}
              align="center"
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
                outlineColor: 'blue.400',
                outlineOffset: '2px',
                borderRadius: 'md',
              }}
            >
              {headerContent}
            </HStack>
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
          headerContent
        )}
      </HStack>

      <Collapse in={isExpanded} animateOpacity>
        <Box id={panelId} role="region">
          {plans.length === 0 ? (
            emptyMessage && (
              <Text fontSize="sm" color={labelColor} py={2}>
                {emptyMessage}
              </Text>
            )
          ) : (
            <SimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={{ base: 4, md: 5 }}
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
