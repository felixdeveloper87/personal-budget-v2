import { VStack, Textarea, Button } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface DescriptionInputProps {
  value: string
  onChange: (v: string) => void
  type: 'INCOME' | 'EXPENSE'
  loading: boolean
}

/**
 * 📝 DescriptionInput Component
 * - Provides a textarea for optional transaction notes.
 * - Includes the main "Add Income / Expense" submit button.
 */
export default function DescriptionInput({
  value,
  onChange,
  type,
  loading,
}: DescriptionInputProps) {
  const colors = useThemeColors()

  return (
    <VStack spacing={{ base: 8, sm: 6 }} align="stretch">
      {/* Textarea for user notes */}
      <Textarea
        placeholder="Add a note (optional)"
        aria-label="Transaction description" // ♿ Accessibility: describes textarea purpose
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        borderRadius="xl"
        border="2px"
        borderColor={colors.border}
        fontSize={{ base: 'sm', sm: 'md' }}
        p={{ base: 3, sm: 3 }}
        _focus={{ borderColor: colors.accent }}
        resize="vertical"
        minH={{ base: '70px', sm: '80px' }}
      />

      {/* Submit button for transaction */}
      <Button
        type="submit"
        aria-label={type === 'INCOME' ? 'Add income' : 'Add expense'} // ♿ Accessibility
        colorScheme={type === 'INCOME' ? 'green' : 'red'}
        size={{ base: 'md', sm: 'lg' }}
        h={{ base: '55px', sm: '56px' }}
        fontSize={{ base: 'md', sm: 'lg' }}
        isLoading={loading}
        loadingText="Saving..."
        borderRadius="xl"
        w="full"
        fontWeight="600"
        shadow="md"
        _hover={{
          transform: 'translateY(-1px)',
          shadow: 'lg',
        }}
        _active={{
          transform: 'translateY(0)',
        }}
        transition="all 0.2s ease"
      >
        {type === 'INCOME' ? 'Add Income' : 'Add Expense'}
      </Button>
    </VStack>
  )
}
