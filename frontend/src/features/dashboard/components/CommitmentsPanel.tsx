import { Box, HStack, Text, VStack, Button } from '@chakra-ui/react'
import { useReducedMotion } from 'framer-motion'
import Panel from './Panel'
import { MotionBox, barV } from './motion'
import { fmtCurrency } from './format'

export interface CommitmentsData {
  totalMonthly: number
  installments: { monthly: number; active: number; past: number }
  fixed: { monthly: number; active: number; cancelled: number }
}

interface CommitmentsPanelProps {
  commitments: CommitmentsData
  onManageInstallments?: () => void
  onManageFixed?: () => void
}

export default function CommitmentsPanel({
  commitments,
  onManageInstallments,
  onManageFixed,
}: CommitmentsPanelProps) {
  const reduce = useReducedMotion()
  const { totalMonthly, installments, fixed } = commitments
  const installPct = totalMonthly > 0 ? (installments.monthly / totalMonthly) * 100 : 50
  const fixedPct = 100 - installPct

  return (
    <Panel h="full">
      <VStack align="stretch" spacing={5}>
        {/* Header */}
        <HStack justify="space-between" align="flex-start">
          <VStack align="stretch" spacing={1}>
            <Text
              fontFamily="var(--pb-mono)"
              fontSize="10.5px"
              letterSpacing="0.2em"
              textTransform="uppercase"
              color="var(--pb-ink-faint)"
            >
              Recurring commitments
            </Text>
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="clamp(1.9rem, 4vw, 2.4rem)"
              fontWeight={500}
              color="var(--pb-ink)"
              lineHeight={1.1}
              style={{ fontVariantNumeric: 'tabular-nums lining-nums' }}
            >
              {fmtCurrency(totalMonthly)}
              <Text
                as="span"
                fontFamily="var(--pb-mono)"
                fontSize="13px"
                fontWeight={400}
                color="var(--pb-ink-faint)"
                ml={1}
              >
                /mo
              </Text>
            </Text>
            <Text
              fontFamily="var(--pb-serif)"
              fontSize="sm"
              color="var(--pb-ink-soft)"
              maxW="30ch"
              lineHeight={1.5}
            >
              Committed every month before any day-to-day spending.
            </Text>
          </VStack>

          <Button
            size="xs"
            h="26px"
            px={3}
            borderRadius="999px"
            fontFamily="var(--pb-mono)"
            fontSize="10px"
            fontWeight={500}
            letterSpacing="0.1em"
            textTransform="uppercase"
            bg="var(--pb-surface-2)"
            color="var(--pb-ink-soft)"
            border="1px solid var(--pb-hair)"
            _hover={{ bg: 'var(--pb-surface-3)', borderColor: 'var(--pb-hair-2)' }}
            flexShrink={0}
            onClick={onManageInstallments}
          >
            Manage
          </Button>
        </HStack>

        {/* Split bar */}
        {totalMonthly > 0 && (
          <Box>
            <Box
              h="10px"
              borderRadius="999px"
              bg="var(--pb-surface-3)"
              border="1px solid var(--pb-hair)"
              overflow="hidden"
              position="relative"
              role="img"
              aria-label={`Installments ${Math.round(installPct)}%, fixed payments ${Math.round(fixedPct)}%`}
            >
              <MotionBox
                position="absolute"
                top={0}
                left={0}
                h="100%"
                w={`${installPct}%`}
                bg="var(--pb-forest-2)"
                borderRadius="999px"
                style={{ transformOrigin: 'left center' }}
                variants={reduce ? undefined : barV}
                initial={reduce ? false : 'hidden'}
                animate={reduce ? false : 'show'}
              />
              {/* Fixed payments stripe */}
              <MotionBox
                position="absolute"
                top={0}
                left={`${installPct}%`}
                h="100%"
                w={`${fixedPct}%`}
                bg="var(--pb-gold-2)"
                borderRadius="0 999px 999px 0"
                style={{ transformOrigin: 'left center' }}
                variants={reduce ? undefined : { ...barV, hidden: { scaleX: 0 }, show: { ...barV.show, transition: { ...barV.show.transition, delay: 0.45 } } }}
                initial={reduce ? false : 'hidden'}
                animate={reduce ? false : 'show'}
              />
            </Box>
          </Box>
        )}

        {/* Rows */}
        <VStack align="stretch" spacing={0} divider={<Box borderBottom="1px solid var(--pb-hair)" />}>
          <CommitmentRow
            color="var(--pb-forest-2)"
            label="Installments"
            monthly={installments.monthly}
            meta={`${installments.active} active · ${installments.past} past`}
            onClick={onManageInstallments}
          />
          <CommitmentRow
            color="var(--pb-gold-2)"
            label="Fixed payments"
            monthly={fixed.monthly}
            meta={`${fixed.active} active · ${fixed.cancelled} cancelled`}
            onClick={onManageFixed}
          />
        </VStack>
      </VStack>
    </Panel>
  )
}

interface CommitmentRowProps {
  color: string
  label: string
  monthly: number
  meta: string
  onClick?: () => void
}

function CommitmentRow({ color, label, monthly, meta, onClick }: CommitmentRowProps) {
  return (
    <HStack
      justify="space-between"
      py={3}
      cursor={onClick ? 'pointer' : undefined}
      _hover={onClick ? { bg: 'var(--pb-tint-green)' } : undefined}
      borderRadius="8px"
      px={2}
      mx={-2}
      transition="background 0.15s"
      onClick={onClick}
    >
      <HStack spacing={3}>
        <Box w={3} h={3} borderRadius="3px" bg={color} flexShrink={0} />
        <VStack align="stretch" spacing={0}>
          <Text fontFamily="var(--pb-serif)" fontSize="sm" color="var(--pb-ink)" fontWeight={500}>
            {label}
          </Text>
          <Text fontFamily="var(--pb-mono)" fontSize="10px" color="var(--pb-ink-faint)" letterSpacing="0.06em">
            {meta}
          </Text>
        </VStack>
      </HStack>
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="13px"
        fontWeight={500}
        color="var(--pb-ink-soft)"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {fmtCurrency(monthly)}/mo
      </Text>
    </HStack>
  )
}
