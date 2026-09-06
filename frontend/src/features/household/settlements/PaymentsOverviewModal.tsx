import { useMemo } from 'react'
import { Badge, Box, Button, Flex, HStack, Icon, SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'
import type { HouseholdDashboard, HouseholdSettlement } from '../../../types'
import { Mail, Upload } from '../../../components/ui/icons'
import { ModalHeader, PremiumModal } from '../../../components/ui'

export function PaymentsOverviewModal({
  isOpen,
  onClose,
  household,
  onOpenAttachments,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  onOpenAttachments: (settlementId: number) => void
}) {
  const { formatCurrency, formatDate, formatNumber, t } = useI18n()

  const settlementsByMonth = useMemo(() => {
    const grouped = new Map<string, HouseholdSettlement[]>()
    for (const settlement of household.settlements) {
      const month = settlement.settlementDate.slice(0, 7)
      if (!grouped.has(month)) grouped.set(month, [])
      grouped.get(month)!.push(settlement)
    }
    return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [household.settlements])

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', md: '2xl' }}
      header={
        <ModalHeader
          title={t('household.settlements.title')}
          caption={t('household.settlements.description')}
          onClose={onClose}
          rightSlot={
            <Badge
              bg="var(--pb-tint-income)"
              color="var(--pb-income)"
              border="1px solid var(--pb-hair)"
              borderRadius="full"
              px={3}
              py={1}
              textTransform="none"
            >
              {t(
                household.settlements.length === 1
                  ? 'household.settlements.count.one'
                  : 'household.settlements.count.other',
                { count: formatNumber(household.settlements.length) },
              )}
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
        {household.settlements.length === 0 ? (
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
              bg="var(--pb-tint-green)"
              color="var(--pb-forest-2)"
            >
              <Icon as={Mail} boxSize={6} weight="duotone" />
            </Flex>
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="lg"
              fontWeight={500}
              textAlign="center"
            >
              {t('household.settlements.emptyTitle')}
            </Text>
            <Text color="var(--pb-ink-soft)" fontSize="sm" textAlign="center">
              {t('household.settlements.emptyDescription')}
            </Text>
          </VStack>
        ) : (
          <VStack spacing={6} align="stretch">
            {settlementsByMonth.map(([monthKey, settlements]) => {
              const [year, month] = monthKey.split('-')
              const monthDate = new Date(Number(year), Number(month) - 1, 1)
              const monthLabel = formatDate(monthDate, { month: 'long', year: 'numeric' })

              return (
                <Box key={monthKey}>
                  <Text
                    fontFamily="var(--pb-mono)"
                    fontSize="xs"
                    fontWeight={700}
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                    color="var(--pb-ink-faint)"
                    mb={3}
                  >
                    {monthLabel}
                  </Text>
                  <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={2.5}>
                    {settlements.map((settlement) => {
                      const statusAccent = settlement.status === 'CONFIRMED'
                        ? 'var(--pb-income)'
                        : settlement.status === 'PENDING'
                          ? 'var(--pb-gold)'
                          : 'var(--pb-ink-faint)'
                      const statusTint = settlement.status === 'CONFIRMED'
                        ? 'var(--pb-tint-income)'
                        : settlement.status === 'PENDING'
                          ? 'var(--pb-tint-gold)'
                          : 'var(--pb-surface-3)'

                      return (
                        <Stack
                          key={settlement.id}
                          direction="column"
                          justify="space-between"
                          gap={3}
                          minH="142px"
                          p={3}
                          borderRadius="14px"
                          border="1px solid"
                          borderColor="var(--pb-hair)"
                          bg="var(--pb-surface)"
                        >
                          <Flex
                            direction={{ base: 'column', sm: 'row' }}
                            align={{ base: 'stretch', sm: 'flex-start' }}
                            justify="space-between"
                            gap={3}
                          >
                            <Box minW={0}>
                              <Text fontWeight={700} color="var(--pb-ink)" noOfLines={1}>
                                {t('household.record.paymentTitle', {
                                  from: settlement.fromMemberName,
                                  to: settlement.toMemberName,
                                })}
                              </Text>
                              <Text mt={0.5} color="var(--pb-ink-faint)" fontSize="xs">
                                {formatDate(settlement.settlementDate, {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </Text>
                            </Box>
                            <Text
                              flexShrink={0}
                              fontFamily="var(--pb-serif)"
                              fontSize="xl"
                              fontWeight={500}
                              color="var(--pb-ink)"
                              style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              {formatCurrency(settlement.amount)}
                            </Text>
                          </Flex>

                          <Flex align="center" justify="space-between" gap={2} flexWrap="wrap">
                            <HStack spacing={1.5} flexWrap="wrap">
                              <Badge
                                borderRadius="full"
                                px={2.5}
                                py={1}
                                bg={statusTint}
                                color={statusAccent}
                                textTransform="capitalize"
                              >
                                {t(
                                  `household.status.${settlement.status}`,
                                  undefined,
                                  settlement.status,
                                )}
                              </Badge>
                            </HStack>

                            <HStack spacing={1} flexWrap="wrap" justify="flex-end">
                              {((settlement.attachments ?? []).length > 0
                                || settlement.canAttach) && (
                                  <Button
                                    aria-label={t('household.settlements.proofAria', {
                                      name: settlement.fromMemberName,
                                    })}
                                    h="34px"
                                    px={2.5}
                                    borderRadius="9px"
                                    variant="ghost"
                                    leftIcon={<Icon as={Upload} boxSize={3.5} />}
                                    onClick={() => onOpenAttachments(settlement.id)}
                                  >
                                    {t('household.settlements.proof', {
                                      count: formatNumber((settlement.attachments ?? []).length),
                                    })}
                                  </Button>
                                )}
                            </HStack>
                          </Flex>
                        </Stack>
                      )
                    })}
                  </SimpleGrid>
                </Box>
              )
            })}
          </VStack>
        )}
      </Box>
    </PremiumModal>
  )
}
