import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box, Button, Flex, FormControl, FormLabel, HStack, Icon, IconButton, Input,
  NumberInput, NumberInputField, SimpleGrid, Text, VStack, useDisclosure,
} from '@chakra-ui/react'
import { Target } from 'lucide-react'

import { deleteCategoryBudget, listCategoryBudgets, upsertCategoryBudget } from '../../api'
import type { AppPage } from '../../components/layout/header/navigation.config'
import { ModalHeader, PremiumModal } from '../../components/ui'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from '../../components/ui/icons'
import { useDashboardData } from '../../hooks/useDashboardData'
import { useI18n } from '../../i18n'
import { ToastService } from '../../services/toast'
import type { CategoryBudget } from '../../types'
import '../dashboard/theme/pb-tokens.css'

import NuHero, { NuHeroBadge } from '../dashboard/components/NuHero'
import { NuSection, NU_SHEET_PB, NU_SHEET_WRAP } from '../dashboard/components/nu'

interface PlanningPageProps {
  onPageChange?: (page: AppPage) => void
}

const AMBER = '#d97706'

function tone(b: CategoryBudget): { color: string; bg: string } {
  if (b.exceeded || b.percentageUsed >= 100) return { color: 'var(--nu-negative)', bg: 'var(--nu-negative-tint)' }
  if (b.percentageUsed >= 80) return { color: AMBER, bg: '#fdf1dd' }
  return { color: 'var(--nu-brand)', bg: 'var(--nu-brand-tint)' }
}

const fieldProps = {
  h: '48px', borderRadius: '14px', bg: 'var(--nu-surface)', border: '2px solid transparent',
  _hover: { bg: 'var(--nu-surface-hover)' },
  _focusVisible: { bg: 'var(--nu-page)', borderColor: 'var(--nu-brand)', boxShadow: 'none' },
} as const

