import {
  Box,
  Container,
  Flex,
  VStack,
  HStack,
  Text,
  Link,
  Divider,
  useColorModeValue,
  SimpleGrid,
  Badge,
  Tooltip,
  IconButton,
  Icon,
  Heading,
} from '@chakra-ui/react'
import { ArrowUp, Heart, Shield, Lock, Zap } from 'lucide-react'
import { useThemeColors } from '../../hooks/useThemeColors'

const linkSections = [
  {
    title: 'Quick Links',
    links: ['Dashboard', 'Analytics', 'Transactions', 'Settings'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Documentation', 'Contact Us', 'Status'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Licenses'],
  },
]

export default function Footer() {
  const colors = useThemeColors()
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  // Precompute color values (for perf + readability)
  const bgGradient = useColorModeValue(
    'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(16,185,129,0.05) 50%, rgba(139,92,246,0.05) 100%)',
    'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(16,185,129,0.1) 50%, rgba(139,92,246,0.1) 100%)'
  )
  const brandText = useColorModeValue(
    'linear-gradient(135deg, #1e293b, #475569)',
    'linear-gradient(135deg, #f8fafc, #e2e8f0)'
  )

  const textSecondary = useColorModeValue(colors.text.secondary, 'gray.300')
  const textPrimary = useColorModeValue(colors.text.primary, 'white')

  return (
    <Box
      as="footer"
      bg={colors.bgSecondary}
      borderTop="1px solid"
      borderColor={colors.border}
      mt="auto"
      w="100%"
      position="relative"
      overflow="hidden"
      zIndex={0}
    >
      {/* ✨ Background Glow */}
      <Box
        position="absolute"
        top="-100px"
        left="-100px"
        right="-100px"
        height="200px"
        background={bgGradient}
        borderRadius="3xl"
        filter="blur(40px)"
        opacity={0.6}
        zIndex={0}
      />

      <Container
        maxW={{ base: '100%', xl: '1400px', '2xl': '1600px' }}
        px={{ base: 4, md: 8, lg: 12, xl: 16 }}
        py={{ base: 8, md: 12, lg: 16 }}
        position="relative"
        zIndex={1}
      >
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 8, md: 10, lg: 12 }}>
          {/* 🪙 Brand Section */}
          <VStack align="start" spacing={5}>
            <HStack spacing={4}>
              <Box
                w={{ base: 10, lg: 12 }}
                h={{ base: 10, lg: 12 }}
                bg={colors.buttonGradient}
                borderRadius="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow={colors.shadow}
                sx={{
                  animation: 'glow 3s ease-in-out infinite',
                  '@keyframes glow': {
                    '0%, 100%': {
                      boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                    },
                    '50%': {
                      boxShadow:
                        '0 4px 20px rgba(59,130,246,0.5), 0 0 30px rgba(59,130,246,0.3)',
                    },
                  },
                }}
              >
                <Text fontSize={{ base: 'xl', lg: '2xl' }} fontWeight="bold" color="white">
                  £
                </Text>
              </Box>
              <VStack spacing={0} align="start">
                <Heading size="md" bg={brandText} bgClip="text" fontWeight="800">
                  Personal Budget
                </Heading>
                <Text fontSize="sm" color={textSecondary} fontWeight="500">
                  Financial Management
                </Text>
              </VStack>
            </HStack>

            <Text fontSize={{ base: 'sm', lg: 'md' }} color={textSecondary} lineHeight="1.6">
              Take control of your finances with smart tracking and insights.
            </Text>

            <HStack spacing={2} flexWrap="wrap">
              {[
                { icon: Zap, text: '100% Free', color: 'green' },
                { icon: Shield, text: 'Secure', color: 'blue' },
                { icon: Lock, text: 'Private', color: 'purple' },
              ].map(({ icon, text, color }) => (
                <Badge
                  key={text}
                  px={3}
                  py={1}
                  borderRadius="lg"
                  fontSize="xs"
                  bg={useColorModeValue(`${color}.50`, `${color}.900`)}
                  color={useColorModeValue(`${color}.700`, `${color}.300`)}
                  border="1px solid"
                  borderColor={useColorModeValue(`${color}.200`, `${color}.700`)}
                  fontWeight="600"
                >
                  <HStack spacing={1}>
                    <Icon as={icon} boxSize={3} />
                    <Text>{text}</Text>
                  </HStack>
                </Badge>
              ))}
            </HStack>
          </VStack>

          {/* 🔗 Link Sections */}
          {linkSections.map((section) => (
            <VStack key={section.title} align="start" spacing={3}>
              <Text fontSize="md" fontWeight="700" color={textPrimary} mb={1}>
                {section.title}
              </Text>
              {section.links.map((item) => (
                <Link
                  key={item}
                  href="#"
                  color={textSecondary}
                  _hover={{
                    color: colors.accent,
                    transform: 'translateX(4px)',
                  }}
                  fontSize={{ base: 'sm', lg: 'md' }}
                  fontWeight="500"
                  transition="all 0.2s ease"
                >
                  {item}
                </Link>
              ))}
            </VStack>
          ))}
        </SimpleGrid>

        <Divider my={{ base: 6, md: 8 }} borderColor={colors.border} />

        {/* 🧭 Bottom Bar */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          gap={{ base: 4, lg: 6 }}
        >
          <VStack spacing={2} align={{ base: 'center', md: 'start' }}>
            <Text fontSize="sm" color={textSecondary} fontWeight="500">
              © {new Date().getFullYear()} Personal Budget. All rights reserved.
            </Text>
            <HStack spacing={2} fontSize="sm" color={textSecondary}>
              <Text>Made with</Text>
              <Icon as={Heart} boxSize={3} color="red.500" />
              <Text>for better financial health</Text>
            </HStack>
          </VStack>

          <Tooltip label="Back to top" hasArrow>
            <IconButton
              aria-label="Scroll to top"
              icon={<ArrowUp size={16} />}
              size="md"
              variant="outline"
              borderRadius="xl"
              onClick={scrollToTop}
              borderColor={colors.border}
              color={textSecondary}
              bg={useColorModeValue('white', 'gray.800')}
              _hover={{
                bg: colors.accent,
                color: 'white',
                borderColor: colors.accent,
                transform: 'translateY(-2px)',
                boxShadow: colors.shadowHover,
              }}
              transition="all 0.25s ease"
            />
          </Tooltip>
        </Flex>
      </Container>
    </Box>
  )
}
