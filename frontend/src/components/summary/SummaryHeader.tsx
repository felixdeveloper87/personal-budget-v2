import {
  HStack,
  VStack,
  Text,
  Button,
  Icon,
  Flex,
  Heading,
  Box,
  useColorModeValue,
} from '@chakra-ui/react'
import { Activity, RotateCcw } from 'lucide-react'
import { getResponsiveStyles } from '../../utils/ui'
import { useThemeColors } from '../../hooks/useThemeColors'

interface SummaryHeaderProps {
  onGoToToday: () => void
}

export default function SummaryHeader({ onGoToToday }: SummaryHeaderProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()

  const iconBg = useColorModeValue(
    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'linear-gradient(135deg, #60a5fa, #3b82f6)'
  )
  const titleBg = useColorModeValue(
    'linear-gradient(135deg, #1e293b, #475569)',
    'linear-gradient(135deg, #f8fafc, #e2e8f0)'
  )

  return (
    <Flex
      direction={responsiveStyles.addTransactionSection.header.direction}
      align={{ base: 'stretch', sm: 'center' }}
      justify="space-between"
      gap={responsiveStyles.addTransactionSection.header.gap}
    >
      {/* Left side */}
      <HStack spacing={{ base: 2, sm: 3, md: 4 }} align="center" flex="1">
        {/* Icon Container with Advanced Effects */}
        <Box
          position="relative"
          p={responsiveStyles.addTransactionSection.header.icon.padding}
          borderRadius={responsiveStyles.addTransactionSection.header.icon.borderRadius}
          bg={useColorModeValue(
            'linear-gradient(135deg, #3b82f6, #1d4ed8, #7c3aed)',
            'linear-gradient(135deg, #60a5fa, #3b82f6, #a78bfa)'
          )}
          boxShadow="xl"
          opacity={0.9}
          sx={{
            animation: 'summaryGlow 3s ease-in-out infinite, iconFloat 4s ease-in-out infinite',
            '@keyframes summaryGlow': {
              '0%,100%': { 
                boxShadow: '0 0 20px rgba(59,130,246,0.3), 0 0 40px rgba(59,130,246,0.1), 0 0 60px rgba(59,130,246,0.05)',
                transform: 'scale(1)'
              },
              '50%': {
                boxShadow: '0 0 30px rgba(59,130,246,0.5), 0 0 60px rgba(59,130,246,0.2), 0 0 90px rgba(59,130,246,0.1)',
                transform: 'scale(1.05)'
              },
            },
            '@keyframes iconFloat': {
              '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
              '25%': { transform: 'translateY(-2px) rotate(1deg)' },
              '50%': { transform: 'translateY(-4px) rotate(0deg)' },
              '75%': { transform: 'translateY(-1px) rotate(-1deg)' }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              background: 'linear-gradient(45deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3), rgba(59,130,246,0.3))',
              borderRadius: 'inherit',
              zIndex: -1,
              filter: 'blur(8px)',
              opacity: 0.6,
              animation: 'shimmer 3s ease-in-out infinite'
            }
          }}
        >
          <Icon
            as={Activity}
            boxSize={responsiveStyles.addTransactionSection.header.icon.size}
            color="white"
            sx={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animation: 'activityPulse 2s ease-in-out infinite',
              '@keyframes activityPulse': {
                '0%,100%': { transform: 'scale(1) rotate(0deg)', filter: 'brightness(1)' },
                '25%': { transform: 'scale(1.1) rotate(2deg)', filter: 'brightness(1.2)' },
                '50%': { transform: 'scale(1.05) rotate(0deg)', filter: 'brightness(1.1)' },
                '75%': { transform: 'scale(1.1) rotate(-2deg)', filter: 'brightness(1.2)' }
              }
            }}
          />
        </Box>

        <VStack align={{ base: 'center', sm: 'start' }} spacing={1} flex="1">
          <Heading
            size={responsiveStyles.addTransactionSection.header.title.size}
            bg={useColorModeValue(
              'linear-gradient(135deg, #1e293b, #475569, #64748b, #334155)',
              'linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1, #94a3b8)'
            )}
            bgClip="text"
            fontWeight="900"
            textAlign={{ base: 'center', sm: 'left' }}
            sx={{
              animation: 'titleShimmer 4s ease-in-out infinite',
              '@keyframes titleShimmer': {
                '0%,100%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' }
              },
              backgroundSize: '200% 200%',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }}
          >
            Financial Overview
          </Heading>
          <Text
            fontSize={responsiveStyles.addTransactionSection.header.title.fontSize}
            color={colors.text.secondary}
            fontWeight="500"
            opacity={0.9}
            textAlign={{ base: 'center', sm: 'left' }}
            display={{ base: 'none', sm: 'block' }}
            sx={{
              animation: 'fadeInUp 0.8s ease-out 0.2s both',
              '@keyframes fadeInUp': {
                '0%': { opacity: 0, transform: 'translateY(10px)' },
                '100%': { opacity: 0.9, transform: 'translateY(0)' }
              }
            }}
          >
            Complete overview with category analysis
          </Text>
        </VStack>
      </HStack>

      {/* Right side - Premium Today Button */}
      <Button
        size="sm"
        variant="ghost"
        colorScheme="blue"
        leftIcon={<RotateCcw size={14} />}
        onClick={onGoToToday}
        display={{ base: 'none', sm: 'flex' }}
        borderRadius="xl"
        px={4}
        py={2}
        fontWeight="700"
        bg={useColorModeValue(
          'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          'linear-gradient(135deg, #60a5fa, #3b82f6)'
        )}
        color="white"
        boxShadow="lg"
        position="relative"
        overflow="hidden"
        opacity={0.9}
        sx={{
          animation: 'todayGlow 3s ease-in-out infinite',
          '@keyframes todayGlow': {
            '0%,100%': { 
              boxShadow: '0 4px 15px rgba(59,130,246,0.3), 0 0 20px rgba(59,130,246,0.1)',
              transform: 'scale(1)'
            },
            '50%': {
              boxShadow: '0 6px 20px rgba(59,130,246,0.4), 0 0 30px rgba(59,130,246,0.2)',
              transform: 'scale(1.02)'
            },
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shimmer 3s ease-in-out infinite'
          }
        }}
        _hover={{
          transform: 'translateY(-2px) scale(1.05)',
          boxShadow: '0 8px 25px rgba(59,130,246,0.4)',
        }}
        _active={{
          transform: 'translateY(0) scale(1.02)',
        }}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      >
        Today
      </Button>
    </Flex>
  )
}
