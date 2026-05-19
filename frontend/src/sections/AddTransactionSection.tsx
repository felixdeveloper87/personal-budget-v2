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
    gradient: 'linear-gradient(135deg, #047857 0%, #10b981 60%, #34d399 100%)', // Emerald/Teal gradient
    glowColor: 'rgba(16, 185, 129, 0.45)',
  },
  {
    label: 'Expense',
    caption: 'Spend out',
    type: 'EXPENSE',
    icon: Minus,
    trendIcon: TrendingDown,
    gradient: 'linear-gradient(135deg, #be123c 0%, #f43f5e 60%, #fb7185 100%)', // Rose/Crimson gradient
    glowColor: 'rgba(244, 63, 94, 0.45)',
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
                    transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                    
                    // Premium shine reflection sweeps across on hover
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '40%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.28), transparent)',
                      transform: 'skewX(-25deg)',
                      transition: 'all 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
                      zIndex: 1,
                    }}
                    
                    _hover={{
                      transform: 'translateY(-3px) scale(1.015)',
                      boxShadow: `0 16px 32px -8px ${action.glowColor}`,
                      _before: {
                        left: '160%',
                      }
                    }}
                    _active={{ transform: 'translateY(-1px) scale(0.985)' }}
                    _focusVisible={{
                      outline: 'none',
                      boxShadow: `0 0 0 3px rgba(255, 255, 255, 0.4), 0 10px 25px -10px ${action.glowColor}`,
                    }}
                  >
                    {/* Floating background decorative trend icon */}
                    <Box
                      position="absolute"
                      left="12%"
                      top="15%"
                      opacity={0.08}
                      transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                      _groupHover={{
                        opacity: 0.16,
                        transform: 'scale(1.2) rotate(5deg)',
                      }}
                      pointerEvents="none"
                      zIndex={0}
                    >
                      <Icon as={action.trendIcon} boxSize="60px" weight="bold" />
                    </Box>

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
                          lineHeight="1.15"
                          letterSpacing="-0.01em"
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

                      {/* Icon Circle Container */}
                      <Box
                        w={{ base: 9, sm: 10 }}
                        h={{ base: 9, sm: 10 }}
                        borderRadius="full"
                        bg="whiteAlpha.200"
                        border="1px solid"
                        borderColor="whiteAlpha.35"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                        transition="all 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                        _groupHover={{
                          borderColor: 'whiteAlpha.600',
                          bg: 'whiteAlpha.300',
                          transform: 'rotate(90deg)',
                        }}
                      >
                        <Icon 
                          as={action.icon} 
                          boxSize={4} 
                          weight="bold" 
                          transition="transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
                          _groupHover={{ transform: 'scale(1.15)' }}
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
