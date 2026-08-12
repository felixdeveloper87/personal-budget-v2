import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Icon,
  Select,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { Pencil, TrendingDown, TrendingUp } from '../ui/icons'
import { useAuth } from '../../contexts/AuthContext'
import { listAccounts, listPaymentMethods, updateTransaction } from '../../api'
import {
  FinancialAccount,
  PaymentMethod,
  Transaction,
  TransactionStatus,
  UpdateTransactionRequest,
} from '../../types'
import { ModalHeader, PremiumModal } from '../ui'
import { ToastService } from '../../services/toast'
import { toLocalIsoDateTimeFromYMD } from '../../utils/dateTime'
import DateSelector from './TransactionForm/DateSelector'
import AmountInput from './TransactionForm/AmountInput'
import CategorySelector from './TransactionForm/CategorySelector'
import DescriptionInput from './TransactionForm/DescriptionInput'
import PaymentMethodSelector from './TransactionForm/PaymentMethodSelector'
import AccountSelector from './TransactionForm/AccountSelector'
import { useEditorialPalette } from '../../editorial'
import { useI18n } from '../../i18n'

interface EditTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  onTransactionUpdated: () => void
}

export default function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  onTransactionUpdated,
}: EditTransactionModalProps) {
  const { user } = useAuth()
  const { t } = useI18n()
  const ed = useEditorialPalette()

  const type = transaction?.type || 'EXPENSE'
  const isIncome = type === 'INCOME'

  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false)
  const [paymentMethodId, setPaymentMethodId] = useState<number | null>(null)
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [accountId, setAccountId] = useState<number | null>(null)
  const [status, setStatus] = useState<TransactionStatus>('CLEARED')

  useEffect(() => {
    if (transaction) {
      setDate(transaction.transactionDate || transaction.dateTime.slice(0, 10))
      setCategory(transaction.category || '')
      setDescription(transaction.description || '')
      setAmount(transaction.amount || 0)
      setPaymentMethodId(transaction.paymentMethodId ?? null)
      setAccountId(transaction.accountId ?? null)
      setStatus(transaction.status ?? 'CLEARED')
    }
  }, [transaction])

  useEffect(() => {
    if (!user?.token || !isOpen) return
    let active = true
    setPaymentMethodsLoading(true)
    Promise.all([listPaymentMethods(), listAccounts()])
      .then(([methods, accountItems]) => {
        if (active) {
          setPaymentMethods(methods)
          setAccounts(accountItems)
        }
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: t('transactions.paymentMethodsLoadFailed'),
          dedupeKey: 'edit-payment-methods-load-failed',
        })
      })
      .finally(() => {
        if (active) setPaymentMethodsLoading(false)
      })
    return () => {
      active = false
    }
  }, [user?.token, isOpen])

  const handleSubmit = useCallback(async () => {
    if (!user?.token || !transaction?.id || loading) return
    if (!accountId) {
      ToastService.warning({
        title: t('transactions.selectAccount'),
        dedupeKey: 'edit-transaction-account-required',
      })
      return
    }

    setLoading(true)
    try {
      const updatedTx: UpdateTransactionRequest = {
        dateTime: toLocalIsoDateTimeFromYMD(date),
        transactionDate: date,
        type: transaction.type,
        category,
        description,
        amount: Number(amount),
        paymentMethodId,
        accountId,
        status,
      }

      await updateTransaction(transaction.id, updatedTx)

      ToastService.success({
        title: t('transactions.updated'),
        duration: 2000,
        dedupeKey: `transaction-updated:${transaction.id}`,
      })

      onTransactionUpdated()
      onClose()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: t('transactions.updateFailed'),
        duration: 3000,
        dedupeKey: `transaction-update-failed:${transaction.id}`,
      })
    } finally {
      setLoading(false)
    }
  }, [
    date,
    category,
    description,
    amount,
    paymentMethodId,
    accountId,
    status,
    transaction,
    user?.token,
    onClose,
    onTransactionUpdated,
    loading,
  ])

  if (!transaction) return null

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
      header={
        <ModalHeader
          icon={Pencil}
          title={t('transactions.editTitle')}
          caption={t(isIncome ? 'transactions.editCaptionIncome' : 'transactions.editCaptionExpense')}
          onClose={onClose}
          accent={isIncome ? 'green' : 'red'}
        />
      }
    >
      <Box flex="1" bg={ed.bg} p={{ base: 4, sm: 6, md: 8 }} overflowY="auto">
        <VStack spacing={6} align="stretch" w="full">
          <DateSelector date={date} onChange={setDate} />
          <AccountSelector
            value={accountId}
            onChange={setAccountId}
            accounts={accounts}
            loading={paymentMethodsLoading}
          />
          {type === 'EXPENSE' && (
            <PaymentMethodSelector
              value={paymentMethodId}
              onChange={setPaymentMethodId}
              paymentMethods={paymentMethods}
              loading={paymentMethodsLoading}
            />
          )}
          <CategorySelector type={type} category={category} onChange={setCategory} />
          <AmountInput amount={amount} onChange={setAmount} type={type} />
          <DescriptionInput
            value={description}
            onChange={setDescription}
            type={type}
            loading={loading}
          />
          <Box>
            <Box as="label" display="block" fontSize="sm" fontWeight={700} mb={2}>
              {t('transactions.status')}
            </Box>
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value as TransactionStatus)}
            >
              <option value="PLANNED">{t('transactions.planned')}</option>
              <option value="PENDING">{t('transactions.pending')}</option>
              <option value="CLEARED">{t('transactions.cleared')}</option>
              <option value="RECONCILED">{t('transactions.reconciled')}</option>
            </Select>
          </Box>

          <Button
            size="lg"
            h={14}
            w="full"
            fontSize="md"
            fontWeight={700}
            color="white"
            borderRadius="xl"
            bg={
              isIncome
                ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
                : 'linear-gradient(135deg, #f43f5e 0%, #dc2626 50%, #b91c1c 100%)'
            }
            bgSize="200% 100%"
            bgPosition="0% 50%"
            boxShadow={
              isIncome
                ? '0 8px 24px -10px rgba(16, 185, 129, 0.55)'
                : '0 8px 24px -10px rgba(244, 63, 94, 0.55)'
            }
            leftIcon={<Icon as={isIncome ? TrendingUp : TrendingDown} boxSize={4} />}
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!accountId}
            loadingText={t('transactions.updating')}
            _hover={{
              bgPosition: '100% 50%',
              transform: 'translateY(-1px)',
              boxShadow: isIncome
                ? '0 12px 30px -10px rgba(16, 185, 129, 0.65)'
                : '0 12px 30px -10px rgba(244, 63, 94, 0.65)',
            }}
            _active={{ transform: 'translateY(0)' }}
            transition="background-position 0.3s ease, transform 0.15s ease, box-shadow 0.2s ease"
          >
            {t('transactions.saveChanges')}
          </Button>
        </VStack>
      </Box>
    </PremiumModal>
  )
}
