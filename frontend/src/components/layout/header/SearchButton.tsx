import { Box, Button, useColorModeValue } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'

interface SearchButtonProps {
  user?: any
  onSearchOpen: () => void
}

export default function SearchButton({ user, onSearchOpen }: SearchButtonProps) {
  const textColor = useColorModeValue('gray.800', 'white')

  if (!user) return null

  return (
    <Box
      flex="1"
      maxW={{ lg: "300px", xl: "400px" }}
      display={{ base: 'none', lg: 'flex' }}
      justifyContent="center"
    >
      <Button
        onClick={onSearchOpen}
        leftIcon={<SearchIcon />}
        size={{ lg: "sm", xl: "md" }}
        px={{ lg: 6, xl: 8 }}
        fontWeight="700"
        fontSize={{ lg: "sm", xl: "md" }}
        borderRadius="2xl"
        variant="outline"
        borderColor={useColorModeValue('gray.300', 'gray.600')}
        color={textColor}
        bg={useColorModeValue(
          'linear-gradient(135deg, #f8fafc, #e2e8f0)',
          'linear-gradient(135deg, #1e293b, #334155)'
        )}
        _hover={{
          bg: useColorModeValue(
            'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
            'linear-gradient(135deg, #334155, #475569)'
          ),
          borderColor: 'blue.500',
          color: 'blue.500',
          transform: 'translateY(-1px)',
          boxShadow: 'md'
        }}
        transition="all 0.2s ease"
        boxShadow="sm"
      >
        Search & Filters
      </Button>
    </Box>
  )
}
