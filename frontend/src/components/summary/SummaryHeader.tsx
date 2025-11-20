import {
  HStack,
  Text,
  Button,
  Flex,
  Heading,
  useColorModeValue,
  Icon,
  Box,
  VStack,
  Image,
} from '@chakra-ui/react'
import { RotateCcw } from 'lucide-react'
import summaryImage from '../../../assets/summary.png'

interface SummaryHeaderProps {
  onGoToToday: () => void
}

export default function SummaryHeader({ onGoToToday }: SummaryHeaderProps) {

  return (
    <Flex justify="space-between" align="center" w="full">
      {/* Left side */}
      <HStack spacing={4}>
        <Box
          p={2}
          bg="transparent"
          borderRadius="xl"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Image
            src={summaryImage}
            alt="Summary"
            boxSize={{ base: 8, sm: 10, md: 12 }}
            objectFit="contain"
          />
        </Box>
        <VStack align="start" spacing={0.5}>
          <Heading
            size="md"
            fontWeight="700"
            textAlign="left"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.02em"
            fontSize={{ base: 'lg', sm: 'xl' }}
            bgGradient={useColorModeValue(
              'linear(to-r, gray.800, gray.600)',
              'linear(to-r, white, gray.300)'
            )}
            bgClip="text"
          >
            Overview
          </Heading>
          <Text
            fontSize={{ base: 'xs', sm: 'xl' }}
            color={useColorModeValue('gray.500', 'gray.400')}
            fontWeight="600"
            textAlign="left"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Financial summary & insights
          </Text>
        </VStack>
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