export default function PlanningPage(_props: PlanningPageProps) {
  const { t, formatCurrency, formatDate } = useI18n()
  const [month, setMonth] = useState(() => new Date())
  const [budgets, setBudgets] = useState<CategoryBudget[]>([])
  const [editing, setEditing] = useState<CategoryBudget | null>(null)
  const form = useDisclosure()
  const { transactions } = useDashboardData(month, 'month')

  const load = useCallback(async () => {
    try {
      setBudgets(await listCategoryBudgets(month))
    } catch (err) {
      ToastService.apiError(err, { title: t('planning.toast.loadFailed'), dedupeKey: 'planning-load-failed' })
    }
  }, [month, t])

  useEffect(() => { void load() }, [load])

  const shiftMonth = (delta: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1))

  const suggestions = useMemo(() => {
    const used = new Set(budgets.map((b) => b.category.toLowerCase()))
    const all = new Set<string>()
    for (const tx of transactions) if (tx.category && !used.has(tx.category.toLowerCase())) all.add(tx.category)
    return [...all].sort()
  }, [transactions, budgets])

  const totals = useMemo(() => {
    const limit = budgets.reduce((s, b) => s + b.limitAmount, 0)
    const spent = budgets.reduce((s, b) => s + b.spentAmount, 0)
    return { limit, spent, pct: limit > 0 ? Math.min(100, (spent / limit) * 100) : 0, attention: budgets.filter((b) => b.exceeded || b.percentageUsed >= 80).length }
  }, [budgets])

  const openForm = (b: CategoryBudget | null) => { setEditing(b); form.onOpen() }

  const save = async (category: string, limitAmount: number) => {
    try {
      await upsertCategoryBudget({ category, limitAmount, year: month.getFullYear(), month: month.getMonth() + 1 })
      form.onClose()
      await load()
      ToastService.success({ title: t('planning.toast.budgetSaved'), dedupeKey: 'budget-saved' })
    } catch (err) {
      ToastService.apiError(err, { title: t('planning.toast.budgetSaveFailed'), dedupeKey: 'budget-save-failed' })
    }
  }

  const remove = async (b: CategoryBudget) => {
    try {
      await deleteCategoryBudget(b.id)
      await load()
    } catch (err) {
      ToastService.apiError(err, { title: t('planning.toast.budgetDeleteFailed'), dedupeKey: `budget-delete-failed:${b.id}` })
    }
  }

  const monthLabel = formatDate(month, { month: 'long', year: 'numeric' })

  return (
    <Box>
      <NuHero
        title={t('nav.planning.label')}
        action={
          <HStack spacing={2}>
            <Box
              as="button" type="button" onClick={() => openForm(null)}
              display="inline-flex" alignItems="center" gap={1.5} h="36px" px={4} borderRadius="full"
              bg="white" color="var(--nu-brand)" fontSize="14px" fontWeight={650} _hover={{ bg: 'rgba(255,255,255,.9)' }}
            >
              <Icon as={Plus} boxSize={4} />{t('planning.budget.new')}
            </Box>
            <NuHeroBadge><Target size={18} strokeWidth={2.4} aria-hidden="true" /></NuHeroBadge>
          </HStack>
        }
      >
        <HStack mt={{ base: 3, md: 4 }} spacing={1}>
          <IconButton aria-label={t('planning.previousMonth')} icon={<Icon as={ChevronLeft} boxSize={4} />} size="sm" variant="ghost" color="white" borderRadius="full" _hover={{ bg: 'rgba(255,255,255,.16)' }} onClick={() => shiftMonth(-1)} />
          <Text fontSize="sm" fontWeight={600} color="white" textTransform="capitalize" minW="130px" textAlign="center">{monthLabel}</Text>
          <IconButton aria-label={t('planning.nextMonth')} icon={<Icon as={ChevronRight} boxSize={4} />} size="sm" variant="ghost" color="white" borderRadius="full" _hover={{ bg: 'rgba(255,255,255,.16)' }} onClick={() => shiftMonth(1)} />
        </HStack>
        <Text mt={3} fontSize="sm" color="rgba(255,255,255,.78)">{t('planning.budget.totalSpent')}</Text>
        <Text mt={0.5} fontSize={{ base: '2rem', md: '2.5rem' }} fontWeight={700} letterSpacing="-0.025em" lineHeight={1.1} color="white" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(totals.spent)}
        </Text>
        <Text mt={1} fontSize="sm" color="rgba(255,255,255,.72)">{t('planning.budget.ofLimits', { limit: formatCurrency(totals.limit) })}</Text>
        <Box mt={3} maxW="380px" h="4px" borderRadius="full" bg="rgba(255,255,255,.2)" overflow="hidden">
          <Box h="full" w={`${totals.pct}%`} borderRadius="full" bg="white" transition="width .35s ease" />
        </Box>
      </NuHero>

      <Box {...NU_SHEET_WRAP}>
        <Box className="nu-dashboard" pb={NU_SHEET_PB} bg="var(--nu-page)" borderTopRadius="24px" borderBottomRadius={{ base: 0, md: '24px' }} overflow="hidden">
          <NuSection
            title={t('planning.budget.yourBudgets')}
            subtitle={budgets.length === 0 ? t('planning.budget.addCategories') : totals.attention > 0 ? t(totals.attention === 1 ? 'planning.budget.attention.one' : 'planning.budget.attention.other', { count: totals.attention }) : t('planning.budget.withinRange')}
          >
            {budgets.length === 0 ? (
              <Flex direction="column" align="center" gap={3} py={8} borderRadius="20px" bg="var(--nu-surface)" textAlign="center" px={4}>
                <Icon as={Target} boxSize={8} color="var(--nu-brand)" />
                <Text fontWeight={700} color="var(--pb-ink)">{t('planning.budget.emptyTitle')}</Text>
                <Text fontSize="sm" color="var(--pb-ink-soft)">{t('planning.budget.emptyBody')}</Text>
                <Box as="button" type="button" onClick={() => openForm(null)} h="40px" px={5} borderRadius="full" bg="var(--nu-brand)" color="white" fontWeight={600} _hover={{ bg: 'var(--nu-brand-deep)' }}>
                  {t('planning.budget.emptyCta')}
                </Box>
              </Flex>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {budgets.map((b) => {
                  const tn = tone(b)
                  return (
                    <Box key={b.id} p={4} borderRadius="20px" bg="var(--nu-surface)">
                      <Flex justify="space-between" align="flex-start" gap={3}>
                        <Box minW={0}>
                          <Text fontSize="16px" fontWeight={700} color="var(--pb-ink)" noOfLines={1}>{b.category}</Text>
                          <Text mt={0.5} fontSize="12px" color="var(--pb-ink-soft)">
                            {t('planning.budget.spentOfLimit', { spent: formatCurrency(b.spentAmount), limit: formatCurrency(b.limitAmount) })}
                          </Text>
                        </Box>
                        <Text px={2.5} py="2px" borderRadius="full" fontSize="12px" fontWeight={700} bg={tn.bg} color={tn.color} flexShrink={0}>
                          {Math.round(b.percentageUsed)}%
                        </Text>
                      </Flex>
                      <Box mt={3} h="8px" borderRadius="full" bg="var(--nu-track)" overflow="hidden">
                        <Box h="full" w={`${Math.min(100, b.percentageUsed)}%`} borderRadius="full" bg={tn.color} transition="width .35s ease" />
                      </Box>
                      <Flex mt={3} justify="space-between" align="center">
                        <Text fontSize="13px" fontWeight={600} color={b.exceeded ? 'var(--nu-negative)' : 'var(--pb-ink)'}>
                          {b.exceeded ? t('planning.budget.overLimit', { amount: formatCurrency(Math.abs(b.remainingAmount)) }) : t('planning.budget.left', { amount: formatCurrency(b.remainingAmount) })}
                        </Text>
                        <HStack spacing={1}>
                          <Box as="button" type="button" onClick={() => openForm(b)} px={3} h="30px" borderRadius="full" fontSize="13px" fontWeight={600} color="var(--nu-brand)" _hover={{ bg: 'var(--nu-brand-tint)' }}>
                            {t('goals.edit')}
                          </Box>
                          <IconButton aria-label={t('planning.budget.remove')} icon={<Icon as={Trash2} boxSize={4} />} size="sm" variant="ghost" borderRadius="full" color="var(--pb-ink-faint)" onClick={() => remove(b)} _hover={{ bg: 'var(--nu-negative-tint)', color: 'var(--nu-negative)' }} />
                        </HStack>
                      </Flex>
                    </Box>
                  )
                })}
              </SimpleGrid>
            )}
          </NuSection>
        </Box>
      </Box>

      <BudgetFormModal isOpen={form.isOpen} budget={editing} suggestions={suggestions} monthLabel={monthLabel} onClose={form.onClose} onSubmit={save} />
    </Box>
  )
}

