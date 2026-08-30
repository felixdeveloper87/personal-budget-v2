import { Badge, Box, Button, Flex, HStack, Icon, IconButton, Stack, Text, VStack } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'
import type { HouseholdDashboard, HouseholdExpense } from '../../../types'
import { Pencil, ReceiptText, Upload, Users } from '../../../components/ui/icons'
import { getHouseholdCategoryConfig } from './expenseConfig'
import { householdAvatarGradient } from '../householdAvatar'

export function ExpenseCard({
  expense,
  household,
  onEditExpense,
  onOpenAttachments,
}: {
  expense: HouseholdExpense
  household: HouseholdDashboard
  onEditExpense: (expense: HouseholdExpense) => void
  onOpenAttachments: (expenseId: number) => void
}) {
  const { formatCurrency, formatDate, formatNumber, t } = useI18n()

const currentShare = expense.shares.find(
  (share) => share.memberId === household.currentMemberId,
)
const attachmentCount = (expense.attachments ?? []).length
const canOpenProof = attachmentCount > 0 || expense.canEdit
const hasFooter = Boolean(currentShare || canOpenProof || expense.canEdit)
const payerIndex = household.members.findIndex(
  (member) => member.id === expense.payerMemberId,
)
const payerGradient = householdAvatarGradient(
  payerIndex,
  expense.payerMemberId,
)
const payerInitial = (expense.payerName || '?').charAt(0).toUpperCase()
const categoryCfg = getHouseholdCategoryConfig(expense.category)

return (
  <Stack
    key={expense.id}
    position="relative"
    overflow="hidden"
    direction="column"
    gap={0}
    h="full"
    p={{ base: 3.5, sm: 4 }}
    pl={{ base: 4, sm: 4.5 }}
    borderRadius="16px"
    border="1px solid var(--pb-hair)"
    bg="var(--pb-surface)"
    boxShadow="0 1px 3px rgba(18, 45, 36, 0.04)"
    transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
    _hover={{
      borderColor: 'var(--pb-hair-2)',
      boxShadow: '0 8px 24px -8px rgba(18, 45, 36, 0.12)',
      transform: 'translateY(-1px)',
    }}
  >
    <Box
      aria-hidden="true"
      position="absolute"
      left="0"
      top="12px"
      bottom="12px"
      w="3.5px"
      borderRadius="full"
      bgGradient={payerGradient}
    />

    {/* Header: Category Icon + Description & Payer + Total */}
    <Flex align="flex-start" justify="space-between" gap={3}>
      <HStack spacing={3} minW={0} flex={1} align="center">
        <Flex
          w="38px"
          h="38px"
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="11px"
          bg={categoryCfg.bg}
          color={categoryCfg.color}
          border="1px solid var(--pb-hair)"
        >
          <Icon as={categoryCfg.icon} boxSize={5} weight="duotone" />
        </Flex>
        <Box minW={0} flex={1}>
          <Text
            fontSize="sm"
            fontWeight={600}
            lineHeight="1.25"
            color="var(--pb-ink)"
            noOfLines={1}
          >
            {expense.description}
          </Text>
          <HStack spacing={1.5} mt={0.5} align="center" minW={0}>
            <HStack
              spacing={1}
              py="1px"
              px={1.5}
              borderRadius="full"
              bg="var(--pb-surface-2)"
              border="1px solid var(--pb-hair)"
              maxW="140px"
            >
              <Flex
                aria-hidden="true"
                w="14px"
                h="14px"
                flexShrink={0}
                align="center"
                justify="center"
                borderRadius="full"
                bgGradient={payerGradient}
                color="white"
                fontFamily="var(--pb-mono)"
                fontSize="7px"
                fontWeight={800}
              >
                {payerInitial}
              </Flex>
              <Text
                color="var(--pb-ink-soft)"
                fontSize="2xs"
                fontWeight={500}
                noOfLines={1}
              >
                {t('household.expenses.paidBy', {
                  name: expense.payerName,
                })}
              </Text>
            </HStack>
          </HStack>
        </Box>
      </HStack>

      <VStack align="flex-end" spacing={0} flexShrink={0} ps={1}>
        <Text
          fontSize="2xs"
          fontWeight={600}
          letterSpacing="0.06em"
          textTransform="uppercase"
          color="var(--pb-ink-faint)"
        >
          {t('household.expenses.total')}
        </Text>
        <Text
          mt="1px"
          fontSize={{ base: 'md', sm: 'lg' }}
          fontWeight={700}
          lineHeight={1.15}
          color="var(--pb-ink)"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(expense.amount)}
        </Text>
      </VStack>
    </Flex>

    {/* Middle: Category Pill + Split info with Date */}
    <Flex
      align="center"
      justify="space-between"
      gap={2}
      mt={2.5}
      pt={2.5}
      borderTop="1px solid var(--pb-hair)"
      flexWrap="wrap"
    >
      <HStack spacing={2} minW={0} flexWrap="wrap">
        <Badge
          borderRadius="full"
          px={2}
          py={0.5}
          bg={categoryCfg.bg}
          color={categoryCfg.color}
          border="1px solid var(--pb-hair)"
          fontSize="2xs"
          fontWeight={600}
          textTransform="none"
        >
          {t(
            `household.category.${expense.category}`,
            undefined,
            expense.category,
          )}
        </Badge>
        <HStack spacing={1} color="var(--pb-ink-faint)" fontSize="2xs" fontWeight={500}>
          <Icon as={Users} boxSize={3} weight="duotone" />
          <Text>
            {t(
              expense.shares.length === 1
                ? 'household.expenses.shares.one'
                : 'household.expenses.shares.other',
              {
                date: formatDate(expense.expenseDate, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }),
                count: formatNumber(expense.shares.length),
              },
            )}
          </Text>
        </HStack>
      </HStack>
    </Flex>

    {/* Footer: Your share + Actions */}
    {hasFooter && (
      <Flex
        align="center"
        justify="space-between"
        gap={2}
        pt={2.5}
        mt="auto"
        borderTop="1px solid var(--pb-hair)"
      >
        {currentShare ? (
          <HStack
            spacing={1.5}
            px={2.5}
            py={1}
            borderRadius="8px"
            border="1px solid rgba(38, 115, 90, 0.18)"
            bg="var(--pb-tint-green)"
          >
            <Text
              fontSize="2xs"
              fontWeight={600}
              letterSpacing="0.04em"
              textTransform="uppercase"
              color="var(--pb-forest-2)"
            >
              {t('household.expenses.yourShare')}
            </Text>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="var(--pb-forest-2)"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatCurrency(currentShare.amount)}
            </Text>
          </HStack>
        ) : (
          <Box />
        )}

        <HStack spacing={1.5} flexShrink={0}>
          {canOpenProof && (
            <Button
              aria-label={t('household.expenses.proofAria', {
                description: expense.description,
              })}
              size="xs"
              h="28px"
              px={2.5}
              borderRadius="8px"
              variant="outline"
              borderColor={attachmentCount > 0 ? 'var(--pb-forest-2)' : 'var(--pb-hair)'}
              bg={attachmentCount > 0 ? 'var(--pb-tint-green)' : 'var(--pb-surface-2)'}
              color={attachmentCount > 0 ? 'var(--pb-forest-2)' : 'var(--pb-ink-soft)'}
              leftIcon={
                <Icon
                  as={attachmentCount > 0 ? ReceiptText : Upload}
                  boxSize={3.5}
                  weight={attachmentCount > 0 ? 'duotone' : 'bold'}
                />
              }
              fontSize="2xs"
              fontWeight={600}
              onClick={() => onOpenAttachments(expense.id)}
              _hover={{
                borderColor: 'var(--pb-forest-2)',
                bg: 'var(--pb-tint-green)',
                color: 'var(--pb-forest-2)',
                transform: 'translateY(-1px)',
              }}
              _active={{ transform: 'translateY(0)' }}
            >
              {t('household.expenses.proof', {
                count: formatNumber(attachmentCount),
              })}
            </Button>
          )}
          {expense.canEdit && (
            <IconButton
              aria-label={t('household.expenses.editAria', {
                description: expense.description,
              })}
              icon={<Icon as={Pencil} boxSize={3.5} />}
              size="xs"
              h="28px"
              w="28px"
              minW="28px"
              borderRadius="8px"
              variant="outline"
              borderColor="var(--pb-hair)"
              bg="var(--pb-surface-2)"
              color="var(--pb-ink-soft)"
              onClick={() => onEditExpense(expense)}
              _hover={{
                borderColor: 'var(--pb-forest-2)',
                bg: 'var(--pb-tint-green)',
                color: 'var(--pb-forest-2)',
                transform: 'translateY(-1px)',
              }}
              _active={{ transform: 'translateY(0)' }}
            />
          )}
        </HStack>
      </Flex>
    )}
  </Stack>
)

}
