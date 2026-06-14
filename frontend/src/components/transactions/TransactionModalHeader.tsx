import {
  Box,
  HStack,
  Text,
  VStack,
  useColorMode,
} from '@chakra-ui/react'
import { editorialPalette, useEd } from '../../editorial'
import { AppCloseButton } from '../ui'

interface TransactionModalHeaderProps {
  type: 'INCOME' | 'EXPENSE'
  onClose: () => void
}

const HEADER_COPY = {
  INCOME: {
    title: 'Income',
    caption: 'Track salary, transfers and one-off payments.',
  },
  EXPENSE: {
    title: 'Expense',
    caption: 'Track spending, bills and monthly commitments.',
  },
} as const

export default function TransactionModalHeader({
  type,
  onClose,
}: TransactionModalHeaderProps) {
  const { colorMode } = useColorMode()
  const ed = useEd() ?? editorialPalette(colorMode)
  const copy = HEADER_COPY[type]

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
            fontFamily={ed.fontDisplay}
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
          fontFamily={ed.fontMono}
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
