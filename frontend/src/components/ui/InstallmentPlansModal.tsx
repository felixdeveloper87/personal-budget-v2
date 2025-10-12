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
} from '@chakra-ui/react'
import { CreditCard, Sparkles } from 'lucide-react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { InstallmentPlanCard } from '../installments'
import { InstallmentPlan } from '../../types'

// 🎨 Animações personalizadas
const shimmer = 'shimmer 4s ease-in-out infinite'
const slideIn = 'slideIn 0.6s ease-out'
const glow = 'glow 3s ease-in-out infinite'

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'md', md: 'lg', lg: 'xl' }}
      closeOnOverlayClick={true}
      motionPreset="slideInBottom"
      scrollBehavior="inside"
    >
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(12px)" />
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
        sx={{
          animation: slideIn,
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
            animation: shimmer,
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
          bg={useColorModeValue(
            'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            'linear-gradient(135deg, #a78bfa, #8b5cf6)'
          )}
          color="white"
          fontWeight="800"
          letterSpacing="wide"
          position="relative"
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
                animation: glow,
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

        <ModalCloseButton
          aria-label="Close modal"
          color="white"
          bg="rgba(0,0,0,0.3)"
          borderRadius="full"
          _hover={{ bg: 'rgba(0,0,0,0.5)' }}
        />

        <ModalBody
          p={0}
          overflowY="auto"
          maxH={{ base: 'calc(100dvh - 200px)', sm: '70vh' }}
          sx={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <Box p={{ base: 4, sm: 6, md: 8 }}>
            {plans.length === 0 ? (
              <VStack spacing={6} align="center" py={20}>
                <Box
                  p={4}
                  borderRadius="2xl"
                  bg={useColorModeValue(
                    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    'linear-gradient(135deg, #a78bfa, #8b5cf6)'
                  )}
                  boxShadow="lg"
                  sx={{
                    animation: glow,
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
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #1e293b, #475569)',
                      'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                    )}
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
                      bg={useColorModeValue(
                        'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        'linear-gradient(135deg, #a78bfa, #8b5cf6)'
                      )}
                      boxShadow="lg"
                      sx={{
                        animation: glow,
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
                        bg={useColorModeValue(
                          'linear-gradient(135deg, #1e293b, #475569)',
                          'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                        )}
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
                    bg={useColorModeValue(
                      'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      'linear-gradient(135deg, #a78bfa, #8b5cf6)'
                    )}
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
                        animation: `${slideIn} ${0.2 + index * 0.1}s ease-out`,
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
