import { Box, Text, Textarea, HStack, Icon, VStack } from '@chakra-ui/react'
import { FileText } from 'lucide-react'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface DescriptionInputProps {
  value: string
  onChange: (value: string) => void
  type: 'INCOME' | 'EXPENSE'
  loading?: boolean
}

/**
 * 📝 DescriptionInput Component
 * - Displays a textarea for transaction description
 * - Shows different placeholder based on transaction type
 * - Handles text input and validation
 */
export default function DescriptionInput({ value, onChange, type, loading = false }: DescriptionInputProps) {
  const colors = useThemeColors()

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const placeholder = type === 'INCOME' 
    ? 'e.g., Salary payment, freelance work...' 
    : 'e.g., Grocery shopping, rent payment...'


  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <Text fontWeight="600" mb={3} color={colors.text.label} fontSize={{ base: 'sm', sm: 'md' }}>
          Description
        </Text>
        
        <Box
          position="relative"
          borderRadius="2xl"
          bg={colors.inputBg}
          border="2px solid"
          borderColor={colors.border}
          _hover={{
            borderColor: colors.accent,
            transform: 'translateY(-2px)',
            boxShadow: 'lg'
          }}
          _focusWithin={{
            borderColor: colors.accent,
            boxShadow: `0 0 0 3px ${colors.accent}20`,
            transform: 'translateY(-2px)'
          }}
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          overflow="hidden"
        >
          {/* Decorative gradient background */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="2px"
            bg={type === 'INCOME' 
              ? 'linear-gradient(90deg, #22c55e, #16a34a, #15803d)' 
              : 'linear-gradient(90deg, #ef4444, #dc2626, #b91c1c)'
            }
            opacity={0.8}
          />
          
          <HStack spacing={4} align="start" p={4}>
            <Box
              p={2}
              borderRadius="xl"
              bg={colors.accent}
              color="white"
              boxShadow="md"
              mt={1}
            >
              <Icon
                as={FileText}
                boxSize={5}
              />
            </Box>
            
            <Textarea
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              fontSize={{ base: 'md', sm: 'lg' }}
              fontWeight="500"
              border="none"
              bg="transparent"
              color={colors.text.primary}
              resize="vertical"
              minH="100px"
              isDisabled={loading}
              _focus={{
                outline: 'none',
                boxShadow: 'none'
              }}
              _hover={{
                border: 'none'
              }}
              _disabled={{
                opacity: 0.6,
                cursor: 'not-allowed',
              }}
            />
          </HStack>
        </Box>
      </Box>
    </VStack>
  )
}


