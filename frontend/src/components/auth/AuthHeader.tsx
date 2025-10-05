import { 
  Box, 
  Flex, 
  HStack, 
  VStack, 
  Text, 
  Button, 
  IconButton, 
  useColorMode, 
  useColorModeValue,
  Container,
  Spacer,
  Tooltip,
  Badge
} from '@chakra-ui/react'
import { 
  SunIcon, 
  MoonIcon, 
  StarIcon,
  TimeIcon,
  LockIcon
} from '@chakra-ui/icons'

export default function AuthHeader() {
  const { colorMode, toggleColorMode } = useColorMode()
  
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const gradientBg = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #4c63d2 0%, #5a4fcf 100%)'
  )
  const shadowColor = useColorModeValue('rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)')

  return (
    <>
      {/* Welcome Banner */}
      <Box 
        bg={gradientBg}
        color="white"
        py={3}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <HStack justify="center" spacing={6}>
            <HStack spacing={2}>
              <StarIcon w={4} h={4} />
              <Text fontSize="sm" fontWeight="medium">
                Welcome to Personal Budget
              </Text>
            </HStack>
            <HStack spacing={2}>
              <TimeIcon w={4} h={4} />
              <Text fontSize="sm">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </HStack>
          </HStack>
        </Container>
        
        {/* Animated background elements */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)"
          animation="shimmer 3s infinite"
          sx={{
            '@keyframes shimmer': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' }
            }
          }}
        />
      </Box>

      {/* Main Header */}
      <Box 
        as="header" 
        bg={bg} 
        borderBottom="1px solid" 
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={1000}
        shadow={`0 2px 8px ${shadowColor}`}
        backdropFilter="blur(10px)"
      >
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Flex h={16} align="center" justify="space-between">
            {/* Logo and Brand */}
            <HStack spacing={4}>
              <HStack spacing={3}>
                <Box
                  w={10}
                  h={10}
                  bg={gradientBg}
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="md"
                  position="relative"
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="all 0.2s"
                >
                  <Text fontSize="xl" fontWeight="bold" color="white">
                    £
                  </Text>
                  <Box
                    position="absolute"
                    top={-1}
                    right={-1}
                    w={3}
                    h={3}
                    bg="green.400"
                    borderRadius="full"
                    border="2px solid white"
                  />
                </Box>
                <VStack spacing={0} align="start">
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Personal Budget
                  </Text>
                  <Text fontSize="xs" color={secondaryTextColor}>
                    Financial Management
                  </Text>
                </VStack>
              </HStack>
            </HStack>

            {/* Features Badges */}
            <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
              <Badge 
                colorScheme="green" 
                variant="subtle" 
                px={3} 
                py={1} 
                borderRadius="full"
                fontSize="xs"
              >
                <HStack spacing={1}>
                  <LockIcon w={3} h={3} />
                  <Text>Secure</Text>
                </HStack>
              </Badge>
              <Badge 
                colorScheme="blue" 
                variant="subtle" 
                px={3} 
                py={1} 
                borderRadius="full"
                fontSize="xs"
              >
                <HStack spacing={1}>
                  <StarIcon w={3} h={3} />
                  <Text>Free</Text>
                </HStack>
              </Badge>
            </HStack>

            {/* Right Side Controls */}
            <HStack spacing={2}>
              {/* Theme Toggle */}
              <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} placement="bottom">
                <IconButton
                  aria-label="toggle theme"
                  icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size="md"
                  _hover={{ bg: hoverBg, transform: 'translateY(-1px)' }}
                  transition="all 0.2s"
                />
              </Tooltip>

              {/* Get Started Button */}
              <Button
                colorScheme="blue"
                size="md"
                borderRadius="xl"
                _hover={{ transform: 'translateY(-1px)' }}
                transition="all 0.2s"
                fontWeight="semibold"
              >
                Get Started
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
    </>
  )
}
