import {
  Modal,
  ModalOverlay,
  ModalContent,
  Box,
  useColorModeValue,
  VStack,
  Button,
  Icon,
  HStack,
  Flex,
} from '@chakra-ui/react'
import { TrendingUp, TrendingDown, X } from 'lucide-react'
import { useThemeColors } from '../../hooks/useThemeColors'
import { Transaction } from '../../types'
import { animations, getGradients, safeAreaStyles, safariStyles, getResponsiveStyles, getScrollbarStyles, getTransactionModalHeaderStyles } from '../ui'
import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '@chakra-ui/react'
import { updateTransaction } from '../../api'
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
  const colors = useThemeColors()
  const gradients = getGradients()
  const responsiveStyles = getResponsiveStyles()
  const { user } = useAuth()
  const toast = useToast()
  
  const type = transaction?.type || 'EXPENSE'
  const headerStyles = getTransactionModalHeaderStyles(useColorModeValue, type)

  // Form states
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Initialize form when transaction changes
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
    if (!user?.token || !transaction?.id) return

    if (loading) return

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
  }, [date, category, description, amount, transaction, user?.token, onClose, onTransactionUpdated, toast, loading])

  if (!transaction) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
      isCentered
      scrollBehavior="inside"
      closeOnOverlayClick={false}
      closeOnEsc={true}
      blockScrollOnMount={true}
    >
      <ModalOverlay 
        bg="blackAlpha.600" 
        backdropFilter="blur(10px)"
      />
      <ModalContent 
        borderRadius={{ base: 'none', md: '3xl' }}
        m={{ base: 0, md: 4 }}
        display="flex"
        flexDirection="column"
        {...responsiveStyles.modal}
        sx={{
          ...safeAreaStyles.container,
          ...safariStyles.modal,
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: useColorModeValue('#cbd5e1', '#4b5563'),
            borderRadius: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: useColorModeValue('#f1f5f9', '#1e293b'),
          }
        }}
      >        
        {/* Decorative background */}
        <Box
          position="absolute"
          top="-50px"
          left="-50px"
          right="-50px"
          height="200px"
          background={gradients.decorative}
          borderRadius="3xl"
          filter="blur(40px)"
          opacity={0.3}
          zIndex={0}
        />

        {/* Header */}
        <Box 
          {...headerStyles.container} 
          position="relative" 
          zIndex={1}
          sx={{
            ...headerStyles.container.sx,
            paddingTop: 'max(56px, env(safe-area-inset-top, 56px))',
          }}
        >
          <Button 
            onClick={onClose} 
            {...headerStyles.closeButton}
          >
            <Icon as={X} boxSize={headerStyles.closeButton.iconSize} />
          </Button>

          <Flex
            direction="row"
            align="center"
            justify="center"
            flexWrap="wrap"
            pr={{ base: 14, sm: 20 }}
            pt={{ base: 2, sm: 0 }}
            gap={{ base: 2, sm: 3 }}
          >
            <HStack
              spacing={{ base: 2, sm: 3 }}
              align="center"
              flex="1"
              minW={0}
            >
              <Box
                p={{ base: 2, sm: 3 }}
                borderRadius="2xl"
                bg={headerStyles.iconContainer.bg}
                boxShadow="lg"
                flexShrink={0}
              >
                {type === 'INCOME' ? (
                  <Icon as={TrendingUp} boxSize={{ base: 5, sm: 6 }} color="white" />
                ) : (
                  <Icon as={TrendingDown} boxSize={{ base: 5, sm: 6 }} color="white" />
                )}
              </Box>
              <VStack align="start" spacing={0} flex="1" minW={0}>
                <Box
                  color={headerStyles.title.color}
                  fontWeight="800"
                  fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}
                  lineHeight="shorter"
                  noOfLines={1}
                >
                  Edit Transaction
                </Box>
                <Box
                  color={headerStyles.subtitle.color}
                  fontWeight="600"
                  fontSize={{ base: 'xs', sm: 'sm' }}
                  noOfLines={1}
                >
                  Update transaction details
                </Box>
              </VStack>
            </HStack>
          </Flex>
        </Box>
        
        <Box
          flex="1"
          overflowY="auto"
          position="relative"
          zIndex={1}
          p={{ base: 4, sm: 6, md: 8 }}
        >
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
              colorScheme={type === 'INCOME' ? 'green' : 'red'}
              bg={type === 'INCOME' 
                ? 'linear-gradient(135deg, #22c55e, #16a34a, #15803d)' 
                : 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)'
              }
              color="white"
              fontWeight="bold"
              borderRadius="2xl"
              w="full"
              h={14}
              fontSize="lg"
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Updating..."
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'xl',
                filter: 'brightness(1.1)'
              }}
              _active={{
                transform: 'translateY(0)'
              }}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              boxShadow="lg"
            >
              Update Transaction
            </Button>
          </VStack>
        </Box>
      </ModalContent>
    </Modal>
  )
}

