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
    <VStack spacing={3} align="stretch">
      <Box>
        {/* Omit overflow:hidden: it clips Phosphor stroke icons near rounded corners (mobile + desktop). */}
        <Box
          borderRadius="2xl"
          bg={colors.inputBg}
          border="2px solid"
          borderColor={colors.border}
          _hover={{ borderColor: colors.accent }}
          _focusWithin={{
            borderColor: colors.accent,
            boxShadow: `0 0 0 3px ${colors.accent}20`
          }}
          transition="border-color 0.3s ease, box-shadow 0.3s ease"
        >
          <VStack align="stretch" spacing={0}>
            <VStack
              spacing={3}
              px={{ base: 3, sm: 4 }}
              py={{ base: 3, sm: 4 }}
              align="stretch"
            >
              {/*
                Mobile Safari/Android: programmatic input.showPicker() / input.click() on a 1px
                input with pointer-events:none often does not open the native date UI. A full-row
                invisible input receives the real tap and opens the picker reliably.
              */}
              <Box position="relative" minH={{ base: '44px', sm: '40px' }}>
                <Input
                  type="date"
                  value={date}
                  onChange={handleChange}
                  position="absolute"
                  inset={0}
                  w="100%"
                  h="100%"
                  opacity={0}
                  zIndex={2}
                  cursor="pointer"
                  fontSize="16px"
                  aria-label="Transaction date"
                  sx={{
                    '&::-webkit-calendar-picker-indicator': {
                      position: 'absolute',
                      inset: 0,
                      w: '100%',
                      h: '100%',
                      opacity: 0,
                      cursor: 'pointer',
                    },
                  }}
                />
                <HStack
                  justify="space-between"
                  spacing={3}
                  align="center"
                  position="relative"
                  zIndex={1}
                  pointerEvents="none"
                  minH={{ base: '44px', sm: '40px' }}
                >
                  <HStack spacing={2.5} minW={0} flex="1">
                    <Box
                      w={{ base: 8, sm: 10 }}
                      h={{ base: 8, sm: 10 }}
                      borderRadius="xl"
                      bg={colors.bgSecondary}
                      color={colors.accent}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
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

                  <Text
                    display="block"
                    flexShrink={0}
                    minW={{ base: '96px', sm: '116px', md: '128px' }}
                    fontSize={{ base: 'sm', sm: 'md' }}
                    fontWeight="700"
                    color={colors.text.primary}
                    lineHeight="1.1"
                    noOfLines={1}
                    textDecoration="underline"
                    textUnderlineOffset="3px"
                    textAlign="right"
                  >
                    {new Date(`${date}T00:00:00`).toLocaleDateString('en-GB')}
                  </Text>
                </HStack>
              </Box>

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
                      _hover={{ bg: colors.bgSecondary, opacity: 1, textDecoration: 'underline' }}
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


