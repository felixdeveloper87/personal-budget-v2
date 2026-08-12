import { AnimatePresence } from 'framer-motion'
import { Box, Divider, Flex, HStack, Text } from '@chakra-ui/react'
import type { TxnVM, TxView } from '../transactions.types'
import type { LedgerGroup } from '../transactions.utils'
import { fmtDayLong } from '../transactions.utils'
import { MotionBox } from '../../dashboard/components/motion'
import TxnRow from './TxnRow'
import './Ledger.css'
import { useI18n } from '../../../i18n'

interface LedgerProps {
  groups: LedgerGroup[]
  view: TxView
  onOpen: (txn: TxnVM) => void
  reduce: boolean
}

function GroupTotalPill({ kind, value }: { kind: 'in' | 'out'; value: number }) {
  const { formatCurrency } = useI18n()
  const isIn = kind === 'in'
  return (
    <HStack
      spacing="0.3rem"
      px=".6rem"
      py="2px"
      borderRadius="999px"
      bg={isIn ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'}
      color={isIn ? 'var(--pb-income)' : 'var(--pb-coral)'}
    >
      <Text as="span" fontSize="11px" lineHeight="1">
        {isIn ? '↗' : '↘'}
      </Text>
      <Text
        fontFamily="var(--pb-mono)"
        fontSize="11px"
        fontWeight={500}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {formatCurrency(value, { minimumFractionDigits: 2 })}
      </Text>
    </HStack>
  )
}

export default function Ledger({ groups, view, onOpen, reduce }: LedgerProps) {
  const { t, locale } = useI18n()
  if (groups.length === 0) {
    return (
      <Box py="2.5rem" textAlign="center">
        <Text fontFamily="var(--pb-serif)" fontStyle="italic" color="var(--pb-ink-faint)">
          {t('transactions.noneMatch')}
        </Text>
      </Box>
    )
  }

  let rowIndex = 0

  const content = (
    <Box>
      {groups.map((g, gi) => (
        <Box key={g.key} mt={gi === 0 ? 0 : '1.4rem'}>
          {/* Group header */}
          <Flex
            align={{ base: 'flex-start', sm: 'center' }}
            justify="space-between"
            gap=".5rem"
            flexWrap="wrap"
            mb=".4rem"
          >
            <Box>
              <Text
                fontFamily="var(--pb-serif)"
                fontSize="1.12rem"
                fontWeight={500}
                color="var(--pb-ink)"
              >
                {fmtDayLong(g.key, locale)}
              </Text>
              <Text
                fontFamily="var(--pb-mono)"
                fontSize="10px"
                letterSpacing="0.08em"
                textTransform="uppercase"
                color="var(--pb-ink-faint)"
              >
                {t(g.rows.length === 1 ? 'transactions.count' : 'transactions.countPlural', {
                  count: g.rows.length,
                })}
              </Text>
            </Box>
            <HStack spacing=".4rem">
              {g.inTotal > 0 && <GroupTotalPill kind="in" value={g.inTotal} />}
              {g.outTotal > 0 && <GroupTotalPill kind="out" value={g.outTotal} />}
            </HStack>
          </Flex>

          <Divider borderColor="var(--pb-hair)" mb=".2rem" />

          {/* Rows */}
          <Box>
            {g.rows.map((t) => {
              const delay = Math.min(rowIndex * 30, 180)
              rowIndex += 1
              return reduce ? (
                <TxnRow key={t.id} txn={t} view={view} onOpen={onOpen} />
              ) : (
                <Box
                  key={t.id}
                  className="pb-row"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  <TxnRow txn={t} view={view} onOpen={onOpen} />
                </Box>
              )
            })}
          </Box>
        </Box>
      ))}
    </Box>
  )

  if (reduce) return content

  return (
    <AnimatePresence mode="wait" initial={false}>
      <MotionBox
        key={view}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18 }}
      >
        {content}
      </MotionBox>
    </AnimatePresence>
  )
}
