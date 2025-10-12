import { Box, Card, CardBody, VStack, HStack, Text, Icon, Badge, useColorModeValue, Flex, Heading } from '@chakra-ui/react'
import { PeriodNavigator, PeriodType } from '../components'
import { Calendar, RotateCcw } from 'lucide-react'
import { useThemeColors } from '../hooks/useThemeColors'

// 🎨 Animações personalizadas aprimoradas
const shimmer = 'shimmer 4s ease-in-out infinite'
const slideIn = 'slideIn 0.6s ease-out'
const glow = 'glow 3s ease-in-out infinite'

interface PeriodNavigatorSectionProps {
  selectedPeriod: PeriodType
  selectedDate: Date
  onDateChange: (date: Date) => void
  onPeriodChange: (period: PeriodType) => void
  label: string
}

/**
 * 🗓️ PeriodNavigatorSection
 * - Wrapper section for the PeriodNavigator component
 * - Maintains consistent section structure with AddTransactionSection
 * - Handles period selection and navigation logic
 */
export default function PeriodNavigatorSection({
  selectedPeriod,
  selectedDate,
  onDateChange,
  onPeriodChange,
  label,
}: PeriodNavigatorSectionProps) {
  const colors = useThemeColors()

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
            'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(139, 92, 246, 0.1) 100%)',
            'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(16, 185, 129, 0.2) 50%, rgba(139, 92, 246, 0.2) 100%)'
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
            background="linear-gradient(90deg, #3b82f6, #10b981, #ef4444, #8b5cf6, #f59e0b)"
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
                      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      'linear-gradient(135deg, #60a5fa, #3b82f6)'
                    )}
                    boxShadow="lg"
                    sx={{
                      animation: glow,
                      '@keyframes glow': {
                        '0%, 100%': { 
                          boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' 
                        },
                        '50%': { 
                          boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)' 
                        }
                      }
                    }}
                  >
                    <Icon as={Calendar} boxSize={6} color="white" />
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
                      Period Filter
                    </Heading>
                    <Text
                      fontSize="sm"
                      color={colors.text.secondary}
                      fontWeight="500"
                    >
                      Navigate through different time periods
                    </Text>
                  </VStack>
                </HStack>
                
                <Badge
                  colorScheme="blue"
                  variant="solid"
                  borderRadius="full"
                  px={4}
                  py={2}
                  fontSize="sm"
                  fontWeight="600"
                  bg={useColorModeValue(
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    'linear-gradient(135deg, #60a5fa, #3b82f6)'
                  )}
                  boxShadow="md"
                >
                  <HStack spacing={2}>
                    <Icon as={RotateCcw} boxSize={3} />
                    <Text>Today</Text>
                  </HStack>
                </Badge>
              </Flex>

              {/* PeriodNavigator integrado */}
              <PeriodNavigator
                selectedPeriod={selectedPeriod}
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                onPeriodChange={onPeriodChange}
                periodLabel={label}
              />
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </Box>
  )
}
