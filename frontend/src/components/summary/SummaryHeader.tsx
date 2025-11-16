import {
  HStack,
  Text,
  Button,
  Flex,
  Heading,
  useColorModeValue,
} from '@chakra-ui/react'
import { RotateCcw } from 'lucide-react'

interface SummaryHeaderProps {
  onGoToToday: () => void
}

export default function SummaryHeader({ onGoToToday }: SummaryHeaderProps) {

  return (
    <Flex justify="space-between" align="center" w="full">
      {/* Left side */}
      <HStack spacing={2} align="baseline" flex="1">
        <Heading
          size="md"
          fontWeight="600"
          textAlign="left"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="-0.015em"
          fontSize={{ base: 'md', sm: 'xl' }}
          color={useColorModeValue('gray.800', 'white')}
        >
          Overview
        </Heading>
        <Text
          fontSize={{ base: 'sm', sm: 'md' }}
          color={useColorModeValue('gray.600', 'gray.400')}
          fontWeight="400"
          textAlign="left"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          • Overview with category analysis
        </Text>
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
