import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  Flex, 
  Icon, 
  SimpleGrid,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { 
  ArrowForwardIcon, 
  LockIcon,
  ViewIcon,
  CalendarIcon,
  AddIcon
} from '@chakra-ui/icons'
import Header from '../components/Header'
import Footer from '../components/Footer'

const MotionBox = motion.create(Box)
const MotionButton = motion.create(Button)

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const { colorMode } = useColorMode()
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, black, gray.900, gray.800)'
  )
  const cardBg = useColorModeValue('white', '#111111')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const headingColor = useColorModeValue('gray.800', 'white')

  const features = [
    {
      icon: <AddIcon boxSize={8} color="green.500" />,
      title: 'Add Transactions',
      description: 'Quickly add income and expenses with our intuitive interface'
    },
    {
      icon: <ViewIcon boxSize={8} color="blue.500" />,
      title: 'Visual Charts',
      description: 'See your spending patterns with interactive pie charts and graphs'
    },
    {
      icon: <CalendarIcon boxSize={8} color="purple.500" />,
      title: 'Monthly Tracking',
      description: 'Monitor your budget month by month with detailed summaries'
    },
    {
      icon: <LockIcon boxSize={8} color="red.500" />,
      title: 'Secure & Private',
      description: 'Your financial data is protected with modern security standards'
    }
  ]

  const benefits = [
    {
      title: 'Simple & Clean',
      description: 'No complex features, just what you need to manage your money'
    },
    {
      title: 'Free Forever',
      description: 'No subscriptions, no hidden fees, completely free to use'
    },
    {
      title: 'Your Data, Your Control',
      description: 'All your information stays private and secure on your device'
    }
  ]

  return (
    <Box minH="100vh" bgGradient={bgGradient} display="flex" flexDirection="column">
      {/* Header */}
      <Header onLogin={onGetStarted} />

      {/* Hero Section */}
      <Container
        maxW={{
          base: "100%",
          md: "4xl",
          lg: "6xl",
          xl: "7xl",
          "2xl": "8xl",
          "3xl": "container.3xl",
        }}
        py={{ base: 12, md: 16, lg: 20 }}
        px={{ base: 4, md: 6 }}
      >
        <VStack spacing={8} textAlign="center">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Heading 
              size="4xl" 
              bgGradient="linear(to-r, blue.400, purple.400, pink.400)"
              bgClip="text"
              mb={6}
            >
              Personal Budget
              <br />
              <Text as="span" color={useColorModeValue('gray.700', 'white')}>
                Made Simple
              </Text>
            </Heading>
            <Text fontSize="xl" color={textColor} maxW="2xl" mb={8}>
              Track your income and expenses with beautiful charts, 
              monthly summaries, and complete control over your personal finances.
            </Text>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HStack spacing={4} flexWrap="wrap" justify="center">
              <MotionButton
                size="lg"
                colorScheme="brand"
                rightIcon={<ArrowForwardIcon />}
                onClick={onGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="600"
                borderRadius="xl"
                bg="linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)"
                _hover={{
                  bg: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(14, 165, 233, 0.4)",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
              >
                Get Started Free
              </MotionButton>
              <Button
                size="lg"
                variant="outline"
                leftIcon={<ViewIcon />}
                onClick={() => {
                  // Scroll to features section
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="600"
                borderRadius="xl"
                borderColor={useColorModeValue('gray.300', 'gray.600')}
                color={useColorModeValue('gray.700', 'gray.200')}
                _hover={{
                  bg: useColorModeValue('gray.50', 'gray.700'),
                  borderColor: useColorModeValue('gray.400', 'gray.500'),
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
              >
                View Features
              </Button>
            </HStack>
          </MotionBox>

        </VStack>
      </Container>

      {/* Features Section */}
      <Box id="features" py={{ base: 12, md: 16, lg: 20 }} bg={useColorModeValue('gray.50', 'gray.800')}>
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
          <VStack spacing={16}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Heading size="2xl" mb={4}>Powerful Features</Heading>
              <Text fontSize="lg" color={textColor} maxW="2xl">
                Everything you need to have complete control of your finances
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
              {features.map((feature, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  p={6}
                  bg={cardBg}
                  rounded="2xl"
                  shadow="lg"
                  textAlign="center"
                  border="1px solid"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  _hover={{ 
                    shadow: 'xl', 
                    transform: 'translateY(-4px)',
                    borderColor: useColorModeValue('gray.300', 'gray.600'),
                  }}
                >
                  <VStack spacing={4}>
                    {feature.icon}
                    <Heading size="md">{feature.title}</Heading>
                    <Text color={textColor} fontSize="sm">
                      {feature.description}
                    </Text>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box py={{ base: 12, md: 16, lg: 20 }}>
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
          <VStack spacing={16}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Heading size="2xl" mb={4}>Why Choose Personal Budget?</Heading>
              <Text fontSize="lg" color={textColor}>
                A simple, secure, and free way to manage your money
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {benefits.map((benefit, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  p={6}
                  bg={cardBg}
                  rounded="2xl"
                  shadow="lg"
                  textAlign="center"
                  border="1px solid"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  _hover={{ 
                    shadow: 'xl', 
                    transform: 'translateY(-4px)',
                    borderColor: useColorModeValue('gray.300', 'gray.600'),
                  }}
                >
                  <VStack spacing={4}>
                    <Heading size="md" color="blue.500">{benefit.title}</Heading>
                    <Text color={textColor}>
                      {benefit.description}
                    </Text>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={{ base: 12, md: 16, lg: 20 }} bg={useColorModeValue('blue.50', 'blue.900')}>
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
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            textAlign="center"
          >
            <VStack spacing={8}>
              <Heading size="2xl">
                Ready to take control of your money?
              </Heading>
              <Text fontSize="lg" color={textColor} maxW="2xl">
                Start managing your personal budget today. 
                It's completely free and takes less than 2 minutes to get started.
              </Text>
              <MotionButton
                size="lg"
                colorScheme="brand"
                rightIcon={<ArrowForwardIcon />}
                onClick={onGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                px={8}
                py={6}
                fontSize="lg"
                fontWeight="600"
                borderRadius="xl"
                bg="linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)"
                _hover={{
                  bg: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(14, 165, 233, 0.4)",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
              >
                Get Started Free
              </MotionButton>
              <Text fontSize="sm" color={textColor}>
                ✅ No credit card • ✅ No commitment • ✅ Your data stays private
              </Text>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  )
}
