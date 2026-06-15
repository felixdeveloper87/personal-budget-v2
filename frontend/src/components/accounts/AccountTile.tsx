import {
  Box,
  Flex,
  HStack,
  Icon,
  IconButton,
  Progress,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useEd } from '../../editorial'
import type { FinancialAccount } from '../../types'
import { BankLogo, getBankMeta } from '../ui'
import { Activity, CreditCard, Pencil, Trash2, Wallet } from '../ui/icons'
import { ACCOUNT_LABELS, money } from './accountMeta'

export interface AccountTileProps {
  account: FinancialAccount
  hideBalances: boolean
  onActivity: () => void
  onEdit: () => void
  onArchive: () => void
}

export default function AccountTile({
  account,
  hideBalances,
  onActivity,
  onEdit,
  onArchive,
}: AccountTileProps) {
  const ed = useEd()
  const border = useColorModeValue('gray.200', 'whiteAlpha.200')
  const muted = useColorModeValue('gray.500', 'gray.400')
  const subtleBase = useColorModeValue('gray.50', 'whiteAlpha.50')
  // Card translúcido padrão (ed.panel) nos dois modos — consistente com a plataforma.
  const subtle = ed ? ed.panel : subtleBase
  const iconBoxBg = useColorModeValue('white', 'whiteAlpha.100')

  const hasMeta = Boolean(getBankMeta(account.institution))
  const negative = account.currentBalance < 0
  const displayBalance = hideBalances ? '••••••' : money(account.currentBalance, account.currency)
  const showOverdraft = account.type === 'CURRENT' && account.overdraftLimit > 0

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onActivity}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onActivity()
        }
      }}
      cursor="pointer"
      textAlign="left"
      w="full"
      borderRadius="2xl"
      border="1px solid"
      borderColor={border}
      bg={subtle}
      p={5}
      transition="all 0.18s ease"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg', borderColor: 'blue.300' }}
      _focusVisible={{ outline: 'none', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.35)' }}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="start">
          <HStack spacing={3} minW={0}>
            {hasMeta ? (
              <BankLogo issuer={account.institution} size={40} borderRadius="12px" />
            ) : (
              <Flex
                w={10}
                h={10}
                borderRadius="xl"
                bg={iconBoxBg}
                border="1px solid"
                borderColor={border}
                align="center"
                justify="center"
                flexShrink={0}
              >
                <Icon as={account.type === 'CREDIT_CARD' ? CreditCard : Wallet} boxSize={5} color={muted} />
              </Flex>
            )}
            <Box minW={0}>
              <Text fontWeight={800} fontSize="md" noOfLines={1}>
                {account.name}
              </Text>
              <Text fontSize="xs" color={muted} noOfLines={1}>
                {ACCOUNT_LABELS[account.type]}
                {account.institution ? ` · ${account.institution}` : ''}
              </Text>
            </Box>
          </HStack>
          <HStack spacing={1} flexShrink={0}>
            <IconButton
              aria-label={`View activity for ${account.name}`}
              icon={<Icon as={Activity} boxSize={3.5} />}
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={(e) => {
                e.stopPropagation()
                onActivity()
              }}
            />
            <IconButton
              aria-label={`Edit ${account.name}`}
              icon={<Icon as={Pencil} boxSize={3.5} />}
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
            />
            <IconButton
              aria-label={`Archive ${account.name}`}
              icon={<Icon as={Trash2} boxSize={3.5} />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={(e) => {
                e.stopPropagation()
                onArchive()
              }}
            />
          </HStack>
        </HStack>

        <Box>
          <Text
            fontSize="2xs"
            color={muted}
            textTransform="uppercase"
            letterSpacing="0.05em"
            fontWeight={700}
          >
            Balance
          </Text>
          <Text
            fontSize="xl"
            fontWeight={800}
            color={!hideBalances && negative ? 'red.500' : undefined}
            sx={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {displayBalance}
          </Text>
        </Box>

        {showOverdraft && (
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="2xs" color={muted}>
                Overdraft remaining
              </Text>
              <Text fontSize="2xs" color={muted}>
                {hideBalances
                  ? 'Hidden'
                  : `${money(account.overdraftAvailable, account.currency)} of ${money(account.overdraftLimit, account.currency)} · ${account.overdraftPercentageUsed.toFixed(0)}% used`}
              </Text>
            </HStack>
            <Progress
              value={hideBalances ? 0 : Math.max(0, 100 - Math.min(100, account.overdraftPercentageUsed))}
              size="xs"
              borderRadius="full"
              colorScheme="green"
              opacity={0.7}
            />
          </Box>
        )}
      </VStack>
    </Box>
  )
}
