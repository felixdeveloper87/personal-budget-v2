import { Box, Flex, Icon, IconButton, Text } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'
import type { HouseholdDashboard, HouseholdExpense } from '../../../types'
import { Pencil, ReceiptText, Upload } from '../../../components/ui/icons'
import { getHouseholdCategoryConfig } from './expenseConfig'

const BRAND = '#820ad1'

/**
 * One expense in two lines:
 *   [icon] description   [proof] [edit]  £ total
 *          3 Oct                Your share £ x
 */
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
  const currentShare = expense.shares.find((share) => share.memberId === household.currentMemberId)
  const attachmentCount = (expense.attachments ?? []).length
  const canOpenProof = attachmentCount > 0 || expense.canEdit
  const categoryCfg = getHouseholdCategoryConfig(expense.category)
  const CategoryIcon = categoryCfg.icon

  return (
    <Box px={{ base: 4, md: 6 }} py={2.5}>
      <Flex align="center" gap={3}>
        <Flex
          w="36px" h="36px" flexShrink={0} align="center" justify="center" borderRadius="full"
          bg={categoryCfg.bg} color={categoryCfg.color}
          title={t(`household.category.${expense.category}`, undefined, expense.category)}
        >
          <CategoryIcon size={18} weight="duotone" aria-hidden="true" />
        </Flex>

        <Box minW={0} flex={1}>
          {/* Line 1: description, proof, edit, total */}
          <Flex align="center" gap={1.5}>
            <Text flex={1} minW={0} fontSize="sm" fontWeight={700} color="var(--pb-ink)" noOfLines={1}>
              {expense.description}
            </Text>
            {canOpenProof && (
              <IconButton
                aria-label={t('household.expenses.proofAria', { description: expense.description })}
                title={t('household.expenses.proof', { count: formatNumber(attachmentCount) })}
                icon={<Icon as={attachmentCount > 0 ? ReceiptText : Upload} boxSize={4} weight={attachmentCount > 0 ? 'fill' : 'bold'} />}
                size="xs" w="28px" minW="28px" h="28px" borderRadius="full" variant="ghost"
                color={attachmentCount > 0 ? BRAND : 'var(--pb-ink-faint)'}
                _hover={{ bg: '#f3e8fc', color: BRAND }}
                onClick={() => onOpenAttachments(expense.id)}
              />
            )}
            {expense.canEdit && (
              <IconButton
                aria-label={t('household.expenses.editAria', { description: expense.description })}
                icon={<Icon as={Pencil} boxSize={4} />}
                size="xs" w="28px" minW="28px" h="28px" borderRadius="full" variant="ghost"
                color="var(--pb-ink-faint)"
                _hover={{ bg: '#f3e8fc', color: BRAND }}
                onClick={() => onEditExpense(expense)}
              />
            )}
            <Text flexShrink={0} ml={1} fontSize="md" fontWeight={800} letterSpacing="-.02em" color="var(--pb-ink)"
              style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(expense.amount)}
            </Text>
          </Flex>

          {/* Line 2: date, your share */}
          <Flex mt={0.5} align="center" gap={2}>
            <Text flex={1} minW={0} fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>
              {formatDate(expense.expenseDate, { day: 'numeric', month: 'short' })}
            </Text>
            {currentShare && (
              <Text flexShrink={0} fontSize="xs" color="var(--pb-ink-soft)">
                {t('household.expenses.yourShare')}{' '}
                <Text as="span" fontWeight={800} color={BRAND} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(currentShare.amount)}
                </Text>
              </Text>
            )}
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}
