import {
  Box,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { AppCloseButton } from '../ui'
import { useI18n } from '../../i18n'
import TransactionArtwork from './TransactionArtwork'

interface TransactionModalHeaderProps {
  type: 'INCOME' | 'EXPENSE'
  onClose: () => void
}

export default function TransactionModalHeader({
  type,
  onClose,
}: TransactionModalHeaderProps) {
  const { t } = useI18n()
  const copy = type === 'INCOME'
    ? { title: t('dashboard.income'), caption: t('transactions.incomeModalCaption') }
    : { title: t('dashboard.expense'), caption: t('transactions.expenseModalCaption') }

  return (
    <Box
      bg={type === 'INCOME' ? '#173D31' : '#6E302E'}
      borderBottom="1px solid"
      borderColor="rgba(255, 255, 255, 0.18)"
      px={{ base: 3.5, sm: 6 }}
      pt={{
        base: 'max(0.85rem, calc(env(safe-area-inset-top, 0px) + 0.55rem))',
        sm: 5,
      }}
      pb={{ base: 3, sm: 4 }}
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" inset={0} pointerEvents="none">
        <TransactionArtwork tone={type === 'INCOME' ? 'income' : 'expense'} />
      </Box>

      <VStack align="stretch" spacing={0.5} position="relative" zIndex={1}>
        <HStack align="center" justify="space-between" spacing={3}>
          <Text
            textStyle="display"
            fontWeight={400}
            fontSize={{ base: 'xl', sm: '2xl' }}
            color="white"
            lineHeight="1"
            noOfLines={1}
          >
            {copy.title}
          </Text>
          <AppCloseButton
            onClick={onClose}
            bg="rgba(255, 255, 255, 0.12)"
            borderColor="rgba(255, 255, 255, 0.24)"
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.38)', color: 'white' }}
            _active={{ bg: 'rgba(255, 255, 255, 0.16)' }}
          />
        </HStack>

        <Text
          fontSize={{ base: 'xs', sm: 'sm' }}
          textStyle="mono"
          color="rgba(255, 255, 255, 0.78)"
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
