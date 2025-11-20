import { Box, Text, HStack, Badge, useColorModeValue, Image } from '@chakra-ui/react'
import logoImage from '../../../../assets/logo.png'

interface LogoProps {
  user?: any
}

export default function Logo({ user }: LogoProps) {
  // Premium Gradient Colors
  const iconGradient = useColorModeValue(
    'linear(to-br, blue.400, purple.500)',
    'linear(to-br, blue.300, purple.400)'
  )
  const titleColor = useColorModeValue('gray.800', 'white')
  const subtitleColor = useColorModeValue('gray.500', 'gray.400')
  
  // Glass effect for icon container
  const iconBg = useColorModeValue(
    'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
    'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
  )
  const iconShadow = useColorModeValue(
    '0 8px 16px rgba(59,130,246,0.15)',
    '0 8px 16px rgba(0,0,0,0.3)'
  )

  return (
    <HStack
      spacing={{ base: 1.5, sm: 2, md: 3 }}
      as="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      _hover={{ 
        opacity: 1,
        transform: 'scale(1.02)'
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      minW={0}
      flexShrink={1}
    >
      <Box
        p={{ base: 1, sm: 1.5, md: 2 }}
        bg="transparent"
        rounded={{ base: 'lg', md: '2xl' }}
        position="relative"
        overflow="hidden"
        flexShrink={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Image
          src={logoImage}
          alt="Personal Budget Logo"
          boxSize={{ base: 6, sm: 7, md: 9, lg: 10 }}
          objectFit="contain"
          position="relative"
          zIndex={1}
        />
      </Box>

      <Box textAlign="left" minW={0} flexShrink={1}>
        <HStack spacing={1.5} align="center" flexWrap="nowrap">
          <Text
            fontSize={{ base: 'xs', sm: 'lg', md: '2xl', lg: '3xl' }}
            fontWeight="900"
            letterSpacing="-0.03em"
            bgGradient={useColorModeValue(
              'linear(to-r, gray.900, gray.700)',
              'linear(to-r, white, gray.200)'
            )}
            bgClip="text"
            lineHeight="1"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            <Text as="span" display={{ base: 'inline', sm: 'none' }}>
              P<Text as="span" color={useColorModeValue('blue.500', 'blue.300')}>.</Text> Budget
            </Text>
            <Text as="span" display={{ base: 'none', sm: 'inline' }}>
              Personal
              <Text as="span" color={useColorModeValue('blue.500', 'blue.300')}>.</Text>
              Budget
            </Text>
          </Text>
          {!user && (
            <Badge
              colorScheme="blue"
              variant="solid"
              fontSize={{ base: '3xs', sm: '2xs', md: 'xs' }}
              px={{ base: 1, sm: 1.5, md: 2 }}
              py={0.5}
              rounded="full"
              textTransform="uppercase"
              letterSpacing="wider"
              fontWeight="bold"
              bgGradient="linear(to-r, blue.500, purple.500)"
              border="1px solid"
              borderColor="whiteAlpha.300"
              boxShadow="sm"
              flexShrink={0}
              display={{ base: 'none', sm: 'inline-flex' }}
            >
              Free
            </Badge>
          )}
        </HStack>
        <Text
          fontSize={{ base: '3xs', sm: '2xs', md: 'xs' }}
          fontWeight="600"
          color={subtitleColor}
          letterSpacing="0.15em"
          textTransform="uppercase"
          opacity={0.8}
          mt={0.5}
          display={{ base: 'none', md: 'block' }}
        >
          Smart Financial Freedom
        </Text>
      </Box>
    </HStack>
  )
}

