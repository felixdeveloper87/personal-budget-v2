import { useState, useMemo, useCallback } from 'react'
import {
  Box,
  Button,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Textarea,
  useToast,
  Text,
  Wrap,
  WrapItem,
  VStack,
  Heading,
  Grid,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Card,
  CardBody,
  Divider,
  Badge,
} from '@chakra-ui/react'
import { useThemeColors } from '../hooks/useThemeColors'
import { createTransaction } from '../api'
import { Transaction } from '../types'
import { useAuth } from '../contexts/AuthContext'
import NumberPad from './NumberPad'
import RecentTransactions from './RecentTransactions'
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  Laptop,
  TrendingUp as Investment,
  Building,
  Home,
  Gift,
  RotateCcw,
  FileText,
  ShoppingCart,
  Car,
  Film,
  Heart,
  Zap,
  ShoppingBag,
} from 'lucide-react'

const incomeCategories = [
  { name: 'Salary', icon: Briefcase },
  { name: 'Freelance', icon: Laptop },
  { name: 'Investments', icon: Investment },
  { name: 'Business', icon: Building },
  { name: 'Rental', icon: Home },
  { name: 'Bonus', icon: Gift },
  { name: 'Refund', icon: RotateCcw },
  { name: 'Others', icon: FileText },
]

const expenseCategories = [
  { name: 'Groceries', icon: ShoppingCart },
  { name: 'Rent', icon: Home },
  { name: 'Transport', icon: Car },
  { name: 'Entertainment', icon: Film },
  { name: 'Health', icon: Heart },
  { name: 'Utilities', icon: Zap },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Others', icon: FileText },
]

interface TransactionFormProps {
  onCreated: (t: Transaction) => void
  onTransactionDeleted?: () => void
  transactions: Transaction[]
}

