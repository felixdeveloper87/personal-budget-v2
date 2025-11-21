import {
  Card,
  CardBody,
  Text,
  Box,
  Icon,
  useColorModeValue,
  Flex,
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

  // Subtle background tint based on the stat color
  // Using a gradient for a more premium feel
  const bgGradient = useColorModeValue(
    `linear(to-br, white, ${stat.color}.50)`,
    `linear(to-br, gray.900, ${stat.color}.900)`
  )

  const borderColor = useColorModeValue(`${stat.color}.100`, `${stat.color}.800`)
  const hoverBorderColor = stat.color

  return (
    <Card
      bgGradient={bgGradient}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="2xl"
      shadow="sm"
      cursor="pointer"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      position="relative"
      overflow="hidden"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'xl',
        borderColor: hoverBorderColor,
        boxShadow: `0 10px 30px -10px ${stat.color}`, // Colored glow on hover
      }}
      onClick={() => onCardClick(stat.id)}
    >
      <CardBody p={{ base: 4, md: 5 }}>
        <Flex justify="space-between" align="center" h="full">
          <Box flex="1" minW={0} mr={4}>
            <Text
              fontSize={{ base: '3xs', sm: 'sm' }}
              fontWeight="700"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="0.05em"
              mb={1}
              isTruncated
            >
              {stat.label}
            </Text>

            <Text
              fontSize={{ base: '2xs', sm: '2xl', md: '3xl' }}
              fontWeight="800"
              color={useColorModeValue('gray.800', 'white')}
              lineHeight="1.1"
              letterSpacing="-0.02em"
              mb={1}
              isTruncated
            >
              {stat.displayValue}
            </Text>

            <Text
              fontSize={{ base: '2xs', sm: '2xl', md: '3xl' }}
              color="gray.500"
              fontWeight="500"
              noOfLines={1}
            >
              {stat.helpText}
            </Text>
          </Box>

          {/* Large Icon without background container */}
          <Icon
            as={IconComponent}
            boxSize={{ base: 10, md: 12 }}
            color={stat.color}
            opacity={0.8}
            flexShrink={0}
            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"
          />
        </Flex>
      </CardBody>
    </Card>
  )
}
