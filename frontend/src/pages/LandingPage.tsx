import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  SimpleGrid,
  useColorModeValue,
  HStack,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Grid,
  GridItem,
  Circle,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  ArrowForwardIcon,
  CheckCircleIcon,
  StarIcon,
  TimeIcon,
} from '@chakra-ui/icons'
import { Header, Footer } from '../components'
import {
  TrendingUp,
  PieChart,
  BarChart3,
  Shield,
  Zap,
  Search,
  DollarSign,
  Repeat,
  Globe
} from 'lucide-react'

const MotionBox = motion(Box)

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {

  const heroGradient = useColorModeValue(
    'radial(circle at 50% 0%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)',
    'radial(circle at 50% 0%, rgba(14, 165, 233, 0.15) 0%, transparent 50%)'
  )

  const cardBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(20, 20, 22, 0.6)')
  const cardBorder = useColorModeValue('rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.05)')
  const cardBackdrop = 'blur(20px)'
  const textColor = useColorModeValue('gray.600', 'gray.400')

  const features = [
    {
      icon: TrendingUp,
      color: 'green.500',
      title: 'Smart Management',
      description: 'Track every penny with precision. Auto-categorization and detailed insights.',
      colSpan: 2
    },
    {
      icon: PieChart,
      color: 'blue.500',
      title: 'Visual Analytics',
      description: 'Beautiful interactive charts that bring your financial data to life.',
      colSpan: 1
    },
    {
      icon: Repeat,
      color: 'purple.500',
      title: 'Installment Plans',
      description: 'Manage split payments and recurring bills effortlessly.',
      colSpan: 1
    },
    {
      icon: Search,
      color: 'orange.500',
      title: 'Deep Search',
      description: 'Find any transaction instantly with powerful filters.',
      colSpan: 2
    }
  ]

  const stats = [
    { label: 'Setup Time', value: '< 2 min', icon: TimeIcon },
    { label: 'Price', value: 'Free', icon: DollarSign },
    { label: 'Privacy', value: '100%', icon: Shield },
    { label: 'Platform', value: 'All', icon: Globe }
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Sign Up',
      description: 'Create your free account in seconds. No credit card needed.',
      icon: Zap
    },
    {
      step: '02',
      title: 'Add Data',
      description: 'Log income and expenses quickly with our smart interface.',
      icon: PlusIcon
    },
    {
      step: '03',
      title: 'Analyze',
      description: 'Get instant insights into your spending habits.',
      icon: BarChart3
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Freelance Designer',
      content: "The most beautiful budget app I've ever used. It actually makes me want to track my finances.",
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      content: "Clean code, clean UI. The dark mode implementation is flawless. Exactly what I was looking for.",
      rating: 5
    },
    {
      name: 'Emma Williams',
      role: 'Small Business Owner',
      content: "Simple yet powerful. The installment tracking feature is a game changer for my business expenses.",
      rating: 5
    }
  ]

  const faqs = [
    {
      question: 'Is Personal Budget really free?',
      answer: 'Yes! 100% free, forever. We believe financial wellness should be accessible to everyone.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use bank-level encryption and strict privacy protocols. Your data is yours alone.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes, you can export your transaction history at any time for your own records.'
    }
  ]

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'black')} overflowX="hidden">
      <Header onLogin={onGetStarted} />

      {/* Hero Section */}
      <Box position="relative" pt={{ base: 12, md: 20 }} pb={{ base: 10, md: 28 }}>
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="100vh"
          bgGradient={heroGradient}
          pointerEvents="none"
        />

        {/* Abstract Shapes */}
        <MotionBox
          position="absolute"
          top="20%"
          right="10%"
          w="500px"
          h="500px"
          bg="brand.400"
          filter="blur(100px)"
          opacity={0.1}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <MotionBox
          position="absolute"
          bottom="20%"
          left="10%"
          w="400px"
          h="400px"
          bg="purple.500"
          filter="blur(100px)"
          opacity={0.1}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge
                px={4}
                py={2}
                rounded="full"
                bg={useColorModeValue('white', 'whiteAlpha.100')}
                color="brand.500"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'whiteAlpha.200')}
                mb={6}
                boxShadow="sm"
              >
                The Future of Personal Finance
              </Badge>
              <Heading
                as="h1"
                fontSize={{ base: "4xl", md: "7xl" }}
                fontWeight="900"
                lineHeight="1.1"
                letterSpacing="-0.02em"
                mb={6}
              >
                Master Your Money <br />
                <Text as="span" bgGradient="linear(to-r, brand.400, purple.500)" bgClip="text">
                  With Elegance
                </Text>
              </Heading>
              <Text
                fontSize={{ base: "lg", md: "2xl" }}
                color={textColor}
                maxW="2xl"
                mx="auto"
                lineHeight="1.6"
              >
                Experience the perfect blend of power and simplicity.
                Track, analyze, and grow your wealth with a tool designed for modern life.
              </Text>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <HStack spacing={4} mt={8} justify="center" flexWrap="wrap">
                <Button
                  size="lg"
                  h={14}
                  px={10}
                  fontSize="lg"
                  colorScheme="brand"
                  rounded="full"
                  rightIcon={<ArrowForwardIcon />}
                  onClick={onGetStarted}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Get Started Free
                </Button>
                <Button
                  size="lg"
                  h={14}
                  px={10}
                  fontSize="lg"
                  variant="outline"
                  rounded="full"
                  leftIcon={<Icon as={CheckCircleIcon} />}
                  borderColor={useColorModeValue('gray.300', 'whiteAlpha.300')}
                  _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.100') }}
                >
                  No Credit Card
                </Button>
              </HStack>
            </MotionBox>

            {/* Floating Stats Card */}
            <MotionBox
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              mt={20}
              w="full"
            >
              <SimpleGrid
                columns={{ base: 2, md: 4 }}
                spacing={8}
                bg={cardBg}
                backdropFilter={cardBackdrop}
                border="1px solid"
                borderColor={cardBorder}
                p={8}
                rounded="3xl"
                shadow="xl"
              >
                {stats.map((stat, idx) => (
                  <VStack key={idx} spacing={2}>
                    <Icon as={stat.icon} boxSize={6} color="brand.500" />
                    <Text fontSize="3xl" fontWeight="bold">{stat.value}</Text>
                    <Text fontSize="sm" color={textColor} textTransform="uppercase" letterSpacing="wide">
                      {stat.label}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </MotionBox>
          </VStack>
        </Container>
      </Box>

      {/* Features Section (Bento Grid) */}
      <Box mb={{ base: 10, md: 20 }} position="relative">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Box textAlign="center" maxW="3xl" mx="auto">
              <Text color="brand.500" fontWeight="bold" mb={2}>POWERFUL FEATURES</Text>
              <Heading fontSize={{ base: "3xl", md: "5xl" }} mb={6}>Everything you need to succeed</Heading>
              <Text fontSize="xl" color={textColor}>
                We've stripped away the clutter to focus on what truly matters: your financial clarity.
              </Text>
            </Box>

            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={6}
              w="full"
            >
              {features.map((feature, idx) => (
                <GridItem
                  key={idx}
                  colSpan={{ base: 1, md: feature.colSpan }}
                  as={motion.div}
                  whileHover={{ y: -5 }}
                  transition="0.2s"
                >
                  <Box
                    h="full"
                    p={8}
                    bg={cardBg}
                    backdropFilter={cardBackdrop}
                    border="1px solid"
                    borderColor={cardBorder}
                    rounded="3xl"
                    position="relative"
                    overflow="hidden"
                  >
                    <Box
                      position="absolute"
                      top={0}
                      right={0}
                      p={8}
                      opacity={0.05}
                      transform="scale(1.5)"
                      transition="0.5s"
                      _groupHover={{ transform: "scale(2) rotate(10deg)", opacity: 0.1 }}
                    >
                      <Icon as={feature.icon} boxSize={32} />
                    </Box>

                    <VStack align="start" spacing={6} position="relative" zIndex={1}>
                      <Circle size={12} bg={useColorModeValue('white', 'whiteAlpha.100')} shadow="sm">
                        <Icon as={feature.icon} color={feature.color} boxSize={6} />
                      </Circle>
                      <Box>
                        <Heading size="lg" mb={3}>{feature.title}</Heading>
                        <Text color={textColor} fontSize="lg">{feature.description}</Text>
                      </Box>
                    </VStack>
                  </Box>
                </GridItem>
              ))}
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* How It Works */}
      <Box py={12} mb={{ base: 10, md: 20 }} >
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Box textAlign="center">
              <Heading fontSize={{ base: "3xl", md: "5xl" }} mb={6}>How it works</Heading>
              <Text fontSize="xl" color={textColor}>Three simple steps to financial freedom</Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={12} w="full" position="relative">
              {/* Connecting Line (Desktop) */}
              <Box
                display={{ base: 'none', md: 'block' }}
                position="absolute"
                top="40px"
                left="10%"
                right="10%"
                h="2px"
                bgGradient="linear(to-r, brand.500, purple.500)"
                opacity={0.2}
                zIndex={0}
              />

              {howItWorks.map((item, idx) => (
                <VStack key={idx} spacing={6} position="relative" zIndex={1}>
                  <Circle
                    size={20}
                    bg={useColorModeValue('white', 'gray.800')}
                    border="4px solid"
                    borderColor="brand.500"
                    shadow="xl"
                  >
                    <Icon as={item.icon} boxSize={8} color="brand.500" />
                  </Circle>
                  <Box textAlign="center">
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="brand.500"
                      textTransform="uppercase"
                      mb={2}
                    >
                      Step {item.step}
                    </Text>
                    <Heading size="md" mb={3}>{item.title}</Heading>
                    <Text color={textColor}>{item.description}</Text>
                  </Box>
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box py={12} mb={{ base: 10, md: 20 }} position="relative" overflow="hidden">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Heading fontSize={{ base: "3xl", md: "5xl" }} textAlign="center">Loved by thousands</Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              {testimonials.map((t, idx) => (
                <MotionBox
                  key={idx}
                  whileHover={{ y: -10 }}
                  p={8}
                  bg={cardBg}
                  backdropFilter={cardBackdrop}
                  border="1px solid"
                  borderColor={cardBorder}
                  rounded="2xl"
                  shadow="lg"
                >
                  <VStack align="start" spacing={4}>
                    <HStack color="yellow.400">
                      {[...Array(t.rating)].map((_, i) => <StarIcon key={i} />)}
                    </HStack>
                    <Text fontSize="lg" fontStyle="italic" color={textColor}>"{t.content}"</Text>
                    <Box pt={4}>
                      <Text fontWeight="bold">{t.name}</Text>
                      <Text fontSize="sm" color="brand.500">{t.role}</Text>
                    </Box>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* FAQ */}
      <Box py={12} mb={{ base: 10, md: 20 }}>
        <Container maxW="container.md">
          <VStack spacing={12}>
            <Heading fontSize={{ base: "3xl", md: "4xl" }} textAlign="center">Common Questions</Heading>

            <Accordion allowToggle w="full">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  border="none"
                  mb={4}
                  bg={useColorModeValue('white', 'gray.900')}
                  rounded="xl"
                  shadow="sm"
                >
                  <AccordionButton p={6} _hover={{ bg: useColorModeValue('gray.50', 'gray.800') }} rounded="xl">
                    <Box flex="1" textAlign="left" fontWeight="bold">
                      {faq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={6} px={6} color={textColor}>
                    {faq.answer}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} mb={{ base: 10, md: 20 }} position="relative" overflow="hidden">
        <Box
          position="absolute"
          inset={0}
          bgGradient="linear(to-r, brand.600, purple.600)"
          opacity={0.9}
        />
        <Box
          position="absolute"
          inset={0}
          bgImage="url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2000&q=80')"
          bgSize="cover"
          bgPosition="center"
          opacity={0.2}
          mixBlendMode="overlay"
        />

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center" color="white">
            <Heading fontSize={{ base: "4xl", md: "6xl" }}>
              Ready to take control?
            </Heading>
            <Text fontSize="xl" maxW="2xl" opacity={0.9}>
              Join thousands of users who are mastering their money with Personal Budget.
              Free forever. No credit card required.
            </Text>
            <Button
              size="lg"
              h={16}
              px={12}
              fontSize="xl"
              bg="white"
              color="brand.600"
              _hover={{ bg: 'gray.100', transform: 'scale(1.05)' }}
              onClick={onGetStarted}
              rounded="full"
              shadow="2xl"
              rightIcon={<ArrowForwardIcon />}
            >
              Start Your Journey Now
            </Button>
          </VStack>
        </Container>
      </Box>

      <Footer />
    </Box>
  )
}

function Badge({ children, ...props }: any) {
  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      fontSize="sm"
      fontWeight="bold"
      {...props}
    >
      {children}
    </Box>
  )
}

function PlusIcon(props: any) {
  return <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M12 5v14M5 12h14" /></Icon>
}
