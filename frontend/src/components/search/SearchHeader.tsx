import { useEffect, useRef } from 'react'
import {
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  useColorModeValue,
} from '@chakra-ui/react'
import { Search, X } from '../ui/icons'

interface SearchFieldProps {
  searchText: string
  onSearchTextChange: (value: string) => void
  /** When true, focus the input on open. Defaults to true. */
  autoFocus?: boolean
}

/**
 * Spotlight-style search field.
 *
 * Lives at the top of the filters modal body — the title / close button are
 * handled by the shared <ModalHeader/> so every modal shares one header look.
 * No looped animations — the modal stays cheap to keep open.
 */
export default function SearchHeader({
  searchText,
  onSearchTextChange,
  autoFocus = true,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const closeHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')
  const inputBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const inputBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const inputColor = useColorModeValue('gray.900', 'gray.50')
  const placeholderColor = useColorModeValue('gray.400', 'gray.600')
  const iconColor = useColorModeValue('gray.400', 'gray.500')
  const focusBorder = useColorModeValue('#3b82f6', '#60a5fa')
  const focusGlow = useColorModeValue(
    'rgba(59, 130, 246, 0.18)',
    'rgba(96, 165, 250, 0.28)',
  )
  const kbdBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const kbdColor = useColorModeValue('gray.500', 'gray.400')

  useEffect(() => {
    if (autoFocus) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 80)
      return () => window.clearTimeout(t)
    }
  }, [autoFocus])

  return (
    <InputGroup size="md">
      <InputLeftElement pointerEvents="none" h="46px" color={iconColor}>
        <Search size={16} weight="bold" />
      </InputLeftElement>
      <Input
        ref={inputRef}
        value={searchText}
        onChange={(e) => onSearchTextChange(e.target.value)}
        placeholder="Search by description…"
        h={{ base: '44px', sm: '46px' }}
        pl={10}
        pr={searchText ? 24 : 16}
        bg={inputBg}
        border="1px solid"
        borderColor={inputBorder}
        color={inputColor}
        fontSize="sm"
        fontWeight={500}
        borderRadius="xl"
        _placeholder={{ color: placeholderColor }}
        _hover={{ borderColor: focusBorder }}
        _focus={{
          borderColor: focusBorder,
          boxShadow: `0 0 0 3px ${focusGlow}`,
        }}
        _focusVisible={{
          borderColor: focusBorder,
          boxShadow: `0 0 0 3px ${focusGlow}`,
        }}
        transition="border-color 0.15s ease, box-shadow 0.15s ease"
      />
      <InputRightElement h="46px" pr={3} width="auto">
        <HStack spacing={1}>
          {searchText && (
            <IconButton
              aria-label="Clear search"
              icon={<X size={14} weight="bold" />}
              onClick={() => onSearchTextChange('')}
              size="xs"
              variant="ghost"
              color={iconColor}
              _hover={{ bg: closeHoverBg }}
            />
          )}
          <HStack spacing={0.5} display={{ base: 'none', sm: 'flex' }} opacity={0.85}>
            <Kbd bg={kbdBg} color={kbdColor} fontSize="2xs" border="none">
              ⌘
            </Kbd>
            <Kbd bg={kbdBg} color={kbdColor} fontSize="2xs" border="none">
              K
            </Kbd>
          </HStack>
        </HStack>
      </InputRightElement>
    </InputGroup>
  )
}
