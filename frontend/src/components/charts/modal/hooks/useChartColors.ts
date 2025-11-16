import { useColorModeValue } from '@chakra-ui/react'

export interface ChartColors {
  // Base colors
  cardBg: string
  cardBgGradient: string
  borderColor: string
  spinnerColor: string
  gridStroke: string
  
  // Income colors
  incomeGradient: string
  incomeColor: string
  incomeHoverBorder: string
  
  // Expense colors
  expenseGradient: string
  expenseColor: string
  expenseHoverBorder: string
  
  // Transaction colors
  transactionsGradient: string
  transactionsColor: string
  transactionsHoverBorder: string
  
  // Average colors
  averageGradient: string
  averageColor: string
  averageHoverBorder: string
  
  // Balance colors
  balanceGradient: string
  balanceColor: string
  balanceHoverBorder: string
  balanceBadgeBg: string
  balanceBadgeColor: string
  
  // Savings colors
  savingsGradient: string
  savingsColor: string
  savingsHoverBorder: string
  
  // Badge colors
  greenBadgeBg: string
  greenBadgeColor: string
  redBadgeBg: string
  redBadgeColor: string
  blueBadgeBg: string
  blueBadgeColor: string
  grayBadgeBg: string
  
  // Legend colors
  legendBg: string
  legendHoverBg: string
}

export function useChartColors(currentBalance?: number): ChartColors {
  // Base colors
  const cardBg = useColorModeValue('white', '#0a0a0a')
  const cardBgGradient = useColorModeValue(
    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)'
  )
  const borderColor = useColorModeValue('rgba(226, 232, 240, 0.8)', 'rgba(75, 85, 99, 0.3)')
  const spinnerColor = useColorModeValue('blue.500', 'blue.300')
  const gridStroke = useColorModeValue('rgba(226, 232, 240, 0.5)', 'rgba(75, 85, 99, 0.2)')
  
  // Income colors
  const incomeGradient = useColorModeValue(
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
  )
  const incomeColor = useColorModeValue('#10b981', '#22c55e')
  const incomeHoverBorder = useColorModeValue('rgba(16, 185, 129, 0.3)', 'rgba(34, 197, 94, 0.4)')
  
  // Expense colors
  const expenseGradient = useColorModeValue(
    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
  )
  const expenseColor = useColorModeValue('#ef4444', '#f87171')
  const expenseHoverBorder = useColorModeValue('rgba(239, 68, 68, 0.3)', 'rgba(248, 113, 113, 0.4)')
  
  // Transaction colors
  const transactionsGradient = useColorModeValue(
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
  )
  const transactionsColor = useColorModeValue('#3b82f6', '#60a5fa')
  const transactionsHoverBorder = useColorModeValue('rgba(59, 130, 246, 0.3)', 'rgba(96, 165, 250, 0.4)')
  
  // Average colors
  const averageGradient = useColorModeValue(
    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
  )
  const averageColor = useColorModeValue('#8b5cf6', '#a78bfa')
  const averageHoverBorder = useColorModeValue('rgba(139, 92, 246, 0.3)', 'rgba(167, 139, 250, 0.4)')
  
  // Balance colors (dynamic based on balance value)
  const balanceGradient = useColorModeValue(
    currentBalance !== undefined && currentBalance >= 0 
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    currentBalance !== undefined && currentBalance >= 0
      ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
      : 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'
  )
  const balanceColor = useColorModeValue(
    currentBalance !== undefined && currentBalance >= 0 ? '#10b981' : '#ef4444',
    currentBalance !== undefined && currentBalance >= 0 ? '#22c55e' : '#f87171'
  )
  const balanceHoverBorderLight = currentBalance !== undefined && currentBalance >= 0 
    ? 'rgba(16, 185, 129, 0.3)' 
    : 'rgba(239, 68, 68, 0.3)'
  const balanceHoverBorderDark = currentBalance !== undefined && currentBalance >= 0 
    ? 'rgba(34, 197, 94, 0.4)' 
    : 'rgba(248, 113, 113, 0.4)'
  const balanceHoverBorder = useColorModeValue(balanceHoverBorderLight, balanceHoverBorderDark)
  
  const balanceBadgeBgLight = currentBalance !== undefined && currentBalance >= 0 ? 'green.50' : 'red.50'
  const balanceBadgeBgDark = currentBalance !== undefined && currentBalance >= 0 ? 'green.900' : 'red.900'
  const balanceBadgeBg = useColorModeValue(balanceBadgeBgLight, balanceBadgeBgDark)
  const balanceBadgeColorLight = currentBalance !== undefined && currentBalance >= 0 ? 'green.600' : 'red.600'
  const balanceBadgeColorDark = currentBalance !== undefined && currentBalance >= 0 ? 'green.300' : 'red.300'
  const balanceBadgeColor = useColorModeValue(balanceBadgeColorLight, balanceBadgeColorDark)
  
  // Savings colors
  const savingsGradient = useColorModeValue(
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
  )
  const savingsColor = useColorModeValue('#3b82f6', '#60a5fa')
  const savingsHoverBorder = useColorModeValue('rgba(59, 130, 246, 0.3)', 'rgba(96, 165, 250, 0.4)')
  
  // Badge colors
  const greenBadgeBg = useColorModeValue('green.50', 'green.900')
  const greenBadgeColor = useColorModeValue('green.600', 'green.300')
  const redBadgeBg = useColorModeValue('red.50', 'red.900')
  const redBadgeColor = useColorModeValue('red.600', 'red.300')
  const blueBadgeBg = useColorModeValue('blue.50', 'blue.900')
  const blueBadgeColor = useColorModeValue('blue.600', 'blue.300')
  const grayBadgeBg = useColorModeValue('gray.100', 'gray.700')
  
  // Legend colors
  const legendBg = useColorModeValue('rgba(16, 185, 129, 0.05)', 'rgba(34, 197, 94, 0.1)')
  const legendHoverBg = useColorModeValue('rgba(16, 185, 129, 0.1)', 'rgba(34, 197, 94, 0.15)')
  
  return {
    cardBg,
    cardBgGradient,
    borderColor,
    spinnerColor,
    gridStroke,
    incomeGradient,
    incomeColor,
    incomeHoverBorder,
    expenseGradient,
    expenseColor,
    expenseHoverBorder,
    transactionsGradient,
    transactionsColor,
    transactionsHoverBorder,
    averageGradient,
    averageColor,
    averageHoverBorder,
    balanceGradient,
    balanceColor,
    balanceHoverBorder,
    balanceBadgeBg,
    balanceBadgeColor,
    savingsGradient,
    savingsColor,
    savingsHoverBorder,
    greenBadgeBg,
    greenBadgeColor,
    redBadgeBg,
    redBadgeColor,
    blueBadgeBg,
    blueBadgeColor,
    grayBadgeBg,
    legendBg,
    legendHoverBg,
  }
}

