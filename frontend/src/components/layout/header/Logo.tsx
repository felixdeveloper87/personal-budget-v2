import { Box, Text, HStack, VStack, Badge, useColorModeValue } from '@chakra-ui/react'
import { useAuth } from '../../../contexts/AuthContext'
import { getShimmerStyles } from '../../../utils/ui'

interface LogoProps {
  user?: any
}

export default function Logo({ user }: LogoProps) {
  const bg = useColorModeValue(
    'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
    'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))'
  )

  return (
    <HStack spacing={{ base: 3, md: 4, lg: 5 }} flex="1" minW="fit-content">
      <Box
        as="button"
        position="relative"
        w={{ base: 12, md: 16, lg: 20, xl: 24 }}
        h={{ base: 12, md: 16, lg: 20, xl: 24 }}
        flexShrink={0}
        bg={useColorModeValue(
          'linear-gradient(135deg, #3b82f6, #1d4ed8, #7c3aed, #10b981)',
          'linear-gradient(135deg, #60a5fa, #3b82f6, #a78bfa, #34d399)'
        )}
        borderRadius="3xl"
        display="flex"
        alignItems="center"
        justifyContent="center"
        transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        boxShadow={useColorModeValue(
          '0 20px 50px rgba(59, 130, 246, 0.6), 0 8px 25px rgba(124, 58, 237, 0.4), 0 0 40px rgba(16, 185, 129, 0.3)',
          '0 20px 50px rgba(96, 165, 250, 0.7), 0 8px 25px rgba(167, 139, 250, 0.5), 0 0 40px rgba(52, 211, 153, 0.4)'
        )}
        overflow="visible"
        sx={{
          animation: 'glow 3s ease-in-out infinite, float 4s ease-in-out infinite, pulse 2s ease-in-out infinite',
          '@keyframes glow': {
            '0%, 100%': { 
              boxShadow: useColorModeValue(
                '0 20px 50px rgba(59, 130, 246, 0.6), 0 8px 25px rgba(124, 58, 237, 0.4), 0 0 40px rgba(16, 185, 129, 0.3)',
                '0 20px 50px rgba(96, 165, 250, 0.7), 0 8px 25px rgba(167, 139, 250, 0.5), 0 0 40px rgba(52, 211, 153, 0.4)'
              )
            },
            '50%': { 
              boxShadow: useColorModeValue(
                '0 25px 60px rgba(59, 130, 246, 0.8), 0 12px 35px rgba(124, 58, 237, 0.6), 0 0 50px rgba(16, 185, 129, 0.5), 0 0 80px rgba(59, 130, 246, 0.3)',
                '0 25px 60px rgba(96, 165, 250, 0.9), 0 12px 35px rgba(167, 139, 250, 0.7), 0 0 50px rgba(52, 211, 153, 0.6), 0 0 80px rgba(96, 165, 250, 0.4)'
              )
            }
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '25%': { transform: 'translateY(-3px) rotate(1deg)' },
            '50%': { transform: 'translateY(-5px) rotate(0deg)' },
            '75%': { transform: 'translateY(-3px) rotate(-1deg)' }
          },
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' }
          }
        }}
        _hover={{ 
          transform: 'translateY(-6px) scale(1.12)',
          boxShadow: useColorModeValue(
            '0 30px 70px rgba(59, 130, 246, 0.7), 0 12px 35px rgba(124, 58, 237, 0.5), 0 0 60px rgba(16, 185, 129, 0.4)',
            '0 30px 70px rgba(96, 165, 250, 0.8), 0 12px 35px rgba(167, 139, 250, 0.6), 0 0 60px rgba(52, 211, 153, 0.5)'
          ),
          cursor: 'pointer',
          '& > *': {
            transform: 'scale(1.1)',
            filter: 'brightness(1.2)'
          }
        }}
        _active={{ 
          transform: 'translateY(-3px) scale(1.08)',
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Text
          fontSize={{ base: '2xl', md: '4xl', lg: '5xl', xl: '6xl' }}
          fontWeight="black"
          color="white"
          textShadow="0 6px 12px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(255, 255, 255, 0.3)"
          filter="drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))"
          lineHeight="1"
          display="flex"
          alignItems="center"
          justifyContent="center"
          minH="100%"
          minW="100%"
          sx={{
            background: 'linear-gradient(45deg, #ffffff, #f0f9ff, #ffffff, #e0f2fe)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' }
            }
          }}
        >
          £
        </Text>
        {user && (
          <Box
            position="absolute"
            top="-2px"
            right="-2px"
            w="8px"
            h="8px"
            bg="green.400"
            borderRadius="full"
            border="2px solid"
            borderColor={bg}
          />
        )}
      </Box>

      <VStack
        spacing={0}
        align="start"
        minW={0}
        display={{ base: 'none', sm: 'flex' }}
      >
        <HStack spacing={2}>
          <Text
            fontSize={{ base: 'lg', md: 'xl', lg: '2xl', xl: '3xl' }}
            fontWeight="900"
            bg={useColorModeValue(
              'linear-gradient(135deg, #1e293b, #475569, #64748b, #334155)',
              'linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1, #94a3b8)'
            )}
            bgClip="text"
            letterSpacing="wide"
            textShadow={useColorModeValue(
              '0 2px 4px rgba(0, 0, 0, 0.1)',
              '0 2px 4px rgba(255, 255, 255, 0.1)'
            )}
            sx={{
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
            }}
          >
            Personal Budget
          </Text>
          {!user && (
            <Badge
              colorScheme="green"
              fontSize={{ base: "xs", sm: "sm", lg: "sm" }}
              px={3}
              py={1}
              borderRadius="full"
              fontWeight="700"
              boxShadow="sm"
              bg="linear-gradient(135deg, #22c55e, #16a34a)"
              color="white"
            >
              Free
            </Badge>
          )}
        </HStack>
        <Text
          fontSize={{ base: "xs", lg: "sm" }}
          color={useColorModeValue('gray.600', 'gray.300')}
          noOfLines={1}
        >
          Financial Management
        </Text>
      </VStack>
    </HStack>
  )
}
