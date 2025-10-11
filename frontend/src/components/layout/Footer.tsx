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
} from '@chakra-ui/react'
import {
  ArrowUpIcon,
} from '@chakra-ui/icons'

export default function Footer() {
  const bg = useColorModeValue('gray.50', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.300')
  const linkColor = useColorModeValue('blue.600', 'blue.400')

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      <Box as="footer" bg={bg} borderTop="1px solid" borderColor={borderColor} mt="auto" w="100%">

        {/* Main Footer Content */}
        <Container maxW={{ base: "100%", xl: "1400px", "2xl": "1600px" }} px={{ base: 4, md: 8, lg: 12, xl: 16 }} py={{ base: 10, md: 14, lg: 16 }}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 8, md: 10, lg: 12 }}>

            {/* Brand */}
            <VStack align="start" spacing={{ base: 4, lg: 5 }}>
              <HStack spacing={{ base: 3, lg: 4 }}>
                <Box 
                  w={{ base: 10, lg: 12 }}
                  h={{ base: 10, lg: 12 }}
                  bg={useColorModeValue(
                    'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                    'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
                  )}
                  borderRadius="xl" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                  boxShadow="0 4px 12px rgba(59, 130, 246, 0.3)"
                >
                  <Text fontSize={{ base: "xl", lg: "2xl" }} fontWeight="bold" color="white">£</Text>
                </Box>
                <VStack spacing={0} align="start">
                  <Text fontSize={{ base: "md", lg: "lg" }} fontWeight="bold" color={textColor}>Personal Budget</Text>
                  <Text fontSize={{ base: "xs", lg: "sm" }} color={secondaryTextColor}>Financial Management</Text>
                </VStack>
              </HStack>
              <Text fontSize={{ base: "sm", lg: "md" }} color={secondaryTextColor} lineHeight="1.6">
                Take control of your finances with smart tracking and insights.
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                <Badge colorScheme="green" px={3} py={1} fontSize={{ base: "2xs", lg: "xs" }} borderRadius="md">100% Free</Badge>
                <Badge colorScheme="blue" px={3} py={1} fontSize={{ base: "2xs", lg: "xs" }} borderRadius="md">Secure</Badge>
                <Badge colorScheme="purple" px={3} py={1} fontSize={{ base: "2xs", lg: "xs" }} borderRadius="md">Private</Badge>
              </HStack>
            </VStack>

            {/* Product */}
            <VStack align="start" spacing={{ base: 3, lg: 4 }}>
              <Text fontSize={{ base: "sm", lg: "md" }} fontWeight="bold" color={textColor} mb={1}>Product</Text>
              {['Features', 'Dashboard', 'Analytics', 'Pricing'].map((item) => (
                <Link 
                  key={item} 
                  href="#" 
                  color={secondaryTextColor} 
                  _hover={{ color: linkColor }} 
                  fontSize={{ base: "sm", lg: "md" }}
                  transition="all 0.2s"
                >
                  {item}
                </Link>
              ))}
            </VStack>

            {/* Company */}
            <VStack align="start" spacing={{ base: 3, lg: 4 }}>
              <Text fontSize={{ base: "sm", lg: "md" }} fontWeight="bold" color={textColor} mb={1}>Company</Text>
              {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                <Link 
                  key={item} 
                  href="#" 
                  color={secondaryTextColor} 
                  _hover={{ color: linkColor }} 
                  fontSize={{ base: "sm", lg: "md" }}
                  transition="all 0.2s"
                >
                  {item}
                </Link>
              ))}
            </VStack>

            {/* Legal */}
            <VStack align="start" spacing={{ base: 3, lg: 4 }}>
              <Text fontSize={{ base: "sm", lg: "md" }} fontWeight="bold" color={textColor} mb={1}>Legal</Text>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Licenses'].map((item) => (
                <Link 
                  key={item} 
                  href="#" 
                  color={secondaryTextColor} 
                  _hover={{ color: linkColor }} 
                  fontSize={{ base: "sm", lg: "md" }}
                  transition="all 0.2s"
                >
                  {item}
                </Link>
              ))}
            </VStack>
          </SimpleGrid>

          <Divider my={{ base: 8, md: 10 }} borderColor={borderColor} />

          {/* Bottom Section */}
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            align="center" 
            gap={{ base: 4, lg: 6 }}
          >
            <VStack spacing={{ base: 2, lg: 3 }} align={{ base: 'center', md: 'start' }}>
              <Text fontSize={{ base: "sm", lg: "md" }} color={secondaryTextColor} fontWeight="500">
                © 2025 Personal Budget. All rights reserved.
              </Text>
              <HStack spacing={2} fontSize={{ base: "xs", lg: "sm" }} color={secondaryTextColor}>
                <Text>Made with</Text>
                <Text color="red.500" fontSize={{ base: "sm", lg: "md" }}>❤️</Text>
                <Text>for better financial health</Text>
              </HStack>
            </VStack>
            
            <HStack spacing={{ base: 3, lg: 4 }}>
              <Tooltip label="Back to top">
                <IconButton 
                  aria-label="scroll to top" 
                  icon={<ArrowUpIcon />} 
                  size={{ base: "sm", lg: "md" }}
                  variant="ghost"
                  borderRadius="lg"
                  onClick={scrollToTop}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.700'),
                    color: 'blue.500',
                    transform: 'translateY(-2px)'
                  }}
                  transition="all 0.2s"
                />
              </Tooltip>
            </HStack>
          </Flex>
        </Container>
      </Box>

    </>
  )
}
