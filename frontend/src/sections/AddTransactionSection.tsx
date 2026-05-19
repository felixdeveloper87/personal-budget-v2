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
import { Plus, Minus, Wallet, TrendingUp, TrendingDown } from '../components/ui/icons'
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
  trendIcon: typeof TrendingUp
  gradient: string
  glowColor: string
}

const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    label: 'Income',
    caption: 'Pay in',
    type: 'INCOME',
    icon: Plus,
    trendIcon: TrendingUp,
    gradient: 'linear-gradient(135deg, #052e24 0%, #059669 55%, #34d399 100%)',
    glowColor: 'rgba(16, 185, 129, 0.35)',
  },
  {
    label: 'Expense',
    caption: 'Spend out',
    type: 'EXPENSE',
    icon: Minus,
    trendIcon: TrendingDown,
    gradient: 'linear-gradient(135deg, #3b0712 0%, #dc2626 55%, #fb7185 100%)',
    glowColor: 'rgba(239, 68, 68, 0.35)',
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

            <HStack spacing={{ base: 2.5, sm: 4 }} w="full">
              {QUICK_ACTIONS.map((action) => (
                  <Button
                    key={action.type}
                    onClick={() => handleOpen(action.type)}
                    flex={1}
                    h={{ base: '64px', sm: '74px' }}
                    variant="unstyled"
                    position="relative"
                    borderRadius="2xl"
                    bg={action.gradient}
                    color="white"
                    role="group"
                    overflow="hidden"
                    boxShadow={`0 10px 25px -10px ${action.glowColor}`}
                    transition="all 0.3s ease"
                    
                    // Subtle shine reflection on hover
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '40%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                      transform: 'skewX(-25deg)',
                      transition: 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                      zIndex: 1,
                    }}
                    
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: `0 14px 28px -8px ${action.glowColor}`,
                      _before: {
                        left: '160%',
                      }
                    }}
                    _active={{ transform: 'scale(0.98)' }}
                    _focusVisible={{
                      outline: 'none',
                      boxShadow: `0 0 0 3px rgba(255, 255, 255, 0.4)`,
                    }}
                  >
                    {/* Content Layer */}
                    <HStack
                      justify="space-between"
                      align="center"
                      spacing={3}
                      h="full"
                      px={{ base: 4, sm: 5 }}
                      position="relative"
                      zIndex={2}
                    >
                      <VStack align="flex-start" spacing={0} minW={0}>
                        <Text
                          fontWeight={800}
                          fontSize={{ base: 'md', sm: 'lg' }}
                          lineHeight="1.1"
                        >
                          {action.label}
                        </Text>
                        <Text 
                          fontWeight={600} 
                          fontSize="2xs" 
                          color="whiteAlpha.800" 
                          noOfLines={1}
                        >
                          {action.caption}
                        </Text>
                      </VStack>

                      {/* Icon Container: Clean & Subtle */}
                      <Box
                        w={{ base: 8, sm: 9 }}
                        h={{ base: 8, sm: 9 }}
                        borderRadius="xl"
                        bg="whiteAlpha.200"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                        transition="all 0.3s ease"
                        _groupHover={{
                          bg: 'whiteAlpha.300',
                          transform: 'scale(1.05)',
                        }}
                      >
                        <Icon 
                          as={action.icon} 
                          boxSize={4} 
                          weight="bold" 
                        />
                      </Box>
                    </HStack>
                  </Button>
                ))
              }
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
