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
  caption: string
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
    caption: 'Pay in',
    type: 'INCOME',
    icon: Plus,
    gradient: 'linear-gradient(135deg, #052e24 0%, #059669 55%, #34d399 100%)',
    shadow: 'rgba(16, 185, 129, 0.35)',
  },
  {
    label: 'Expense',
    caption: 'Spend out',
    type: 'EXPENSE',
    icon: Minus,
    gradient: 'linear-gradient(135deg, #3b0712 0%, #dc2626 55%, #fb7185 100%)',
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

            <HStack spacing={{ base: 2, sm: 3 }} w="full">
              {QUICK_ACTIONS.map(({ label, caption, type: t, icon, gradient, shadow }) => (
                <Button
                  key={t}
                  onClick={() => handleOpen(t)}
                  flex={1}
                  h={{ base: '58px', sm: '64px' }}
                  variant="unstyled"
                  position="relative"
                  borderRadius="2xl"
                  bg={gradient}
                  color="white"
                  overflow="hidden"
                  boxShadow={`0 12px 28px -16px ${shadow}`}
                  transition="transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    bg: 'linear-gradient(135deg, rgba(255,255,255,0.22), transparent 48%)',
                  }}
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: `0 18px 36px -18px ${shadow}`,
                    filter: 'saturate(1.08)',
                  }}
                  _active={{ transform: 'scale(0.98)' }}
                  _focusVisible={{
                    outline: '2px solid',
                    outlineColor: 'blue.300',
                    outlineOffset: '2px',
                  }}
                >
                  <HStack
                    justify="space-between"
                    align="center"
                    spacing={3}
                    h="full"
                    px={{ base: 3, sm: 4 }}
                    position="relative"
                    zIndex={1}
                  >
                    <VStack align="flex-start" spacing={0} minW={0}>
                      <Text fontWeight={800} fontSize={{ base: 'sm', sm: 'md' }} lineHeight="1.1">
                        {label}
                      </Text>
                      <Text fontWeight={600} fontSize="2xs" color="whiteAlpha.800" noOfLines={1}>
                        {caption}
                      </Text>
                    </VStack>
                    <Box
                      w={{ base: 8, sm: 9 }}
                      h={{ base: 8, sm: 9 }}
                      borderRadius="xl"
                      bg="whiteAlpha.200"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Icon as={icon} boxSize={4} weight="bold" />
                    </Box>
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
