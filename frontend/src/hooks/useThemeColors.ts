import { useColorModeValue } from '@chakra-ui/react'

export const useThemeColors = () => {
  return {
    // 🎨 Backgrounds
    bg: useColorModeValue('linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', '#000000'),
    bgSecondary: useColorModeValue(
      'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
      'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
    ),
    cardBg: useColorModeValue('linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)', '#111111'),
    cardHover: useColorModeValue('linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)', '#1a1a1a'),
    inputBg: useColorModeValue('#f8fafc', '#1a1a1a'),
    tabBg: useColorModeValue('#f8fafc', '#1a1a1a'),
    tabSelectedBg: useColorModeValue('linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)', '#111111'),
    
    // 🔲 Borders
    border: useColorModeValue('#e2e8f0', '#374151'),
    borderHover: useColorModeValue('#cbd5e1', '#4b5563'),
    tabBorder: useColorModeValue('#e2e8f0', '#374151'),
    
    // 📝 Text colors
    text: {
      primary: useColorModeValue('#0f172a', '#ffffff'),
      secondary: useColorModeValue('#64748b', '#d1d5db'),
      muted: useColorModeValue('#94a3b8', '#9ca3af'),
      label: useColorModeValue('#1e293b', '#ffffff'),
    },
    
    // 🎯 Accent colors
    accent: useColorModeValue('#3b82f6', '#60a5fa'),
    accentHover: useColorModeValue('#2563eb', '#3b82f6'),
    
    // 🌟 Shadows
    shadow: useColorModeValue(
      '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
    ),
    shadowHover: useColorModeValue(
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
    ),
    
    // 🔘 Button styles
    buttonGradient: useColorModeValue(
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
    ),
    buttonGradientHover: useColorModeValue(
      'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    ),
  }
}
