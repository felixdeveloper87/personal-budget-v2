import React, { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  Icon,
  Spinner,
  Center,
  Card,
  CardBody,
  Flex,
  Badge,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { FiCreditCard, CreditCard, Sparkles } from 'lucide-react'
import { useThemeColors } from '../hooks/useThemeColors'
import { InstallmentPlanCard } from '../components/installments'
import { InstallmentPlan } from '../types'
import { listInstallmentPlans } from '../api'

// 🎨 Animações personalizadas aprimoradas
const shimmer = 'shimmer 4s ease-in-out infinite'
const slideIn = 'slideIn 0.6s ease-out'
const glow = 'glow 3s ease-in-out infinite'
const float = 'float 3s ease-in-out infinite'

/**
 * 💳 InstallmentPlansSection
 * Displays all active installment plans for the logged user
 */
export default function InstallmentPlansSection() {
  const colors = useThemeColors()
  const [plans, setPlans] = useState<InstallmentPlan[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlans = async () => {
    setLoading(true)
    try {
      const data = await listInstallmentPlans()
      setPlans(data)
    } catch (err) {
      console.error('Error fetching installment plans:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handlePlanDeleted = () => {
    fetchPlans() // Refresh list after deletion
  }

  if (loading) {
    return (
      <Box 
        w="full" 
        px={{ base: 3, sm: 4, md: 6 }}
        sx={{
          // Safe area support para iPhone 14 Pro
          paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Center py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color={colors.accent} />
            <Text color={colors.text.secondary} fontSize="sm">
              Loading installment plans...
            </Text>
          </VStack>
        </Center>
      </Box>
    )
  }

  if (plans.length === 0) {
    return (
      <Box 
        w="full" 
        px={{ base: 3, sm: 4, md: 6 }}
        sx={{
          // Safe area support para iPhone 14 Pro
          paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Box position="relative" mb={8}>
          {/* Background decorativo com gradiente */}
          <Box
            position="absolute"
            top="-50px"
            left="-50px"
            right="-50px"
            height="200px"
            background={useColorModeValue(
              'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)',
              'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(16, 185, 129, 0.2) 100%)'
            )}
            borderRadius="3xl"
            filter="blur(40px)"
            opacity={0.6}
            zIndex={0}
          />
          
          {/* Card principal com glassmorphism */}
          <Card
            position="relative"
            bg={useColorModeValue(
              'rgba(255, 255, 255, 0.9)',
              'rgba(17, 17, 17, 0.9)'
            )}
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={useColorModeValue(
              'rgba(255, 255, 255, 0.2)',
              'rgba(255, 255, 255, 0.1)'
            )}
            borderRadius="3xl"
            shadow="2xl"
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
            
            <CardBody p={{ base: 8, sm: 10, md: 12 }}>
              <VStack spacing={6} align="center">
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
            </CardBody>
          </Card>
        </Box>
      </Box>
    )
  }

  return (
    <Box 
      w="full" 
      px={{ base: 3, sm: 4, md: 6 }}
      sx={{
        // Safe area support para iPhone 14 Pro
        paddingLeft: 'max(12px, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(12px, env(safe-area-inset-right, 0px))',
      }}
    >
      <Box position="relative" mb={8}>
        {/* Background decorativo com gradiente */}
        <Box
          position="absolute"
          top="-50px"
          left="-50px"
          right="-50px"
          height="200px"
          background={useColorModeValue(
            'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)',
            'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 50%, rgba(16, 185, 129, 0.2) 100%)'
          )}
          borderRadius="3xl"
          filter="blur(40px)"
          opacity={0.6}
          zIndex={0}
        />
        
        {/* Card principal com glassmorphism */}
        <Card
          position="relative"
          bg={useColorModeValue(
            'rgba(255, 255, 255, 0.9)',
            'rgba(17, 17, 17, 0.9)'
          )}
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor={useColorModeValue(
            'rgba(255, 255, 255, 0.2)',
            'rgba(255, 255, 255, 0.1)'
          )}
          borderRadius="3xl"
          shadow="2xl"
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
          
          <CardBody p={{ base: 4, sm: 5, md: 8 }}>
            <VStack spacing={{ base: 6, md: 8 }} align="stretch">
              {/* Header com design moderno */}
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
                      fontSize="sm"
                      color={colors.text.secondary}
                      fontWeight="500"
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

              {/* Grid de plans otimizado para iPhone 14 Pro */}
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
                    <InstallmentPlanCard plan={plan} onDeleted={handlePlanDeleted} />
                  </Box>
                ))}
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  )
}

