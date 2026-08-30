import { Badge, Box, Button, Flex, HStack, Icon, Stack, Text, VStack } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'
import type { HouseholdDashboard, HouseholdDebt } from '../../../types'
import { Check, Wallet } from '../../../components/ui/icons'
import { ModalHeader as AppModalHeader, PremiumModal } from '../../../components/ui'

export function BalancesOverviewModal({
  isOpen,
  onClose,
  household,
  onRecordPayment,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  onRecordPayment: (debt: HouseholdDebt) => void
}) {
  const { formatCurrency, t } = useI18n()
  const outstandingTotal = household.debts.reduce(
    (total, debt) => total + debt.amount,
    0,
  )
  const hasOpenBalances = household.debts.length > 0

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '2xl' }}
      header={
        <AppModalHeader
          icon={Wallet}
          title={t('household.balances.title')}
          caption={t('household.balances.description')}
          onClose={onClose}
          accent={hasOpenBalances ? 'red' : 'green'}
          rightSlot={
            <Badge
              bg={hasOpenBalances ? 'var(--pb-tint-coral)' : 'var(--pb-tint-income)'}
              color={hasOpenBalances ? 'var(--pb-coral)' : 'var(--pb-income)'}
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {hasOpenBalances
                ? t('household.balances.open', {
                  amount: formatCurrency(outstandingTotal),
                })
                : t('household.balances.allSettled')}
            </Badge>
          }
        />
      }
      footer={
        <Flex justify="flex-end" w="full">
          <Button
            h="44px"
            w={{ base: 'full', sm: 'auto' }}
            px={5}
            borderRadius="11px"
            bg="var(--pb-forest-2)"
            color="var(--pb-on-accent)"
            onClick={onClose}
            _hover={{ bg: 'var(--pb-forest)' }}
          >
            {t('household.common.close')}
          </Button>
        </Flex>
      }
    >
      <Box p={{ base: 3, sm: 4, md: 5 }} bg="var(--pb-surface-2)">
        {!hasOpenBalances ? (
          <VStack
            py={9}
            px={4}
            spacing={3}
            border="1px dashed var(--pb-hair-2)"
            borderRadius="14px"
            bg="var(--pb-surface)"
          >
            <Flex
              w={11}
              h={11}
              align="center"
              justify="center"
              borderRadius="full"
              bg="var(--pb-tint-income)"
              color="var(--pb-income)"
            >
              <Icon as={Check} boxSize={5} weight="bold" />
            </Flex>
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="lg"
              fontWeight={500}
              textAlign="center"
            >
              {t('household.balances.everyoneSettled')}
            </Text>
            <Text color="var(--pb-ink-soft)" fontSize="sm" textAlign="center">
              {t('household.balances.noDebts')}
            </Text>
          </VStack>
        ) : (
          <VStack align="stretch" spacing={2.5}>
            {household.debts.map((debt) => {
              const youPay = debt.fromMemberId === household.currentMemberId
              const youReceive = debt.toMemberId === household.currentMemberId
              const accent = youPay
                ? 'var(--pb-coral)'
                : youReceive
                  ? 'var(--pb-income)'
                  : 'var(--pb-ink-soft)'
              const tint = youPay
                ? 'var(--pb-tint-coral)'
                : youReceive
                  ? 'var(--pb-tint-income)'
                  : 'var(--pb-surface)'

              return (
                <Stack
                  key={`${debt.fromMemberId}-${debt.toMemberId}`}
                  direction={{ base: 'column', sm: 'row' }}
                  align={{ base: 'stretch', sm: 'center' }}
                  justify="space-between"
                  gap={3}
                  p={{ base: 3.5, sm: 4 }}
                  borderRadius="14px"
                  border="1px solid var(--pb-hair)"
                  bg="var(--pb-surface)"
                >
                  <Box minW={0}>
                    <HStack spacing={2} flexWrap="wrap">
                      <Text fontWeight={700} color="var(--pb-ink)" noOfLines={1}>
                        {youPay
                          ? t('household.balances.youOweName', {
                            name: debt.toMemberName,
                          })
                          : youReceive
                            ? t('household.balances.owesYou', {
                              name: debt.fromMemberName,
                            })
                            : t('household.balances.memberOwes', {
                              from: debt.fromMemberName,
                              to: debt.toMemberName,
                            })}
                      </Text>
                      {(youPay || youReceive) && (
                        <Badge
                          borderRadius="full"
                          px={2}
                          bg={tint}
                          color={accent}
                          textTransform="none"
                        >
                          {youPay
                            ? t('household.balances.youPay')
                            : t('household.balances.youReceive')}
                        </Badge>
                      )}
                    </HStack>
                    <Text mt={0.5} color="var(--pb-ink-faint)" fontSize="xs">
                      {youPay
                        ? t('household.balances.payHint')
                        : youReceive
                          ? t('household.balances.receiveHint')
                          : t('household.balances.otherHint')}
                    </Text>
                  </Box>
                  <HStack
                    justify={{ base: 'space-between', sm: 'flex-end' }}
                    spacing={3}
                  >
                    <Text
                      fontFamily="var(--pb-serif)"
                      fontSize="xl"
                      fontWeight={500}
                      color={accent}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatCurrency(debt.amount)}
                    </Text>
                    {youPay && (
                      <Button
                        h="38px"
                        px={3.5}
                        borderRadius="10px"
                        bg="var(--pb-forest-2)"
                        color="var(--pb-on-accent)"
                        onClick={() => onRecordPayment(debt)}
                        _hover={{
                          bg: 'var(--pb-forest)',
                          transform: 'translateY(-1px)',
                        }}
                      >
                        {t('household.balances.recordPayment')}
                      </Button>
                    )}
                  </HStack>
                </Stack>
              )
            })}
          </VStack>
        )}
      </Box>
    </PremiumModal>
  )
}
