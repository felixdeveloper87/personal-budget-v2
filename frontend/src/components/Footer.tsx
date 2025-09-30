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
  Badge,
  Tooltip,
  IconButton,
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
  Switch
} from '@chakra-ui/react'
import {
  EmailIcon,
  ExternalLinkIcon,
  PhoneIcon,
  InfoIcon,
  StarIcon,
  SettingsIcon,
  ArrowUpIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon
} from '@chakra-ui/icons'
import { useState } from 'react'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

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
    onClose()
  }

  return (
    <>
      <Box as="footer" bg={bg} borderTop="1px solid" borderColor={borderColor} mt="auto">

        {/* Gradient Top Section */}
        <Box bg={gradientBg} py={{ base: 6, md: 10 }} position="relative" overflow="hidden">
          <Container maxW="7xl" px={{ base: 4, sm: 6 }}>
            <VStack spacing={{ base: 6, md: 8 }} textAlign="center" color="white">
              <HStack spacing={{ base: 3, md: 4 }}>
                <Box
                  w={{ base: 12, md: 14 }}
                  h={{ base: 12, md: 14 }}
                  bg="rgba(255,255,255,0.2)"
                  borderRadius="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  backdropFilter="blur(10px)"
                  border="1px solid rgba(255,255,255,0.3)"
                >
                  <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">£</Text>
                </Box>
                <VStack spacing={1} align="start">
                  <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">Personal Budget</Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} opacity={0.9}>Smart Financial Management</Text>
                </VStack>
              </HStack>
              <Text fontSize={{ base: "sm", md: "lg" }} maxW="600px" opacity={0.9}>
                Take control of your finances with our intuitive budgeting tool.
                Track expenses, manage income, and achieve your financial goals with confidence.
              </Text>
              <HStack spacing={3} wrap="wrap" justify="center">
                <Button size="sm" variant="outline" leftIcon={<StarIcon />} color="white" borderColor="rgba(255,255,255,0.3)" _hover={{ bg: 'rgba(255,255,255,0.1)' }}>
                  Rate Us
                </Button>
                <Button size="sm" variant="outline" leftIcon={<CopyIcon />} color="white" borderColor="rgba(255,255,255,0.3)" _hover={{ bg: 'rgba(255,255,255,0.1)' }}>
                  Share
                </Button>
                <Button size="sm" variant="outline" leftIcon={<DownloadIcon />} color="white" borderColor="rgba(255,255,255,0.3)" _hover={{ bg: 'rgba(255,255,255,0.1)' }}>
                  Download App
                </Button>
              </HStack>
            </VStack>
          </Container>
        </Box>

        {/* Main Footer Content */}
        <Container maxW="7xl" px={{ base: 4, sm: 6 }} py={{ base: 8, md: 12 }}>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={8}>

            {/* Brand + Quick Actions */}
            <VStack align="start" spacing={4}>
              <HStack spacing={3}>
                <Box w={10} h={10} bg={gradientBg} borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="xl" fontWeight="bold" color="white">£</Text>
                </Box>
                <VStack spacing={0} align="start">
                  <Text fontSize="md" fontWeight="bold" color={textColor}>Personal Budget</Text>
                  <Text fontSize="xs" color={secondaryTextColor}>Financial Management</Text>
                </VStack>
              </HStack>
              <Text fontSize="xs" color={secondaryTextColor}>
                Empowering individuals to take control of their financial future.
              </Text>
              <HStack spacing={2}>
                <Badge colorScheme="green" px={2} py={1} fontSize="xs">Secure</Badge>
                <Badge colorScheme="blue" px={2} py={1} fontSize="xs">Private</Badge>
              </HStack>
              <HStack spacing={2} wrap="wrap">
                <Button size="xs" variant="outline" leftIcon={<EmailIcon />} fontSize="xs">Contact</Button>
                <Button size="xs" variant="outline" leftIcon={<InfoIcon />} fontSize="xs">About</Button>
                <Button size="xs" variant="outline" leftIcon={<SettingsIcon />} fontSize="xs" onClick={onOpen}>Feedback</Button>
              </HStack>
            </VStack>

            {/* Quick Links */}
            <VStack align="start" spacing={3}>
              <Text fontSize="md" fontWeight="bold" color={textColor}>Quick Links</Text>
              {['Dashboard', 'Reports', 'Categories', 'Settings'].map((item) => (
                <Link key={item} href="#" color={linkColor} _hover={{ color: hoverColor }} fontSize="sm" display="flex" alignItems="center" gap={2}>
                  {item} <Icon as={ExternalLinkIcon} w={3} h={3} />
                </Link>
              ))}
            </VStack>

            {/* Support */}
            <VStack align="start" spacing={3}>
              <Text fontSize="md" fontWeight="bold" color={textColor}>Support</Text>
              {['Help Center', 'Documentation', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <Link key={item} href="#" color={linkColor} _hover={{ color: hoverColor }} fontSize="sm" display="flex" alignItems="center" gap={2}>
                  {item} <Icon as={ExternalLinkIcon} w={3} h={3} />
                </Link>
              ))}
            </VStack>

            {/* Newsletter */}
            <VStack align="start" spacing={3}>
              <Text fontSize="md" fontWeight="bold" color={textColor}>Stay Updated</Text>
              <Text fontSize="xs" color={secondaryTextColor}>
                Get the latest updates, tips, and exclusive content.
              </Text>

              <form onSubmit={handleNewsletterSubmit} style={{ width: '100%' }}>
                <InputGroup size="md">
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    pr={{ base: "80px", sm: "0" }} // garante espaço no mobile
                  />
                  <InputRightElement w="auto" pr={2}>
                    <Button
                      type="submit"
                      size={{ base: "xs", sm: "sm" }}   // menor no mobile
                      colorScheme="blue"
                      h="full"
                      px={{ base: 2, sm: 4 }}          // menos padding no mobile
                      minW={{ base: "70px", sm: "100px" }} // largura mínima
                      fontSize={{ base: "xs", sm: "sm" }}  // fonte menor no mobile
                    >
                      {isSubscribed ? <CheckIcon /> : 'Subscribe'}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </form>

              <VStack align="start" spacing={1}>
                <HStack spacing={2} fontSize="xs" color={secondaryTextColor}>
                  <PhoneIcon w={3} h={3} /> <Text>+1 (555) 123-4567</Text>
                </HStack>
                <HStack spacing={2} fontSize="xs" color={secondaryTextColor}>
                  <EmailIcon w={3} h={3} /> <Text>support@personalbudget.com</Text>
                </HStack>
              </VStack>
            </VStack>
          </SimpleGrid>

          <Divider my={8} />

          {/* Bottom Section */}
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={4}>
            <Text fontSize="xs" color={secondaryTextColor}>© 2024 Personal Budget. All rights reserved.</Text>
            <HStack spacing={3}>
              <Tooltip label="Scroll to top">
                <IconButton aria-label="back to top" icon={<ArrowUpIcon />} size="sm" variant="ghost" onClick={scrollToTop} />
              </Tooltip>
              <Button size="sm" variant="ghost" leftIcon={<ExternalLinkIcon />}>Share</Button>
              <Button size="sm" variant="ghost" leftIcon={<CopyIcon />}>Copy Link</Button>
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
                <HStack spacing={2}>
                  {[1, 2, 3, 4, 5].map(r => (
                    <IconButton key={r} aria-label={`Rate ${r}`} icon={<StarIcon />} colorScheme="yellow" variant="ghost" size="lg" />
                  ))}
                </HStack>
              </FormControl>
              <FormControl>
                <FormLabel>What can we improve?</FormLabel>
                <Textarea placeholder="Tell us what you think..." rows={4} />
              </FormControl>
              <FormControl>
                <FormLabel>Would you recommend us?</FormLabel>
                <HStack>
                  <Switch /> <Text fontSize="sm">Yes, I would recommend</Text>
                </HStack>
              </FormControl>
              <Button colorScheme="blue" onClick={handleFeedbackSubmit} w="full">Submit Feedback</Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
