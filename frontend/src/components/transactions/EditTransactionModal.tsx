import { useCallback, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Icon,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { Pencil, TrendingDown, TrendingUp } from '../ui/icons'
import { useAuth } from '../../contexts/AuthContext'
import { updateTransaction } from '../../api'
import { Transaction } from '../../types'
import { ModalHeader, PremiumModal } from '../ui'
import DateSelector from './TransactionForm/DateSelector'
import AmountInput from './TransactionForm/AmountInput'
import CategorySelector from './TransactionForm/CategorySelector'
import DescriptionInput from './TransactionForm/DescriptionInput'

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
  const toast = useToast()

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const bodyBg = useColorModeValue('gray.50', '#0a0a0a')

  const type = transaction?.type || 'EXPENSE'
  const isIncome = type === 'INCOME'

  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (transaction) {
      const txDate = new Date(transaction.dateTime)
      setDate(txDate.toISOString().slice(0, 10))
      setCategory(transaction.category || '')
      setDescription(transaction.description || '')
      setAmount(transaction.amount || 0)
    }
  }, [transaction])

  const handleSubmit = useCallback(async () => {
    if (!user?.token || !transaction?.id || loading) return

    setLoading(true)
    try {
      const now = new Date()
      const selectedDate = new Date(date)
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0)

      const updatedTx: Transaction = {
        ...transaction,
        dateTime: selectedDate.toISOString(),
        category,
        description,
        amount: Number(amount),
      }

      await updateTransaction(transaction.id, updatedTx)

      toast({
        title: 'Transaction updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })

      onTransactionUpdated()
      onClose()
    } catch (err: any) {
      toast({
        title: 'Error updating transaction',
        description: err?.message || 'Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }, [
    date,
    category,
    description,
    amount,
    transaction,
    user?.token,
    onClose,
    onTransactionUpdated,
    toast,
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
