import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  SimpleGrid,
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
            // Light mode → azul/roxo translúcido visível
            "radial(circle at 30% 30%, rgba(59,130,246,0.2), rgba(139,92,246,0.15), transparent 70%)",
            // Dark mode → azul forte, mais contraste
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
          maxW="7xl"
          py={{ base: 14, sm: 20, md: 28 }}
          px={{ base: 4, sm: 6, md: 8 }}
          position="relative"
          zIndex={1}
        >
          <VStack spacing={{ base: 6, sm: 8 }} textAlign="center">
            {/* Title */}
            <Heading
              fontSize={{ base: "2xl", sm: "3xl", md: "5xl" }}
              lineHeight="1.2"
              fontWeight="extrabold"
            >
              <Text
                as="span"
                bgGradient="linear(to-r, blue.400, purple.400, pink.400)"
                bgClip="text"
                display="block"
              >
                Personal Budget
              </Text>
              <Text
                as="span"
                color={useColorModeValue("gray.700", "gray.200")}
                display="block"
              >
                Simple. Secure. Free.
              </Text>
            </Heading>

            {/* Subheadline */}
            <Text
              fontSize={{ base: "sm", sm: "md", md: "lg" }}
              color={useColorModeValue("gray.600", "gray.300")}
              maxW="xl"
            >
              Track income and expenses with ease. Gain clarity and control over your money.
            </Text>

            {/* Call to Actions */}
            <VStack spacing={3} w={{ base: "full", sm: "auto" }}>
              <MotionButton
                size="lg"
                colorScheme="brand"
                rightIcon={<ArrowForwardIcon />}
                onClick={onGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                px={{ base: 6, sm: 8 }}
                py={{ base: 4, sm: 6 }}
                fontSize={{ base: "md", sm: "lg" }}
                fontWeight="600"
                borderRadius="xl"
                w={{ base: "full", sm: "auto" }}
                bg="linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)"
                _hover={{
                  bg: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(14, 165, 233, 0.4)",
                }}
                _active={{ transform: "translateY(0)" }}
              >
                Get Started Free
              </MotionButton>

              <Button
                size="lg"
                variant="outline"
                leftIcon={<ViewIcon />}
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
                }}
                px={{ base: 6, sm: 8 }}
                py={{ base: 4, sm: 6 }}
                fontSize={{ base: "md", sm: "lg" }}
                fontWeight="600"
                borderRadius="xl"
                w={{ base: "full", sm: "auto" }}
                borderColor={useColorModeValue("gray.300", "gray.600")}
                color={useColorModeValue("gray.700", "gray.200")}
                _hover={{
                  bg: useColorModeValue("gray.50", "gray.700"),
                  borderColor: useColorModeValue("gray.400", "gray.500"),
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
                }}
                _active={{ transform: "translateY(0)" }}
              >
                View Features
              </Button>
            </VStack>
          </VStack>
        </Container>
      </Box>
      {/* Features Section */}
      <Box id="features" py={{ base: 12, sm: 16, md: 20, lg: 24 }} bg={useColorModeValue('gray.50', 'gray.800')}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, md: 8 }}>
          <VStack spacing={{ base: 12, sm: 16, md: 20 }}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Heading size={{ base: "xl", sm: "2xl" }} mb={{ base: 3, sm: 4 }}>
                Powerful Features
              </Heading>
              <Text fontSize={{ base: "md", sm: "lg" }} color={textColor} maxW="2xl" px={{ base: 2, sm: 0 }}>
                Everything you need to have complete control of your finances
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 6, sm: 8 }} w="full">
              {features.map((feature, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  p={{ base: 5, sm: 6 }}
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
                  <VStack spacing={{ base: 3, sm: 4 }}>
                    <Box>{feature.icon}</Box>
                    <Heading size={{ base: "sm", sm: "md" }} lineHeight="1.2">
                      {feature.title}
                    </Heading>
                    <Text color={textColor} fontSize={{ base: "xs", sm: "sm" }} lineHeight="1.4">
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
      <Box py={{ base: 12, sm: 16, md: 20, lg: 24 }}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, md: 8 }}>
          <VStack spacing={{ base: 12, sm: 16, md: 20 }}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              textAlign="center"
            >
              <Heading size={{ base: "xl", sm: "2xl" }} mb={{ base: 3, sm: 4 }}>
                Why Choose Personal Budget?
              </Heading>
              <Text fontSize={{ base: "md", sm: "lg" }} color={textColor} px={{ base: 2, sm: 0 }}>
                A simple, secure, and free way to manage your money
              </Text>
            </MotionBox>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, sm: 8 }} w="full">
              {benefits.map((benefit, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  p={{ base: 5, sm: 6 }}
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
                  <VStack spacing={{ base: 3, sm: 4 }}>
                    <Heading size={{ base: "sm", sm: "md" }} color="blue.500" lineHeight="1.2">
                      {benefit.title}
                    </Heading>
                    <Text color={textColor} fontSize={{ base: "sm", sm: "md" }} lineHeight="1.4">
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
      <Box py={{ base: 12, sm: 16, md: 20, lg: 24 }} bg={useColorModeValue('blue.50', 'blue.900')}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, md: 8 }}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            textAlign="center"
          >
            <VStack spacing={{ base: 6, sm: 8, md: 10 }}>
              <Heading size={{ base: "xl", sm: "2xl" }}>
                Ready to take control of your money?
              </Heading>
              <Text fontSize={{ base: "md", sm: "lg" }} color={textColor} maxW="2xl" px={{ base: 2, sm: 0 }}>
                Start managing your personal budget today.
                It's completely free and takes less than 2 minutes to get started.
              </Text>
              <MotionButton
                size={{ base: "md", sm: "lg" }}
                colorScheme="brand"
                rightIcon={<ArrowForwardIcon />}
                onClick={onGetStarted}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                px={{ base: 6, sm: 8 }}
                py={{ base: 4, sm: 6 }}
                fontSize={{ base: "md", sm: "lg" }}
                fontWeight="600"
                borderRadius="xl"
                w={{ base: "full", sm: "auto" }}
                maxW={{ base: "100%", sm: "md" }}
                bg="linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)"
                _hover={{
                  bg: "linear-gradient(135deg, #0284c7 0%, #2563eb 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(14, 165, 233, 0.4)",
                }}
                _active={{ transform: "translateY(0)" }}
              >
                Get Started Free
              </MotionButton>
              <Text fontSize={{ base: "xs", sm: "sm" }} color={textColor} px={{ base: 4, sm: 0 }} textAlign="center">
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
