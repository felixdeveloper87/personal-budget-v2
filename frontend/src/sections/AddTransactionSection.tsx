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
import { ArrowUpRight, ArrowDownRight, ChevronRight, Wallet } from '../components/ui/icons'
import type { LucideIcon } from '../components/ui/icons'
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
  icon: LucideIcon
}

const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    label: 'Income',
    caption: 'Money in',
    type: 'INCOME',
    icon: ArrowUpRight,
  },
  {
    label: 'Expense',
    caption: 'Money out',
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
  const actionStyles = {
    INCOME: {
      bg: useColorModeValue('green.50', 'rgba(16,185,129,0.10)'),
      border: useColorModeValue('green.100', 'rgba(16,185,129,0.24)'),
      hoverBorder: useColorModeValue('green.300', 'rgba(16,185,129,0.45)'),
      hoverBg: useColorModeValue('green.100', 'rgba(16,185,129,0.15)'),
      label: useColorModeValue('green.900', 'green.100'),
      caption: useColorModeValue('green.700', 'green.300'),
      iconGradient: useColorModeValue(
        'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'linear-gradient(135deg, rgba(34,197,94,0.32) 0%, rgba(16,185,129,0.22) 100%)',
      ),
      iconColor: useColorModeValue('white', 'green.100'),
      glow: useColorModeValue(
        'radial-gradient(120px 120px at 88% 50%, rgba(34,197,94,0.18), transparent 70%)',
        'radial-gradient(120px 120px at 88% 50%, rgba(34,197,94,0.22), transparent 70%)',
      ),
      focus: useColorModeValue('rgba(22,163,74,0.22)', 'rgba(74,222,128,0.26)'),
      shadow: useColorModeValue('0 1px 2px rgba(15,23,42,0.04)', 'none'),
      hoverShadow: useColorModeValue('0 14px 30px -18px rgba(22,163,74,0.55)', '0 14px 30px -18px rgba(16,185,129,0.5)'),
    },
    EXPENSE: {
      bg: useColorModeValue('red.50', 'rgba(239,68,68,0.10)'),
      border: useColorModeValue('red.100', 'rgba(239,68,68,0.24)'),
      hoverBorder: useColorModeValue('red.300', 'rgba(239,68,68,0.45)'),
      hoverBg: useColorModeValue('red.100', 'rgba(239,68,68,0.15)'),
      label: useColorModeValue('red.900', 'red.100'),
      caption: useColorModeValue('red.700', 'red.300'),
      iconGradient: useColorModeValue(
        'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
        'linear-gradient(135deg, rgba(248,113,113,0.32) 0%, rgba(239,68,68,0.22) 100%)',
      ),
      iconColor: useColorModeValue('white', 'red.100'),
      glow: useColorModeValue(
        'radial-gradient(120px 120px at 88% 50%, rgba(239,68,68,0.16), transparent 70%)',
        'radial-gradient(120px 120px at 88% 50%, rgba(239,68,68,0.22), transparent 70%)',
      ),
      focus: useColorModeValue('rgba(220,38,38,0.22)', 'rgba(248,113,113,0.26)'),
      shadow: useColorModeValue('0 1px 2px rgba(15,23,42,0.04)', 'none'),
      hoverShadow: useColorModeValue('0 14px 30px -18px rgba(220,38,38,0.55)', '0 14px 30px -18px rgba(239,68,68,0.5)'),
    },
  }

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
              {QUICK_ACTIONS.map((action) => {
                const styles = actionStyles[action.type]

                return (
                  <Button
                    key={action.type}
                    onClick={() => handleOpen(action.type)}
                    flex={1}
                    h={{ base: '62px', sm: '68px' }}
                    variant="unstyled"
                    position="relative"
                    borderRadius="xl"
                    bg={styles.bg}
                    color={styles.label}
                    border="1px solid"
                    borderColor={styles.border}
                    role="group"
                    overflow="hidden"
                    boxShadow={styles.shadow}
                    transition="background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease"
                    _hover={{
                      bg: styles.hoverBg,
                      borderColor: styles.hoverBorder,
                      transform: 'translateY(-2px)',
                      boxShadow: styles.hoverShadow,
                    }}
                    _active={{ transform: 'translateY(0) scale(0.99)' }}
                    _focusVisible={{
                      outline: 'none',
                      boxShadow: `0 0 0 3px ${styles.focus}`,
                    }}
                  >
                    <Box
                      position="absolute"
                      inset={0}
                      bgImage={styles.glow}
                      opacity={0}
                      transition="opacity 0.25s ease"
                      pointerEvents="none"
                      _groupHover={{ opacity: 1 }}
                    />

                    <HStack
                      justify="space-between"
                      align="center"
                      spacing={3}
                      h="full"
                      px={{ base: 3.5, sm: 4 }}
                      position="relative"
                    >
                      <Box
                        w={{ base: 9, sm: 10 }}
                        h={{ base: 9, sm: 10 }}
                        borderRadius="lg"
                        bgImage={styles.iconGradient}
                        color={styles.iconColor}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                        boxShadow="inset 0 1px 0 rgba(255,255,255,0.18)"
                        transition="transform 0.18s ease"
                        _groupHover={{ transform: 'scale(1.06)' }}
                      >
                        <Icon as={action.icon} boxSize={{ base: 4, sm: 5 }} weight="bold" />
                      </Box>

                      <VStack align="flex-start" spacing={0} minW={0} flex={1}>
                        <Text
                          fontWeight={750}
                          fontSize={{ base: 'sm', sm: 'md' }}
                          lineHeight="1.15"
                          letterSpacing="-0.01em"
                          noOfLines={1}
                        >
                          {action.label}
                        </Text>
                        <Text
                          fontWeight={600}
                          fontSize="2xs"
                          color={styles.caption}
                          textTransform="uppercase"
                          letterSpacing="0.06em"
                          noOfLines={1}
                        >
                          {action.caption}
                        </Text>
                      </VStack>

                      <Icon
                        as={ChevronRight}
                        boxSize={4}
                        color={styles.caption}
                        flexShrink={0}
                        opacity={0}
                        transform="translateX(-4px)"
                        transition="opacity 0.18s ease, transform 0.18s ease"
                        _groupHover={{ opacity: 0.9, transform: 'translateX(0)' }}
                      />
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
