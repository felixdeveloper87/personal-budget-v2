import { Box, Input, Portal, useColorModeValue } from '@chakra-ui/react'
import {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react'
import { UK_BANKS } from './BankLogo'

interface BankComboboxProps {
  value: string
  onChange: (value: string) => void
  size?: string
  placeholder?: string
}

interface MenuPosition {
  left: number
  top: number
  width: number
  maxHeight: number
}

const MENU_GAP = 4
const VIEWPORT_PADDING = 8
const MIN_MENU_HEIGHT = 96
const MAX_MENU_HEIGHT = 240

export default function BankCombobox({ value, onChange, size = 'sm', placeholder = 'e.g. NatWest' }: BankComboboxProps) {
  const [open, setOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const dropdownBg = useColorModeValue('white', '#1a1a1a')
  const dropdownBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const itemHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100')

  const filtered = useMemo(() => {
    if (!value.trim()) return UK_BANKS
    const lower = value.toLowerCase()
    return UK_BANKS.filter((b) => b.toLowerCase().includes(lower))
  }, [value])

  const updatePosition = useCallback(() => {
    const input = inputRef.current
    if (!input) return

    const rect = input.getBoundingClientRect()
    const visualViewport = window.visualViewport
    const viewportWidth = visualViewport?.width ?? window.innerWidth
    const viewportHeight = visualViewport?.height ?? window.innerHeight

    const width = Math.max(
      0,
      Math.min(rect.width, viewportWidth - VIEWPORT_PADDING * 2),
    )
    const maxLeft = Math.max(VIEWPORT_PADDING, viewportWidth - width - VIEWPORT_PADDING)
    const left = Math.min(Math.max(rect.left, VIEWPORT_PADDING), maxLeft)

    const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_PADDING - MENU_GAP
    const spaceAbove = rect.top - VIEWPORT_PADDING - MENU_GAP
    const openAbove = spaceBelow < MIN_MENU_HEIGHT && spaceAbove > spaceBelow
    const availableSpace = Math.max(openAbove ? spaceAbove : spaceBelow, MIN_MENU_HEIGHT)
    const maxHeight = Math.min(MAX_MENU_HEIGHT, availableSpace)
    const top = openAbove
      ? Math.max(VIEWPORT_PADDING, rect.top - MENU_GAP - maxHeight)
      : Math.min(rect.bottom + MENU_GAP, viewportHeight - VIEWPORT_PADDING - maxHeight)

    setMenuPosition({ left, top, width, maxHeight })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    const animationFrame = window.requestAnimationFrame(updatePosition)
    const keyboardFrame = window.setTimeout(updatePosition, 250)
    const visualViewport = window.visualViewport

    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    visualViewport?.addEventListener('scroll', updatePosition)
    visualViewport?.addEventListener('resize', updatePosition)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.clearTimeout(keyboardFrame)
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
      visualViewport?.removeEventListener('scroll', updatePosition)
      visualViewport?.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return

    const handleOutsidePress = (event: MouseEvent | TouchEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (containerRef.current?.contains(target)) return
      if (dropdownRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', handleOutsidePress, true)
    document.addEventListener('touchstart', handleOutsidePress, true)
    return () => {
      document.removeEventListener('mousedown', handleOutsidePress, true)
      document.removeEventListener('touchstart', handleOutsidePress, true)
    }
  }, [open])

  const handleFocus = () => {
    updatePosition()
    setOpen(true)
  }

  const handleSelect = useCallback((bank: string) => {
    onChange(bank)
    setOpen(false)
    window.requestAnimationFrame(() => inputRef.current?.blur())
  }, [onChange])

  return (
    <Box ref={containerRef}>
      <Input
        ref={inputRef}
        size={size}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          window.requestAnimationFrame(updatePosition)
        }}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && filtered.length > 0 && menuPosition && (
        <Portal>
          <Box
            ref={dropdownRef}
            position="fixed"
            left={`${menuPosition.left}px`}
            top={`${menuPosition.top}px`}
            width={`${menuPosition.width}px`}
            zIndex={9999}
            bg={dropdownBg}
            border="1px solid"
            borderColor={dropdownBorder}
            borderRadius="md"
            boxShadow="lg"
            maxH={`${menuPosition.maxHeight}px`}
            overflowY="auto"
            role="listbox"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
            }}
          >
            {filtered.map((bank) => (
              <Box
                key={bank}
                as="button"
                type="button"
                w="full"
                textAlign="left"
                px={3}
                py={2}
                fontSize="sm"
                cursor="pointer"
                bg="transparent"
                border={0}
                _hover={{ bg: itemHoverBg }}
                _focus={{ bg: itemHoverBg, outline: 'none' }}
                onMouseDown={(e: ReactMouseEvent<HTMLButtonElement>) => { e.preventDefault(); handleSelect(bank) }}
                onTouchEnd={(e: ReactTouchEvent<HTMLButtonElement>) => { e.preventDefault(); handleSelect(bank) }}
                role="option"
                aria-selected={value === bank}
              >
                {bank}
              </Box>
            ))}
          </Box>
        </Portal>
      )}
    </Box>
  )
}
