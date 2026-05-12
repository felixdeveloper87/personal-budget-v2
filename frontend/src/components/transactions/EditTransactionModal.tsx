import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Icon,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { Pencil, TrendingDown, TrendingUp } from '../ui/icons'
import { useAuth } from '../../contexts/AuthContext'
import { listPaymentMethods, updateTransaction } from '../../api'
import { PaymentMethod, Transaction } from '../../types'
import { ModalHeader, PremiumModal } from '../ui'
import { ToastService } from '../../services/toast'
import { toLocalIsoDateTimeFromYMD } from '../../utils/dateTime'
import DateSelector from './TransactionForm/DateSelector'
import AmountInput from './TransactionForm/AmountInput'
import CategorySelector from './TransactionForm/CategorySelector'
import DescriptionInput from './TransactionForm/DescriptionInput'
import PaymentMethodSelector from './TransactionForm/PaymentMethodSelector'

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

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const bodyBg = useColorModeValue('gray.50', '#0a0a0a')

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

  useEffect(() => {
    if (transaction) {
      setDate(transaction.transactionDate || transaction.dateTime.slice(0, 10))
      setCategory(transaction.category || '')
      setDescription(transaction.description || '')
      setAmount(transaction.amount || 0)
      setPaymentMethodId(transaction.paymentMethodId ?? null)
    }
  }, [transaction])

  useEffect(() => {
    if (!user?.token || !isOpen) return
    let active = true
    setPaymentMethodsLoading(true)
    listPaymentMethods()
      .then((methods) => {
        if (active) setPaymentMethods(methods)
      })
      .catch((err) => {
        ToastService.apiError(err, {
          title: 'Could not load payment methods',
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

    setLoading(true)
    try {
      const updatedTx: Transaction = {
        ...transaction,
        dateTime: toLocalIsoDateTimeFromYMD(date),
        transactionDate: date,
        category,
        description,
        amount: Number(amount),
        paymentMethodId,
      }

      await updateTransaction(transaction.id, updatedTx)

      ToastService.success({
        title: 'Transaction updated',
        duration: 2000,
        dedupeKey: `transaction-updated:${transaction.id}`,
      })

      onTransactionUpdated()
      onClose()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: 'Could not update transaction',
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
          title="Edit transaction"
          caption={`Update this ${isIncome ? 'income' : 'expense'}`}
          onClose={onClose}
          accent={isIncome ? 'green' : 'red'}
        />
      }
      contentProps={{ bg: surfaceBg }}
    >
      <Box flex="1" bg={bodyBg} p={{ base: 4, sm: 6, md: 8 }} overflowY="auto">
        <VStack spacing={6} align="stretch" w="full">
          <DateSelector date={date} onChange={setDate} />
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
            loadingText="Updating…"
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
            Save changes
          </Button>
        </VStack>
      </Box>
    </PremiumModal>
  )
}
