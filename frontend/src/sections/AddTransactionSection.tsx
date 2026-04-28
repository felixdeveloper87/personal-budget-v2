import { useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Icon,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import { Plus, Minus, Wallet } from '../components/ui/icons'
import { AddTransactionModal } from '../components/transactions'
import { Transaction } from '../types'
import { SectionCard, SectionHeader } from '../components/ui'

interface AddTransactionSectionProps {
  transactions: Transaction[]
  onRefresh: () => void
}

interface QuickActionConfig {
  label: string
  type: 'INCOME' | 'EXPENSE'
  icon: typeof Plus
  /** CSS gradient applied to the button background. */
  gradient: string
  /** Subtle ambient shadow color (rgba). */
  shadow: string
}

const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    label: 'Income',
    type: 'INCOME',
    icon: Plus,
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    shadow: 'rgba(16, 185, 129, 0.35)',
  },
  {
    label: 'Expense',
    type: 'EXPENSE',
    icon: Minus,
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    shadow: 'rgba(239, 68, 68, 0.35)',
  },
]

export default function AddTransactionSection({
  transactions,
  onRefresh,
}: AddTransactionSectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')

  const handleOpen = (next: 'INCOME' | 'EXPENSE') => {
    setType(next)
    onOpen()
  }

  const handleTransactionCreated = () => {
    onRefresh()
    onClose()
  }

  return (
    <>
      <SectionCard h="full">
        <Box p={{ base: 4, sm: 5 }}>
          <VStack spacing={4} align="stretch">
            <SectionHeader
              icon={Wallet}
              title="Quick actions"
              caption="Log income or an expense in seconds"
              accent="blue"
            />

            <HStack spacing={3} w="full">
              {QUICK_ACTIONS.map(({ label, type: t, icon, gradient, shadow }) => (
                <Button
                  key={t}
                  onClick={() => handleOpen(t)}
                  flex={1}
                  h={{ base: '44px', sm: '48px' }}
                  variant="unstyled"
                  position="relative"
                  borderRadius="xl"
                  bg={gradient}
                  color="white"
                  fontWeight={700}
                  fontSize="sm"
                  letterSpacing="0.02em"
                  boxShadow={`0 4px 14px ${shadow}`}
                  transition="transform 0.18s ease, box-shadow 0.18s ease"
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: `0 8px 22px ${shadow}`,
                  }}
                  _active={{ transform: 'scale(0.98)' }}
                  _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'blue.300',
                    outlineOffset: '2px',
                  }}
                >
                  <HStack
                    justify="center"
                    align="center"
                    spacing={2}
                    h="full"
                    px={3}
                  >
                    <Icon as={icon} boxSize={4} strokeWidth={2.75} />
                    <Text fontWeight={700}>{label}</Text>
                  </HStack>
                </Button>
              ))}
            </HStack>
          </VStack>
        </Box>
      </SectionCard>

      <AddTransactionModal
        isOpen={isOpen}
        onClose={onClose}
        type={type}
        transactions={transactions}
        onTransactionCreated={handleTransactionCreated}
        onRefresh={onRefresh}
      />
    </>
  )
}
