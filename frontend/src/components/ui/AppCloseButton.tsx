import { IconButton, IconButtonProps, useBreakpointValue, useColorMode } from '@chakra-ui/react'
import { editorialPalette, useEd } from '../../editorial'
import { X } from './icons'

type AppCloseButtonProps = Omit<IconButtonProps, 'aria-label' | 'icon'> & {
  'aria-label'?: string
}

export default function AppCloseButton({
  'aria-label': ariaLabel = 'Close',
  size = 'md',
  ...props
}: AppCloseButtonProps) {
  const { colorMode } = useColorMode()
  const ed = useEd() ?? editorialPalette(colorMode)
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
      bg={ed.controlBg}
      border="1px solid"
      borderColor={ed.line}
      color={ed.muted}
      _hover={{
        bg: ed.jadeSoft,
        borderColor: ed.jade,
        color: ed.jade,
        transform: 'translateY(-1px)',
      }}
      _active={{
        bg: ed.jadeSoftHover,
        transform: 'translateY(0)',
      }}
      _focusVisible={{
        boxShadow: `0 0 0 3px ${ed.jade}38`,
      }}
      transition="background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, transform 0.15s ease"
      flexShrink={0}
      {...props}
    />
  )
}
