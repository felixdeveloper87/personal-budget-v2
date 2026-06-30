import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import AccountAvatar from '../../../features/accounts/components/AccountAvatar'
import { FinancialAccount } from '../../../types'

interface AccountSelectorProps {
  value: number | null
  onChange: (value: number | null) => void
  accounts: FinancialAccount[]
  loading?: boolean
}

export default function AccountSelector({
  value,
  onChange,
  accounts,
  loading = false,
}: AccountSelectorProps) {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const cardBg = useColorModeValue('white', 'whiteAlpha.50')
  const selectedBg = useColorModeValue('blue.50', 'whiteAlpha.100')
  const nameColor = useColorModeValue('gray.800', 'gray.100')
  const accent = useColorModeValue('#2563eb', '#60a5fa')

  const activeAccounts = accounts.filter((account) => account.active)
  const selected = activeAccounts.find((account) => account.id === value)

  return (
    <FormControl isRequired minW={0}>
      <FormLabel fontSize="sm" fontWeight={700}>Balance account</FormLabel>

      {loading || activeAccounts.length === 0 ? (
        <Box border="1px solid" borderColor={borderColor} borderRadius="lg" p={3}>
          <Text fontSize="sm" color={captionColor}>
            {loading ? 'Loading accounts…' : 'Create an account first'}
          </Text>
        </Box>
      ) : (
        // Single horizontal line of real-icon account chips; scrolls (carousel)
        // when there are more accounts than fit.
        <Flex
          direction="row"
          gap={2.5}
          overflowX="auto"
          w="full"
          minW={0}
          maxW="100%"
          pb={1}
          mx={-1}
          px={1}
          sx={{
            scrollSnapType: 'x proximity',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            '::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {activeAccounts.map((account) => {
            const isSelected = account.id === value
            return (
              <Box
                key={account.id}
                as="button"
                type="button"
                role="group"
                onClick={() => onChange(account.id)}
                textAlign="left"
                flex="0 0 auto"
                minW="172px"
                maxW="220px"
                borderRadius="xl"
                px={3}
                py={2.5}
                border="2px solid"
                borderColor={isSelected ? accent : borderColor}
                bg={isSelected ? selectedBg : cardBg}
                boxShadow={isSelected ? `0 12px 30px -18px ${accent}` : 'none'}
                transition="border-color 0.18s ease, box-shadow 0.18s ease"
                sx={{ scrollSnapAlign: 'start' }}
                _hover={{ borderColor: accent }}
                _focusVisible={{ outline: '2px solid', outlineColor: accent, outlineOffset: '2px' }}
              >
                <HStack spacing={2.5} align="center">
                  <AccountAvatar account={account} size={34} />
                  <VStack align="flex-start" spacing={0} minW={0}>
                    <Text
                      noOfLines={1}
                      fontWeight={700}
                      fontSize="sm"
                      color={nameColor}
                      _groupHover={{ textDecoration: 'underline' }}
                    >
                      {account.name}
                    </Text>
                    <Text noOfLines={1} fontSize="xs" color={captionColor}>
                      {account.currency} {account.currentBalance.toFixed(2)}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )
          })}
        </Flex>
      )}

      <Text mt={2} fontSize="xs" color={captionColor}>
        {selected
          ? `${selected.institution || selected.type} · current balance ${selected.currency} ${selected.currentBalance.toFixed(2)}`
          : 'Where this transaction changes the balance. Choose the payment method separately below.'}
      </Text>
    </FormControl>
  )
}
