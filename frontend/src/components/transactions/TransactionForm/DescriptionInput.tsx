import { Box, Text, Input, HStack, Icon, VStack } from '@chakra-ui/react'
import { FileText } from '../../ui/icons'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface DescriptionInputProps {
  value: string
  onChange: (value: string) => void
  type: 'INCOME' | 'EXPENSE'
  loading?: boolean
}

/**
 * 📝 DescriptionInput — Single-line note field (aligned with Date / Amount / Category cards)
 */
export default function DescriptionInput({
  value,
  onChange,
  type,
  loading = false,
}: DescriptionInputProps) {
  const colors = useThemeColors()
  const accentBorder = type === 'INCOME' ? 'green.400' : 'red.400'
  const focusWithinShadow =
    type === 'INCOME' ? '0 0 0 3px #4ade8020' : '0 0 0 3px #f8717120'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const placeholder =
    type === 'INCOME'
      ? 'e.g. bonus, tips'
      : 'e.g. food, uber'

  return (
    <VStack spacing={3} align="stretch">
      <Box>
        <Box
          borderRadius="2xl"
          bg={colors.inputBg}
          border="2px solid"
          borderColor={colors.border}
          _hover={{
            borderColor: accentBorder,
            transform: 'translateY(-2px)',
            boxShadow: 'lg',
          }}
          _focusWithin={{
            borderColor: accentBorder,
            boxShadow: focusWithinShadow,
            transform: 'translateY(-2px)',
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <HStack
            spacing={{ base: 2, sm: 2.5 }}
            align="center"
            px={{ base: 3, sm: 4 }}
            py={{ base: 3, sm: 4 }}
            minH={{ base: '52px', sm: '56px' }}
          >
            <Box
              role="presentation"
              w={{ base: 8, sm: 10 }}
              h={{ base: 8, sm: 10 }}
              borderRadius="xl"
              bg={colors.bgSecondary}
              color={accentBorder}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              aria-hidden
            >
              <Icon
                as={FileText}
                boxSize={{ base: 4, sm: 5 }}
                sx={{ '& svg': { display: 'block' } }}
              />
            </Box>
            <Text
              fontSize={{ base: 'sm', sm: 'md' }}
              fontWeight="600"
              color={colors.text.secondary}
              lineHeight="1.1"
              flexShrink={0}
              whiteSpace="nowrap"
            >
              Details
            </Text>
            <Input
              type="text"
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              aria-label="Transaction details"
              flex={1}
              minW={0}
              h="auto"
              minH={0}
              p={0}
              border="none"
              bg="transparent"
              color={colors.text.primary}
              fontSize={{ base: 'sm', sm: 'md' }}
              fontWeight="500"
              lineHeight="1.2"
              isDisabled={loading}
              sx={{
                _placeholder: { color: colors.text.secondary, opacity: 0.75 },
              }}
              _focus={{ outline: 'none', boxShadow: 'none' }}
              _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </HStack>
        </Box>
      </Box>
    </VStack>
  )
}
