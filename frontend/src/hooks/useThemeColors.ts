import { useColorModeValue, useTheme } from '@chakra-ui/react'
import { GRADIENTS } from '../theme'

export const useThemeColors = () => {
  const theme = useTheme()

  return {
    // 🧱 Backgrounds
    bgSecondary: useColorModeValue(GRADIENTS.secondaryLight, GRADIENTS.secondaryDark),
    cardBg: useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark),
    cardHover: useColorModeValue(
      'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 50%, #a7f3d0 100%)',
      '#1a1a1a'
    ),
    inputBg: useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark),

    // 🔲 Borders
    border: useColorModeValue('#cbd5e1', 'gray.800'),
    borderHover: useColorModeValue('#cbd5e1', '#4b5563'),

    // 📝 Text
    text: {
      primary: useColorModeValue('#0f172a', '#ffffff'),
      secondary: useColorModeValue('#64748b', '#d1d5db'),
      muted: useColorModeValue('#94a3b8', '#9ca3af'),
      label: useColorModeValue('#1e293b', '#ffffff'),
    },

    // 🎯 Accent (usa a paleta brand do tema)
    accent: useColorModeValue(theme.colors.brand[500], theme.colors.brand[300]),
    accentHover: useColorModeValue(theme.colors.brand[600], theme.colors.brand[400]),

    // 🌟 Sombras
    shadow: useColorModeValue(
      '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.04)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
    ),
    shadowHover: useColorModeValue(
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
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
