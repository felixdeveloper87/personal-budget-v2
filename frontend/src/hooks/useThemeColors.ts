import { useColorModeValue, useTheme } from '@chakra-ui/react'
import { GRADIENTS } from '../theme'

export const useThemeColors = () => {
  const theme = useTheme()

  return {
    // 🧱 Backgrounds
    bgSecondary: useColorModeValue(GRADIENTS.secondaryLight, GRADIENTS.secondaryDark),
    cardBg: useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark),
    cardHover: useColorModeValue(
      'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(235,241,238,0.96) 100%)',
      'linear-gradient(135deg, rgba(17,22,20,0.99) 0%, rgba(11,14,13,0.99) 100%)'
    ),
    inputBg: useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark),

    // 🔲 Borders
    border: useColorModeValue('rgba(23, 32, 28, 0.13)', 'rgba(232, 242, 237, 0.10)'),
    borderHover: useColorModeValue('rgba(24, 81, 62, 0.28)', 'rgba(232, 242, 237, 0.20)'),

    // 📝 Text
    text: {
      primary: useColorModeValue('#17201c', '#eff4f1'),
      secondary: useColorModeValue('#58635e', '#a8b5af'),
      muted: useColorModeValue('#626d67', '#7b8a83'),
      label: useColorModeValue('#18513e', '#eff4f1'),
    },

    // 🎯 Accent (usa a paleta brand do tema)
    accent: useColorModeValue(theme.colors.brand[500], theme.colors.brand[300]),
    accentHover: useColorModeValue(theme.colors.brand[600], theme.colors.brand[400]),

    // 🌟 Sombras
    shadow: useColorModeValue(
      '0 1px 2px rgba(18, 45, 36, 0.045), 0 12px 32px rgba(18, 45, 36, 0.07)',
      '0 1px 2px rgba(0, 0, 0, 0.52), 0 14px 38px rgba(0, 0, 0, 0.40)'
    ),
    shadowHover: useColorModeValue(
      '0 4px 12px rgba(18, 45, 36, 0.08), 0 26px 60px rgba(18, 45, 36, 0.12)',
      '0 4px 12px rgba(0, 0, 0, 0.58), 0 30px 66px rgba(0, 0, 0, 0.54)'
    ),

    // 🔘 Botões
    buttonGradient: useColorModeValue(
      `linear-gradient(135deg, ${theme.colors.brand[500]} 0%, ${theme.colors.brand[700]} 100%)`,
      `linear-gradient(135deg, ${theme.colors.brand[300]} 0%, ${theme.colors.brand[500]} 100%)`
    ),
    buttonGradientHover: useColorModeValue(
      `linear-gradient(135deg, ${theme.colors.brand[600]} 0%, ${theme.colors.brand[800]} 100%)`,
      `linear-gradient(135deg, ${theme.colors.brand[400]} 0%, ${theme.colors.brand[600]} 100%)`
    ),
  }
}
