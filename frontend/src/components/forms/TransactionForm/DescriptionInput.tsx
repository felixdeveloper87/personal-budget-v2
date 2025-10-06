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
    <VStack spacing={{ base: 8, sm: 6 }} align="stretch">
      <Textarea
        placeholder="Add a note (optional)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={{ base: 5, sm: 4 }}
        borderRadius="xl"
        border="2px"
        borderColor={colors.border}
        fontSize={{ base: "lg", sm: "md" }}
        p={{ base: 4, sm: 3 }}
        _focus={{ borderColor: colors.accent }}
        resize="vertical"
        minH={{ base: "120px", sm: "100px" }}
      />
      <Button
        type="submit"
        colorScheme="blue"
        size={{ base: "xl", sm: "lg" }}
        h={{ base: "60px", sm: "48px" }}
        isLoading={loading}
        loadingText="Saving..."
        borderRadius="xl"
        w="full"
        fontSize={{ base: "lg", sm: "md" }}
        fontWeight="bold"
      >
        {type === 'INCOME' ? 'Add Income' : 'Add Expense'}
      </Button>
    </VStack>
  )
}
