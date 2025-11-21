import {
  Card,
  CardBody,
  Text,
  Box,
  Icon,
  useColorModeValue,
  Flex,
  HStack,
  VStack,
} from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'

interface SummaryCardProps {
  stat: {
    id: string
    label: string
    icon: LucideIcon
    color: string
    bgColor: string
    darkBgColor: string
    displayValue: string
    helpText: string
    description?: string
  }
  periodMeta: {
    label: string
    detail: string
    accentColor: string
    icon: LucideIcon
  }
  onCardClick: (cardId: string) => void
}

export default function SummaryCard({ stat, periodMeta, onCardClick }: SummaryCardProps) {
  const IconComponent = stat.icon
  
  // Colors & Styles
  const cardBg = useColorModeValue('gray.100', 'black')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const valueColor = useColorModeValue('gray.800', 'white')
  const descriptionColor = useColorModeValue('gray.500', 'gray.500')
  
  // Icon Box Styles
  const iconBoxBg = useColorModeValue(stat.bgColor, stat.darkBgColor)
  
  return (
    <Card
      role="button"
      onClick={() => onCardClick(stat.id)}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      cursor="pointer"
      overflow="hidden"
      position="relative"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'lg',
        borderColor: stat.color,
      }}
    >
      {/* Background Gradient Blob */}
      <Box
        position="absolute"
        top="-30%"
        right="-30%"
        w="150px"
        h="150px"
        bg={stat.color}
        opacity={0.1}
        filter="blur(40px)"
        borderRadius="full"
      />

      <CardBody p={5}>
        <VStack align="stretch" spacing={4}>
          
          {/* Top Row: Icon & Label */}
          <HStack spacing={4} align="center">
            {/* Icon Box */}
            <Flex
              w={12}
              h={12}
              align="center"
              justify="center"
              borderRadius="xl"
              bg={iconBoxBg}
              color={stat.color}
              boxShadow="sm"
              flexShrink={0}
            >
              <Icon as={IconComponent} boxSize={6} />
            </Flex>

            {/* Label & Period Badge */}
            <VStack align="start" spacing={0} flex={1}>
              <Text
                fontSize="sm"
                fontWeight="700"
                color={labelColor}
                textTransform="uppercase"
                letterSpacing="wider"
              >
                {stat.label}
              </Text>
              {stat.helpText && (
                 <Text fontSize="xs" color={descriptionColor} fontWeight="500">
                   {stat.helpText}
                 </Text>
              )}
            </VStack>
          </HStack>

          {/* Middle Row: Value */}
          <Box>
            <Text
              fontSize="3xl"
              fontWeight="800"
              color={valueColor}
              lineHeight="1.1"
              letterSpacing="-0.02em"
              mb={1}
            >
              {stat.displayValue}
            </Text>
            {stat.description && (
              <Text fontSize="sm" color={descriptionColor} noOfLines={2}>
                {stat.description}
              </Text>
            )}
          </Box>

          {/* Bottom Row: View Details Link */}
          <Flex 
            align="center" 
            justify="space-between" 
            pt={2} 
            borderTop="1px solid" 
            borderColor={useColorModeValue('gray.100', 'gray.800')}
          >
             <HStack spacing={2} color={stat.color} _groupHover={{ color: stat.color }}>
               <Text fontSize="xs" fontWeight="700" textTransform="uppercase">
                 View Details
               </Text>
               <Icon as={ArrowRight} boxSize={3} />
             </HStack>
          </Flex>

        </VStack>
      </CardBody>
    </Card>
  )
}
