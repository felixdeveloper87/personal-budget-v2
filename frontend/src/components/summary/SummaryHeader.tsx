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
        <Box
          p={responsiveStyles.addTransactionSection.header.icon.padding}
          borderRadius={responsiveStyles.addTransactionSection.header.icon.borderRadius}
          bg={iconBg}
          boxShadow="lg"
          sx={{
            animation: 'glow 3s ease-in-out infinite',
            '@keyframes glow': {
              '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' },
              '50%': {
                boxShadow:
                  '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)',
              },
            },
          }}
        >
          <Icon
            as={Activity}
            boxSize={responsiveStyles.addTransactionSection.header.icon.size}
            color="white"
          />
        </Box>

        <VStack align="start" spacing={1} flex="1">
          <Heading
            size={responsiveStyles.addTransactionSection.header.title.size}
            bg={titleBg}
            bgClip="text"
            fontWeight="800"
            textAlign="left"
          >
            Financial Overview
          </Heading>
          <Text
            fontSize={responsiveStyles.addTransactionSection.header.title.fontSize}
            color={colors.text.secondary}
            fontWeight="400"
            opacity={0.8}
            textAlign="left"
            display={{ base: 'none', sm: 'block' }}
          >
            Complete overview with category analysis
          </Text>
        </VStack>
      </HStack>

      {/* Right side - Today Button */}
      <Button
        size="sm"
        variant="ghost"
        colorScheme="blue"
        leftIcon={<RotateCcw size={14} />}
        onClick={onGoToToday}
        display={{ base: 'none', sm: 'flex' }}
      >
        Today
      </Button>
    </Flex>
  )
}
