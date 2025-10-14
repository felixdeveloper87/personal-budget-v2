import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Flex,
  Heading,
  SimpleGrid,
  useColorModeValue,
  Button,
} from '@chakra-ui/react'
import { CreditCard, Sparkles, X } from 'lucide-react'
import { useThemeColors } from '../../hooks/useThemeColors'
import InstallmentPlanCard from './InstallmentPlanCard'
import { InstallmentPlan } from '../../types'
import { getResponsiveStyles, getGradients, animations, safeAreaStyles, safariStyles } from '../../utils/ui'

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
  const gradients = getGradients()
  
  // Move all useColorModeValue calls to the top
  const modalBg = useColorModeValue(
    'rgba(255, 255, 255, 0.95)',
    'rgba(17, 17, 17, 0.95)'
  )
  const headerBg = useColorModeValue(
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #a78bfa, #8b5cf6)'
  )
  const emptyStateBg = useColorModeValue(
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #a78bfa, #8b5cf6)'
  )
  const titleBg = useColorModeValue(
    'linear-gradient(135deg, #1e293b, #475569)',
    'linear-gradient(135deg, #f8fafc, #e2e8f0)'
  )
  const closeButtonBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(15, 23, 42, 0.8)')
  const closeButtonBorderColor = useColorModeValue('gray.300', 'gray.600')
  const closeButtonHoverBg = useColorModeValue('red.50', 'red.900')
  const closeButtonIconColor = useColorModeValue('gray.700', 'gray.200')
  const iconBg = useColorModeValue(
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #a78bfa, #8b5cf6)'
  )
  const badgeBg = useColorModeValue(
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #a78bfa, #8b5cf6)'
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'md', md: 'lg', lg: 'xl' }}
      closeOnOverlayClick={true}
      motionPreset="slideInBottom"
      scrollBehavior="inside"
      isCentered={false}
    >
      <ModalOverlay 
        bg="blackAlpha.600" 
        backdropFilter="blur(12px)"
        css={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />
      <ModalContent
        borderRadius={{ base: 'none', sm: '3xl' }}
        h={{ base: '100dvh', sm: 'auto' }}
        maxH={{ base: '100dvh', sm: '85vh' }}
        mx={{ base: 0, sm: 4 }}
        my={{ base: 0, sm: 4 }}
        border="1px solid"
        borderColor={colors.border}
        boxShadow="0 32px 64px -12px rgba(0,0,0,0.4)"
        overflow="hidden"
        bg={modalBg}
        backdropFilter="blur(20px)"
        position="relative"
        sx={{
          ...safeAreaStyles.container,
          ...safariStyles.modal,
          animation: animations.slideIn,
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
        {/* Barra superior animada */}
        <Box
          height="4px"
          background="linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981, #f59e0b, #ef4444)"
          backgroundSize="300% 100%"
          sx={{
            animation: animations.shimmer,
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '-200% 0' },
              '100%': { backgroundPosition: '200% 0' }
            }
          }}
        />

        <ModalHeader
          textAlign="center"
          borderBottom="1px"
          borderColor={colors.border}
          py={8}
          bg={headerBg}
          color="white"
          fontWeight="800"
          letterSpacing="wide"
          position="relative"
          backdropFilter="blur(8px)"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={3}
            mb={2}
          >
            <Box
              p={2}
              borderRadius="full"
              bg="rgba(255,255,255,0.2)"
              sx={{
                animation: animations.glow,
                '@keyframes glow': {
                  '0%, 100%': { 
                    boxShadow: '0 0 5px rgba(255, 255, 255, 0.3)' 
                  },
                  '50%': { 
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)' 
                  }
                }
              }}
            >
              <CreditCard size={22} />
            </Box>
            <Text>Active Installment Plans</Text>
            <Sparkles size={20} />
          </Box>
          <Text 
            fontSize={{ base: '2xs', sm: 'xs' }}
            opacity={0.7}
            fontWeight="400"
          >
            Track your ongoing payment plans
          </Text>
        </ModalHeader>

        <Button
          position="absolute"
          top={{ base: 4, sm: 5, md: 6 }}
          right={{ base: 4, sm: 5, md: 6 }}
          size="lg"
          variant="ghost"
          onClick={onClose}
          borderRadius="full"
          p={3}
          bg={closeButtonBg}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor={closeButtonBorderColor}
          _hover={{
            bg: closeButtonHoverBg,
            borderColor: 'red.300',
            transform: 'scale(1.1)',
            boxShadow: 'lg',
          }}
          _active={{
            transform: 'scale(0.95)',
          }}
          transition="all 0.2s ease"
          zIndex={10}
          boxShadow="md"
          aria-label="Close modal"
        >
          <Icon as={X} boxSize={5} color={closeButtonIconColor} />
        </Button>

        <ModalBody
          p={0}
          overflowY="auto"
          maxH={{ base: 'calc(100dvh - 200px)', sm: '70vh' }}
          sx={{
            ...safariStyles.scrollable,
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
          }}
        >
          <Box p={{ base: 4, sm: 6, md: 8 }}>
            {plans.length === 0 ? (
              <VStack spacing={6} align="center" py={20}>
                <Box
                  p={4}
                  borderRadius="2xl"
                  bg={emptyStateBg}
                  boxShadow="lg"
                  sx={{
                    animation: animations.glow,
                    '@keyframes glow': {
                      '0%, 100%': { 
                        boxShadow: '0 0 5px rgba(139, 92, 246, 0.3)' 
                      },
                      '50%': { 
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)' 
                      }
                    }
                  }}
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
              <VStack spacing={6} align="stretch">
                {/* Header com contagem */}
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  align="center"
                  justify="space-between"
                  gap={4}
                >
                  <HStack spacing={4} align="center">
                    <Box
                      p={3}
                      borderRadius="2xl"
                      bg={iconBg}
                      boxShadow="lg"
                      sx={{
                        animation: animations.glow,
                        '@keyframes glow': {
                          '0%, 100%': { 
                            boxShadow: '0 0 5px rgba(139, 92, 246, 0.3)' 
                          },
                          '50%': { 
                            boxShadow: '0 0 20px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)' 
                          }
                        }
                      }}
                    >
                      <Icon as={CreditCard} boxSize={6} color="white" />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading
                        size="lg"
                        bg={titleBg}
                        bgClip="text"
                        fontWeight="800"
                      >
                        Active Installment Plans
                      </Heading>
                      <Text
                        fontSize={{ base: '2xs', sm: 'xs' }}
                        color={colors.text.secondary}
                        fontWeight="400"
                        opacity={0.8}
                      >
                        Track your ongoing payment plans
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <Badge
                    colorScheme="purple"
                    variant="solid"
                    borderRadius="full"
                    px={4}
                    py={2}
                    fontSize="sm"
                    fontWeight="600"
                    bg={badgeBg}
                    boxShadow="md"
                  >
                    <HStack spacing={2}>
                      <Icon as={Sparkles} boxSize={3} />
                      <Text>{plans.length} Active</Text>
                    </HStack>
                  </Badge>
                </Flex>

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
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
