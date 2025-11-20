import {
  Card,
  CardBody,
  Text,
  Box,
  Icon,
  useColorModeValue,
  Flex,
  HStack,
} from '@chakra-ui/react'

interface SummaryCardProps {
  stat: {
    id: string
    label: string
    icon: any
    color: string
    bgColor: string
    darkBgColor: string
    displayValue: string
    helpText: string
  }
  onCardClick: (cardId: string) => void
}

export default function SummaryCard({ stat, onCardClick }: SummaryCardProps) {
  const IconComponent = stat.icon

  const bg = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  // Use the solid color for hover border, or a specific token if available. 
  // Since we can't easily add opacity to 'blue.600', we'll use the color directly or a standard hover style.
  // Let's use the stat.color directly for a nice pop.
  const hoverBorderColor = stat.color

  // Use the pre-defined background colors
  const iconBg = useColorModeValue(stat.bgColor, stat.darkBgColor)
  const iconColor = stat.color

  return (
    <Card
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      shadow="sm"
      cursor="pointer"
      transition="all 0.2s ease-in-out"
      position="relative"
      overflow="hidden"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'lg',
        borderColor: hoverBorderColor,
      }}
      onClick={() => onCardClick(stat.id)}
    >
      <CardBody p={{ base: 3, md: 5 }}>
        <Flex justify="space-between" align="center" mb={2}>
          <Text
            fontSize={{ base: 'xs', sm: 'sm' }}
            fontWeight="600"
            color="gray.500"
            textTransform="uppercase"
            letterSpacing="0.05em"
            isTruncated
          >
            {stat.label}
          </Text>

          <Flex
            align="center"
            justify="center"
            w={{ base: 8, md: 12 }}
            h={{ base: 8, md: 12 }}
            borderRadius="xl"
            bg={iconBg}
            color={iconColor}
            flexShrink={0}
          >
            <Icon as={IconComponent} boxSize={{ base: 4, md: 6 }} />
          </Flex>
        </Flex>

        <Box mb={2}>
          <Text
            fontSize={{ base: 'lg', sm: '2xl', md: '3xl' }}
            fontWeight="700"
            color={useColorModeValue('gray.800', 'white')}
            lineHeight="1.2"
            isTruncated
          >
            {stat.displayValue}
          </Text>
        </Box>

        <HStack spacing={2} mt={1}>
          <Text
            fontSize="xs"
            color="gray.500"
            fontWeight="500"
            noOfLines={1}
          >
            {stat.helpText}
          </Text>
        </HStack>
      </CardBody>
    </Card>
  )
}
