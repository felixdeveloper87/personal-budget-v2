import React, { useState, useCallback } from 'react'
import { Box, VStack, Card, CardBody, useToast, Button } from '@chakra-ui/react'
import { useAuth } from '../../../contexts/AuthContext'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { createTransaction, createInstallmentPlan, createRecurringTransaction } from '../../../api'
import RecentTransactions from './RecentTransactions'
import { Plus, Minus } from '../../ui/icons'
import DateSelector from './DateSelector'
import AmountInput from './AmountInput'
import CategorySelector from './CategorySelector'
import DescriptionInput from './DescriptionInput'
import InstallmentSelector from './InstallmentSelector'
import RecurringSelector from './RecurringSelector'
import ExpenseModeSelector, { ExpenseMode } from './ExpenseModeSelector'
import IncomeModeSelector, { IncomeMode } from './IncomeModeSelector'
import { Transaction } from '../../../types'

/** Calendar date in local TZ (avoid UTC drift from `toISOString().slice`). */
function toLocalYYYYMMDD(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Day-of-month part of `YYYY-MM-DD`, clamped — matches the transaction calendar date picker. */
function dayOfMonthFromYMD(ymd: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim())
  if (!match) return new Date().getDate()
  const day = parseInt(match[3], 10)
  return Math.min(31, Math.max(1, day))
}

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
  const [date, setDate] = useState(() => toLocalYYYYMMDD())
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(initialType)
  const [category, setCategory] = useState(type === 'INCOME' ? 'Salary' : 'Groceries')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  // 💳 Installment states
  const [expenseMode, setExpenseMode] = useState<ExpenseMode>('single')
  const [incomeMode, setIncomeMode] = useState<IncomeMode>('single')
  const [installments, setInstallments] = useState(3)
  const [firstInstallmentDate, setFirstInstallmentDate] = useState(() => toLocalYYYYMMDD())
  const [recurringStartDate, setRecurringStartDate] = useState(() => toLocalYYYYMMDD())
  const [recurringDayOfMonth, setRecurringDayOfMonth] = useState(() =>
    dayOfMonthFromYMD(toLocalYYYYMMDD())
  )

  /** Keep recurring due-day default aligned with the transaction date while editing a single (one-off) row. */
  const onTransactionDateChange = useCallback((nextDate: string) => {
    setDate(nextDate)
    if (
      (type === 'EXPENSE' && expenseMode === 'single') ||
      (type === 'INCOME' && incomeMode === 'single')
    ) {
      setRecurringDayOfMonth(dayOfMonthFromYMD(nextDate))
    }
  }, [type, expenseMode, incomeMode])


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
        if (expenseMode === 'fixed' && type === 'EXPENSE') {
          await createRecurringTransaction({
            type,
            category,
            description,
            amount: Number(amount),
            startDate: recurringStartDate,
            dayOfMonth: recurringDayOfMonth,
          })

          toast({
            title: 'Fixed expense created',
            description: 'Due transactions will be generated automatically.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
        } else if (incomeMode === 'fixed' && type === 'INCOME') {
          await createRecurringTransaction({
            type,
            category,
            description,
            amount: Number(amount),
            startDate: toLocalYYYYMMDD(),
            dayOfMonth: recurringDayOfMonth,
          })

          toast({
            title: 'Fixed income created',
            description: 'Monthly income will be generated automatically.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
        } else if (expenseMode === 'installment' && type === 'EXPENSE' && installments > 1) {
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
        setExpenseMode('single')
        setIncomeMode('single')
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
      expenseMode,
      incomeMode,
      installments,
      recurringStartDate,
      recurringDayOfMonth,
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
              spacing={{ base: 4, sm: 5 }}
              align="stretch"
              w="full"
              aria-label="Add transaction form" // ♿ Accessibility
            >
          {type === 'INCOME' && (
            <IncomeModeSelector
              value={incomeMode}
              onChange={(mode) => {
                setIncomeMode(mode)
                if (mode === 'fixed') {
                  setRecurringDayOfMonth(dayOfMonthFromYMD(date))
                }
              }}
            />
          )}
          {type === 'EXPENSE' && (
            <ExpenseModeSelector
              value={expenseMode}
              onChange={(mode) => {
                setExpenseMode(mode)
                if (mode === 'fixed') {
                  setRecurringStartDate(date)
                  setRecurringDayOfMonth(dayOfMonthFromYMD(date))
                }
                if (mode === 'installment') {
                  setFirstInstallmentDate(date)
                }
              }}
            />
          )}
          <AmountInput amount={amount} onChange={setAmount} type={type} />
          {((type === 'EXPENSE' && expenseMode === 'single') ||
            (type === 'INCOME' && incomeMode === 'single')) && (
            <DateSelector date={date} onChange={onTransactionDateChange} />
          )}
          {type === 'EXPENSE' && expenseMode === 'fixed' && (
              <RecurringSelector
                title="Fixed expense schedule"
                type={type}
                startDate={recurringStartDate}
                onStartDateChange={setRecurringStartDate}
                dayOfMonth={recurringDayOfMonth}
                onDayOfMonthChange={setRecurringDayOfMonth}
                showSystemNote
              />
          )}
          {type === 'INCOME' && incomeMode === 'fixed' && (
              <RecurringSelector
                title="Fixed income schedule"
                type={type}
                dayOfMonth={recurringDayOfMonth}
                onDayOfMonthChange={setRecurringDayOfMonth}
                showSystemNote={false}
              />
          )}
          {type === 'EXPENSE' && expenseMode === 'installment' && (
              <InstallmentSelector
                enabled
                onEnabledChange={() => undefined}
                installments={installments}
                onInstallmentsChange={setInstallments}
                amount={amount}
                firstInstallmentDate={firstInstallmentDate}
                onFirstInstallmentDateChange={setFirstInstallmentDate}
                showToggle={false}
              />
          )}
          <CategorySelector type={type} category={category} onChange={setCategory} />
          <DescriptionInput
            value={description}
            onChange={setDescription}
            type={type}
            loading={loading}
          />
          
          {compact && (
            <Button
              size="lg"
              h={{ base: 12, sm: 14 }}
              w="full"
              fontSize={{ base: 'sm', sm: 'md' }}
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
              loadingText={
                type === 'INCOME' && incomeMode === 'fixed'
                  ? 'Creating fixed income...'
                  : expenseMode === 'fixed' && type === 'EXPENSE'
                  ? 'Creating fixed expense...'
                  : expenseMode === 'installment' && type === 'EXPENSE'
                    ? 'Creating installment plan...'
                  : type === 'INCOME'
                    ? 'Adding income...'
                    : 'Adding expense...'
              }
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
              {type === 'INCOME' && incomeMode === 'fixed'
                ? 'Create fixed income'
                : expenseMode === 'fixed' && type === 'EXPENSE'
                ? 'Create fixed expense'
                : expenseMode === 'installment' && type === 'EXPENSE'
                  ? 'Create installment plan'
                : type === 'INCOME'
                  ? 'Add income'
                  : 'Add expense'}
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
          <CardBody p={{ base: 4, sm: 6, md: 8 }}>
            <VStack
              spacing={{ base: 4, sm: 5, md: 6 }}
              align="stretch"
              w="full"
            >
              {type === 'INCOME' && (
                <IncomeModeSelector
                  value={incomeMode}
                  onChange={(mode) => {
                    setIncomeMode(mode)
                    if (mode === 'fixed') {
                      setRecurringDayOfMonth(dayOfMonthFromYMD(date))
                    }
                  }}
                />
              )}
              {type === 'EXPENSE' && (
                <ExpenseModeSelector
                  value={expenseMode}
                  onChange={(mode) => {
                    setExpenseMode(mode)
                    if (mode === 'fixed') {
                      setRecurringStartDate(date)
                      setRecurringDayOfMonth(dayOfMonthFromYMD(date))
                    }
                    if (mode === 'installment') {
                      setFirstInstallmentDate(date)
                    }
                  }}
                />
              )}
              <AmountInput amount={amount} onChange={setAmount} type={type} />
              {((type === 'EXPENSE' && expenseMode === 'single') ||
                (type === 'INCOME' && incomeMode === 'single')) && (
                <DateSelector date={date} onChange={onTransactionDateChange} />
              )}
              {type === 'EXPENSE' && expenseMode === 'fixed' && (
                  <RecurringSelector
                    title="Fixed expense schedule"
                    type={type}
                    startDate={recurringStartDate}
                    onStartDateChange={setRecurringStartDate}
                    dayOfMonth={recurringDayOfMonth}
                    onDayOfMonthChange={setRecurringDayOfMonth}
                    showSystemNote
                  />
              )}
              {type === 'INCOME' && incomeMode === 'fixed' && (
                  <RecurringSelector
                    title="Fixed income schedule"
                    type={type}
                    dayOfMonth={recurringDayOfMonth}
                    onDayOfMonthChange={setRecurringDayOfMonth}
                    showSystemNote={false}
                  />
              )}
              {type === 'EXPENSE' && expenseMode === 'installment' && (
                  <InstallmentSelector
                    enabled
                    onEnabledChange={() => undefined}
                    installments={installments}
                    onInstallmentsChange={setInstallments}
                    amount={amount}
                    firstInstallmentDate={firstInstallmentDate}
                    onFirstInstallmentDateChange={setFirstInstallmentDate}
                    showToggle={false}
                  />
              )}
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
