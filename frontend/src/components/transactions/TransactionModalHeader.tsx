import {
  Box,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { AppCloseButton } from '../ui'
import { useI18n } from '../../i18n'

interface TransactionModalHeaderProps {
  type: 'INCOME' | 'EXPENSE'
  onClose: () => void
  useMobileSafeArea?: boolean
}

export default function TransactionModalHeader({
  type,
  onClose,
  useMobileSafeArea = true,
}: TransactionModalHeaderProps) {
  const { t } = useI18n()
  const copy = type === 'INCOME'
    ? { title: t('dashboard.income'), caption: t('transactions.incomeModalCaption') }
    : { title: t('dashboard.expense'), caption: t('transactions.expenseModalCaption') }

  return (
    <Box
      bg="#820ad1"
      px={{ base: 3.5, sm: 6 }}
      pt={{
        base: useMobileSafeArea
          ? 'max(0.85rem, calc(env(safe-area-inset-top, 0px) + 0.55rem))'
          : 4,
        sm: 5,
      }}
      pb={{ base: 3, sm: 4 }}
      position="relative"
      overflow="hidden"
    >
      {/* Soft concentric rings — same line-art language as the page heroes. */}
      <Box
        aria-hidden="true"
        position="absolute"
        top="-90px"
        right="-70px"
        w="220px"
        h="220px"
        borderRadius="full"
        border="1px solid rgba(255,255,255,0.14)"
        boxShadow="0 0 0 36px rgba(255,255,255,0.03), 0 0 0 37px rgba(255,255,255,0.1)"
        pointerEvents="none"
      />

      <VStack align="stretch" spacing={0.5} position="relative" zIndex={1}>
        <HStack align="center" justify="space-between" spacing={3}>
          <Text
            fontWeight={700}
            letterSpacing="-0.02em"
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
          color="rgba(255, 255, 255, 0.84)"
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
