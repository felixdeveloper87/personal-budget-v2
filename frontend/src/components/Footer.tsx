import { 
  Box, 
  Container, 
  Flex, 
  VStack, 
  HStack, 
  Text, 
  Link, 
  Icon, 
  Divider,
  useColorModeValue,
  SimpleGrid,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Image,
  Badge,
  Tooltip,
  IconButton,
  Progress,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Textarea,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react'
import { 
  EmailIcon, 
  ExternalLinkIcon, 
  PhoneIcon, 
  InfoIcon,
  ChevronUpIcon,
  StarIcon,
  TimeIcon,
  SettingsIcon,
  LockIcon,
  ArrowUpIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon
} from '@chakra-ui/icons'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  
  const bg = useColorModeValue('gray.50', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300')
  const linkColor = useColorModeValue('blue.600', 'blue.400')
  const hoverColor = useColorModeValue('blue.700', 'blue.300')
  const gradientBg = useColorModeValue(
    'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #8b5cf6 100%)',
    'linear-gradient(135deg, #000000 0%, #111111 50%, #1a1a1a 100%)'
  )
  const cardBg = useColorModeValue('white', '#111111')
  const shadowColor = useColorModeValue('rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)')

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      toast({
        title: 'Successfully subscribed!',
        description: 'You will receive our latest updates and financial tips.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      setEmail('')
    }
  }

  const handleFeedbackSubmit = () => {
    toast({
      title: 'Feedback submitted!',
      description: 'Thank you for helping us improve our service.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    setShowFeedback(false)
    onClose()
  }

  return (
    <>
      {/* Enhanced Footer */}
      <Box as="footer" bg={bg} borderTop="1px solid" borderColor={borderColor} mt="auto" position="relative">
        {/* Gradient Top Section */}
        <Box bg={gradientBg} py={{ base: 6, md: 8 }} position="relative" overflow="hidden">
          <Container
            maxW={{
              base: "100%",
              md: "4xl",
              lg: "6xl",
              xl: "7xl",
              "2xl": "8xl",
              "3xl": "container.3xl",
            }}
            px={{ base: 4, md: 6 }}
          >
            <VStack spacing={{ base: 4, md: 6 }} textAlign="center" color="white">
              <VStack spacing={{ base: 3, md: 4 }}>
                <HStack spacing={3}>
                  <Box
                    w={{ base: 12, md: 16 }}
                    h={{ base: 12, md: 16 }}
                    bg="rgba(255,255,255,0.2)"
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255,255,255,0.3)"
                  >
                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
                      £
                    </Text>
                  </Box>
                  <VStack spacing={1} align="start">
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                      Personal Budget
                    </Text>
                    <Text fontSize={{ base: "sm", md: "md" }} opacity={0.9}>
                      Smart Financial Management
                    </Text>
                  </VStack>
                </HStack>
                <Text fontSize={{ base: "md", md: "lg" }} maxW="600px" opacity={0.9}>
                  Take control of your finances with our intuitive budgeting tool. 
                  Track expenses, manage income, and achieve your financial goals with confidence.
                </Text>
              </VStack>
              
              <HStack spacing={{ base: 2, md: 4 }} wrap="wrap" justify="center">
                <Button
                  size={{ base: "md", md: "lg" }}
                  variant="outline"
                  leftIcon={<StarIcon />}
                  color="white"
                  borderColor="rgba(255,255,255,0.3)"
                  _hover={{ 
                    bg: 'rgba(255,255,255,0.1)', 
                    borderColor: 'rgba(255,255,255,0.5)',
                    transform: 'translateY(-2px)'
                  }}
                  transition="all 0.2s"
                >
                  Rate Us
                </Button>
                <Button
                  size={{ base: "md", md: "lg" }}
                  variant="outline"
                  leftIcon={<CopyIcon />}
                  color="white"
                  borderColor="rgba(255,255,255,0.3)"
                  _hover={{ 
                    bg: 'rgba(255,255,255,0.1)', 
                    borderColor: 'rgba(255,255,255,0.5)',
                    transform: 'translateY(-2px)'
                  }}
                  transition="all 0.2s"
                >
                  Share
                </Button>
                <Button
                  size={{ base: "md", md: "lg" }}
                  variant="outline"
                  leftIcon={<DownloadIcon />}
                  color="white"
                  borderColor="rgba(255,255,255,0.3)"
                  _hover={{ 
                    bg: 'rgba(255,255,255,0.1)', 
                    borderColor: 'rgba(255,255,255,0.5)',
                    transform: 'translateY(-2px)'
                  }}
                  transition="all 0.2s"
                >
                  Download App
                </Button>
              </HStack>
            </VStack>
          </Container>
          
          {/* Animated background elements */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)"
            animation="shimmer 4s infinite"
            sx={{
              '@keyframes shimmer': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' }
              }
            }}
          />
        </Box>

        {/* Main Footer Content */}
        <Container
          maxW={{
            base: "100%",
            md: "4xl",
            lg: "6xl",
            xl: "7xl",
            "2xl": "8xl",
            "3xl": "container.3xl",
          }}
          px={{ base: 4, md: 6 }}
          py={{ base: 8, md: 12 }}
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 6, md: 8 }}>
            {/* Enhanced Brand Section */}
            <VStack spacing={{ base: 4, md: 6 }} align="start">
              <VStack spacing={{ base: 3, md: 4 }} align="start">
                <HStack spacing={3}>
                  <Box
                    w={{ base: 10, md: 12 }}
                    h={{ base: 10, md: 12 }}
                    bg={gradientBg}
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="lg"
                  >
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="white">
                      £
                    </Text>
                  </Box>
                  <VStack spacing={1} align="start">
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor}>
                      Personal Budget
                    </Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} color={secondaryTextColor}>
                      Financial Management
                    </Text>
                  </VStack>
                </HStack>
                <Text fontSize={{ base: "xs", md: "sm" }} color={secondaryTextColor} lineHeight="1.6">
                  Empowering individuals to take control of their financial future 
                  through smart budgeting and expense tracking.
                </Text>
                <HStack spacing={2} wrap="wrap">
                  <Badge colorScheme="green" variant="subtle" px={2} py={1} fontSize="xs">
                    <HStack spacing={1}>
                      <LockIcon w={3} h={3} />
                      <Text fontSize="xs">Secure</Text>
                    </HStack>
                  </Badge>
                  <Badge colorScheme="blue" variant="subtle" px={2} py={1} fontSize="xs">
                    <HStack spacing={1}>
                      <LockIcon w={3} h={3} />
                      <Text fontSize="xs">Private</Text>
                    </HStack>
                  </Badge>
                </HStack>
              </VStack>
              
              <VStack spacing={{ base: 2, md: 3 }} align="start">
                <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold" color={textColor}>
                  Quick Actions
                </Text>
                <HStack spacing={2} wrap="wrap">
                  <Button
                    size={{ base: "xs", md: "sm" }}
                    variant="outline"
                    leftIcon={<EmailIcon />}
                    _hover={{ bg: linkColor, color: 'white' }}
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    Contact
                  </Button>
                  <Button
                    size={{ base: "xs", md: "sm" }}
                    variant="outline"
                    leftIcon={<InfoIcon />}
                    _hover={{ bg: linkColor, color: 'white' }}
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    About
                  </Button>
                  <Button
                    size={{ base: "xs", md: "sm" }}
                    variant="outline"
                    leftIcon={<SettingsIcon />}
                    _hover={{ bg: linkColor, color: 'white' }}
                    onClick={onOpen}
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    Feedback
                  </Button>
                </HStack>
              </VStack>
            </VStack>

            {/* Enhanced Quick Links */}
            <VStack spacing={{ base: 4, md: 6 }} align="start">
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor}>
                Quick Links
              </Text>
              <VStack spacing={{ base: 2, md: 3 }} align="start">
                <Link 
                  href="#" 
                  color={linkColor} 
                  _hover={{ color: hoverColor, transform: 'translateX(4px)' }}
                  fontSize={{ base: "xs", md: "sm" }}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  transition="all 0.2s"
                >
                  <TimeIcon w={{ base: 3, md: 4 }} h={{ base: 3, md: 4 }} />
                  Dashboard
                  <Icon as={ExternalLinkIcon} w={{ base: 2, md: 3 }} h={{ base: 2, md: 3 }} />
                </Link>
                <Link 
                  href="#" 
                  color={linkColor} 
                  _hover={{ color: hoverColor, transform: 'translateX(4px)' }}
                  fontSize={{ base: "xs", md: "sm" }}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  transition="all 0.2s"
                >
                  <TimeIcon w={{ base: 3, md: 4 }} h={{ base: 3, md: 4 }} />
                  Reports
                  <Icon as={ExternalLinkIcon} w={{ base: 2, md: 3 }} h={{ base: 2, md: 3 }} />
                </Link>
                <Link 
                  href="#" 
                  color={linkColor} 
                  _hover={{ color: hoverColor, transform: 'translateX(4px)' }}
                  fontSize={{ base: "xs", md: "sm" }}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  transition="all 0.2s"
                >
                  <SettingsIcon w={{ base: 3, md: 4 }} h={{ base: 3, md: 4 }} />
                  Categories
                  <Icon as={ExternalLinkIcon} w={{ base: 2, md: 3 }} h={{ base: 2, md: 3 }} />
                </Link>
                <Link 
                  href="#" 
                  color={linkColor} 
                  _hover={{ color: hoverColor, transform: 'translateX(4px)' }}
                  fontSize={{ base: "xs", md: "sm" }}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  transition="all 0.2s"
                >
                  <SettingsIcon w={{ base: 3, md: 4 }} h={{ base: 3, md: 4 }} />
                  Settings
                  <Icon as={ExternalLinkIcon} w={{ base: 2, md: 3 }} h={{ base: 2, md: 3 }} />
                </Link>
              </VStack>
            </VStack>

            {/* Enhanced Support */}
            <VStack spacing={{ base: 4, md: 6 }} align="start">
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor}>
                Support & Resources
              </Text>
              <VStack spacing={{ base: 2, md: 3 }} align="start">
                <Link 
                  href="#" 
                  color={linkColor} 
                  _hover={{ color: hoverColor, transform: 'translateX(4px)' }}
                  fontSize={{ base: "xs", md: "sm" }}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  transition="all 0.2s"
                >
                  <InfoIcon w={{ base: 3, md: 4 }} h={{ base: 3, md: 4 }} />
                  Help Center
                  <Icon as={ExternalLinkIcon} w={{ base: 2, md: 3 }} h={{ base: 2, md: 3 }} />
                </Link>
                <Link 
                  href="#" 
                  color={linkColor} 
                  _hover={{ color: hoverColor, transform: 'translateX(4px)' }}
                  fontSize={{ base: "xs", md: "sm" }}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  transition="all 0.2s"
                >
                  <DownloadIcon w={{ base: 3, md: 4 }} h={{ base: 3, md: 4 }} />
                  Documentation
                  <Icon as={ExternalLinkIcon} w={{ base: 2, md: 3 }} h={{ base: 2, md: 3 }} />
                </Link>
                <Link 
                  href="#" 
                  color={linkColor} 
                  _hover={{ color: hoverColor, transform: 'translateX(4px)' }}
                  fontSize={{ base: "xs", md: "sm" }}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  transition="all 0.2s"
                >
                  <LockIcon w={{ base: 3, md: 4 }} h={{ base: 3, md: 4 }} />
                  Privacy Policy
                  <Icon as={ExternalLinkIcon} w={{ base: 2, md: 3 }} h={{ base: 2, md: 3 }} />
                </Link>
                <Link 
                  href="#" 
                  color={linkColor} 
                  _hover={{ color: hoverColor, transform: 'translateX(4px)' }}
                  fontSize={{ base: "xs", md: "sm" }}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  transition="all 0.2s"
                >
                  <LockIcon w={{ base: 3, md: 4 }} h={{ base: 3, md: 4 }} />
                  Terms of Service
                  <Icon as={ExternalLinkIcon} w={{ base: 2, md: 3 }} h={{ base: 2, md: 3 }} />
                </Link>
              </VStack>
            </VStack>

            {/* Enhanced Newsletter */}
            <VStack spacing={{ base: 4, md: 6 }} align="start">
              <VStack spacing={{ base: 2, md: 3 }} align="start">
                <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" color={textColor}>
                  Stay Updated
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }} color={secondaryTextColor}>
                  Get the latest updates, financial tips, and exclusive content delivered to your inbox.
                </Text>
              </VStack>
              
              <form onSubmit={handleNewsletterSubmit} style={{ width: '100%' }}>
                <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                  <InputGroup size={{ base: "sm", md: "md" }}>
                    <Input
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="xl"
                      fontSize={{ base: "xs", md: "sm" }}
                      _focus={{
                        borderColor: linkColor,
                        boxShadow: `0 0 0 1px ${linkColor}`
                      }}
                    />
                    <InputRightElement>
                      <Button
                        type="submit"
                        size={{ base: "xs", md: "sm" }}
                        colorScheme="blue"
                        variant="solid"
                        h="80%"
                        px={{ base: 2, md: 4 }}
                        borderRadius="lg"
                        fontSize={{ base: "xs", md: "sm" }}
                        _hover={{ transform: 'scale(1.05)' }}
                        transition="all 0.2s"
                      >
                        {isSubscribed ? <CheckIcon /> : 'Subscribe'}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  {isSubscribed && (
                    <Text fontSize="xs" color="green.500" textAlign="center">
                      ✓ Successfully subscribed!
                    </Text>
                  )}
                </VStack>
              </form>
              
              <VStack spacing={{ base: 2, md: 3 }} align="start">
                <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="semibold" color={textColor}>
                  Contact Information
                </Text>
                <VStack spacing={2} align="start">
                  <HStack spacing={2} fontSize={{ base: "xs", md: "sm" }} color={secondaryTextColor}>
                    <PhoneIcon w={{ base: 3, md: 4 }} h={{ base: 3, md: 4 }} />
                    <Text>+1 (555) 123-4567</Text>
                  </HStack>
                  <HStack spacing={2} fontSize={{ base: "xs", md: "sm" }} color={secondaryTextColor}>
                    <EmailIcon w={{ base: 3, md: 4 }} h={{ base: 3, md: 4 }} />
                    <Text>support@personalbudget.com</Text>
                  </HStack>
                </VStack>
              </VStack>
            </VStack>
          </SimpleGrid>

          <Divider my={{ base: 6, md: 8 }} />

          {/* Enhanced Bottom Section */}
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align="center" 
            gap={{ base: 4, md: 6 }}
          >
            <VStack spacing={{ base: 1, md: 2 }} align={{ base: 'center', md: 'start' }}>
              <Text fontSize={{ base: "xs", md: "sm" }} color={secondaryTextColor}>
                © 2024 Personal Budget. All rights reserved.
              </Text>
              <HStack spacing={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "xs" }} color={secondaryTextColor}>
                <Text>Made with</Text>
                <Text color="red.500">❤️</Text>
                <Text>for better financial management</Text>
              </HStack>
            </VStack>
            
            <HStack spacing={{ base: 2, md: 4 }} wrap="wrap" justify={{ base: 'center', md: 'flex-end' }}>
              <Tooltip label="Scroll to top" placement="top">
                <IconButton
                  aria-label="back to top"
                  icon={<ArrowUpIcon />}
                  size={{ base: "xs", md: "sm" }}
                  variant="ghost"
                  onClick={scrollToTop}
                  _hover={{ bg: linkColor, color: 'white' }}
                  transition="all 0.2s"
                />
              </Tooltip>
              <Button
                size={{ base: "xs", md: "sm" }}
                variant="ghost"
                leftIcon={<ExternalLinkIcon />}
                _hover={{ bg: linkColor, color: 'white' }}
                transition="all 0.2s"
                fontSize={{ base: "xs", md: "sm" }}
              >
                Share
              </Button>
              <Button
                size={{ base: "xs", md: "sm" }}
                variant="ghost"
                leftIcon={<CopyIcon />}
                _hover={{ bg: linkColor, color: 'white' }}
                transition="all 0.2s"
                fontSize={{ base: "xs", md: "sm" }}
              >
                Copy Link
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Feedback Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Your Feedback</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>How would you rate your experience?</FormLabel>
                <HStack spacing={4}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <IconButton
                      key={rating}
                      aria-label={`Rate ${rating}`}
                      icon={<StarIcon />}
                      colorScheme={rating <= 4 ? 'yellow' : 'gray'}
                      variant="ghost"
                      size="lg"
                    />
                  ))}
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel>What can we improve?</FormLabel>
                <Textarea
                  placeholder="Tell us what you think..."
                  rows={4}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Would you recommend us?</FormLabel>
                <HStack>
                  <Switch />
                  <Text fontSize="sm">Yes, I would recommend Personal Budget</Text>
                </HStack>
              </FormControl>
              <Button
                colorScheme="blue"
                onClick={handleFeedbackSubmit}
                w="full"
              >
                Submit Feedback
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
