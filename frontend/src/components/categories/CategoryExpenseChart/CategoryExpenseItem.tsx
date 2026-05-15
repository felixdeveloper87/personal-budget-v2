import React from 'react'
import { useColorModeValue } from '@chakra-ui/react'
import { CategoryExpenseItemProps } from './types'
import CategoryTransactionDropdown from '../CategoryTransactionDropdown'

export const CategoryExpenseItem = React.memo<CategoryExpenseItemProps>(({
  category,
  amount,
  percentage,
  color,
  onClick,
  isExpanded = false,
  transactions = [],
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.900')
  const hoverBg = useColorModeValue(`${color}20`, `${color}30`)
  const badgeBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')

  return (
    <CategoryTransactionDropdown
      category={category}
      amount={amount}
      percentage={percentage}
      color={color}
      transactions={transactions}
      accentScheme="red"
      borderColor={borderColor}
      hoverBg={hoverBg}
      badgeBg={badgeBg}
      amountColor="red.500"
      showProgress
      isExpanded={isExpanded}
      onToggle={onClick}
    />
  )
})

CategoryExpenseItem.displayName = 'CategoryExpenseItem'
