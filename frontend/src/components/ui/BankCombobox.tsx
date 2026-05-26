import { Box, Input, Portal, useColorModeValue, useOutsideClick } from '@chakra-ui/react'
import { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { UK_BANKS } from './BankLogo'

interface BankComboboxProps {
  value: string
  onChange: (value: string) => void
  size?: string
  placeholder?: string
}

export default function BankCombobox({ value, onChange, size = 'sm', placeholder = 'e.g. NatWest' }: BankComboboxProps) {
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const dropdownBg = useColorModeValue('white', '#1a1a1a')
  const dropdownBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const itemHoverBg = useColorModeValue('gray.100', 'whiteAlpha.100')

  const filtered = useMemo(() => {
    if (!value.trim()) return UK_BANKS
    const lower = value.toLowerCase()
    return UK_BANKS.filter((b) => b.toLowerCase().includes(lower))
  }, [value])

  const updateRect = useCallback(() => {
    if (inputRef.current) setRect(inputRef.current.getBoundingClientRect())
  }, [])

  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => {
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [open, updateRect])

  useOutsideClick({ ref: containerRef, handler: () => setOpen(false) })

  const handleFocus = () => {
    updateRect()
    setOpen(true)
  }

  const handleSelect = (bank: string) => {
    onChange(bank)
    setOpen(false)
    inputRef.current?.blur()
  }

  return (
    <Box ref={containerRef}>
      <Input
        ref={inputRef}
        size={size}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filtered.length > 0 && rect && (
        <Portal>
          <Box
            position="fixed"
            left={`${rect.left}px`}
            top={`${rect.bottom + 4}px`}
            width={`${rect.width}px`}
            zIndex={9999}
            bg={dropdownBg}
            border="1px solid"
            borderColor={dropdownBorder}
            borderRadius="md"
            boxShadow="lg"
            maxH="200px"
            overflowY="auto"
          >
            {filtered.map((bank) => (
              <Box
                key={bank}
                px={3}
                py={2}
                fontSize="sm"
                cursor="pointer"
                _hover={{ bg: itemHoverBg }}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(bank) }}
                onTouchEnd={(e) => { e.preventDefault(); handleSelect(bank) }}
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
