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

  // Modern post-it inspired colors
  const footerBg = useColorModeValue(
    'rgba(255, 255, 255, 0.9)',
    'rgba(255, 255, 255, 0.05)'
  )
  const brandTextColor = useColorModeValue('gray.800', 'gray.100')
  const subtitleColor = useColorModeValue('gray.600', 'gray.300')

  const textSecondary = useColorModeValue(colors.text.secondary, 'gray.300')
  const textPrimary = useColorModeValue(colors.text.primary, 'white')

  return (
    <Box
      as="footer"
      bg={footerBg}
      backdropFilter="blur(10px)"
      borderTop="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.600')}
      mt="auto"
      w="100%"
      position="relative"
    >
      {/* Simple top border */}
      <Box
        height="3px"
        bg={useColorModeValue('blue.200', 'blue.500')}
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
                bg={useColorModeValue('#dbeafe', '#1e293b')} // Azul post-it
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px solid"
                borderColor={useColorModeValue('blue.200', 'blue.500')}
                boxShadow="sm"
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderColor: useColorModeValue('blue.300', 'blue.400')
                }}
                transition="all 0.2s ease"
              >
                <Text 
                  fontSize={{ base: 'xl', lg: '2xl' }} 
                  fontWeight="bold" 
                  color={useColorModeValue('blue.600', 'blue.300')}
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  £
                </Text>
              </Box>
              <VStack spacing={0} align="start">
                <Heading 
                  size="md" 
                  color={brandTextColor} 
                  fontWeight="700"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  Personal Budget
                </Heading>
                <Text 
                  fontSize="sm" 
                  color={subtitleColor} 
                  fontWeight="500"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
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
                  borderRadius="xl"
                  fontSize="xs"
                  bg={useColorModeValue(
                    color === 'green' ? '#dcfce7' : color === 'blue' ? '#dbeafe' : '#f3e8ff',
                    color === 'green' ? '#1f2937' : color === 'blue' ? '#1e293b' : '#2d1b1b'
                  )}
                  color={useColorModeValue(
                    color === 'green' ? 'green.600' : color === 'blue' ? 'blue.600' : 'purple.600',
                    color === 'green' ? 'green.300' : color === 'blue' ? 'blue.300' : 'purple.300'
                  )}
                  border="1px solid"
                  borderColor={useColorModeValue(
                    color === 'green' ? 'green.200' : color === 'blue' ? 'blue.200' : 'purple.200',
                    color === 'green' ? 'green.500' : color === 'blue' ? 'blue.500' : 'purple.500'
                  )}
                  fontWeight="500"
                  fontFamily="system-ui, -apple-system, sans-serif"
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
              <Text 
                fontSize="md" 
                fontWeight="700" 
                color={useColorModeValue('gray.800', 'gray.100')} 
                mb={1}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {section.title}
              </Text>
              {section.links.map((item) => (
                <Link
                  key={item}
                  href="#"
                  color={useColorModeValue('gray.600', 'gray.300')}
                  _hover={{
                    color: useColorModeValue('blue.600', 'blue.300'),
                    transform: 'translateX(2px)',
                  }}
                  fontSize={{ base: 'sm', lg: 'md' }}
                  fontWeight="500"
                  fontFamily="system-ui, -apple-system, sans-serif"
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
              borderColor={useColorModeValue('gray.200', 'gray.600')}
              color={useColorModeValue('gray.600', 'gray.300')}
              bg={useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.05)')}
              backdropFilter="blur(10px)"
              _hover={{
                bg: useColorModeValue('#dbeafe', '#1e293b'),
                color: useColorModeValue('blue.600', 'blue.300'),
                borderColor: useColorModeValue('blue.300', 'blue.500'),
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              transition="all 0.2s ease"
            />
          </Tooltip>
        </Flex>
      </Container>
    </Box>
  )
}
