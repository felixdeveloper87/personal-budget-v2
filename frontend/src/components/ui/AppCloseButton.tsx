import { IconButton, IconButtonProps, useBreakpointValue, useColorModeValue } from '@chakra-ui/react'
import { X } from './icons'

type AppCloseButtonProps = Omit<IconButtonProps, 'aria-label' | 'icon'> & {
  'aria-label'?: string
}

export default function AppCloseButton({
  'aria-label': ariaLabel = 'Close',
  size = 'md',
  ...props
}: AppCloseButtonProps) {
  const bg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const hoverBg = useColorModeValue('red.50', 'rgba(248, 113, 113, 0.16)')
  const activeBg = useColorModeValue('red.100', 'rgba(248, 113, 113, 0.22)')
  const borderColor = useColorModeValue('blackAlpha.200', 'whiteAlpha.200')
  const hoverBorderColor = useColorModeValue('red.200', 'red.400')
  const iconColor = useColorModeValue('gray.800', 'gray.50')
  const hoverColor = useColorModeValue('red.600', 'red.200')
  const focusRing = useColorModeValue('rgba(239, 68, 68, 0.22)', 'rgba(248, 113, 113, 0.32)')
  const shadow = useColorModeValue(
    '0 6px 14px -10px rgba(15, 23, 42, 0.45)',
    '0 8px 18px -12px rgba(0, 0, 0, 0.8)'
  )
  const iconSize = useBreakpointValue({ base: 24, sm: 26 }) ?? 26

  return (
    <IconButton
      aria-label={ariaLabel}
      icon={<X size={iconSize} weight="bold" />}
      size={size}
      variant="ghost"
      w={{ base: 10, sm: 9 }}
      h={{ base: 10, sm: 9 }}
      minW={{ base: 10, sm: 9 }}
      borderRadius="full"
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      color={iconColor}
      boxShadow={shadow}
      _hover={{
        bg: hoverBg,
        borderColor: hoverBorderColor,
        color: hoverColor,
        transform: 'translateY(-1px)',
      }}
      _active={{
        bg: activeBg,
        transform: 'translateY(0)',
      }}
      _focusVisible={{
        boxShadow: `0 0 0 3px ${focusRing}`,
      }}
      transition="background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease"
      flexShrink={0}
      {...props}
    />
  )
}
