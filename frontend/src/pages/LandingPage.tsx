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
  List,
  ListItem,
  ListIcon,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Grid,
  GridItem,
  Badge
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  ArrowForwardIcon,
  LockIcon,
  ViewIcon,
  CalendarIcon,
  AddIcon,
  CheckCircleIcon,
  StarIcon,
  TimeIcon,
  SearchIcon,
  ChevronRightIcon
} from '@chakra-ui/icons'
import { Header, Footer } from '../components'
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  Shield, 
  Zap, 
  Smartphone, 
  Moon, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Eye,
  Download,
  Bell,
  CreditCard
} from 'lucide-react'

const MotionBox = motion.create(Box)
const MotionButton = motion.create(Button)

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, black, gray.900, gray.800)'
  )
  const cardBg = useColorModeValue('white', '#111111')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const headingColor = useColorModeValue('gray.800', 'white')

  const features = [
    {
      icon: <Icon as={TrendingUp} boxSize={10} />,
      color: 'green.500',
      title: 'Smart Transaction Management',
      description: 'Add, edit, and delete transactions in seconds. Categorize automatically and track every penny with precision.',
      details: ['Quick add with number pad', 'Custom categories', 'Date & time tracking', 'Detailed descriptions']
    },
    {
      icon: <Icon as={PieChart} boxSize={10} />,
      color: 'blue.500',
      title: 'Interactive Charts & Analytics',
      description: 'Visualize your spending patterns with beautiful, interactive pie charts and category breakdowns.',
      details: ['Expense by category', 'Income analysis', 'Monthly comparisons', 'Real-time updates']
    },
    {
      icon: <Icon as={Calendar} boxSize={10} />,
      color: 'purple.500',
      title: 'Period Navigation',
      description: 'Navigate through months and analyze your financial history with intuitive period controls.',
      details: ['Monthly summaries', 'Year overview', 'Historical data', 'Trend analysis']
    },
    {
      icon: <Icon as={Search} boxSize={10} />,
      color: 'orange.500',
      title: 'Advanced Search & Filters',
      description: 'Find any transaction instantly with powerful search and filtering capabilities.',
      details: ['Search by description', 'Filter by category', 'Date range filters', 'Type filtering']
    },
    {
      icon: <Icon as={Shield} boxSize={10} />,
      color: 'red.500',
      title: 'Bank-Level Security',
      description: 'Your data is protected with JWT authentication and modern encryption standards.',
      details: ['Encrypted data', 'Secure authentication', 'Private by default', 'No data sharing']
    },
    {
      icon: <Icon as={Moon} boxSize={10} />,
      color: 'indigo.500',
      title: 'Dark Mode & Responsive',
      description: 'Beautiful interface that works perfectly on any device, with dark mode support.',
      details: ['Auto dark mode', 'Mobile optimized', 'Touch friendly', 'Fast & smooth']
    }
  ]

  const stats = [
    {
      label: 'Setup Time',
      value: '< 2 min',
      helpText: 'Start tracking immediately',
      icon: TimeIcon
    },
    {
      label: 'Price',
      value: '$0',
      helpText: 'Free forever, no tricks',
      icon: DollarSign
    },
    {
      label: 'Categories',
      value: 'Unlimited',
      helpText: 'Customize as you need',
      icon: Filter
    },
    {
      label: 'Devices',
      value: 'All',
      helpText: 'Mobile, tablet, desktop',
      icon: Smartphone
    }
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'Create Your Account',
      description: 'Sign up in seconds with just your name and email. No credit card required.',
      icon: AddIcon
    },
    {
      step: '2',
      title: 'Add Your Transactions',
      description: 'Quickly log your income and expenses with our intuitive interface and number pad.',
      icon: CreditCard
    },
    {
      step: '3',
      title: 'Visualize & Analyze',
      description: 'See your spending patterns through beautiful charts and get insights instantly.',
      icon: BarChart3
    },
    {
      step: '4',
      title: 'Take Control',
      description: 'Make better financial decisions with clear data and comprehensive summaries.',
      icon: TrendingUp
    }
  ]

  const benefits = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'No loading times, no lag. Add transactions and see results instantly.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Bank-level encryption. Your data is yours and only yours.'
    },
    {
      icon: Smartphone,
      title: 'Works Everywhere',
      description: 'Perfect on mobile, tablet, and desktop. Track on the go or at home.'
    },
    {
      icon: Moon,
      title: 'Beautiful Design',
      description: 'Clean, modern interface with dark mode. Easy on the eyes, easy to use.'
    },
    {
      icon: DollarSign,
      title: 'Free Forever',
      description: 'No subscriptions, no hidden fees, no premium features. 100% free.'
    },
    {
      icon: Eye,
      title: 'Clear Insights',
      description: 'See exactly where your money goes with detailed charts and breakdowns.'
    }
  ]

  const faqs = [
    {
      question: 'Is Personal Budget really free?',
      answer: 'Yes! 100% free, forever. No premium plans, no hidden fees, no credit card required. All features are available to everyone.'
    },
    {
      question: 'Is my financial data secure?',
      answer: 'Absolutely. We use bank-level encryption, JWT authentication, and modern security standards. Your data is encrypted and private.'
    },
    {
      question: 'Can I use it on my phone?',
      answer: 'Yes! Personal Budget is fully responsive and works beautifully on mobile, tablet, and desktop. Access your budget anywhere.'
    },
    {
      question: 'Do I need to download anything?',
      answer: 'No downloads needed! Personal Budget is a web app that works directly in your browser. Just sign up and start using it.'
    },
    {
      question: 'Can I import my bank transactions?',
      answer: 'Currently, you add transactions manually, which gives you full control and privacy. We\'re considering import features for future versions.'
    },
    {
      question: 'How many categories can I create?',
      answer: 'Unlimited! Create as many custom categories as you need to organize your finances exactly how you want.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Freelance Designer',
      content: 'Finally, a budget app that doesn\'t overwhelm me! Super simple to use and the charts help me understand my spending patterns.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Software Developer',
      content: 'I\'ve tried many budget apps, but this is the cleanest and fastest. The dark mode is perfect for late-night budget reviews.',
      rating: 5
    },
    {
      name: 'Emma Williams',
      role: 'Small Business Owner',
      content: 'Love that it\'s completely free with no catches. The category breakdown feature helped me save $500 last month!',
      rating: 5
    }
  ]

  return (
    <Box minH="100vh" bgGradient={bgGradient} display="flex" flexDirection="column">
      {/* Header */}
      <Header onLogin={onGetStarted} />

      {/* Hero Section */}
      <Box
        as="section"
        position="relative"
        overflow="hidden"
        bgGradient={useColorModeValue(
          "linear(to-br, blue.50, purple.50, pink.50)",
          "linear(to-br, gray.900, black, gray.800)"
        )}
      >
        {/* Animated background effect */}
        <Box
          position="absolute"
          inset={0}
          bgGradient={useColorModeValue(
            "radial(circle at 30% 30%, rgba(59,130,246,0.2), rgba(139,92,246,0.15), transparent 70%)",
            "radial(circle at 20% 20%, rgba(59,130,246,0.25), transparent 70%)"
          )}
          animation="pulseBg 8s ease-in-out infinite"
          sx={{
            "@keyframes pulseBg": {
              "0%, 100%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.05)" }
            }
          }}
        />
        <Container
          maxW={{ base: "100%", xl: "1400px", "2xl": "1600px" }}
          py={{ base: 14, sm: 20, md: 28 }}
          px={{ base: 4, md: 8, lg: 12, xl: 16 }}
          position="relative"
          zIndex={1}
        >
          <VStack spacing={{ base: 6, sm: 8 }} textAlign="center">
            {/* Title */}
            <Heading
              fontSize={{ base: "3xl", sm: "4xl", md: "6xl" }}
              lineHeight="1.1"
              fontWeight="extrabold"
            >
              <Text
                as="span"
                bgGradient="linear(to-r, blue.400, purple.400, pink.400)"
                bgClip="text"
                display="block"
              >
                Take Control of
              </Text>
              <Text
                as="span"
                color={useColorModeValue("gray.700", "gray.200")}
                display="block"
              >
                Your Money, Today
              </Text>
            </Heading>

            {/* Subheadline */}
            <Text
              fontSize={{ base: "md", sm: "lg", md: "xl" }}
              color={useColorModeValue("gray.600", "gray.300")}
              maxW="2xl"
              lineHeight="1.6"
            >
              The simplest, fastest way to track income and expenses. 
              Visualize your spending, make better decisions, and achieve your financial goals.
            </Text>

            {/* Call to Actions */}
            <VStack spacing={4} w={{ base: "full", sm: "auto" }}>
              <MotionButton
                size="lg"
                colorScheme="brand"
                rightIcon={<ArrowForwardIcon />}
                onClick={onGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                px={{ base: 8, sm: 10 }}
                py={{ base: 6, sm: 7 }}
                fontSize={{ base: "lg", sm: "xl" }}
                fontWeight="700"
                borderRadius="xl"
                w={{ base: "full", sm: "auto" }}
                bg="linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)"
                _hover={{
                  bg: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 30px rgba(14, 165, 233, 0.5)",
                }}
                _active={{ transform: "translateY(0)" }}
              >
                Start Free Now
              </MotionButton>

              <HStack spacing={6} pt={2}>
                <HStack spacing={2}>
                  <CheckCircleIcon color="green.500" />
                  <Text fontSize="sm" color={textColor}>No setup fees</Text>
                </HStack>
                <HStack spacing={2}>
                  <CheckCircleIcon color="green.500" />
                  <Text fontSize="sm" color={textColor}>No credit card</Text>
                </HStack>
                <HStack spacing={2}>
                  <CheckCircleIcon color="green.500" />
                  <Text fontSize="sm" color={textColor}>2 min setup</Text>
                </HStack>
              </HStack>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={{ base: 12, md: 16 }} bg={useColorModeValue('white', 'gray.900')}>
        <Container maxW={{ base: "100%", xl: "1400px", "2xl": "1600px" }} px={{ base: 4, md: 8, lg: 12, xl: 16 }}>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={{ base: 6, md: 8 }}>
            {stats.map((stat, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Stat textAlign="center">
                  <Icon
                    as={stat.icon}
                    boxSize={8}
                    color="blue.500"
                    mb={3}
                    mx="auto"
                  />
                  <StatNumber fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
                    {stat.value}
                  </StatNumber>
                  <StatLabel fontSize={{ base: "sm", md: "md" }} fontWeight="600">
                    {stat.label}
                  </StatLabel>
                  <StatHelpText fontSize="xs" color={textColor}>
                    {stat.helpText}
                  </StatHelpText>
                </Stat>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
      {/* Features Section */}
      <Box id="features" py={{ base: 12, sm: 16, md: 20, lg: 24 }} bg={useColorModeValue('gray.50', 'gray.800')}>
        <Container maxW={{ base: "100%", xl: "1400px", "2xl": "1600px" }} px={{ base: 4, md: 8, lg: 12, xl: 16 }}>
          <VStack spacing={{ base: 12, sm: 16 }}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Text
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                color="blue.500"
                mb={2}
                letterSpacing="wider"
              >
                Features
              </Text>
              <Heading size={{ base: "xl", sm: "2xl" }} mb={{ base: 3, sm: 4 }}>
                Everything You Need in One Place
              </Heading>
              <Text fontSize={{ base: "md", sm: "lg" }} color={textColor} maxW="2xl" mx="auto">
                Powerful tools designed to make budget tracking effortless and effective
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 6, md: 8 }} w="full">
              {features.map((feature, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  p={{ base: 6, md: 8 }}
                  bg={cardBg}
                  rounded="2xl"
                  shadow="lg"
                  border="1px solid"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  _hover={{
                    shadow: '2xl',
                    transform: 'translateY(-8px)',
                    borderColor: feature.color,
                  }}
                >
                  <VStack spacing={4} align="start">
                    <Box color={feature.color}>
                      {feature.icon}
                    </Box>
                    <Heading size="md" lineHeight="1.2">
                      {feature.title}
                    </Heading>
                    <Text color={textColor} fontSize="sm" lineHeight="1.6">
                      {feature.description}
                    </Text>
                    <List spacing={2} w="full">
                      {feature.details.map((detail, idx) => (
                        <ListItem key={idx} fontSize="sm">
                          <ListIcon as={CheckCircleIcon} color={feature.color} />
                          {detail}
                        </ListItem>
                      ))}
                    </List>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box py={{ base: 12, sm: 16, md: 20 }} bg={useColorModeValue('white', 'gray.900')}>
        <Container maxW={{ base: "100%", xl: "1400px", "2xl": "1600px" }} px={{ base: 4, md: 8, lg: 12, xl: 16 }}>
          <VStack spacing={{ base: 12, sm: 16 }}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Text
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                color="blue.500"
                mb={2}
                letterSpacing="wider"
              >
                How It Works
              </Text>
              <Heading size={{ base: "xl", sm: "2xl" }} mb={{ base: 3, sm: 4 }}>
                Get Started in 4 Simple Steps
              </Heading>
              <Text fontSize={{ base: "md", sm: "lg" }} color={textColor} maxW="2xl" mx="auto">
                From signup to insights in less than 2 minutes
              </Text>
            </MotionBox>

            <Grid
              templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
              gap={{ base: 8, md: 6 }}
              w="full"
            >
              {howItWorks.map((step, index) => (
                <GridItem key={index}>
                  <MotionBox
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    viewport={{ once: true }}
                  >
                    <VStack spacing={4}>
                      <Box
                        position="relative"
                        w="full"
                        display="flex"
                        justifyContent="center"
                      >
                        <Box
                          bg="blue.500"
                          color="white"
                          borderRadius="full"
                          w={16}
                          h={16}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="2xl"
                          fontWeight="bold"
                          shadow="lg"
                        >
                          {step.step}
                        </Box>
                        {index < howItWorks.length - 1 && (
                          <Icon
                            as={ChevronRightIcon}
                            position="absolute"
                            right={{ base: "-20%", md: "-50%" }}
                            top="50%"
                            transform="translateY(-50%) rotate(90deg)"
                            boxSize={8}
                            color="blue.300"
                            display={{ base: "none", md: "block" }}
                          />
                        )}
                      </Box>
                      <VStack spacing={2} textAlign="center">
                        <Heading size="sm">{step.title}</Heading>
                        <Text fontSize="sm" color={textColor} px={2}>
                          {step.description}
                        </Text>
                      </VStack>
                    </VStack>
                  </MotionBox>
                </GridItem>
              ))}
            </Grid>

            <MotionButton
              size="lg"
              colorScheme="blue"
              rightIcon={<ArrowForwardIcon />}
              onClick={onGetStarted}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              px={10}
              py={7}
              fontSize="lg"
              fontWeight="600"
              borderRadius="xl"
              mt={8}
            >
              Start Your Journey
            </MotionButton>
          </VStack>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box py={{ base: 12, sm: 16, md: 20 }} bg={useColorModeValue('gray.50', 'gray.800')}>
        <Container maxW={{ base: "100%", xl: "1400px", "2xl": "1600px" }} px={{ base: 4, md: 8, lg: 12, xl: 16 }}>
          <VStack spacing={{ base: 12, sm: 16 }}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Text
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                color="blue.500"
                mb={2}
                letterSpacing="wider"
              >
                Why Choose Us
              </Text>
              <Heading size={{ base: "xl", sm: "2xl" }} mb={{ base: 3, sm: 4 }}>
                Built for Modern Financial Management
              </Heading>
              <Text fontSize={{ base: "md", sm: "lg" }} color={textColor} maxW="2xl" mx="auto">
                The perfect balance of simplicity, power, and privacy
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 6, md: 8 }} w="full">
              {benefits.map((benefit, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  p={{ base: 6, md: 8 }}
                  bg={cardBg}
                  rounded="2xl"
                  shadow="md"
                  textAlign="center"
                  border="1px solid"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  _hover={{
                    shadow: 'xl',
                    transform: 'translateY(-6px)',
                  }}
                >
                  <VStack spacing={4}>
                    <Box
                      bg={useColorModeValue('blue.50', 'blue.900')}
                      p={4}
                      borderRadius="full"
                    >
                      <Icon as={benefit.icon} boxSize={8} color="blue.500" />
                    </Box>
                    <Heading size="md" lineHeight="1.2">
                      {benefit.title}
                    </Heading>
                    <Text color={textColor} fontSize="sm" lineHeight="1.6">
                      {benefit.description}
                    </Text>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box py={{ base: 12, sm: 16, md: 20 }} bg={useColorModeValue('white', 'gray.900')}>
        <Container maxW={{ base: "100%", xl: "1400px", "2xl": "1600px" }} px={{ base: 4, md: 8, lg: 12, xl: 16 }}>
          <VStack spacing={{ base: 12, sm: 16 }}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Text
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                color="blue.500"
                mb={2}
                letterSpacing="wider"
              >
                Testimonials
              </Text>
              <Heading size={{ base: "xl", sm: "2xl" }} mb={{ base: 3, sm: 4 }}>
                Loved by Users Worldwide
              </Heading>
              <Text fontSize={{ base: "md", sm: "lg" }} color={textColor} maxW="2xl" mx="auto">
                See what others are saying about Personal Budget
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }} w="full">
              {testimonials.map((testimonial, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                  p={{ base: 6, md: 8 }}
                  bg={cardBg}
                  rounded="2xl"
                  shadow="lg"
                  border="1px solid"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                >
                  <VStack spacing={4} align="start">
                    <HStack spacing={1}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} color="yellow.400" boxSize={4} />
                      ))}
                    </HStack>
                    <Text color={textColor} fontSize="sm" lineHeight="1.7" fontStyle="italic">
                      "{testimonial.content}"
                    </Text>
                    <Box>
                      <Text fontWeight="bold" fontSize="sm">
                        {testimonial.name}
                      </Text>
                      <Text fontSize="xs" color={textColor}>
                        {testimonial.role}
                      </Text>
                    </Box>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box py={{ base: 12, sm: 16, md: 20 }} bg={useColorModeValue('gray.50', 'gray.800')}>
        <Container maxW={{ base: "100%", lg: "900px", xl: "1000px", "2xl": "1200px" }} px={{ base: 4, md: 8, lg: 12, xl: 16 }}>
          <VStack spacing={{ base: 8, md: 12 }}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Text
                fontSize="sm"
                fontWeight="bold"
                textTransform="uppercase"
                color="blue.500"
                mb={2}
                letterSpacing="wider"
              >
                FAQ
              </Text>
              <Heading size={{ base: "xl", sm: "2xl" }} mb={{ base: 3, sm: 4 }}>
                Frequently Asked Questions
              </Heading>
              <Text fontSize={{ base: "md", sm: "lg" }} color={textColor}>
                Everything you need to know about Personal Budget
              </Text>
            </MotionBox>

            <Accordion allowToggle w="full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  border="none"
                  mb={4}
                  bg={cardBg}
                  rounded="xl"
                  shadow="sm"
                >
                  <AccordionButton
                    p={6}
                    _hover={{
                      bg: useColorModeValue('gray.50', 'gray.700'),
                    }}
                    borderRadius="xl"
                  >
                    <Box flex="1" textAlign="left">
                      <Heading size="sm" fontWeight="600">
                        {faq.question}
                      </Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={6} px={6}>
                    <Text color={textColor} fontSize="sm" lineHeight="1.7">
                      {faq.answer}
                    </Text>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        py={{ base: 16, sm: 20, md: 24 }}
        bgGradient={useColorModeValue(
          'linear(to-br, blue.500, purple.600)',
          'linear(to-br, blue.600, purple.900)'
        )}
        position="relative"
        overflow="hidden"
      >
        {/* Decorative elements */}
        <Box
          position="absolute"
          inset={0}
          opacity={0.1}
          bgImage="radial-gradient(circle at 20px 20px, white 2px, transparent 0)"
          bgSize="40px 40px"
        />
        
        <Container maxW={{ base: "100%", lg: "1000px", xl: "1100px", "2xl": "1300px" }} px={{ base: 4, md: 8, lg: 12, xl: 16 }} position="relative" zIndex={1}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            textAlign="center"
          >
            <VStack spacing={{ base: 6, sm: 8 }}>
              <Badge
                colorScheme="whiteAlpha"
                fontSize="sm"
                px={4}
                py={2}
                borderRadius="full"
                textTransform="uppercase"
                fontWeight="bold"
                bg="whiteAlpha.300"
                color="white"
              >
                Join Thousands of Happy Users
              </Badge>
              
              <Heading 
                size={{ base: "xl", sm: "2xl", md: "3xl" }}
                color="white"
                lineHeight="1.2"
              >
                Ready to Transform Your
                <br />
                Financial Future?
              </Heading>
              
              <Text 
                fontSize={{ base: "md", sm: "lg", md: "xl" }}
                color="whiteAlpha.900"
                maxW="2xl"
                lineHeight="1.6"
              >
                Start tracking your money smarter today. Join for free and take
                the first step toward financial freedom.
              </Text>

              <VStack spacing={4} pt={4}>
                <MotionButton
                  size="lg"
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  px={{ base: 10, md: 12 }}
                  py={{ base: 7, md: 8 }}
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="700"
                  borderRadius="xl"
                  bg="white"
                  color="blue.600"
                  rightIcon={<ArrowForwardIcon />}
                  _hover={{
                    bg: 'whiteAlpha.900',
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
                  }}
                  _active={{ transform: "translateY(0)" }}
                  shadow="2xl"
                >
                  Start Free Now
                </MotionButton>

                <HStack spacing={4} pt={2} flexWrap="wrap" justify="center">
                  <HStack spacing={2}>
                    <CheckCircleIcon color="white" />
                    <Text fontSize="sm" color="white" fontWeight="500">
                      Free forever
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <CheckCircleIcon color="white" />
                    <Text fontSize="sm" color="white" fontWeight="500">
                      No credit card
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <CheckCircleIcon color="white" />
                    <Text fontSize="sm" color="white" fontWeight="500">
                      Setup in 2 minutes
                    </Text>
                  </HStack>
                </HStack>
              </VStack>

              <Box pt={6}>
                <Text fontSize="xs" color="whiteAlpha.800">
                  🔒 Your data is encrypted and secure • 🌍 Access from anywhere • 📱 Works on all devices
                </Text>
              </Box>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  )
}
