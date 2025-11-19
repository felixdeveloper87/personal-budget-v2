import { Box, Button } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { getSearchButtonStyles, searchButtonContainerStyles } from '../../ui'

interface SearchButtonProps {
  user?: any
  onSearchOpen: () => void
}

export default function SearchButton({ user, onSearchOpen }: SearchButtonProps) {
  if (!user) return null

  return (
    <Box
      {...searchButtonContainerStyles}
      display={{ base: 'none', lg: 'block' }}
      flexShrink={0}
    >
      <Button
        onClick={onSearchOpen}
        leftIcon={<SearchIcon />}
        {...getSearchButtonStyles()}
      >
        <Box as="span">
          Search...
        </Box>
        <Box
          as="span"
          ml={4}
          fontSize="xs"
          color="gray.400"
          display={{ base: 'none', xl: 'inline' }}
          border="1px solid"
          borderColor="gray.500"
          borderRadius="md"
          px={1.5}
          py={0.5}
        >
          ⌘K
        </Box>
      </Button>
    </Box>
  )
}
