import { useState } from 'react'
import {
  Box,
  Button,
  HStack,
  Text,
  useDisclosure,
  VStack,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  Flex,
  Heading,
} from '@chakra-ui/react'
import { useThemeColors } from '../hooks/useThemeColors'
import { TrendingUp, TrendingDown, Plus, Minus, Sparkles } from 'lucide-react'
import { AddTransactionModal } from '../components/transactions'
import { Transaction } from '../types'
import { getResponsiveStyles } from '../components/ui'

// 🎨 Modern post-it inspired colors
const COLORS = {
  income: {
    bg: '#dcfce7', // Verde post-it
    bgDark: '#1f2937', // Verde escuro
    color: 'green.600',
    colorDark: 'green.300',
    border: 'green.200',
    borderDark: 'green.500'
  },
  expense: {
    bg: '#fecaca', // Rosa post-it
    bgDark: '#2d1b1b', // Rosa escuro
    color: 'red.600',
    colorDark: 'red.300',
    border: 'red.200',
    borderDark: 'red.500'
  }
}

interface AddTransactionSectionProps {
  transactions: Transaction[]
  onRefresh: () => void
}

export default function AddTransactionSection({ transactions, onRefresh }: AddTransactionSectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const colors = useThemeColors()
  const responsiveStyles = getResponsiveStyles()

  const handleOpen = (t: 'INCOME' | 'EXPENSE') => {
    setType(t)
    onOpen()
  }

  const handleTransactionCreated = () => {
    onRefresh()
    onClose()
  }

  const getButtonColors = (type: 'INCOME' | 'EXPENSE') => {
    const key = type.toLowerCase() as 'income' | 'expense'
    return COLORS[key]
  }

  return (
    <>
      {/* 💳 Add Transaction Section */}
      <Box
        w="full"
        px={{ base: 2, sm: 3, md: 4, lg: 6 }}
        sx={{
          paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Card
          bg={useColorModeValue(
            'rgba(255, 255, 255, 0.9)',
            'rgba(255, 255, 255, 0.05)'
          )}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
          borderRadius="2xl"
          shadow="sm"
          overflow="hidden"
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            borderColor: useColorModeValue('green.200', 'green.500')
          }}
          transition="all 0.2s ease"
        >
          {/* Simple top border */}
          <Box
            height="3px"
            bg={useColorModeValue('green.200', 'green.500')}
          />

            <CardBody p={{ base: 3, sm: 4, md: 5, lg: 6 }}>
              <VStack spacing={responsiveStyles.addTransactionSection.card.spacing} align="stretch">
                {/* Header */}
                <Flex
                  direction={responsiveStyles.addTransactionSection.header.direction}
                  align={{ base: 'center', sm: 'center', md: 'center' }}
                  justify="space-between"
                  gap={responsiveStyles.addTransactionSection.header.gap}
                  w="full"
                >
                  {/* Title Section */}
                  <HStack spacing={{ base: 2, sm: 3, md: 4 }} align="center" justify={{ base: 'center', sm: 'flex-start' }}>
                    {/* Modern Icon Container */}
                    <Box
                      p={{ base: 2, sm: 2.5, md: 3 }}
                      borderRadius={responsiveStyles.addTransactionSection.header.icon.borderRadius}
                      bg={useColorModeValue(COLORS.income.bg, COLORS.income.bgDark)}
                      border="1px solid"
                      borderColor={useColorModeValue(COLORS.income.border, COLORS.income.borderDark)}
                      boxShadow="sm"
                      _hover={{
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        borderColor: useColorModeValue('green.300', 'green.400')
                      }}
                      transition="all 0.2s ease"
                    >
                      <Icon 
                        as={Sparkles} 
                        boxSize={responsiveStyles.addTransactionSection.header.icon.size} 
                        color={useColorModeValue(COLORS.income.color, COLORS.income.colorDark)}
                      />
                    </Box>

                    <VStack align={{ base: 'center', sm: 'start' }} spacing={1} flex="1">
                      <Heading
                        size={responsiveStyles.addTransactionSection.header.title.size}
                        color={useColorModeValue('gray.800', 'gray.100')}
                        fontWeight="700"
                        textAlign={{ base: 'center', sm: 'left' }}
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        Quick Actions
                      </Heading>
                      <Text
                        fontSize={responsiveStyles.addTransactionSection.header.title.fontSize}
                        color={useColorModeValue('gray.600', 'gray.300')}
                        fontWeight="500"
                        textAlign={{ base: 'center', sm: 'left' }}
                        display={{ base: 'none', sm: 'block' }}
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        Choose an action to quickly add a transaction
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Buttons Section */}
                  <HStack
                    spacing={responsiveStyles.addTransactionSection.buttons.spacing}
                    justify={{ base: 'center', sm: 'center', md: 'flex-end' }}
                    align="center"
                    flexWrap="nowrap"
                  >
                    {[
                      {
                        label: 'Add Money',
                        icon: Plus,
                        accent: TrendingUp,
                        type: 'INCOME' as const,
                      },
                      {
                        label: 'Add Expense',
                        icon: Minus,
                        accent: TrendingDown,
                        type: 'EXPENSE' as const,
                      },
                    ].map(({ label, icon, accent, type: t }) => (
                      <Button
                        key={t}
                        aria-label={label}
                        onClick={() => handleOpen(t)}
                        size={responsiveStyles.buttons.action.size}
                        leftIcon={<Icon as={icon} boxSize={responsiveStyles.buttons.action.iconSize} />}
                        rightIcon={<Icon as={accent} boxSize={responsiveStyles.buttons.action.rightIconSize} />}
                        borderRadius="xl"
                        px={responsiveStyles.buttons.action.padding}
                        py={responsiveStyles.buttons.action.padding}
                        fontSize={responsiveStyles.buttons.action.fontSize}
                        fontWeight="500"
                        bg={useColorModeValue(getButtonColors(t).bg, getButtonColors(t).bgDark)}
                        color={useColorModeValue(getButtonColors(t).color, getButtonColors(t).colorDark)}
                        border="1px solid"
                        borderColor={useColorModeValue(getButtonColors(t).border, getButtonColors(t).borderDark)}
                        minW={responsiveStyles.buttons.action.minWidth}
                        h={responsiveStyles.buttons.action.height}
                        fontFamily="system-ui, -apple-system, sans-serif"
                        backdropFilter="blur(10px)"
                        w={{ base: 'full', sm: 'auto', md: 'auto' }}
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                          borderColor: useColorModeValue(
                            t === 'INCOME' ? 'green.300' : 'red.300',
                            t === 'INCOME' ? 'green.400' : 'red.400'
                          ),
                          bg: useColorModeValue(
                            t === 'INCOME' ? 'green.50' : 'red.50',
                            t === 'INCOME' ? 'green.900' : 'red.900'
                          )
                        }}
                        _active={{
                          transform: 'translateY(0)',
                        }}
                        transition="all 0.2s ease"
                      >
                        {label}
                      </Button>
                    ))}
                  </HStack>
                </Flex>
              </VStack>
            </CardBody>
          </Card>
      </Box>

      {/* 🧾 Modal */}
      <AddTransactionModal
        isOpen={isOpen}
        onClose={onClose}
        type={type}
        transactions={transactions}
        onTransactionCreated={handleTransactionCreated}
        onRefresh={onRefresh}
      />
    </>
  )
}