import { Box, VStack, HStack, Text, Icon, useColorModeValue } from '@chakra-ui/react'
import type { LucideIcon } from '../../../ui/icons'
import { useThemeColors } from '../../../../hooks/useThemeColors'
import { animations } from '../../../ui'

interface ChartCardProps {
  icon: LucideIcon
  value: string | number
  label: string
  gradient: string
  color: string
  hoverBorderColor: string
  delay?: number
  minW?: string | { base?: string; sm?: string; lg?: string }
}

export default function ChartCard({
  icon: IconComponent,
  value,
  label,
  gradient,
  color,
  hoverBorderColor,
  delay = 0,
  minW,
}: ChartCardProps) {
  const colors = useThemeColors()
  const cardBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const hoverShadow = useColorModeValue(
    '0 6px 20px -6px rgba(15, 23, 42, 0.12)',
    '0 6px 20px -6px rgba(0, 0, 0, 0.45)',
  )

  return (
    <Box
      position="relative"
      minW={minW || { base: '60px', sm: '75px', lg: '90px' }}
      p={{ base: 2.5, sm: 3 }}
      borderRadius="xl"
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      boxShadow="0 1px 2px rgba(15,23,42,0.04)"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: hoverShadow,
        borderColor: hoverBorderColor,
      }}
      transition="transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease"
      sx={{
        animation:
          delay >= 0
            ? `${animations.slideIn} ${0.22 + delay * 0.08}s ease-out`
            : undefined,
      }}
      overflow="hidden"
    >
      <VStack spacing={1} align="center">
        <HStack spacing={1} align="center">
          <Icon as={IconComponent} boxSize={3.5} color={color} strokeWidth={2.25} />
          <Text
            fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}
            fontWeight={800}
            bgGradient={gradient}
            bgClip="text"
            lineHeight="1"
          >
            {value}
          </Text>
        </HStack>
        <Text
          fontSize="2xs"
          fontWeight={600}
          color={colors.text.secondary}
          letterSpacing="0.06em"
          textTransform="uppercase"
        >
          {label}
        </Text>
      </VStack>
    </Box>
  )
}
