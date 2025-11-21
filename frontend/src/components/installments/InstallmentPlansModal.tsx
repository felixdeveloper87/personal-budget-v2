import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Heading,
  SimpleGrid,
  useColorModeValue,
  Button,
} from '@chakra-ui/react'
import { CreditCard, X } from 'lucide-react'
import { useThemeColors } from '../../hooks/useThemeColors'
import InstallmentPlanCard from './InstallmentPlanCard'
import { InstallmentPlan } from '../../types'
import { getResponsiveStyles, animations, safeAreaStyles, safariStyles, getModalHeaderStyles, getScrollbarStyles, PremiumModal } from '../ui'

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
  const responsiveStyles = getResponsiveStyles()
  const headerStyles = getModalHeaderStyles(useColorModeValue)
  const cardBg = useColorModeValue('gray.50', 'black')

  // Simplified color values
  const emptyStateBg = useColorModeValue(
    '#dbeafe', // Azul post-it
    colors.cardBg // Usar cor do tema para modo dark
  )
  const titleBg = useColorModeValue(
    'gray.800', // Texto escuro
    colors.text.primary // Usar cor do tema para modo dark
  )
  const iconBg = useColorModeValue(
    '#60a5fa', // Azul claro
    colors.accent // Usar cor do tema para modo dark
  )
  const plansHeaderTextColor = useColorModeValue('gray.800', 'white')

  const ModalHeader = (
    <Box
      {...headerStyles.container}
      p={{ base: 0.5, sm: 2, md: 3 }}
      sx={{
        ...headerStyles.container.sx,
        paddingTop: 'max(56px, env(safe-area-inset-top, 56px))',
        paddingBottom: { base: '2' }
      }}
    >
      <HStack
        spacing={{ base: 2, sm: 3 }}
        align="center"
        justify="space-between"
        flexWrap="nowrap"
        pr={{ base: 2, sm: 4 }}
        pt={{ base: 2, sm: 0 }}
      >
        {/* Logo + Text */}
        <HStack
          spacing={{ base: 2, sm: 3 }}
          align="center"
          flex="1"
          minW={0}
        >
          <Box
            p={{ base: 2, sm: 3 }}
            borderRadius="2xl"
            bg={iconBg}
            boxShadow="lg"
            flexShrink={0}
          >
            <CreditCard size={22} color="white" />
          </Box>
          <VStack
            align="start"
            spacing={0}
            flex="1"
            minW={0}
          >
            <Text
              color={useColorModeValue('black', 'white')}
              fontWeight="800"
              fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
              lineHeight="shorter"
              noOfLines={1}
            >
              Active Installment Plans
            </Text>
            <Text
              color={useColorModeValue('gray.600', 'gray.300')}
              fontWeight="600"
              fontSize={{ base: 'xs', sm: 'sm' }}
              noOfLines={1}
            >
              Track your ongoing payment plans
            </Text>
          </VStack>
        </HStack>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          bg={useColorModeValue(headerStyles.closeButton.bg.light, headerStyles.closeButton.bg.dark)}
          border="1px solid"
          borderColor={useColorModeValue(headerStyles.closeButton.borderColor.light, headerStyles.closeButton.borderColor.dark)}
          borderRadius={headerStyles.closeButton.borderRadius}
          p={headerStyles.closeButton.p}
          _hover={headerStyles.closeButton._hover}
          transition={headerStyles.closeButton.transition}
          flexShrink={0}
        >
          <Icon as={X} boxSize={headerStyles.closeButton.iconSize} color={useColorModeValue(headerStyles.closeButton.iconColor.light, headerStyles.closeButton.iconColor.dark)} />
        </Button>
      </HStack>
    </Box>
  )

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
      header={ModalHeader}
      contentProps={{
        bg: cardBg,
      }}
    >
      {/* Modal content - Scrollable */}
      <Box
        flex="1"
        overflowY="auto"
        {...responsiveStyles.content}
        sx={{
          ...safeAreaStyles.content,
          ...safariStyles.scrollable,
          ...getScrollbarStyles(useColorModeValue)
        }}
      >
        <Box p={{ base: 2, sm: 4, md: 6 }}>
          {plans.length === 0 ? (
            <VStack spacing={6} align="center" py={20}>
              <Box
                p={4}
                borderRadius="2xl"
                bg={cardBg}
                boxShadow="lg"
              >
                <Icon as={CreditCard} boxSize={8} color="white" />
              </Box>

              <VStack spacing={3} align="center">
                <Heading
                  size="lg"
                  bg={titleBg}
                  bgClip="text"
                  fontWeight="800"
                  textAlign="center"
                >
                  No Active Installment Plans
                </Heading>
                <Text
                  color={colors.text.secondary}
                  fontSize={{ base: 'sm', sm: 'md' }}
                  textAlign="center"
                  maxW="400px"
                  lineHeight="shorter"
                >
                  Create installment expenses in the form above to see them here
                </Text>
              </VStack>
            </VStack>
          ) : (
            <VStack align="stretch">
              {/* Header com contagem */}
              <HStack justify="space-between" align="center" mb={4}>
                <HStack spacing={3}>
                  <Text
                    fontSize={{ base: 'lg', md: 'xl' }}
                    fontWeight="bold"
                    color={plansHeaderTextColor}
                  >
                    Installment Plans
                  </Text>
                  <Badge
                    colorScheme="blue"
                    variant="subtle"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="500"
                  >
                    {plans.length} Active
                  </Badge>
                </HStack>
              </HStack>

              {/* Grid de plans */}
              <SimpleGrid
                columns={{ base: 1, sm: 1, md: 2 }}
                spacing={{ base: 4, sm: 5, md: 6 }}
                w="full"
              >
                {plans.map((plan, index) => (
                  <Box
                    key={plan.id}
                    sx={{
                      animation: `${animations.slideIn} ${0.2 + index * 0.1}s ease-out`,
                      '@keyframes slideIn': {
                        from: {
                          opacity: 0,
                          transform: 'translateY(20px) scale(0.95)'
                        },
                        to: {
                          opacity: 1,
                          transform: 'translateY(0) scale(1)'
                        }
                      }
                    }}
                  >
                    <InstallmentPlanCard plan={plan} onDeleted={onPlanDeleted} />
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          )}
        </Box>
      </Box>
    </PremiumModal>
  )
}