function BudgetFormModal({
  isOpen, budget, suggestions, monthLabel, onClose, onSubmit,
}: {
  isOpen: boolean
  budget: CategoryBudget | null
  suggestions: string[]
  monthLabel: string
  onClose: () => void
  onSubmit: (category: string, limit: number) => Promise<void>
}) {
  const { t } = useI18n()
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setCategory(budget?.category ?? '')
    setLimit(budget?.limitAmount ?? 0)
    setBusy(false)
  }, [isOpen, budget])

  const valid = category.trim().length > 0 && limit > 0
  const submit = async () => {
    if (!valid || busy) return
    setBusy(true)
    try { await onSubmit(category.trim(), limit) } finally { setBusy(false) }
  }

  return (
    <PremiumModal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: 'md' }}
      contentProps={{ className: 'nu-dashboard', maxH: { base: 'calc(100dvh - 24px)', sm: '78dvh' } }}
      header={<ModalHeader title={t(budget ? 'planning.budget.editTitle' : 'planning.budget.title')} caption={monthLabel} onClose={onClose} />}
    >
      <VStack spacing={4} align="stretch" p={5} bg="var(--nu-page)">
        <FormControl>
          <FormLabel fontSize="13px" color="var(--pb-ink-soft)">{t('planning.budget.category')}</FormLabel>
          <Input {...fieldProps} list="budget-categories" value={category} isReadOnly={budget != null} maxLength={60} onChange={(e) => setCategory(e.target.value)} placeholder={t('planning.budget.categoryPlaceholder')} />
          <datalist id="budget-categories">{suggestions.map((c) => <option key={c} value={c} />)}</datalist>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="13px" color="var(--pb-ink-soft)">{t('planning.budget.monthlyLimit')}</FormLabel>
          <NumberInput min={0} precision={2} value={limit || ''} onChange={(_, v) => setLimit(v || 0)}>
            <NumberInputField {...fieldProps} placeholder="0,00" />
          </NumberInput>
        </FormControl>
        <Button mt={2} h="48px" borderRadius="full" bg="var(--nu-brand)" color="white" fontWeight={600} _hover={{ bg: 'var(--nu-brand-deep)' }} _disabled={{ opacity: 0.4, cursor: 'not-allowed', _hover: { bg: 'var(--nu-brand)' } }} isDisabled={!valid} isLoading={busy} onClick={submit}>
          {t('planning.budget.save')}
        </Button>
      </VStack>
    </PremiumModal>
  )
}
