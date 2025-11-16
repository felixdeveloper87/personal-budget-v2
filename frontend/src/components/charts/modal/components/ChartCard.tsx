import { Box, VStack, HStack, Text, Icon, useColorModeValue } from '@chakra-ui/react'
import { LucideIcon } from 'lucide-react'
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
  const cardBg = useColorModeValue('white', '#0a0a0a')
  const cardBgGradient = useColorModeValue(
    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)'
  )
  const borderColor = useColorModeValue('rgba(226, 232, 240, 0.8)', 'rgba(75, 85, 99, 0.3)')
  
  return (
    <Box 
      position="relative"
      minW={minW || { base: "60px", sm: "75px", lg: "90px" }}
      p={{ base: 2.5, sm: 3 }}
      borderRadius="lg"
      bg={cardBg}
      background={cardBgGradient}
      border="1px solid"
      borderColor={borderColor}
      boxShadow="0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: `0 10px 25px ${hoverBorderColor.replace('0.3', '0.15')}, 0 4px 10px rgba(0,0,0,0.1)`,
        borderColor: hoverBorderColor,
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      sx={{
        animation: `${animations.slideIn} ${0.3 + delay * 0.1}s ease-out`,
      }}
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="2px"
        bg={gradient}
      />
      <VStack spacing={1} align="center">
        <HStack spacing={1} align="center">
          <Icon as={IconComponent} boxSize={3.5} color={color} />
          <Text 
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
            fontWeight="800" 
            bgGradient={gradient}
            bgClip="text"
            lineHeight="1"
          >
            {value}
          </Text>
        </HStack>
        <Text 
          fontSize={{ base: "2xs", sm: "2xs" }} 
          fontWeight="600"
          color={colors.text.secondary}
          letterSpacing="0.5px"
          textTransform="uppercase"
        >
          {label}
        </Text>
      </VStack>
    </Box>
  )
}

