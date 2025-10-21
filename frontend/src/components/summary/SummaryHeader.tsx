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
import { GRADIENTS } from '../../theme'
import { getResponsiveStyles, sectionTitleStyles, sectionHeaderStyles } from '../ui'
import { useThemeColors } from '../../hooks/useThemeColors'

interface SummaryHeaderProps {
  onGoToToday: () => void
}

export default function SummaryHeader({ onGoToToday }: SummaryHeaderProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()

  // Modern post-it inspired colors
  const iconBg = useColorModeValue(
    '#dbeafe', // Azul post-it
    '#1e293b'  // Azul escuro
  )
  const iconColor = useColorModeValue('blue.600', 'blue.300')
  const titleColor = useColorModeValue('gray.800', 'gray.100')
  const subtitleColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Flex
      direction={sectionHeaderStyles.container.direction}
      align={sectionHeaderStyles.container.align}
      justify={sectionHeaderStyles.container.justify}
      gap={sectionHeaderStyles.container.gap}
      w={sectionHeaderStyles.container.w}
    >
      {/* Left side */}
      <HStack 
        direction={sectionHeaderStyles.iconAndTitle.direction}
        align={sectionHeaderStyles.iconAndTitle.align}
        spacing={{ base: 2, sm: 2, md: 3 }}
        flex="0"
        justify="flex-start"
      >
        {/* Modern Icon Container */}
        <Box
          p={sectionHeaderStyles.icon.padding}
          borderRadius={sectionHeaderStyles.icon.borderRadius}
          bg={iconBg}
          border="1px solid"
          borderColor={useColorModeValue('blue.200', 'blue.500')}
          boxShadow={sectionHeaderStyles.icon.boxShadow}
          _hover={{
            transform: sectionHeaderStyles.icon.hover.transform,
            boxShadow: sectionHeaderStyles.icon.hover.boxShadow,
            borderColor: useColorModeValue('blue.300', 'blue.400')
          }}
          transition={sectionHeaderStyles.icon.transition}
        >
          <Icon
            as={Activity}
            boxSize={sectionHeaderStyles.icon.size}
            color={iconColor}
          />
        </Box>

        <HStack align="center" spacing={3} flex="0">
          <Heading
            size={sectionTitleStyles.size}
            color={titleColor}
            fontWeight="600"
            textAlign="left"
            fontFamily={sectionTitleStyles.fontFamily}
            letterSpacing="-0.01em"
            lineHeight="1.2"
            whiteSpace="nowrap"
            fontSize={{ base: 'sm', sm: 'lg' }}
            opacity={0.9}
          >
            Financial Overview
          </Heading>
          <Text
            fontSize={{ base: 'sm', sm: 'md' }}
            color={subtitleColor}
            fontWeight="500"
            textAlign="left"
            display={{ base: 'none', sm: 'block' }}
            fontFamily="system-ui, -apple-system, sans-serif"
            whiteSpace="nowrap"
          >
            Complete overview with category analysis
          </Text>
        </HStack>
      </HStack>

      {/* Right side - Modern Today Button */}
      <Button
        size="sm"
        leftIcon={<RotateCcw size={14} />}
        onClick={onGoToToday}
        display={{ base: 'none', sm: 'flex' }}
        borderRadius="xl"
        px={4}
        py={2}
        fontWeight="500"
        bg="transparent"
        color={useColorModeValue('blue.600', 'blue.300')}
        border="1px solid"
        borderColor={useColorModeValue('blue.200', 'blue.500')}
        boxShadow="sm"
        fontFamily="system-ui, -apple-system, sans-serif"
        backdropFilter="blur(10px)"
        _hover={{
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderColor: useColorModeValue('blue.300', 'blue.400'),
          bg: useColorModeValue('blue.50', 'blue.900')
        }}
        _active={{
          transform: 'translateY(0)',
        }}
        transition="all 0.2s ease"
      >
        Today
      </Button>
    </Flex>
  )
}
