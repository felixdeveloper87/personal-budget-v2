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
        size={{ lg: 'md', xl: 'md' }}
        fontSize={{ lg: 'sm', xl: 'md' }}
        px={{ lg: 3, xl: 4 }}
      >
        <Box as="span" display={{ lg: 'none', xl: 'inline' }}>
          Search & Filters
        </Box>
        <Box as="span" display={{ lg: 'inline', xl: 'none' }}>
          Search
        </Box>
      </Button>
    </Box>
  )
}
