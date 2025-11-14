import {
  Modal,
  ModalOverlay,
  ModalContent,
  Card,
  CardBody,
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
import { getResponsiveStyles, getGradients, animations, safeAreaStyles, safariStyles, getShimmerStyles, getModalHeaderStyles, getScrollbarStyles } from '../ui'

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
  const headerStyles = getModalHeaderStyles(useColorModeValue)
  
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
  const badgeBg = useColorModeValue(
    '#60a5fa', // Azul claro
    colors.accent // Usar cor do tema para modo dark
  )
  const plansHeaderTextColor = useColorModeValue('gray.800', 'white')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl' }}
      isCentered
      scrollBehavior="inside"
      closeOnOverlayClick={false}
      closeOnEsc={true}
      blockScrollOnMount={true}
    >
      <ModalOverlay 
        bg="blackAlpha.600" 
        backdropFilter="blur(10px)"
      />
      <ModalContent 
        borderRadius={{ base: 'none', md: '3xl' }}
        overflow="hidden"
        m={{ base: 0, md: 4 }}
        display="flex"
        flexDirection="column"
        {...responsiveStyles.modal}
        sx={{
          ...safeAreaStyles.container,
          ...safariStyles.modal
        }}
      >
        {/* Decorative background */}
        <Box
          position="absolute"
          top="-50px"
          left="-50px"
          right="-50px"
          height="200px"
          background={gradients.decorative}
          borderRadius="3xl"
          filter="blur(40px)"
          opacity={0.6}
          zIndex={0}
        />
        
        {/* Main card with glassmorphism */}
        <Card
          position="relative"
          bg={useColorModeValue(
            'rgba(255, 255, 255, 0.95)',
            'rgba(17, 17, 17, 0.95)'
          )}
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor={useColorModeValue(
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0.1)'
          )}
          borderRadius={{ base: 'none', sm: '3xl' }}
          shadow="2xl"
          overflow="hidden"
          w="full"
          h="full"
          sx={{
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
          {/* Animated top bar */}
          <Box
            height="2px"
            sx={getShimmerStyles()}
          />
          
          <CardBody p={0} display="flex" flexDirection="column" h="full">
            <VStack spacing={0} align="stretch" h="full">
              {/* Header */}
              <Box {...headerStyles.container}>
                <Button 
                  onClick={onClose} 
                  {...headerStyles.closeButton}
                >
                  <Icon as={X} {...headerStyles.closeButtonIcon} />
                </Button>

                <Flex
                  direction="row"
                  align="center"
                  justify="center"
                  flexWrap="wrap"
                  pr={{ base: 14, sm: 20 }}
                  pt={{ base: 2, sm: 0 }}
                  gap={{ base: 2, sm: 3 }}
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
                      sx={{
                        animation: animations.glow,
                        '@keyframes glow': {
                          '0%, 100%': { 
                            boxShadow: '0 0 5px rgba(96, 165, 250, 0.3)' 
                          },
                          '50%': { 
                            boxShadow: '0 0 20px rgba(96, 165, 250, 0.6), 0 0 30px rgba(96, 165, 250, 0.4)' 
                          }
                        }
                      }}
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
                </Flex>
              </Box>

              {/* Modal content - Scrollable */}
              <Box 
                flex="1" 
                p={responsiveStyles.spacing.container}
                overflowY="auto"
                {...responsiveStyles.content}
                sx={{
                  ...safeAreaStyles.content,
                  ...safariStyles.scrollable,
                  ...getScrollbarStyles(useColorModeValue)
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
                        boxShadow: '0 0 5px rgba(96, 165, 250, 0.3)' 
                      },
                      '50%': { 
                        boxShadow: '0 0 20px rgba(96, 165, 250, 0.6), 0 0 30px rgba(96, 165, 250, 0.4)' 
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
            </VStack>
          </CardBody>
        </Card>
      </ModalContent>
    </Modal>
  )
}
