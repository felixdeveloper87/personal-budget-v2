import {
  Box,
  HStack,
  Text,
  VStack,
  useColorMode,
} from '@chakra-ui/react'
import { editorialPalette, useEd } from '../../editorial'
import { AppCloseButton } from '../ui'
import { useI18n } from '../../i18n'

interface TransactionModalHeaderProps {
  type: 'INCOME' | 'EXPENSE'
  onClose: () => void
}

export default function TransactionModalHeader({
  type,
  onClose,
}: TransactionModalHeaderProps) {
  const { colorMode } = useColorMode()
  const { t } = useI18n()
  const ed = useEd() ?? editorialPalette(colorMode)
  const copy = type === 'INCOME'
    ? { title: t('dashboard.income'), caption: t('transactions.incomeModalCaption') }
    : { title: t('dashboard.expense'), caption: t('transactions.expenseModalCaption') }

  return (
    <Box
      bg={ed.bg2}
      borderBottom="1px solid"
      borderColor={ed.line}
      px={{ base: 3.5, sm: 6 }}
      pt={{
        base: 'max(0.85rem, calc(env(safe-area-inset-top, 0px) + 0.55rem))',
        sm: 5,
      }}
      pb={{ base: 3, sm: 4 }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="2px"
        bg={type === 'INCOME'
          ? `linear-gradient(90deg, ${ed.jade}, ${ed.gold})`
          : `linear-gradient(90deg, ${ed.red}, ${ed.gold})`}
      />

      <VStack align="stretch" spacing={0.5}>
        <HStack align="center" justify="space-between" spacing={3}>
          <Text
            textStyle="display"
            fontWeight={400}
            fontSize={{ base: 'xl', sm: '2xl' }}
            color={ed.cream}
            lineHeight="1"
            noOfLines={1}
          >
            {copy.title}
          </Text>
          <AppCloseButton onClick={onClose} />
        </HStack>

        <Text
          fontSize={{ base: 'xs', sm: 'sm' }}
          textStyle="mono"
          color={ed.muted}
          letterSpacing="0.025em"
          lineHeight="1.4"
          noOfLines={1}
          pr={10}
        >
          {copy.caption}
        </Text>
      </VStack>
    </Box>
  )
}
