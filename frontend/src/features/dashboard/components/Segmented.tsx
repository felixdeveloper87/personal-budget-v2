import { HStack, Box } from '@chakra-ui/react'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (v: T) => void
  size?: 'sm' | 'md'
  fullWidth?: boolean
  'aria-label'?: string
}

export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  'aria-label': ariaLabel,
}: SegmentedProps<T>) {
  const px = size === 'sm' ? '10px' : '14px'
  const py = size === 'sm' ? '4px' : '6px'
  const fs = size === 'sm' ? '10px' : '11.5px'

  return (
    <HStack
      spacing={0}
      bg="rgba(30,77,56,0.06)"
      borderRadius="999px"
      p="3px"
      border="1px solid var(--pb-hair)"
      role="radiogroup"
      aria-label={ariaLabel}
      w={fullWidth ? 'full' : undefined}
      display="inline-flex"
    >
      {options.map((opt) => (
        <Box
          key={opt.value}
          as="button"
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          flex={fullWidth ? 1 : undefined}
          onClick={() => onChange(opt.value)}
          px={px}
          py={py}
          borderRadius="999px"
          bg={value === opt.value ? 'var(--pb-surface)' : 'transparent'}
          boxShadow={
            value === opt.value
              ? '0 1px 3px rgba(28,55,40,0.12)'
              : 'none'
          }
          fontFamily="var(--pb-mono)"
          fontSize={fs}
          fontWeight={value === opt.value ? 500 : 400}
          letterSpacing="0.06em"
          color={value === opt.value ? 'var(--pb-ink)' : 'var(--pb-ink-soft)'}
          transition="all 0.15s ease"
          cursor="pointer"
          border="none"
          outline="none"
          textTransform="uppercase"
          whiteSpace="nowrap"
          textAlign="center"
          _focus={{ boxShadow: '0 0 0 2px var(--pb-forest)' }}
          _hover={{ color: 'var(--pb-ink)' }}
        >
          {opt.label}
        </Box>
      ))}
    </HStack>
  )
}
