import { Box, Button, Flex, HStack, Icon, VStack, Text, Heading, useColorModeValue } from '@chakra-ui/react'
import { Search, X } from 'lucide-react'

interface SearchHeaderProps {
  onClose: () => void
}

export default function SearchHeader({ onClose }: SearchHeaderProps) {
  return (
    <Box 
      p={{ base: 4, sm: 5, md: 6 }} 
      borderBottom="1px" 
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      position="relative"
      bg={useColorModeValue(
        'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #ffffff 100%)',
        'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
      )}
      sx={{
        // Safe area support for iPhone 14 Pro
        paddingTop: 'max(16px, env(safe-area-inset-top, 0px))',
      }}
    >
      {/* Fixed close button in top right corner */}
      <Button
        position="absolute"
        top={{ base: 4, sm: 5, md: 6 }}
        right={{ base: 4, sm: 5, md: 6 }}
        size="lg"
        variant="ghost"
        onClick={onClose}
        borderRadius="full"
        p={3}
        bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(15, 23, 42, 0.8)')}
        backdropFilter="blur(10px)"
        border="1px solid"
        borderColor={useColorModeValue('gray.300', 'gray.600')}
        _hover={{
          bg: useColorModeValue('red.50', 'red.900'),
          borderColor: 'red.300',
          transform: 'scale(1.1)',
          boxShadow: 'lg',
        }}
        _active={{
          transform: 'scale(0.95)',
        }}
        transition="all 0.2s ease"
        zIndex={10}
        boxShadow="md"
      >
        <Icon as={X} boxSize={5} color={useColorModeValue('gray.700', 'gray.200')} />
      </Button>

      <Flex
        direction={{ base: 'column', sm: 'row' }}
        align="center"
        justify="space-between"
        gap={4}
        pr={{ base: 16, sm: 20, md: 20 }} // Space for close button
      >
        <HStack spacing={4} align="center">
          <Box
            p={3}
            borderRadius="2xl"
            bg={useColorModeValue(
              'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              'linear-gradient(135deg, #60a5fa, #3b82f6)'
            )}
            boxShadow="lg"
            sx={{
              animation: 'glow 3s ease-in-out infinite',
              '@keyframes glow': {
                '0%, 100%': { 
                  boxShadow: '0 0 5px rgba(59, 130, 246, 0.3)' 
                },
                '50%': { 
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)' 
                }
              }
            }}
          >
            <Icon as={Search} boxSize={6} color="white" />
          </Box>
          <VStack align="start" spacing={1}>
            <Heading
              size={{ base: 'md', sm: 'lg' }}
              bg={useColorModeValue(
                'linear-gradient(135deg, #0f172a, #1e293b)',
                'linear-gradient(135deg, #f1f5f9, #cbd5e1)'
              )}
              bgClip="text"
              fontWeight="800"
            >
              Search Transactions
            </Heading>
            <Text
              fontSize={{ base: 'xs', sm: 'sm' }}
              color={useColorModeValue('gray.700', 'gray.200')}
              fontWeight="500"
            >
              Find your transactions quickly
            </Text>
          </VStack>
        </HStack>
      </Flex>
    </Box>
  )
}
