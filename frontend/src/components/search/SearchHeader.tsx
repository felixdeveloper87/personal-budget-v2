import { useEffect, useRef } from 'react'
import {
  Box,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Kbd,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { Search, X } from 'lucide-react'

interface SearchHeaderProps {
  onClose: () => void
  searchText: string
  onSearchTextChange: (value: string) => void
  /** When true, focus the input on open. Defaults to true. */
  autoFocus?: boolean
}

/**
 * Spotlight-style search header.
 *
 * The text input is the protagonist (top of the modal), filters live below.
 * No looped animations — modal stays cheap to keep open.
 */
export default function SearchHeader({
  onClose,
  searchText,
  onSearchTextChange,
  autoFocus = true,
}: SearchHeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const closeIdleColor = useColorModeValue('gray.500', 'gray.400')
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
    <Box
      bg={surfaceBg}
      borderBottom="1px solid"
      borderColor={borderColor}
      px={{ base: 4, sm: 6 }}
      pt={{ base: 'max(1rem, env(safe-area-inset-top, 0px))', sm: 5 }}
      pb={4}
    >
      <HStack justify="space-between" align="center" mb={4} spacing={3}>
        <HStack spacing={3} minW={0}>
          <Box
            w={9}
            h={9}
            borderRadius="lg"
            bg={useColorModeValue('blue.50', 'whiteAlpha.100')}
            color={useColorModeValue('blue.600', 'blue.300')}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Icon as={Search} boxSize={4} strokeWidth={2.25} />
          </Box>
          <VStack align="flex-start" spacing={0} minW={0}>
            <Text
              fontWeight={700}
              fontSize="md"
              color={titleColor}
              lineHeight="1.2"
              noOfLines={1}
            >
              Search transactions
            </Text>
            <Text fontSize="xs" color={captionColor} noOfLines={1}>
              Filter by text, type, category or date
            </Text>
          </VStack>
        </HStack>

        <IconButton
          aria-label="Close"
          icon={<Icon as={X} boxSize={4} />}
          onClick={onClose}
          size="sm"
          variant="ghost"
          color={closeIdleColor}
          _hover={{ bg: closeHoverBg, color: titleColor }}
          transition="background-color 0.15s ease, color 0.15s ease"
        />
      </HStack>

      <InputGroup size="md">
        <InputLeftElement pointerEvents="none" h="44px" color={iconColor}>
          <Icon as={Search} boxSize={4} />
        </InputLeftElement>
        <Input
          ref={inputRef}
          value={searchText}
          onChange={(e) => onSearchTextChange(e.target.value)}
          placeholder="Search by description…"
          h="44px"
          pl={10}
          pr={searchText ? 24 : 16}
          bg={inputBg}
          border="1px solid"
          borderColor={inputBorder}
          color={inputColor}
          fontSize="sm"
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
        <InputRightElement h="44px" pr={3} width="auto">
          <HStack spacing={1}>
            {searchText && (
              <IconButton
                aria-label="Clear search"
                icon={<Icon as={X} boxSize={3.5} />}
                onClick={() => onSearchTextChange('')}
                size="xs"
                variant="ghost"
                color={iconColor}
                _hover={{ bg: closeHoverBg }}
              />
            )}
            <HStack
              spacing={0.5}
              display={{ base: 'none', sm: 'flex' }}
              opacity={0.85}
            >
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
    </Box>
  )
}
