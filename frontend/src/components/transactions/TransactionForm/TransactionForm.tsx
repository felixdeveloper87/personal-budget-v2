import React, { useState, useCallback, useEffect } from 'react'
import {
  Box,
  VStack,
  Card,
  CardBody,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  HStack,
  Text,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { useAuth } from '../../../contexts/AuthContext'
import { useThemeColors } from '../../../hooks/useThemeColors'
import {
  createTransaction,
  createInstallmentPlan,
  createRecurringTransaction,
  listAccounts,
  listPaymentMethods,
} from '../../../api'
import RecentTransactions from './RecentTransactions'
import { Plus, Minus } from '../../ui/icons'
import DateSelector from './DateSelector'
import AmountInput from './AmountInput'
import CategorySelector from './CategorySelector'
import DescriptionInput from './DescriptionInput'
import InstallmentSelector from './InstallmentSelector'
import RecurringSelector from './RecurringSelector'
import PaymentMethodSelector from './PaymentMethodSelector'
import AccountSelector from './AccountSelector'
import ExpenseModeSelector, { ExpenseMode } from './ExpenseModeSelector'
import IncomeModeSelector, { IncomeMode } from './IncomeModeSelector'
import QuickTransactionPresets from './QuickTransactionPresets'
import { FinancialAccount, PaymentMethod, Transaction } from '../../../types'
import { ToastService } from '../../../services/toast'
import { toLocalIsoDateTimeFromYMD } from '../../../utils/dateTime'
import { useI18n } from '../../../i18n'

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
  const { t, formatCurrency, formatDate, categoryLabel } = useI18n()
  const colors = useThemeColors()
  const formatYMD = (ymd: string) => formatDate(ymd, { day: '2-digit', month: 'short', year: 'numeric' })

  // 🗓️ Controlled form states
  const [date, setDate] = useState(() => toLocalYYYYMMDD())
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>(initialType)
  const [category, setCategory] = useState(type === 'INCOME' ? 'Salary' : 'Groceries')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false)
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null)
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [accountId, setAccountId] = useState<number | null>(null)

  // Review-before-save step shown after the user taps the submit button.
  const [reviewOpen, setReviewOpen] = useState(false)

  // 💳 Installment states
  const [expenseMode, setExpenseMode] = useState<ExpenseMode>('single')
  const [incomeMode, setIncomeMode] = useState<IncomeMode>('single')
  const [installments, setInstallments] = useState(3)
  const [firstInstallmentDate, setFirstInstallmentDate] = useState(() => toLocalYYYYMMDD())
  const [recurringStartDate, setRecurringStartDate] = useState(() => toLocalYYYYMMDD())
  const [recurringDayOfMonth, setRecurringDayOfMonth] = useState(() =>
    dayOfMonthFromYMD(toLocalYYYYMMDD())
  )

  useEffect(() => {
    if (!user?.token) return
    let active = true
    setPaymentMethodsLoading(true)
    listPaymentMethods()
      .then((methods) => {
        if (active) setPaymentMethods(methods)
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: t('transactions.paymentMethodsLoadFailed'),
          dedupeKey: 'payment-methods-load-failed',
        })
      })
      .finally(() => {
        if (active) setPaymentMethodsLoading(false)
      })
    return () => {
      active = false
    }
  }, [user?.token])

  useEffect(() => {
    if (!user?.token) return
    let active = true
    setAccountsLoading(true)
    listAccounts()
      .then((items) => {
        if (!active) return
        setAccounts(items)
        setAccountId((current) => current ?? items.find((account) => account.active)?.id ?? null)
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: t('form.accountsLoadFailed'),
          dedupeKey: 'accounts-load-failed',
        })
      })
      .finally(() => {
        if (active) setAccountsLoading(false)
      })
    return () => {
      active = false
    }
  }, [user?.token])

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

  const applyQuickPreset = useCallback(
    ({ description: nextDescription, category: nextCategory }: {
      description: string
      category: string
    }) => {
      setDescription(nextDescription)
      setCategory(nextCategory)
    },
    [],
  )

  /** Selecting a card also points the transaction at the account it settles to. */
  const handlePaymentMethodChange = useCallback(
    (id: number | null) => {
      setPaymentMethodId(id)
      const card = paymentMethods.find((method) => method.id === id)
      if (card?.settlementAccountId) {
        setAccountId(card.settlementAccountId)
      }
    },
    [paymentMethods],
  )

  const selectedCard = paymentMethods.find((method) => method.id === paymentMethodId) ?? null


  /**
   * 🧾 Handle form submission:
   * - Creates installment plan if enabled (EXPENSE only)
   * - Otherwise creates a single transaction
   * - Displays success/error toast
   * - Resets form on success
   */
  const onSubmit = useCallback(
    async (): Promise<boolean> => {
      if (!user?.token) return false

      if (loading) return false
      if (!accountId) {
        ToastService.warning({
          title: t('transactions.selectAccount'),
          description: t('form.accountRequiredDescription'),
          dedupeKey: 'transaction-account-required',
        })
        return false
      }
      const isInstallment = type === 'EXPENSE' && expenseMode === 'installment' && installments > 1
      if (isInstallment && !paymentMethodId) {
        ToastService.warning({
          title: t('form.selectCreditCard'),
          description: t('form.creditCardRequiredDescription'),
          dedupeKey: 'installment-card-required',
        })
        return false
      }

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
            accountId,
            paymentMethodId,
          })

          ToastService.success({
            title: t('form.fixedExpenseCreated'),
            description: t('form.fixedExpenseCreatedDescription'),
            duration: 3000,
            dedupeKey: 'fixed-expense-created',
          })
        } else if (incomeMode === 'fixed' && type === 'INCOME') {
          await createRecurringTransaction({
            type,
            category,
            description,
            amount: Number(amount),
            startDate: toLocalYYYYMMDD(),
            dayOfMonth: recurringDayOfMonth,
            accountId,
            paymentMethodId,
          })

          ToastService.success({
            title: t('form.fixedIncomeCreated'),
            description: t('form.fixedIncomeCreatedDescription'),
            duration: 3000,
            dedupeKey: 'fixed-income-created',
          })
        } else if (expenseMode === 'installment' && type === 'EXPENSE' && installments > 1) {
          const parts = firstInstallmentDate.split('-').map(Number)
          const yy = parts[0] ?? new Date().getFullYear()
          const mm = parts[1] ?? 1
          const dd = parts[2] ?? 1
          const start = new Date(yy, mm - 1, dd)
          const now = new Date()
          start.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())

          const perInstallment = Number((Number(amount) / installments).toFixed(2))

          await createInstallmentPlan({
            totalInstallments: installments,
            installmentValue: perInstallment,
            category,
            description,
            startDate: firstInstallmentDate,
            purchaseDate: date,
            startDateTime: toLocalIsoDateTimeFromYMD(firstInstallmentDate, start),
            accountId,
            paymentMethodId,
          })

          ToastService.success({
            title: t('form.installmentPlanCreated'),
            description: t('form.installmentPlanSummary', {
              count: installments,
              amount: formatCurrency(Number(amount) / installments),
            }),
            duration: 3000,
            dedupeKey: 'installment-plan-created',
          })
        } else {
          // 💰 Create single transaction
          const tx: Transaction = {
            dateTime: toLocalIsoDateTimeFromYMD(date),
            transactionDate: date,
            type,
            category,
            description,
            amount: Number(amount),
            paymentMethodId,
            accountId,
            status: 'CLEARED',
          }
          const created = await createTransaction(tx)
          onCreated(created)

          ToastService.success({
            title: t('form.transactionSaved'),
            duration: 2000,
            dedupeKey: 'transaction-saved',
          })
        }

        // Reset form
        setAmount(0)
        setDescription('')
        setExpenseMode('single')
        setIncomeMode('single')
        setInstallments(3)
        setPaymentMethodId(null)

        // Trigger parent refresh
        onCreated({} as Transaction)
        return true
      } catch (err: unknown) {
        ToastService.apiError(err, {
          title: t('form.transactionSaveFailed'),
          duration: 3000,
          dedupeKey: 'transaction-save-failed',
        })
        return false
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
      paymentMethodId,
      accountId,
      user?.token,
      onCreated,
    ]
  )

  const selectedAccount = accounts.find((account) => account.id === accountId) ?? null

  /** Pre-flight checks before opening the review summary. */
  const canReview = (): boolean => {
    if (!accountId) {
      ToastService.warning({
        title: t('transactions.selectAccount'),
        description: t('form.accountRequiredDescription'),
        dedupeKey: 'transaction-account-required',
      })
      return false
    }
    if (!amount || Number(amount) <= 0) {
      ToastService.warning({
        title: t('form.enterAmount'),
        description: t('form.enterAmountDescription'),
        dedupeKey: 'transaction-amount-required',
      })
      return false
    }
    const isInstallment = type === 'EXPENSE' && expenseMode === 'installment' && installments > 1
    if (isInstallment && !paymentMethodId) {
      ToastService.warning({
        title: t('form.selectCreditCard'),
        description: t('form.creditCardRequiredDescription'),
        dedupeKey: 'installment-card-required',
      })
      return false
    }
    return true
  }

  const handleReviewRequest = () => {
    if (canReview()) setReviewOpen(true)
  }

  const handleConfirmSave = async () => {
    const ok = await onSubmit()
    // On success the parent closes the modal (this unmounts); only reset on failure.
    if (!ok) setReviewOpen(false)
  }

  const modeLabel =
    type === 'EXPENSE'
      ? expenseMode === 'fixed'
        ? t('form.fixedMonthly')
        : expenseMode === 'installment'
          ? t('dashboard.installments')
          : t('form.oneOff')
      : incomeMode === 'fixed'
        ? t('form.fixedMonthly')
        : t('form.oneOff')

  const isInstallmentReview =
    type === 'EXPENSE' && expenseMode === 'installment' && installments > 1

  const reviewItems: Array<{ label: string; value: string }> = [
    { label: t('form.howItWorks'), value: modeLabel },
    {
      label: t('transactions.amount'),
      value: isInstallmentReview
        ? t('form.amountSummary', {
            total: formatCurrency(Number(amount)),
            count: installments,
            installment: formatCurrency(Number(amount) / installments),
          })
        : formatCurrency(Number(amount)),
    },
    { label: t('transactions.category'), value: category ? categoryLabel(category) : '—' },
    { label: t('transactions.account'), value: selectedAccount ? selectedAccount.name : '—' },
  ]
  if (type === 'EXPENSE') {
    reviewItems.push({
      label: t('form.paymentMethod'),
      value: selectedCard ? selectedCard.name : t('form.debitDefault'),
    })
  }
  if (
    (type === 'EXPENSE' && expenseMode === 'single') ||
    (type === 'INCOME' && incomeMode === 'single')
  ) {
    reviewItems.push({ label: t('form.date'), value: formatYMD(date) })
  } else if (type === 'EXPENSE' && expenseMode === 'fixed') {
    reviewItems.push({
      label: t('form.schedule'),
      value: t('form.everyMonthFrom', { day: recurringDayOfMonth, date: formatYMD(recurringStartDate) }),
    })
  } else if (type === 'INCOME' && incomeMode === 'fixed') {
    reviewItems.push({ label: t('form.schedule'), value: t('form.everyMonth', { day: recurringDayOfMonth }) })
  } else if (type === 'EXPENSE' && expenseMode === 'installment') {
    reviewItems.push({ label: t('form.purchaseDate'), value: formatYMD(date) })
    reviewItems.push({ label: t('form.firstInstallment'), value: formatYMD(firstInstallmentDate) })
  }
  if (description.trim()) {
    reviewItems.push({ label: t('transactions.description'), value: description.trim() })
  }

  const isIncome = type === 'INCOME'
  const accentScheme = isIncome ? 'green' : 'red'
  const confirmGradient = isIncome
    ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
    : 'linear-gradient(135deg, #f43f5e 0%, #dc2626 50%, #b91c1c 100%)'

  return (
    <Box w="full" minW={0}>
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
              minW={0}
              aria-label={t('form.addTransactionAria')} // ♿ Accessibility
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
          <AccountSelector
            value={accountId}
            onChange={setAccountId}
            accounts={accounts}
            loading={accountsLoading}
          />
          {type === 'EXPENSE' && (
            <PaymentMethodSelector
              value={paymentMethodId}
              onChange={handlePaymentMethodChange}
              paymentMethods={paymentMethods}
              loading={paymentMethodsLoading}
            />
          )}
          {((type === 'EXPENSE' && (expenseMode === 'single' || expenseMode === 'installment')) ||
            (type === 'INCOME' && incomeMode === 'single')) && (
            <DateSelector
              date={date}
              onChange={onTransactionDateChange}
              label={expenseMode === 'installment' ? t('form.purchaseDate') : undefined}
            />
          )}
          {type === 'EXPENSE' && expenseMode === 'fixed' && (
              <RecurringSelector
                title={t('form.fixedExpenseSchedule')}
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
                title={t('form.fixedIncomeSchedule')}
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
                card={selectedCard}
              />
          )}
          <CategorySelector type={type} category={category} onChange={setCategory} />
          <QuickTransactionPresets
            category={category}
            transactionType={type}
            onSelect={applyQuickPreset}
          />
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
              onClick={handleReviewRequest}
              isLoading={loading}
              isDisabled={!accountId}
              loadingText={
                type === 'INCOME' && incomeMode === 'fixed'
                  ? t('form.creatingFixedIncome')
                  : expenseMode === 'fixed' && type === 'EXPENSE'
                  ? t('form.creatingFixedExpense')
                  : expenseMode === 'installment' && type === 'EXPENSE'
                    ? t('form.creatingInstallment')
                  : type === 'INCOME'
                    ? t('form.addingIncome')
                    : t('form.addingExpense')
              }
              _hover={{
                bgPosition: '100% 50%',
                boxShadow: type === 'INCOME'
                  ? '0 12px 30px -10px rgba(16, 185, 129, 0.65)'
                  : '0 12px 30px -10px rgba(244, 63, 94, 0.65)',
              }}
              transition="background-position 0.3s ease, box-shadow 0.2s ease"
            >
              {type === 'INCOME' && incomeMode === 'fixed'
                ? t('form.createFixedIncome')
                : expenseMode === 'fixed' && type === 'EXPENSE'
                ? t('form.createFixedExpense')
                : expenseMode === 'installment' && type === 'EXPENSE'
                  ? t('form.createInstallment')
                : type === 'INCOME'
                  ? t('form.addIncome')
                  : t('form.addExpense')}
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
          aria-label={t('form.entryAria')}
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
              <AccountSelector
                value={accountId}
                onChange={setAccountId}
                accounts={accounts}
                loading={accountsLoading}
              />
              {type === 'EXPENSE' && (
                <PaymentMethodSelector
                  value={paymentMethodId}
                  onChange={setPaymentMethodId}
                  paymentMethods={paymentMethods}
                  loading={paymentMethodsLoading}
                />
              )}
              {((type === 'EXPENSE' && (expenseMode === 'single' || expenseMode === 'installment')) ||
                (type === 'INCOME' && incomeMode === 'single')) && (
                <DateSelector
                  date={date}
                  onChange={onTransactionDateChange}
                  label={expenseMode === 'installment' ? t('form.purchaseDate') : undefined}
                />
              )}
              {type === 'EXPENSE' && expenseMode === 'fixed' && (
                  <RecurringSelector
                    title={t('form.fixedExpenseSchedule')}
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
                    title={t('form.fixedIncomeSchedule')}
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
              <QuickTransactionPresets
                category={category}
                transactionType={type}
                onSelect={applyQuickPreset}
              />
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

      {/* ✅ Review-before-save summary */}
      <Modal
        isOpen={reviewOpen}
        onClose={() => !loading && setReviewOpen(false)}
        isCentered
        size={{ base: 'sm', sm: 'md' }}
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent bg={colors.cardBg} borderRadius="2xl" mx={3}>
          <ModalHeader pb={2}>
            <VStack align="stretch" spacing={1}>
              <HStack spacing={2}>
                <Badge colorScheme={accentScheme} borderRadius="full" px={2.5} py={0.5}>
                  {t(isIncome ? 'dashboard.income' : 'dashboard.expense')}
                </Badge>
                <Text fontSize="md" fontWeight={700} color={colors.text.primary}>
                  {t('form.reviewTitle')}
                </Text>
              </HStack>
              <Text fontSize="xs" color={colors.text.secondary} fontWeight={500}>
                {t('form.reviewCaption')}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalBody>
            <VStack align="stretch" spacing={0} divider={<Divider borderColor={colors.border} />}>
              {reviewItems.map((item) => (
                <HStack key={item.label} justify="space-between" align="flex-start" py={2.5} spacing={4}>
                  <Text fontSize="sm" color={colors.text.secondary} flexShrink={0}>
                    {item.label}
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight={700}
                    color={colors.text.primary}
                    textAlign="right"
                    minW={0}
                  >
                    {item.value}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="ghost"
              onClick={() => setReviewOpen(false)}
              isDisabled={loading}
              flex={1}
              borderRadius="xl"
            >
              {t('form.back')}
            </Button>
            <Button
              flex={1}
              color="white"
              borderRadius="xl"
              bg={confirmGradient}
              onClick={handleConfirmSave}
              isLoading={loading}
              loadingText={t('form.saving')}
              _hover={{ filter: 'brightness(1.06)' }}
            >
              {t('form.confirmSave')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
