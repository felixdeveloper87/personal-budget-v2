import React, { useState, useCallback } from 'react'
import { Box, VStack, Card, CardBody, useToast } from '@chakra-ui/react'
import { useAuth } from '../../../contexts/AuthContext'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { createTransaction } from '../../../api'
import RecentTransactions from '../../transactions/RecentTransactions'
import DateSelector from './DateSelector'
import AmountInput from './AmountInput'
import CategorySelector from './CategorySelector'
import DescriptionInput from './DescriptionInput'
import { Transaction } from '../../../types'

interface TransactionFormProps {
  onCreated: (t: Transaction) => void
  onTransactionDeleted?: () => void
  transactions: Transaction[]
  initialType?: 'INCOME' | 'EXPENSE'
  showRecentTransactions?: boolean
  compact?: boolean
}

/**
 * 💼 TransactionForm
 * Handles transaction creation with modular input components.
 * Can render in full or compact mode (for modal usage).
 * Integrates with AuthContext to send authenticated API requests.
 */
export default function TransactionForm({
  onCreated,
  onTransactionDeleted,
  transactions,
  initialType = 'INCOME',
  showRecentTransactions = true,
  compact = false,
}: TransactionFormProps) {
  const { user } = useAuth()
  const toast = useToast()
  const colors = useThemeColors()

  // 🗓️ Controlled form states
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(initialType)
  const [category, setCategory] = useState(type === 'INCOME' ? 'Salary' : 'Groceries')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  /**
   * 🧾 Handle form submission:
   * - Sends transaction data to API
   * - Displays success/error toast
   * - Resets description and amount on success
   */
  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!user?.token) return

      setLoading(true)
      try {
        const now = new Date()
        const selectedDate = new Date(date)
        selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0)

        const tx: Transaction = {
          dateTime: selectedDate.toISOString(),
          type,
          category,
          description,
          amount: Number(amount),
        }
        const created = await createTransaction(tx)
        onCreated(created)

        toast({
          title: 'Transaction saved',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })

        setAmount(0)
        setDescription('')
      } catch (err: any) {
        toast({
          title: 'Error saving transaction',
          description: err?.message || 'Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    },
    [date, type, category, description, amount, user?.token, onCreated, toast]
  )

  return (
    <Box w="full">
      {compact ? (
        /**
         * 🧩 Compact layout (used inside modals)
         * - Lightweight and vertically stacked
         * - Same logic, smaller spacing
         */
        <VStack
          spacing={{ base: 6, sm: 4 }}
          align="stretch"
          as="form"
          onSubmit={onSubmit}
          w="full"
          aria-label="Add transaction form" // ♿ Accessibility
        >
          <DateSelector date={date} onChange={setDate} />
          <AmountInput amount={amount} onChange={setAmount} type={type} />
          <CategorySelector type={type} category={category} onChange={setCategory} />
          <DescriptionInput
            value={description}
            onChange={setDescription}
            type={type}
            loading={loading}
          />
        </VStack>
      ) : (
        /**
         * 🪟 Full layout (used on dashboard pages)
         * - Includes Card container and wider spacing
         */
        <Card
          bg={colors.cardBg}
          shadow="lg"
          borderRadius="2xl"
          border="1px"
          borderColor={colors.border}
          w="full"
          role="region" // ♿ Accessibility: marks card as a section
          aria-label="Transaction entry form"
        >
          <CardBody p={{ base: 6, sm: 6, md: 10 }}>
            <VStack
              spacing={{ base: 6, sm: 4, md: 6 }}
              align="stretch"
              as="form"
              onSubmit={onSubmit}
              w="full"
            >
              <DateSelector date={date} onChange={setDate} />
              <AmountInput amount={amount} onChange={setAmount} type={type} />
              <CategorySelector type={type} category={category} onChange={setCategory} />
              <DescriptionInput
                value={description}
                onChange={setDescription}
                type={type}
                loading={loading}
              />
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* 📊 Optional section showing recent transactions */}
      {showRecentTransactions && (
        <Box mt={{ base: 6, md: 8 }}>
          <RecentTransactions
            transactions={transactions}
            type={type}
            limit={3}
            onTransactionDeleted={onTransactionDeleted}
          />
        </Box>
      )}
    </Box>
  )
}
