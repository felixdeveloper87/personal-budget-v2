import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { Box, VStack, Card, CardBody, Divider, useToast } from '@chakra-ui/react'
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

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(initialType)
  const [category, setCategory] = useState(type === 'INCOME' ? 'Salary' : 'Groceries')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!user?.token) return

      setLoading(true)
      try {
        const tx: Transaction = { date, type, category, description, amount: Number(amount) }
        const created = await createTransaction(tx, user.token)
        onCreated(created)
        toast({ title: 'Transaction saved', status: 'success', duration: 2000 })
        setAmount(0)
        setDescription('')
      } catch (err: any) {
        toast({ title: 'Error saving', status: 'error', description: err?.message })
      } finally {
        setLoading(false)
      }
    },
    [date, type, category, description, amount, user?.token, onCreated, toast]
  )

  return (
    <Box w="full">
      {compact ? (
        // Layout compacto para modais
        <VStack spacing={6} align="stretch" as="form" onSubmit={onSubmit}>
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
        // Layout completo para outras páginas
        <Card bg={colors.cardBg} shadow="lg" borderRadius="2xl" border="1px" borderColor={colors.border}>
          <CardBody p={{ base: 4, sm: 6, md: 10 }}>
            <VStack spacing={{ base: 4, md: 6 }} align="stretch" as="form" onSubmit={onSubmit}>
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
