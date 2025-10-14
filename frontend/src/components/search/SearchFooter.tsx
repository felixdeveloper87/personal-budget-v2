import { Box, HStack, Button, Icon, useColorModeValue } from '@chakra-ui/react'
import { Search } from 'lucide-react'

interface SearchFooterProps {
  onClearAll: () => void
  onSearch: () => void
}

export default function SearchFooter({ onClearAll, onSearch }: SearchFooterProps) {
  return (
    <Box 
      p={{ base: 4, sm: 5, md: 6 }} 
      borderTop="1px" 
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      bg={useColorModeValue('gray.50', 'gray.800')}
      sx={{
        // Safe area support for iPhone 14 Pro
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <HStack spacing={3} justify="space-between" w="full">
        <Button
          variant="outline"
          borderRadius="2xl"
          h={{ base: '52px', sm: '48px' }}
          px={{ base: 6, sm: 4 }}
          fontSize={{ base: 'md', sm: 'sm' }}
          fontWeight="600"
          borderColor={useColorModeValue('gray.300', 'gray.600')}
          color={useColorModeValue('gray.700', 'gray.300')}
          flex={{ base: 1, sm: 'none' }}
          _hover={{
            bg: useColorModeValue('gray.100', 'gray.700'),
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          }}
          _active={{
            transform: 'translateY(0)',
          }}
          onClick={onClearAll}
        >
          Clear All
        </Button>
        <Button
          bg={useColorModeValue(
            'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            'linear-gradient(135deg, #60a5fa, #3b82f6)'
          )}
          color="white"
          borderRadius="2xl"
          h={{ base: '52px', sm: '48px' }}
          px={{ base: 8, sm: 6 }}
          fontSize={{ base: 'md', sm: 'sm' }}
          fontWeight="600"
          boxShadow="lg"
          flex={{ base: 1, sm: 'none' }}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: 'xl',
          }}
          _active={{
            transform: 'translateY(0)',
          }}
          onClick={onSearch}
        >
          <HStack spacing={2}>
            <Icon as={Search} boxSize={4} />
            <span>Search</span>
          </HStack>
        </Button>
      </HStack>
    </Box>
  )
}
