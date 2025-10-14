import { useColorModeValue } from '@chakra-ui/react'

export const useThemeColors = () => {
  return {
    // Backgrounds
    bg: useColorModeValue('linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', '#000000'),
    bgSecondary: useColorModeValue('#f1f5f9', '#0a0a0a'),
    cardBg: useColorModeValue('linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)', '#111111'),
    cardHover: useColorModeValue('linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)', '#111111'),
    inputBg: useColorModeValue('#f8fafc', '#1a1a1a'),
    tabBg: useColorModeValue('#f8fafc', '#1a1a1a'),
    tabSelectedBg: useColorModeValue('linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)', '#111111'),
    
    // Borders
    border: useColorModeValue('#cbd5e1', 'gray.800'),
    borderHover: useColorModeValue('#94a3b8', 'gray.700'),
    tabBorder: useColorModeValue('#cbd5e1', 'gray.800'),
    
    // Text colors
    text: {
      primary: useColorModeValue('#0f172a', 'white'),
      secondary: useColorModeValue('#334155', 'gray.300'),
      muted: useColorModeValue('#475569', 'gray.400'),
      label: useColorModeValue('#1e293b', 'white'),
    },
    
    // Accent colors
    accent: useColorModeValue('#0ea5e9', 'blue.300'),
    accentHover: useColorModeValue('#0284c7', 'blue.400'),
    
    // Shadows
    shadow: useColorModeValue(
      '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.02), 0 0 0 1px rgba(0, 0, 0, 0.02)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
    ),
    shadowHover: useColorModeValue(
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -2px rgba(0, 0, 0, 0.4)'
    ),
    
    // Button gradients
    buttonGradient: useColorModeValue(
      'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
      'brand.500'
    ),
    buttonGradientHover: useColorModeValue(
      'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
      'brand.400'
    ),
  }
}
