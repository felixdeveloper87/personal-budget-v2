import { useRef } from 'react'
import { Box, Text, Input, HStack, Icon, Button, VStack, Wrap, WrapItem } from '@chakra-ui/react'
import { Calendar, Clock, CalendarCheck } from '../../ui/icons'
import { useThemeColors } from '../../../hooks/useThemeColors'

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
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const openDatePicker = () => {
    const input = inputRef.current
    if (!input) return

    if (typeof input.showPicker === 'function') {
      input.showPicker()
      return
    }

    input.focus()
    input.click()
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
    <VStack spacing={3} align="stretch">
      <Box>
        {/* Omit overflow:hidden: it clips Phosphor stroke icons near rounded corners (mobile + desktop). */}
        <Box
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
        >
          <VStack align="stretch" spacing={0}>
            <VStack
              spacing={3}
              px={{ base: 3, sm: 4 }}
              py={{ base: 3, sm: 4 }}
              align="stretch"
            >
              <HStack justify="space-between" spacing={3} align="center">
                <HStack spacing={2.5} minW={0} flex="1">
                  <Box
                    as="button"
                    type="button"
                    onClick={openDatePicker}
                    w={{ base: 8, sm: 10 }}
                    h={{ base: 8, sm: 10 }}
                    borderRadius="xl"
                    bg={colors.bgSecondary}
                    color={colors.accent}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    cursor="pointer"
                    _hover={{ bg: colors.border }}
                    _focusVisible={{ boxShadow: `0 0 0 2px ${colors.accent}20` }}
                  >
                    <Icon
                      as={Calendar}
                      boxSize={{ base: 4, sm: 5 }}
                      sx={{ '& svg': { display: 'block' } }}
                    />
                  </Box>
                  <Text
                    fontSize={{ base: 'sm', sm: 'md' }}
                    fontWeight="600"
                    color={colors.text.secondary}
                    lineHeight="1.1"
                    noOfLines={1}
                  >
                    What date?
                  </Text>
                </HStack>

                <Box position="relative" flexShrink={0} minW={{ base: '96px', sm: '116px', md: '128px' }}>
                  <Input
                    ref={inputRef}
                    type="date"
                    value={date}
                    onChange={handleChange}
                    position="absolute"
                    w="1px"
                    h="1px"
                    opacity={0}
                    pointerEvents="none"
                    aria-label="Transaction date"
                  />
                  <Text
                    as="button"
                    type="button"
                    onClick={openDatePicker}
                    display="block"
                    w="full"
                    fontSize={{ base: 'sm', sm: 'md' }}
                    fontWeight="700"
                    color={colors.text.primary}
                    lineHeight="1.1"
                    noOfLines={1}
                    textDecoration="underline"
                    textUnderlineOffset="3px"
                    cursor="pointer"
                    textAlign="right"
                    _hover={{ color: colors.accent }}
                    _focusVisible={{ boxShadow: `0 0 0 2px ${colors.accent}20` }}
                  >
                    {new Date(`${date}T00:00:00`).toLocaleDateString('en-GB')}
                  </Text>
                </Box>
              </HStack>

              <Wrap spacing={2} align="center">
                {quickDateOptions.map((option) => (
                  <WrapItem key={option.value}>
                    <Button
                      variant="ghost"
                      onClick={() => onChange(option.value)}
                      leftIcon={
                        <Icon
                          as={option.icon}
                          boxSize={3.5}
                          sx={{ '& svg': { display: 'block' } }}
                        />
                      }
                      iconSpacing={{ base: 1.5, sm: 2 }}
                      h={{ base: 7, sm: 8 }}
                      px={{ base: 2, sm: 3 }}
                      minW="unset"
                      borderRadius="full"
                      color={date === option.value ? colors.text.primary : colors.text.secondary}
                      bg={date === option.value ? colors.bgSecondary : 'transparent'}
                      fontSize={{ base: 'xs', sm: 'xs' }}
                      fontWeight={date === option.value ? 600 : 500}
                      opacity={date === option.value ? 1 : 0.78}
                      _hover={{ bg: colors.bgSecondary, opacity: 1 }}
                      _active={{ bg: colors.bgSecondary }}
                      _focusVisible={{ boxShadow: `0 0 0 2px ${colors.accent}20` }}
                    >
                      {option.label}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </VStack>
          </VStack>
        </Box>
      </Box>
    </VStack>
  )
}


