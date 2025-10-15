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
    <Box {...searchButtonContainerStyles}>
      <Button
        onClick={onSearchOpen}
        leftIcon={<SearchIcon />}
        {...getSearchButtonStyles()}
      >
        Search & Filters
      </Button>
    </Box>
  )
}
