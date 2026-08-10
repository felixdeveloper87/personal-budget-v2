import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import type { FinancialAccount } from '../../../types'
import { ChevronRight, Pencil, Trash2 } from '../../../components/ui/icons'
import { ACCOUNT_LABELS, money } from '../../../components/accounts/accountMeta'
import AccountAvatar from './AccountAvatar'

interface AccountCardProps {
  account: FinancialAccount
  selected: boolean
  hideBalances: boolean
  onSelect: () => void
  onEdit: () => void
  onArchive: () => void
}

const Tool = ({
  label,
  icon,
  danger,
  onClick,
}: {
  label: string
  icon: typeof Pencil
  danger?: boolean
  onClick: (e: React.MouseEvent) => void
}) => (
  <Box
    as="button"
    type="button"
    aria-label={label}
    onClick={onClick}
    w="30px"
    h="30px"
    borderRadius="8px"
    display="grid"
    placeItems="center"
    color="var(--pb-ink-faint)"
    transition="0.15s"
    _hover={{
      bg: danger ? 'var(--pb-tint-coral)' : 'var(--pb-surface-2)',
      color: danger ? 'var(--pb-coral)' : 'var(--pb-forest-2)',
    }}
  >
    <Icon as={icon} boxSize="15px" />
  </Box>
)

export default function AccountCard({
  account,
  selected,
  hideBalances,
  onSelect,
  onEdit,
  onArchive,
}: AccountCardProps) {
  const negative = account.currentBalance < 0

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      cursor="pointer"
      position="relative"
      w="full"
      textAlign="left"
      bg="var(--pb-surface)"
      border="1px solid"
      borderColor={selected ? 'var(--pb-forest-2)' : 'var(--pb-hair)'}
      borderRadius="14px"
      boxShadow="0 1px 2px rgba(15,23,42,.05), 0 10px 28px rgba(15,23,42,.06)"
      pt="1rem"
      px="1.05rem"
      pb="1.3rem"
      overflow="hidden"
      transition="0.18s"
      _hover={{ borderColor: 'var(--pb-hair-2)', transform: 'translateY(-1px)' }}
      _focusVisible={{ outline: 'none', boxShadow: '0 0 0 2px var(--pb-forest-2)' }}
      sx={{ '&:hover .acc-reveal, &:focus-visible .acc-reveal': { opacity: 1 } }}
    >
      {/* Selected left rule */}
      {selected && <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="var(--pb-forest-2)" />}

      <Flex align="flex-start" gap="0.8rem">
        <AccountAvatar account={account} />
        <Box flex={1} minW={0}>
          <Text fontSize="1.08rem" fontWeight={500} lineHeight="1.2" color="var(--pb-ink)" noOfLines={1}>
            {account.name}
          </Text>
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="10px"
            letterSpacing="0.05em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
            mt="0.2rem"
            noOfLines={1}
          >
            {ACCOUNT_LABELS[account.type]}
            {account.institution ? ` · ${account.institution}` : ''}
          </Text>
        </Box>
        <HStack
          className="acc-reveal"
          spacing="0.2rem"
          flexShrink={0}
          opacity={selected ? 1 : 0}
          transition="opacity 0.15s"
        >
          <Tool
            label={`Edit ${account.name}`}
            icon={Pencil}
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          />
          <Tool
            label={`Remove ${account.name}`}
            icon={Trash2}
            danger
            onClick={(e) => {
              e.stopPropagation()
              onArchive()
            }}
          />
        </HStack>
      </Flex>

      <Box mt="0.9rem">
        <Text
          fontFamily="var(--pb-mono)"
          fontSize="9.5px"
          letterSpacing="0.13em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
        >
          Balance
        </Text>
        <Text
          className="num"
          display="block"
          fontSize="1.45rem"
          fontWeight={500}
          lineHeight="1.1"
          mt="0.1rem"
          color={!hideBalances && negative ? 'var(--pb-coral)' : 'var(--pb-ink)'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {hideBalances ? '••••••' : money(account.currentBalance, account.currency)}
        </Text>
      </Box>

      {account.type === 'CURRENT' && account.overdraftLimit > 0 && (
        <Flex
          mt="0.7rem"
          pt="0.6rem"
          align="center"
          justify="space-between"
          gap="0.75rem"
          borderTop="1px solid var(--pb-hair)"
        >
          <Text
            fontFamily="var(--pb-mono)"
            fontSize="9px"
            letterSpacing="0.09em"
            textTransform="uppercase"
            color="var(--pb-ink-faint)"
          >
            Overdraft remaining
          </Text>
          <Text
            className="num"
            flexShrink={0}
            fontFamily="var(--pb-mono)"
            fontSize="11px"
            fontWeight={600}
            color={account.overdraftAvailable > 0 ? 'var(--pb-forest-2)' : 'var(--pb-coral)'}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {hideBalances ? '••••••' : money(account.overdraftAvailable, account.currency)}
          </Text>
        </Flex>
      )}

      {/* Chevron affordance */}
      <Icon
        as={ChevronRight}
        className="acc-reveal"
        position="absolute"
        right="1.05rem"
        bottom="1rem"
        boxSize="16px"
        color="var(--pb-ink-faint)"
        opacity={0}
        transition="0.15s"
      />

    </Box>
  )
}
