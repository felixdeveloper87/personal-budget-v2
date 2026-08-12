import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { ArrowUpRight, Repeat2, Rows3 } from 'lucide-react'
import Panel from './Panel'
import { useI18n } from '../../../i18n'

type CommitmentKind = 'installments' | 'fixed'

interface CommitmentCardProps {
  kind: CommitmentKind
  monthly: number
  active: number
  inactive: number
  onManage?: () => void
}

const CONTENT = {
  installments: {
    labelKey: 'dashboard.installments',
    inactiveLabelKey: 'dashboard.completed',
    descriptionKey: 'dashboard.installmentsDescription',
    color: 'var(--pb-forest-2)',
    tint: 'var(--pb-tint-green)',
    Icon: Rows3,
  },
  fixed: {
    labelKey: 'dashboard.fixedPayments',
    inactiveLabelKey: 'dashboard.cancelled',
    descriptionKey: 'dashboard.fixedPaymentsDescription',
    color: 'var(--pb-gold-2)',
    tint: 'var(--pb-tint-gold)',
    Icon: Repeat2,
  },
} as const

export default function CommitmentCard({ kind, monthly, active, inactive, onManage }: CommitmentCardProps) {
  const { t, formatCurrency } = useI18n()
  const content = CONTENT[kind]
  const Icon = content.Icon

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={3.5} h="full">
        <HStack justify="space-between" align="flex-start">
          <HStack spacing={2.5}>
            <HStack
              w={8}
              h={8}
              justify="center"
              borderRadius="10px"
              bg={content.tint}
              color={content.color}
              flexShrink={0}
            >
              <Icon size={15} strokeWidth={1.8} />
            </HStack>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="10.5px"
              letterSpacing="0.17em"
              textTransform="uppercase"
              color="var(--pb-ink-faint)"
            >
              {t(content.labelKey)}
            </Text>
          </HStack>
          <Text fontFamily="var(--pb-mono)" fontSize="10px" color="var(--pb-ink-faint)">
            {t('dashboard.activeCount', { count: active })}
          </Text>
        </HStack>

        <HStack align="baseline" spacing={1.5}>
          <Text
            fontFamily="var(--pb-serif)"
            fontSize="clamp(1.75rem, 3.2vw, 2.15rem)"
            fontWeight={500}
            lineHeight={1}
            color={content.color}
            style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
          >
            {formatCurrency(monthly)}
          </Text>
          <Text fontFamily="var(--pb-mono)" fontSize="10px" letterSpacing="0.08em" color="var(--pb-ink-faint)">
            {t('dashboard.perMonth')}
          </Text>
        </HStack>

        <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink-soft)" lineHeight={1.5}>
          {t(content.descriptionKey)}
        </Text>

        <HStack justify="space-between" mt="auto" pt={1}>
          <Text fontFamily="var(--pb-mono)" fontSize="9.5px" letterSpacing="0.06em" color="var(--pb-ink-faint)">
            {inactive} {t(content.inactiveLabelKey)}
          </Text>
          {onManage && (
            <Button
              onClick={onManage}
              variant="ghost"
              size="xs"
              h="26px"
              px={0}
              color={content.color}
              fontFamily="var(--pb-mono)"
              fontSize="10px"
              letterSpacing="0.08em"
              textTransform="uppercase"
              rightIcon={<ArrowUpRight size={13} />}
              _hover={{ bg: 'transparent', textDecoration: 'underline' }}
            >
              {t('dashboard.manage')}
            </Button>
          )}
        </HStack>
      </VStack>
    </Panel>
  )
}
