import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { createAccountTransfer } from '../../../api'
import type { FinancialAccount } from '../../../types'
import { money } from '../../../components/accounts/accountMeta'
import { ModalHeader, PremiumModal } from '../../../components/ui'
import {
  AlertTriangle,
  ArrowRight,
  Building,
  ChevronDown,
  DollarSign,
  Repeat,
  Wallet,
} from '../../../components/ui/icons'
import { ToastService } from '../../../services/toast'
import AccountAvatar from './AccountAvatar'

const today = () => {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

interface TransferModalProps {
  isOpen: boolean
  onClose: () => void
  accounts: FinancialAccount[]
  initialFromAccountId: number | null
  hideBalances: boolean
  onTransferred: () => void | Promise<void>
}

export default function TransferModal({
  isOpen,
  onClose,
  accounts,
  initialFromAccountId,
  hideBalances,
  onTransferred,
}: TransferModalProps) {
  const [fromAccountId, setFromAccountId] = useState<number | null>(null)
  const [toAccountId, setToAccountId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [transferDate, setTransferDate] = useState(today())
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const activeAccounts = useMemo(() => accounts.filter((account) => account.active), [accounts])

  useEffect(() => {
    if (!isOpen) return
    const initialFrom = activeAccounts.some((account) => account.id === initialFromAccountId)
      ? initialFromAccountId
      : activeAccounts[0]?.id ?? null

    setFromAccountId(initialFrom)
    setToAccountId(activeAccounts.find((account) => account.id !== initialFrom)?.id ?? null)
    setAmount('')
    setTransferDate(today())
    setDescription('')
    setSaving(false)
  }, [activeAccounts, initialFromAccountId, isOpen])

  const displayMoney = (value: number, currency = 'GBP') =>
    hideBalances ? '••••••' : money(value, currency)

  const parsedAmount = Number(amount)
  const sameAccount = fromAccountId !== null && fromAccountId === toAccountId
  const canSubmit =
    activeAccounts.length >= 2 &&
    fromAccountId !== null &&
    toAccountId !== null &&
    !sameAccount &&
    parsedAmount > 0 &&
    Boolean(transferDate)

  const submit = async () => {
    if (!canSubmit || fromAccountId === null || toAccountId === null) return

    setSaving(true)
    try {
      await createAccountTransfer({
        fromAccountId,
        toAccountId,
        amount: parsedAmount,
        transferDate,
        description: description.trim() || undefined,
      })
      await onTransferred()
      ToastService.success({
        title: 'Transfer recorded',
        dedupeKey: 'account-transfer-created',
      })
      onClose()
    } catch (err) {
      ToastService.apiError(err, {
        title: 'Could not transfer',
        dedupeKey: 'account-transfer-failed',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: 'xl' }}
      header={
        <ModalHeader
          icon={Repeat}
          title="Transfer between accounts"
          caption="Move money without counting it as income or spending"
          onClose={onClose}
          accent="blue"
        />
      }
      footer={
        <HStack justify="flex-end" spacing={2}>
          <Button variant="ghost" onClick={onClose} isDisabled={saving}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            leftIcon={<Icon as={Repeat} boxSize={4} />}
            onClick={submit}
            isLoading={saving}
            isDisabled={!canSubmit}
          >
            {parsedAmount > 0 ? `Transfer ${money(parsedAmount)}` : 'Record transfer'}
          </Button>
        </HStack>
      }
    >
      <Box p={{ base: 4, md: 6 }}>
        {activeAccounts.length < 2 ? (
          <Notice>Create at least two active accounts before recording a transfer.</Notice>
        ) : (
          <VStack align="stretch" spacing={5}>
            <SimpleGrid columns={{ base: 1, sm: 7 }} spacing={3} alignItems="end">
              <FormControl gridColumn={{ sm: 'span 3' }}>
                <FormLabel fontSize="sm">From account</FormLabel>
                <TransferAccountSelect
                  accounts={activeAccounts}
                  value={fromAccountId}
                  onChange={setFromAccountId}
                  formatBalance={displayMoney}
                  icon={Wallet}
                />
              </FormControl>

              <Flex align="center" justify="center" h={{ sm: '52px' }} transform={{ base: 'rotate(90deg)', sm: 'none' }}>
                <Flex
                  w="32px"
                  h="32px"
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg="var(--pb-sidebar-active-bg)"
                  color="var(--pb-sidebar-accent)"
                >
                  <Icon as={ArrowRight} boxSize={4} />
                </Flex>
              </Flex>

              <FormControl gridColumn={{ sm: 'span 3' }} isInvalid={sameAccount}>
                <FormLabel fontSize="sm">To account</FormLabel>
                <TransferAccountSelect
                  accounts={activeAccounts}
                  value={toAccountId}
                  onChange={setToAccountId}
                  formatBalance={displayMoney}
                  icon={Building}
                />
              </FormControl>
            </SimpleGrid>

            {sameAccount && <Notice>Choose two different accounts.</Notice>}

            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">
                  <HStack spacing={1.5}>
                    <Icon as={DollarSign} boxSize={3.5} />
                    <Text as="span">Amount</Text>
                  </HStack>
                </FormLabel>
                <NumberInput min={0} precision={2} value={amount} onChange={setAmount}>
                  <NumberInputField
                    bg="var(--pb-surface-2)"
                    borderColor="var(--pb-hair)"
                    borderRadius="12px"
                    h="44px"
                  />
                </NumberInput>
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Transfer date</FormLabel>
                <Input
                  type="date"
                  value={transferDate}
                  onChange={(event) => setTransferDate(event.target.value)}
                  bg="var(--pb-surface-2)"
                  borderColor="var(--pb-hair)"
                  borderRadius="12px"
                  h="44px"
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel fontSize="sm">
                Reference{' '}
                <Text as="span" color="var(--pb-ink-faint)" fontWeight={400}>
                  (optional)
                </Text>
              </FormLabel>
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. Monthly savings"
                bg="var(--pb-surface-2)"
                borderColor="var(--pb-hair)"
                borderRadius="12px"
                h="44px"
              />
            </FormControl>
          </VStack>
        )}
      </Box>
    </PremiumModal>
  )
}

interface TransferAccountSelectProps {
  accounts: FinancialAccount[]
  value: number | null
  onChange: (accountId: number) => void
  formatBalance: (value: number, currency?: string) => string
  icon: typeof Wallet
}

function TransferAccountSelect({
  accounts,
  value,
  onChange,
  formatBalance,
  icon,
}: TransferAccountSelectProps) {
  const selected = accounts.find((account) => account.id === value)

  return (
    <Menu matchWidth>
      <MenuButton
        as={Box}
        role="button"
        tabIndex={0}
        w="full"
        h="52px"
        px="0.65rem"
        borderRadius="12px"
        bg="var(--pb-surface-2)"
        border="1px solid var(--pb-hair)"
        cursor="pointer"
        transition="0.15s"
        _hover={{ borderColor: 'var(--pb-hair-2)' }}
      >
        <Flex align="center" justify="space-between" gap={2} h="full">
          <HStack spacing={2.5} minW={0}>
            {selected ? (
              <AccountAvatar account={selected} size={30} />
            ) : (
              <Flex w="30px" h="30px" align="center" justify="center" borderRadius="9px" bg="var(--pb-surface)">
                <Icon as={icon} boxSize={4} color="var(--pb-ink-faint)" />
              </Flex>
            )}
            <Box minW={0} textAlign="left">
              <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
                {selected?.name ?? 'Select account'}
              </Text>
              {selected && (
                <Text className="num" fontSize="10.5px" color="var(--pb-ink-soft)">
                  {formatBalance(selected.currentBalance, selected.currency)}
                </Text>
              )}
            </Box>
          </HStack>
          <Icon as={ChevronDown} boxSize={4} color="var(--pb-ink-faint)" flexShrink={0} />
        </Flex>
      </MenuButton>
      <MenuList
        minW="100%"
        bg="var(--pb-surface)"
        borderColor="var(--pb-hair)"
        borderRadius="12px"
        boxShadow="var(--pb-shadow)"
        py={1}
        zIndex={20}
      >
        {accounts.map((account) => (
          <MenuItem
            key={account.id}
            onClick={() => onChange(account.id)}
            bg="var(--pb-surface)"
            _hover={{ bg: 'var(--pb-surface-2)' }}
            _focus={{ bg: 'var(--pb-surface-2)' }}
          >
            <HStack justify="space-between" w="full" minW={0} spacing={3}>
              <HStack spacing={2.5} minW={0}>
                <AccountAvatar account={account} size={26} />
                <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>
                  {account.name}
                </Text>
              </HStack>
              <Text className="num" fontSize="xs" color="var(--pb-ink-soft)" flexShrink={0}>
                {formatBalance(account.currentBalance, account.currency)}
              </Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <HStack align="start" spacing={2} px={3} py={2.5} borderRadius="10px" bg="var(--pb-tint-coral)">
      <Icon as={AlertTriangle} boxSize={4} color="var(--pb-coral)" mt="1px" flexShrink={0} />
      <Text fontSize="xs" color="var(--pb-ink-soft)">{children}</Text>
    </HStack>
  )
}