export default function TransactionForm({
  onCreated,
  onTransactionDeleted,
  transactions,
}: TransactionFormProps) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [category, setCategory] = useState('Salary')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const currentCategories = useMemo(
    () => (type === 'INCOME' ? incomeCategories : expenseCategories),
    [type]
  )

  const handleTypeChange = useCallback((newType: 'INCOME' | 'EXPENSE') => {
    setType(newType)
    const newCategories = newType === 'INCOME' ? incomeCategories : expenseCategories
    setCategory(newCategories[0].name)
    setAmount(0)
    setDescription('')
  }, [])

  const quickAmounts = useMemo(
    () => (type === 'INCOME' ? [100, 500, 1000, 2000] : [10, 25, 50, 100]),
    [type]
  )

  const quickDates = useMemo(() => {
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return [
      { label: 'Today', date: today },
      { label: 'Yesterday', date: yesterday },
      { label: 'Tomorrow', date: tomorrow },
      { label: 'Week ago', date: weekAgo },
      { label: '1st of month', date: firstOfMonth },
      { label: 'End of month', date: lastOfMonth },
    ]
  }, [])

  const handleQuickDate = useCallback((d: Date) => {
    setDate(d.toISOString().slice(0, 10))
  }, [])

  const onSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [date, type, category, description, amount, user?.token, onCreated, toast])

  const colors = useThemeColors()

  return (
    <Box w="full">
      <Card bg={colors.cardBg} shadow="lg" borderRadius="2xl" border="1px" borderColor={colors.border}>
        <CardBody p={{ base: 4, sm: 6, md: 10 }}>
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            {/* Header */}
            <VStack spacing={2} align={{ base: "center", md: "flex-start" }}>
              <HStack spacing={3} align="center" flexWrap="wrap" justify={{ base: "center", md: "flex-start" }}>
                <Heading size={{ base: "md", md: "lg" }} color={colors.text.label}>
                  Add {type === 'INCOME' ? 'Income' : 'Expense'}
                </Heading>
                <Badge colorScheme={type === 'INCOME' ? 'green' : 'red'} borderRadius="full" px={3} fontSize={{ base: "xs", md: "sm" }}>
                  {type === 'INCOME' ? 'Money in' : 'Money out'}
                </Badge>
              </HStack>
              <Text fontSize={{ base: "xs", md: "sm" }} color={colors.text.secondary} textAlign={{ base: "center", md: "left" }}>
                {type === 'INCOME'
                  ? 'Track money coming into your account'
                  : 'Record money going out of your account'}
              </Text>
            </VStack>

            <Divider />

            {/* Form */}
            <form onSubmit={onSubmit}>
              <VStack spacing={{ base: 6, md: 8 }} align="stretch">
                {/* Transaction Type Toggle */}
                <Box w="full">
                  <Text fontWeight="600" mb={4} color={colors.text.label}>
                    Transaction Type
                  </Text>
                  <Box
                    position="relative"
                    bg={colors.border}
                    borderRadius="2xl"
                    p={1}
                    w="full"
                    maxW="400px"
                    mx="auto"
                    boxShadow="inset 0 2px 4px rgba(0, 0, 0, 0.1)"
                  >
                    <HStack spacing={0} w="full">
                      <Button
                        onClick={() => handleTypeChange('INCOME')}
                        variant="ghost"
                        size={{ base: "md", md: "lg" }}
                        px={{ base: 4, md: 8 }}
                        py={{ base: 4, md: 6 }}
                        borderRadius="xl"
                        bg={type === 'INCOME' ? 'white' : 'transparent'}
                        color={type === 'INCOME' ? 'green.600' : colors.text.secondary}
                        fontWeight="600"
                        fontSize={{ base: "sm", md: "md" }}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        boxShadow={type === 'INCOME' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'}
                        transform={type === 'INCOME' ? 'scale(1.02)' : 'scale(1)'}
                        _hover={{
                          bg: type === 'INCOME' ? 'white' : 'rgba(255, 255, 255, 0.1)',
                          transform: 'scale(1.05)',
                        }}
                        _active={{
                          transform: 'scale(0.98)',
                        }}
                        leftIcon={<TrendingUp size={20} />}
                        rightIcon={
                          type === 'INCOME' ? (
                            <Box
                              w={{ base: 1.5, md: 2 }}
                              h={{ base: 1.5, md: 2 }}
                              bg="green.500"
                              borderRadius="full"
                              boxShadow="0 0 8px rgba(34, 197, 94, 0.6)"
                            />
                          ) : undefined
                        }
                        flex={1}
                      >
                        <Text display={{ base: "none", sm: "inline" }}>Income</Text>
                        <Text display={{ base: "inline", sm: "none" }}>+</Text>
                      </Button>
                      <Button
                        onClick={() => handleTypeChange('EXPENSE')}
                        variant="ghost"
                        size={{ base: "md", md: "lg" }}
                        px={{ base: 4, md: 8 }}
                        py={{ base: 4, md: 6 }}
                        borderRadius="xl"
                        bg={type === 'EXPENSE' ? 'white' : 'transparent'}
                        color={type === 'EXPENSE' ? 'red.600' : colors.text.secondary}
                        fontWeight="600"
                        fontSize={{ base: "sm", md: "md" }}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        boxShadow={type === 'EXPENSE' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'}
                        transform={type === 'EXPENSE' ? 'scale(1.02)' : 'scale(1)'}
                        _hover={{
                          bg: type === 'EXPENSE' ? 'white' : 'rgba(255, 255, 255, 0.1)',
                          transform: 'scale(1.05)',
                        }}
                        _active={{
                          transform: 'scale(0.98)',
                        }}
                        leftIcon={<TrendingDown size={20} />}
                        rightIcon={
                          type === 'EXPENSE' ? (
                            <Box
                              w={{ base: 1.5, md: 2 }}
                              h={{ base: 1.5, md: 2 }}
                              bg="red.500"
                              borderRadius="full"
                              boxShadow="0 0 8px rgba(239, 68, 68, 0.6)"
                            />
                          ) : undefined
                        }
                        flex={1}
                      >
                        <Text display={{ base: "none", sm: "inline" }}>Expense</Text>
                        <Text display={{ base: "inline", sm: "none" }}>-</Text>
                      </Button>
                    </HStack>
                  </Box>
                  <Text fontSize={{ base: "xs", md: "sm" }} color={colors.text.muted} mt={2} textAlign="center">
                    {type === 'INCOME' 
                      ? '💰 Money coming into your account' 
                      : '💸 Money going out of your account'
                    }
                  </Text>
                </Box>

                {/* Date & Amount */}
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={{ base: 6, md: 8 }}>
                  {/* Date */}
                  <Box>
                    <Text fontWeight="600" mb={3} color={colors.text.label}>Date</Text>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      size="lg"
                      borderRadius="xl"
                      border="2px"
                      borderColor={colors.border}
                      _focus={{ borderColor: colors.accent }}
                    />
                    <Wrap mt={3} spacing={2}>
                      {quickDates.map((qd) => (
                        <WrapItem key={qd.label}>
                          <Button
                            size={{ base: "xs", sm: "sm" }}
                            variant={date === qd.date.toISOString().slice(0, 10) ? 'solid' : 'outline'}
                            colorScheme="blue"
                            borderRadius="full"
                            onClick={() => handleQuickDate(qd.date)}
                            fontSize={{ base: "xs", sm: "sm" }}
                            px={{ base: 2, sm: 3 }}
                          >
                            {qd.label}
                          </Button>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>

                  {/* Amount */}
                  <Box>
                    <Text fontWeight="600" mb={3} color={colors.text.label}>Amount</Text>
                    <NumberInput
                      value={amount}
                      onChange={(_, val) => setAmount(val || 0)}
                      size="lg"
                      precision={2}
                      step={0.01}
                      min={0}
                    >
                      <NumberInputField
                        placeholder="£0.00"
                        fontSize="lg"
                        fontWeight="600"
                        borderRadius="xl"
                        border="2px"
                        borderColor={colors.border}
                        onClick={onOpen}
                        cursor="pointer"
                      />
                    </NumberInput>
                    <Wrap mt={3} spacing={2}>
                      {quickAmounts.map((qa) => (
                        <WrapItem key={qa}>
                          <Button
                            size={{ base: "xs", sm: "sm" }}
                            variant={amount === qa ? 'solid' : 'outline'}
                            colorScheme="blue"
                            borderRadius="full"
                            onClick={() => setAmount(qa)}
                            fontSize={{ base: "xs", sm: "sm" }}
                            px={{ base: 2, sm: 3 }}
                          >
                            £{qa}
                          </Button>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                </Grid>

                {/* Category */}
                <Box>
                  <Text fontWeight="600" mb={3} color={colors.text.label}>
                    {type === 'INCOME' ? 'Income Category' : 'Expense Category'}
                  </Text>
                  <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={{ base: 2, md: 3 }}>
                    {currentCategories.map((cat) => {
                      const IconComponent = cat.icon
                      return (
                        <Button
                          key={cat.name}
                          variant={category === cat.name ? 'solid' : 'outline'}
                          colorScheme={category === cat.name ? 'blue' : 'gray'}
                          borderRadius="xl"
                          justifyContent="flex-start"
                          onClick={() => setCategory(cat.name)}
                          size={{ base: "sm", md: "md" }}
                          px={{ base: 2, md: 3 }}
                          py={{ base: 3, md: 4 }}
                          fontSize={{ base: "xs", sm: "sm" }}
                        >
                          <HStack spacing={{ base: 1, md: 2 }}>
                            <IconComponent size={18} />
                            <Text display={{ base: "none", sm: "inline" }}>{cat.name}</Text>
                            <Text display={{ base: "inline", sm: "none" }} fontSize="xs">
                              {cat.name.length > 6 ? cat.name.substring(0, 6) + '...' : cat.name}
                            </Text>
                          </HStack>
                        </Button>
                      )
                    })}
                  </SimpleGrid>
                </Box>

                {/* Description + Submit */}
                <VStack spacing={{ base: 4, md: 8 }} align="stretch">
                  <Textarea
                    placeholder="Add a note (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    size={{ base: "md", md: "lg" }}
                    rows={4}
                    borderRadius="xl"
                    border="2px"
                    borderColor={colors.border}
                    fontSize={{ base: "sm", md: "md" }}
                  />
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size={{ base: "md", md: "lg" }}
                    isLoading={loading}
                    loadingText="Saving..."
                    borderRadius="xl"
                    px={{ base: 6, md: 10 }}
                    py={{ base: 4, md: 6 }}
                    fontWeight="600"
                    fontSize={{ base: "sm", md: "md" }}
                    w="full"
                  >
                    {type === 'INCOME' ? 'Add Income' : 'Add Expense'}
                  </Button>
                </VStack>
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>

      {/* Recent Transactions */}
      <Box mt={{ base: 6, md: 8 }}>
        <RecentTransactions
          transactions={transactions}
          type={type}
          limit={3}
          onTransactionDeleted={onTransactionDeleted}
        />
      </Box>

      {/* Number Pad Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", sm: "sm" }}>
        <ModalOverlay />
        <ModalContent borderRadius={{ base: "none", sm: "2xl" }} m={0} h={{ base: "100vh", sm: "auto" }}>
          <ModalHeader textAlign="center" fontSize={{ base: "lg", sm: "md" }}>Enter Amount</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={{ base: 4, sm: 6 }}>
            <NumberPad value={amount} onValueChange={setAmount} />
            <HStack mt={6} justify="space-between">
              <Button variant="ghost" onClick={onClose} size={{ base: "md", sm: "sm" }}>Cancel</Button>
              <Button colorScheme="blue" onClick={onClose} size={{ base: "md", sm: "sm" }}>Done</Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
