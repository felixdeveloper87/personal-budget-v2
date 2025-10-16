import { Box, Text, Input, HStack, Icon, Button, VStack, Wrap, WrapItem } from '@chakra-ui/react'
import { Calendar, Clock, CalendarCheck } from 'lucide-react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { getResponsiveStyles } from '../../ui'

interface DateSelectorProps {
  date: string
  onChange: (date: string) => void
}

/**
 * 📅 DateSelector Component
 * - Displays a date input with calendar icon
 * - Uses HTML5 date input for native date picker
 * - Handles date formatting and validation
 */
export default function DateSelector({ date, onChange }: DateSelectorProps) {
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const getQuickDateOptions = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return [
      {
        label: 'Today',
        value: today.toISOString().slice(0, 10),
        icon: CalendarCheck,
        color: 'green'
      },
      {
        label: 'Tomorrow',
        value: tomorrow.toISOString().slice(0, 10),
        icon: CalendarCheck,
        color: 'green'
      },
      {
        label: 'Yesterday',
        value: yesterday.toISOString().slice(0, 10),
        icon: Clock,
        color: 'blue'
      }
    ]
  }

  const quickDateOptions = getQuickDateOptions()

  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <Text fontWeight="600" mb={3} color={colors.text.label} fontSize={{ base: 'sm', sm: 'md' }}>
          Date
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
            bg="linear-gradient(90deg, #3b82f6, #8b5cf6, #10b981, #f59e0b, #ef4444)"
            opacity={0.6}
          />
          
          <HStack spacing={4} align="center" p={4}>
            <Box
              p={2}
              borderRadius="xl"
              bg={colors.accent}
              color="white"
              boxShadow="md"
            >
              <Icon
                as={Calendar}
                boxSize={5}
              />
            </Box>
            
            <Input
              type="date"
              value={date}
              onChange={handleChange}
              fontSize={{ base: 'lg', sm: 'xl' }}
              fontWeight="bold"
              border="none"
              bg="transparent"
              color={colors.text.primary}
              h="auto"
              p={0}
              _focus={{
                outline: 'none',
                boxShadow: 'none'
              }}
              _hover={{
                border: 'none'
              }}
              cursor="pointer"
            />
          </HStack>
        </Box>
      </Box>

      {/* Quick Date Buttons */}
      <Box>
        <Text fontWeight="500" mb={2} color={colors.text.secondary} fontSize={{ base: 'xs', sm: 'sm' }}>
          Quick Select
        </Text>
        <Wrap spacing={responsiveStyles.categoryList.spacing}>
          {quickDateOptions.map((option) => (
            <WrapItem key={option.value}>
              <Button
                variant={date === option.value ? 'solid' : 'outline'}
                colorScheme={date === option.value ? 'blue' : 'gray'}
                leftIcon={<Icon as={option.icon} size={16} />}
                onClick={() => onChange(option.value)}
                {...responsiveStyles.buttons.category}
                h={responsiveStyles.buttons.category.height}
                fontWeight="bold"
                borderWidth="2px"
                borderRadius="xl"
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                transition="all 0.2s"
              >
                {option.label}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      </Box>
    </VStack>
  )
}


