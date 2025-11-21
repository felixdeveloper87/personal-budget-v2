import {
  Box,
  Text,
  useColorModeValue,
  VStack,
  Button,
  Icon,
  HStack,
} from '@chakra-ui/react'
import { Plus, Minus, X } from 'lucide-react'
import TransactionForm from './TransactionForm/TransactionForm'
import { Transaction } from '../../types'
import { safeAreaStyles, safariStyles, getResponsiveStyles, getScrollbarStyles, PremiumModal } from '../ui'
import { motion } from 'framer-motion'

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'INCOME' | 'EXPENSE'
  transactions: Transaction[]
  onTransactionCreated: () => void
  onRefresh: () => void
}

const MotionBox = motion(Box)

export default function AddTransactionModal({
  isOpen,
  onClose,
  type,
  transactions,
  onTransactionCreated,
  onRefresh,
}: AddTransactionModalProps) {
  const responsiveStyles = getResponsiveStyles()
  const cardBg = useColorModeValue('gray.50', 'blackAlpha.500')

  const headerBg = useColorModeValue(
    type === 'INCOME'
      ? 'linear(to-br, green.50, green.200, green.100)'
      : 'linear(to-br, red.50, red.200, red.100)',
    type === 'INCOME'
      ? 'linear(to-br, green.900, green.700, green.800)'
      : 'linear(to-br, red.500, red.500, red.900)'
  )

  const iconGradient = useColorModeValue(
    type === 'INCOME'
      ? 'linear(to-br, green.400, emerald.500)'
      : 'linear(to-br, red.400, rose.500)',
    type === 'INCOME'
      ? 'linear(to-br, green.300, emerald.400)'
      : 'linear(to-br, red.300, rose.400)'
  )

  const handleTransactionCreated = () => {
    onTransactionCreated()
    onClose()
  }

  const ModalHeader = (
    <Box
      position="relative"
      bgGradient={headerBg}
      borderBottom="1px solid"
      borderColor={useColorModeValue(
        type === 'INCOME' ? 'green.200' : 'red.200',
        type === 'INCOME' ? 'green.700' : 'red.700'
      )}
      p={{ base: 4, sm: 5, md: 6 }}
      sx={{
        paddingTop: 'max(56px, env(safe-area-inset-top, 56px))',
      }}
      overflow="hidden"
    >
      {/* Decorative gradient blob */}
      <Box
        position="absolute"
        top="-50%"
        right="-20%"
        w="300px"
        h="300px"
        bg={type === 'INCOME' ? 'green.400' : 'red.400'}
        opacity={useColorModeValue(0.1, 0.2)}
        filter="blur(60px)"
        borderRadius="full"
      />

      {/* Another decorative blob */}
      <Box
        position="absolute"
        bottom="-30%"
        left="-10%"
        w="200px"
        h="200px"
        bg={type === 'INCOME' ? 'emerald.400' : 'rose.400'}
        opacity={useColorModeValue(0.08, 0.15)}
        filter="blur(50px)"
        borderRadius="full"
      />
      <HStack
        spacing={{ base: 3, sm: 4 }}
        align="center"
        justify="space-between"
        flexWrap="nowrap"
        position="relative"
        zIndex={1}
      >
        {/* Logo + Text */}
        <HStack
          spacing={{ base: 3, sm: 4 }}
          align="center"
          flex="1"
          minW={0}
        >
          <MotionBox
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            p={{ base: 2.5, sm: 3 }}
            borderRadius="2xl"
            bgGradient={iconGradient}
            boxShadow="xl"
            flexShrink={0}
            border="2px solid"
            borderColor={useColorModeValue('gray.300', 'whiteAlpha.300')}
            _hover={{
              transform: 'scale(1.05) rotate(5deg)',
              boxShadow: '2xl',
            }}
          >
            {type === 'INCOME' ? (
              <Plus size={22} color="green" strokeWidth={3} />
            ) : (
              <Minus size={22} color="red" strokeWidth={3} />
            )}
          </MotionBox>
          <VStack
            align="start"
            spacing={1}
            flex="1"
            minW={0}
          >
            <Text
              color={useColorModeValue('gray.800', 'white')}
              fontWeight="900"
              fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}
              lineHeight="shorter"
              noOfLines={1}
              letterSpacing="-0.02em"
            >
              {type === 'INCOME' ? 'Add Income' : 'Add Expense'}
            </Text>
            <Text
              color={useColorModeValue('gray.600', 'gray.300')}
              fontWeight="600"
              fontSize={{ base: 'xs', sm: 'sm' }}
              noOfLines={1}
            >
              {type === 'INCOME' ? 'Track your incoming money' : 'Record your spending'}
            </Text>
          </VStack>
        </HStack>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          bg={useColorModeValue('whiteAlpha.600', 'blackAlpha.400')}
          border="1px solid"
          borderColor={useColorModeValue('gray.300', 'gray.600')}
          borderRadius="xl"
          p={2.5}
          _hover={{
            bg: useColorModeValue('whiteAlpha.800', 'blackAlpha.600'),
            borderColor: useColorModeValue('gray.400', 'gray.500'),
            transform: 'scale(1.05)',
          }}
          transition="all 0.2s ease"
          flexShrink={0}
          backdropFilter="blur(10px)"
        >
          <Icon as={X} boxSize={5} color={useColorModeValue('gray.700', 'gray.300')} />
        </Button>
      </HStack>
    </Box>
  )

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'lg', md: 'xl', lg: '4xl' }}
      header={ModalHeader}
      contentProps={{
        bg: cardBg,
      }}
    >
      {/* Modal content - Scrollable */}
      <Box
        flex="1"
        p={{ base: 4, sm: 5, md: 6 }}
        overflowY="auto"
        bg={cardBg}
        {...responsiveStyles.content}
        sx={{
          ...safeAreaStyles.content,
          ...safariStyles.scrollable,
          ...getScrollbarStyles(useColorModeValue)
        }}
      >
        <TransactionForm
          transactions={transactions}
          onCreated={handleTransactionCreated}
          onTransactionDeleted={onRefresh}
          initialType={type}
          showRecentTransactions
          compact
        />
      </Box>
    </PremiumModal>
  )
}
