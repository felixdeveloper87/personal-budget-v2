import { VStack, Textarea, Button } from '@chakra-ui/react'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface DescriptionInputProps {
  value: string
  onChange: (v: string) => void
  type: 'INCOME' | 'EXPENSE'
  loading: boolean
}

export default function DescriptionInput({ value, onChange, type, loading }: DescriptionInputProps) {
  const colors = useThemeColors()

  return (
    <VStack spacing={6} align="stretch">
      <Textarea
        placeholder="Add a note (optional)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        borderRadius="xl"
        border="2px"
        borderColor={colors.border}
      />
      <Button
        type="submit"
        colorScheme="blue"
        size="lg"
        isLoading={loading}
        loadingText="Saving..."
        borderRadius="xl"
        w="full"
      >
        {type === 'INCOME' ? 'Add Income' : 'Add Expense'}
      </Button>
    </VStack>
  )
}
