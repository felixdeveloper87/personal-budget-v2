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
import { ChevronDown, CreditCard } from 'lucide-react'
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

  const { activePlans, pastPlans } = useMemo(() => {
    const active: InstallmentPlan[] = []
    const past: InstallmentPlan[] = []
    for (const plan of plans) {
      if (isInstallmentPlanCompleted(plan)) past.push(plan)
      else active.push(plan)
    }
    return { activePlans: active, pastPlans: past }
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
          <VStack spacing={8} align="stretch">
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
