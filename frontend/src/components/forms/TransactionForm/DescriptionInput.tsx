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
        rows={5}
        borderRadius="xl"
        border="2px"
        borderColor={colors.border}
        fontSize={{ base: 'lg', sm: 'md' }}
        p={{ base: 4, sm: 3 }}
        _focus={{ borderColor: colors.accent }}
        resize="vertical"
        minH={{ base: '120px', sm: '100px' }}
      />

      {/* Submit button for transaction */}
      <Button
        type="submit"
        aria-label={type === 'INCOME' ? 'Add income' : 'Add expense'} // ♿ Accessibility
        colorScheme={type === 'INCOME' ? 'green' : 'red'}
        size="lg"
        h={{ base: '65px', sm: '56px' }}
        isLoading={loading}
        loadingText="Saving..."
        borderRadius="xl"
        w="full"
        fontSize={{ base: 'xl', sm: 'lg' }}
        fontWeight="bold"
        shadow="lg"
        _hover={{
          transform: 'translateY(-2px)',
          shadow: 'xl',
        }}
        _active={{
          transform: 'translateY(0)',
        }}
        transition="all 0.2s"
      >
        {type === 'INCOME' ? '✅ Add Income' : '💸 Add Expense'}
      </Button>
    </VStack>
  )
}
