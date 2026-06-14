import { useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { ArrowUpRight, ArrowDownRight, Wallet } from '../components/ui/icons'
import type { LucideIcon } from '../components/ui/icons'
import { AddTransactionModal } from '../components/transactions'
import { Transaction } from '../types'
import { SectionCard, SectionHeader } from '../components/ui'
import { useEd, EDITORIAL } from '../editorial'

interface AddTransactionSectionProps {
  transactions: Transaction[]
  onRefresh: () => void
}

interface QuickActionConfig {
  label: string
  type: 'INCOME' | 'EXPENSE'
  icon: LucideIcon
}

const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    label: 'Income',
    type: 'INCOME',
    icon: ArrowUpRight,
  },
  {
    label: 'Expense',
    type: 'EXPENSE',
    icon: ArrowDownRight,
  },
]

export default function AddTransactionSection({
  transactions,
  onRefresh,
}: AddTransactionSectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const ed = useEd()
  const pal = ed ?? EDITORIAL
  const baseStyles = {
    INCOME: {
      bg: useColorModeValue('green.50', 'rgba(16,185,129,0.10)'),
      border: useColorModeValue('green.100', 'rgba(16,185,129,0.24)'),
      hoverBorder: useColorModeValue('green.300', 'rgba(16,185,129,0.45)'),
      hoverBg: useColorModeValue('green.100', 'rgba(16,185,129,0.15)'),
      label: useColorModeValue('green.900', 'green.100'),
      iconBg: useColorModeValue('green.100', 'rgba(34,197,94,0.18)'),
      iconColor: useColorModeValue('green.700', 'green.200'),
      focus: useColorModeValue('rgba(22,163,74,0.22)', 'rgba(74,222,128,0.26)'),
    },
    EXPENSE: {
      bg: useColorModeValue('red.50', 'rgba(239,68,68,0.10)'),
      border: useColorModeValue('red.100', 'rgba(239,68,68,0.24)'),
      hoverBorder: useColorModeValue('red.300', 'rgba(239,68,68,0.45)'),
      hoverBg: useColorModeValue('red.100', 'rgba(239,68,68,0.15)'),
      label: useColorModeValue('red.900', 'red.100'),
      iconBg: useColorModeValue('red.100', 'rgba(239,68,68,0.18)'),
      iconColor: useColorModeValue('red.700', 'red.200'),
      focus: useColorModeValue('rgba(220,38,38,0.22)', 'rgba(248,113,113,0.26)'),
    },
  }
  const editorialStyles = {
    INCOME: {
      bg: 'rgba(127,230,179,0.10)',
      border: 'rgba(127,230,179,0.22)',
      hoverBorder: 'rgba(127,230,179,0.48)',
      hoverBg: 'rgba(127,230,179,0.16)',
      label: pal.cream,
      iconBg: 'rgba(127,230,179,0.16)',
      iconColor: pal.jade,
      focus: 'rgba(127,230,179,0.30)',
    },
    EXPENSE: {
      bg: 'rgba(248,163,163,0.10)',
      border: 'rgba(248,163,163,0.22)',
      hoverBorder: 'rgba(248,163,163,0.48)',
      hoverBg: 'rgba(248,163,163,0.16)',
      label: pal.cream,
      iconBg: 'rgba(248,163,163,0.16)',
      iconColor: pal.red,
      focus: 'rgba(248,163,163,0.30)',
    },
  }
  const actionStyles = ed ? editorialStyles : baseStyles

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
              accent="neutral"
            />

            <HStack spacing={{ base: 2.5, sm: 4 }} w="full">
              {QUICK_ACTIONS.map((action) => {
                const styles = actionStyles[action.type]

                return (
                  <Button
                    key={action.type}
                    onClick={() => handleOpen(action.type)}
                    flex={1}
                    h={{ base: '48px', sm: '52px' }}
                    variant="unstyled"
                    position="relative"
                    borderRadius="xl"
                    bg={styles.bg}
                    color={styles.label}
                    border="1px solid"
                    borderColor={styles.border}
                    role="group"
                    transition="background 0.18s ease, border-color 0.18s ease, transform 0.18s ease"
                    _hover={{
                      bg: styles.hoverBg,
                      borderColor: styles.hoverBorder,
                      transform: 'translateY(-1px)',
                    }}
                    _active={{ transform: 'translateY(0) scale(0.99)' }}
                    _focusVisible={{
                      outline: 'none',
                      boxShadow: `0 0 0 3px ${styles.focus}`,
                    }}
                  >
                    <HStack
                      justify="flex-start"
                      align="center"
                      spacing={3}
                      h="full"
                      px={{ base: 3.5, sm: 4 }}
                      position="relative"
                    >
                      <Box
                        w={8}
                        h={8}
                        borderRadius="lg"
                        bg={styles.iconBg}
                        color={styles.iconColor}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Icon as={action.icon} boxSize={4} weight="bold" />
                      </Box>

                      <Text fontWeight={750} fontSize="sm" noOfLines={1}>
                        {action.label}
                      </Text>
                    </HStack>
                  </Button>
                )
              })}
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
