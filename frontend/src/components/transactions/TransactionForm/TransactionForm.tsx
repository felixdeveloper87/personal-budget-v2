import React, { useState, useCallback } from 'react'
import { Box, VStack, Card, CardBody, useToast, Button } from '@chakra-ui/react'
import { useAuth } from '../../../contexts/AuthContext'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { createTransaction, createInstallmentPlan } from '../../../api'
import RecentTransactions from './RecentTransactions'
import { Plus, Minus } from '../../ui/icons'
import DateSelector from './DateSelector'
import AmountInput from './AmountInput'
import CategorySelector from './CategorySelector'
import DescriptionInput from './DescriptionInput'
import InstallmentSelector from './InstallmentSelector'
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

  // 💳 Installment states
  const [installmentEnabled, setInstallmentEnabled] = useState(false)
  const [installments, setInstallments] = useState(3)
  const [firstInstallmentDate, setFirstInstallmentDate] = useState(() => {
    const today = new Date()
    return today.toISOString().slice(0, 10)
  })


  /**
   * 🧾 Handle form submission:
   * - Creates installment plan if enabled (EXPENSE only)
   * - Otherwise creates a single transaction
   * - Displays success/error toast
   * - Resets form on success
   */
  const onSubmit = useCallback(
    async () => {
      if (!user?.token) return

      if (loading) return

      setLoading(true)
      try {
        // 💳 Create installment plan (only for EXPENSE)
        if (installmentEnabled && type === 'EXPENSE' && installments > 1) {
          // Use the selected first installment date
          const selectedDate = new Date(firstInstallmentDate)
          const now = new Date()
          selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0)
          
          await createInstallmentPlan({
            totalInstallments: installments,
            installmentValue: Number(amount) / installments,
            category,
            description,
            startDate: firstInstallmentDate, // Use the selected date
            startDateTime: selectedDate.toISOString(), // Add full datetime
          })

          toast({
            title: '✅ Installment plan created!',
            description: `${installments}x of £${(Number(amount) / installments).toFixed(2)}`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
        } else {
          // 💰 Create single transaction
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
        }

        // Reset form
        setAmount(0)
        setDescription('')
        setInstallmentEnabled(false)
        setInstallments(3)

        // Trigger parent refresh
        onCreated({} as Transaction)
      } catch (err: any) {
        toast({
          title: 'Error saving',
          description: err?.message || 'Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    },
    [
      date,
      type,
      category,
      description,
      amount,
      installmentEnabled,
      installments,
      user?.token,
      onCreated,
      toast,
    ]
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
              spacing={{ base: 6, sm: 5 }}
              align="stretch"
              w="full"
              aria-label="Add transaction form" // ♿ Accessibility
            >
          <DateSelector date={date} onChange={setDate} />
          <CategorySelector type={type} category={category} onChange={setCategory} />
          <AmountInput amount={amount} onChange={setAmount} type={type} />
          {/* Show installment selector only for EXPENSE */}
          {type === 'EXPENSE' && (
            <InstallmentSelector
              enabled={installmentEnabled}
              onEnabledChange={setInstallmentEnabled}
              installments={installments}
              onInstallmentsChange={setInstallments}
              amount={amount}
              firstInstallmentDate={firstInstallmentDate}
              onFirstInstallmentDateChange={setFirstInstallmentDate}
            />
          )}
          <DescriptionInput
            value={description}
            onChange={setDescription}
            type={type}
            loading={loading}
          />
          
          {compact && (
            <Button
              size="lg"
              h={14}
              w="full"
              fontSize="md"
              fontWeight={700}
              color="white"
              borderRadius="xl"
              bg={type === 'INCOME'
                ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                : 'linear-gradient(135deg, #f43f5e 0%, #dc2626 50%, #b91c1c 100%)'
              }
              bgSize="200% 100%"
              bgPosition="0% 50%"
              boxShadow={type === 'INCOME'
                ? '0 8px 24px -10px rgba(16, 185, 129, 0.55)'
                : '0 8px 24px -10px rgba(244, 63, 94, 0.55)'
              }
              leftIcon={type === 'INCOME' ? <Plus size={18} /> : <Minus size={18} />}
              onClick={onSubmit}
              isLoading={loading}
              loadingText={type === 'INCOME' ? 'Adding income…' : 'Adding expense…'}
              _hover={{
                bgPosition: '100% 50%',
                transform: 'translateY(-1px)',
                boxShadow: type === 'INCOME'
                  ? '0 12px 30px -10px rgba(16, 185, 129, 0.65)'
                  : '0 12px 30px -10px rgba(244, 63, 94, 0.65)',
              }}
              _active={{ transform: 'translateY(0)' }}
              transition="background-position 0.3s ease, transform 0.15s ease, box-shadow 0.2s ease"
            >
              {type === 'INCOME' ? 'Add income' : 'Add expense'}
            </Button>
          )}
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
          <CardBody p={{ base: 6, sm: 6, md: 8 }}>
            <VStack
              spacing={{ base: 6, sm: 5, md: 6 }}
              align="stretch"
              w="full"
            >
              <DateSelector date={date} onChange={setDate} />
              <CategorySelector type={type} category={category} onChange={setCategory} />
              <AmountInput amount={amount} onChange={setAmount} type={type} />
              {/* Show installment selector only for EXPENSE */}
              {type === 'EXPENSE' && (
                <InstallmentSelector
                  enabled={installmentEnabled}
                  onEnabledChange={setInstallmentEnabled}
                  installments={installments}
                  onInstallmentsChange={setInstallments}
                  amount={amount}
                  firstInstallmentDate={firstInstallmentDate}
                  onFirstInstallmentDateChange={setFirstInstallmentDate}
                />
              )}
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
