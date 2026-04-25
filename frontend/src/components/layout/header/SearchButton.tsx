import { Box, Button, Kbd, HStack, Text, useColorModeValue } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'

interface SearchButtonProps {
  user?: any
  onSearchOpen: () => void
}

export default function SearchButton({ user, onSearchOpen }: SearchButtonProps) {
  if (!user) return null

  const buttonBg = useColorModeValue('white', 'whiteAlpha.100')
  const buttonBorder = useColorModeValue('gray.200', 'whiteAlpha.300')
  const textColor = useColorModeValue('gray.600', 'gray.200')
  const hintBg = useColorModeValue('gray.50', 'whiteAlpha.200')
  const hintBorder = useColorModeValue('gray.300', 'whiteAlpha.300')
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.200')
  const hoverBorderColor = useColorModeValue('blue.200', 'blue.400')
  const hoverTextColor = useColorModeValue('gray.800', 'white')

  return (
    <Box
      display={{ base: 'none', xl: 'block' }}
      flexShrink={0}
    >
      <Button
        onClick={onSearchOpen}
        leftIcon={<SearchIcon />}
        variant="ghost"
        h="38px"
        px={3}
        bg={buttonBg}
        border="1px solid"
        borderColor={buttonBorder}
        borderRadius="xl"
        color={textColor}
        minW={{ xl: '210px', '2xl': '230px' }}
        justifyContent="space-between"
        _hover={{
          bg: hoverBg,
          borderColor: hoverBorderColor,
          color: hoverTextColor,
          transform: 'translateY(-1px)',
        }}
        _active={{ transform: 'translateY(0)' }}
        transition="all 0.2s ease"
      >
        <HStack w="full" justify="space-between" spacing={3}>
          <Text fontSize="sm" fontWeight="500">Search</Text>
          <Kbd
            fontSize="xs"
            px={1.5}
            py={0.5}
            borderRadius="md"
            bg={hintBg}
            borderColor={hintBorder}
            display={{ base: 'none', xl: 'inline-flex' }}
          >
            Ctrl K
          </Kbd>
        </HStack>
      </Button>
    </Box>
  )
}
