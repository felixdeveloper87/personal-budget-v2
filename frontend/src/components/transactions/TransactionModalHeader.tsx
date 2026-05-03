import {
  Box,
  HStack,
  Icon,
  IconButton,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { X } from '../ui/icons'

interface TransactionModalHeaderProps {
  type: 'INCOME' | 'EXPENSE'
  onClose: () => void
}

const HEADER_COPY = {
  INCOME: {
    title: 'Income',
    caption: 'Track salary, transfers and one-off payments.',
    line: 'linear-gradient(90deg, #22c55e, #10b981)',
  },
  EXPENSE: {
    title: 'Expense',
    caption: 'Track spending, bills and monthly commitments.',
    line: 'linear-gradient(90deg, #fb7185, #ef4444)',
  },
} as const

export default function TransactionModalHeader({
  type,
  onClose,
}: TransactionModalHeaderProps) {
  const copy = HEADER_COPY[type]

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const closeIdleColor = useColorModeValue('gray.500', 'gray.400')
  const closeHoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.100')

  return (
    <Box
      bg={surfaceBg}
      borderBottom="1px solid"
      borderColor={borderColor}
      px={{ base: 3.5, sm: 6 }}
      pt={{
        base: 'max(0.85rem, calc(env(safe-area-inset-top, 0px) + 0.55rem))',
        sm: 5,
      }}
      pb={{ base: 3, sm: 4 }}
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" top={0} left={0} right={0} h="3px" bg={copy.line} />

      <VStack align="stretch" spacing={0.5}>
        <HStack align="center" justify="space-between" spacing={3}>
          <Text
            fontWeight={800}
            fontSize={{ base: 'lg', sm: 'xl' }}
            color={titleColor}
            lineHeight="1.1"
            noOfLines={1}
          >
            {copy.title}
          </Text>
        <IconButton
          aria-label="Close"
          icon={<Icon as={X} boxSize={4} />}
          onClick={onClose}
          size="sm"
          variant="ghost"
          borderRadius="full"
          color={closeIdleColor}
          _hover={{ bg: closeHoverBg, color: titleColor }}
          transition="background-color 0.15s ease, color 0.15s ease"
          flexShrink={0}
        />
        </HStack>

        <Text
          fontSize={{ base: 'xs', sm: 'sm' }}
          color={captionColor}
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
