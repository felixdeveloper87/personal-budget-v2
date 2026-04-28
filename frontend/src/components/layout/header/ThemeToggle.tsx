import { Icon, IconButton, Tooltip, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { Sun, Moon } from '../../ui/icons'

interface ThemeToggleProps {
  size?: 'sm' | 'md'
}

export default function ThemeToggle({ size = 'md' }: ThemeToggleProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const isLight = colorMode === 'light'

  const bg = useColorModeValue('white', 'whiteAlpha.100')
  const border = useColorModeValue('gray.200', 'whiteAlpha.200')
  const color = useColorModeValue('gray.700', 'yellow.300')
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.200')
  const hoverBorder = useColorModeValue('blue.300', 'yellow.400')
  const hoverColor = useColorModeValue('blue.600', 'yellow.200')

  const dimensions = size === 'sm' ? '36px' : '40px'

  return (
    <Tooltip label={`Switch to ${isLight ? 'dark' : 'light'} mode`} hasArrow openDelay={300}>
      <IconButton
        aria-label="Toggle color mode"
        icon={
          isLight
            ? <Icon as={Moon} weight="duotone" boxSize={size === 'sm' ? 4 : '18px'} />
            : <Icon as={Sun} weight="duotone" boxSize={size === 'sm' ? 4 : '18px'} />
        }
        onClick={toggleColorMode}
        variant="ghost"
        h={dimensions}
        w={dimensions}
        minW={dimensions}
        borderRadius="xl"
        border="1px solid"
        borderColor={border}
        bg={bg}
        color={color}
        boxShadow="0 1px 2px rgba(15, 23, 42, 0.04)"
        transition="background 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease"
        sx={{
          '& > svg': {
            transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
          },
          '&:hover > svg': {
            transform: 'rotate(-18deg) scale(1.08)',
          },
          '&:active > svg': {
            transform: 'rotate(0deg) scale(0.96)',
          },
        }}
        _hover={{
          bg: hoverBg,
          borderColor: hoverBorder,
          color: hoverColor,
          transform: 'translateY(-1px)',
        }}
        _active={{ transform: 'translateY(0)' }}
        _focusVisible={{
          outline: 'none',
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35)',
        }}
      />
    </Tooltip>
  )
}
