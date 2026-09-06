import { useColorMode } from '@chakra-ui/react'
import { DARK_PALETTE, LIGHT_PALETTE } from '../palette'

export const useThemeColors = () => {
  const { colorMode } = useColorMode()
  const palette = colorMode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE

  return {
    bgSecondary: palette['surface-2'],
    cardBg: palette.surface,
    cardHover: palette['panel-raised'],
    inputBg: palette.control,
    border: palette.hair,
    borderHover: palette['hair-2'],
    text: {
      primary: palette.ink,
      secondary: palette['ink-soft'],
      muted: palette['ink-faint'],
      label: palette['header-ink'],
    },
    accent: palette['forest-2'],
    accentHover: palette.forest,
    shadow: palette.shadow,
    shadowHover: palette['shadow-lift'],
    buttonGradient: palette['forest-2'],
    buttonGradientHover: palette.forest,
  }
}
