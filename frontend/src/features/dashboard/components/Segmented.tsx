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
  mobileFullWidth?: boolean
  tone?: 'default' | 'summary'
  'aria-label'?: string
}

export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  mobileFullWidth = false,
  tone = 'default',
  'aria-label': ariaLabel,
}: SegmentedProps<T>) {
  const px = size === 'sm' ? '10px' : '14px'
  const py = size === 'sm' ? '4px' : '6px'
  const fs = size === 'sm' ? '10px' : '11.5px'
  const summary = tone === 'summary'

  return (
    <HStack
      spacing={0}
      bg={summary ? 'var(--pb-summary-panel)' : 'var(--pb-surface-3)'}
      borderRadius="999px"
      p="3px"
      border={`1px solid ${summary ? 'var(--pb-summary-line)' : 'var(--pb-hair)'}`}
      role="radiogroup"
      aria-label={ariaLabel}
      w={fullWidth ? 'full' : mobileFullWidth ? { base: 'full', sm: 'auto' } : undefined}
      display="inline-flex"
    >
      {options.map((opt) => (
        <Box
          key={opt.value}
          as="button"
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          flex={fullWidth ? 1 : mobileFullWidth ? { base: 1, sm: 'initial' } : undefined}
          onClick={() => onChange(opt.value)}
          px={px}
          py={py}
          borderRadius="999px"
          bg={value === opt.value
            ? summary ? 'var(--pb-summary-control)' : 'var(--pb-surface)'
            : 'transparent'}
          boxShadow={
            value === opt.value
              ? '0 1px 3px rgba(28,55,40,0.12)'
              : 'none'
          }
          fontFamily="var(--pb-mono)"
          fontSize={fs}
          fontWeight={value === opt.value ? 500 : 400}
          letterSpacing="0.06em"
          color={value === opt.value
            ? summary ? 'var(--pb-summary-ink)' : 'var(--pb-ink)'
            : summary ? 'var(--pb-summary-ink-soft)' : 'var(--pb-ink-soft)'}
          transition="all 0.15s ease"
          cursor="pointer"
          border="none"
          outline="none"
          textTransform="uppercase"
          whiteSpace="nowrap"
          textAlign="center"
          _focus={{ boxShadow: `0 0 0 2px ${summary ? 'var(--pb-summary-ink-faint)' : 'var(--pb-forest)'}` }}
          _hover={{ color: summary ? 'var(--pb-summary-ink)' : 'var(--pb-ink)' }}
        >
          {opt.label}
        </Box>
      ))}
    </HStack>
  )
}
