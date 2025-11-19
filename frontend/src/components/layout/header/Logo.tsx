import { Box, Text, HStack, Badge, useColorModeValue, Icon } from '@chakra-ui/react'
import { Wallet } from 'lucide-react'

interface LogoProps {
  user?: any
}

export default function Logo({ user }: LogoProps) {
  const iconColor = useColorModeValue('brand.500', 'brand.400')
  const titleColor = useColorModeValue('gray.900', 'white')
  const subtitleColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <HStack
      spacing={3}
      as="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      _hover={{ opacity: 0.8 }}
      transition="opacity 0.2s"
    >
      <Box
        p={2}
        bg={useColorModeValue('brand.50', 'whiteAlpha.100')}
        rounded="xl"
        color={iconColor}
      >
        <Icon as={Wallet} boxSize={6} strokeWidth={2.5} />
      </Box>

      <Box textAlign="left">
        <HStack spacing={2} align="center">
          <Text
            fontSize={{ base: '1.0rem', md: '1.5rem', lg: '2rem' }}
            fontWeight="800"
            letterSpacing="tight"
            color={titleColor}
            lineHeight="1"
          >
            Personal Budget
          </Text>
          {!user && (
            <Badge
              colorScheme="green"
              variant="subtle"
              fontSize={{ base: '0.576rem', sm: 'xs' }}
              px={1.5}
              rounded="md"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Free
            </Badge>
          )}
        </HStack>
        <Text
          fontSize={{ base: '0.6rem', sm: 'xs' }}
          fontWeight="500"
          color={subtitleColor}
          letterSpacing="wide"
          textTransform="uppercase"
        >
          Financial Freedom
        </Text>
      </Box>
    </HStack>
  )
}

