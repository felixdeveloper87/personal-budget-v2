import { Icon, IconButton, Tooltip, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { useEd } from '../../../editorial'
import { useI18n } from '../../../i18n'
import { Sun, Moon } from '../../ui/icons'

interface ThemeToggleProps {
  size?: 'sm' | 'md'
}

export default function ThemeToggle({ size = 'md' }: ThemeToggleProps) {
  const { colorMode, toggleColorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const ed = useEd()
  const { t } = useI18n()

  const bgBase = useColorModeValue('rgba(255,255,255,0.65)', 'rgba(255,255,255,0.04)')
  const bg = ed ? ed.controlBg : bgBase
  const borderBase = useColorModeValue('rgba(226,232,240,0.8)', 'rgba(255,255,255,0.08)')
  const border = ed ? ed.line : borderBase
  const shadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 4px rgba(15,23,42,0.04)',
    'inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 4px rgba(0,0,0,0.2)',
  )
  const colorBase = useColorModeValue('gray.600', 'yellow.300')
  const color = ed ? ed.gold : colorBase
  const hoverBgBase = useColorModeValue('rgba(255,255,255,0.9)', 'rgba(255,255,255,0.08)')
  const hoverBg = ed ? ed.controlHoverBg : hoverBgBase
  const hoverBorderBase = useColorModeValue('blue.300', 'yellow.400')
  const hoverBorder = ed ? ed.jade : hoverBorderBase
  const hoverColorBase = useColorModeValue('blue.600', 'yellow.200')
  const hoverColor = ed ? ed.jade : hoverColorBase
  const hoverShadowBase = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 12px rgba(37,99,235,0.10)',
    'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 12px rgba(0,0,0,0.32)',
  )
  const editorialHoverShadow = useColorModeValue(
    'inset 0 1px 0 rgba(255,255,255,0.88), 0 8px 20px rgba(18,45,36,0.12)',
    'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 20px rgba(0,0,0,0.42)',
  )
  const hoverShadow = ed ? editorialHoverShadow : hoverShadowBase
  const focusShadow = ed
    ? `0 0 0 2px ${ed.bg}, 0 0 0 5px ${ed.jade}`
    : '0 0 0 3px rgba(59, 130, 246, 0.35)'

  const dimensions = size === 'sm' ? '36px' : '40px'

  return (
    <Tooltip
      label={t(isLight ? 'header.theme.switchToDark' : 'header.theme.switchToLight')}
      hasArrow
      openDelay={300}
    >
      <IconButton
        aria-label={t('header.theme.toggle')}
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
        borderRadius={ed ? 'full' : 'xl'}
        border="1px solid"
        borderColor={border}
        bg={bg}
        color={color}
        backdropFilter="blur(10px)"
        boxShadow={shadow}
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
          boxShadow: hoverShadow,
        }}
        _active={{ transform: 'translateY(0)' }}
        _focusVisible={{
          outline: 'none',
          boxShadow: focusShadow,
        }}
      />
    </Tooltip>
  )
}
