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
import { GRADIENTS } from '../theme'
import { TrendingUp, TrendingDown, Plus, Minus, Sparkles } from 'lucide-react'
import { AddTransactionModal } from '../components/transactions'
import { Transaction } from '../types'
import { getResponsiveStyles, sectionTitleStyles, sectionHeaderStyles } from '../components/ui'

// 🎨 Modern post-it inspired colors
const COLORS = {
  income: {
    bg: '#dcfce7', // Verde post-it
    bgDark: '#1f2937', // Verde escuro
    color: 'green.900',
    colorDark: 'green.400',
    border: 'green.500',
    borderDark: 'green.300'
  },
  expense: {
    bg: '#fecaca', // Rosa post-it
    bgDark: '#2d1b1b', // Rosa escuro
    color: 'red.600',
    colorDark: 'red.400',
    border: 'red.500',
    borderDark: 'red.300'
  }
}

interface AddTransactionSectionProps {
  transactions: Transaction[]
  onRefresh: () => void
}

export default function AddTransactionSection({ transactions, onRefresh }: AddTransactionSectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
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
        px={{ base: 1, sm: 2, md: 3, lg: 4 }}
        sx={{
          paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Card
          bg={useColorModeValue(GRADIENTS.cardLight, GRADIENTS.cardDark)}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="transparent"
          backgroundImage={useColorModeValue(
            'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.3)) border-box',
            'linear-gradient(rgba(26, 32, 44, 0.8), rgba(26, 32, 44, 0.8)) padding-box, linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.4)) border-box'
          )}
          borderRadius="2xl"
          shadow="sm"
          overflow="hidden"
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '2px',
            background: useColorModeValue(
              'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.6), transparent)',
              'linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.8), transparent)'
            ),
            animation: 'shimmer 3s infinite',
            zIndex: 1,
            pointerEvents: 'none'
          }}
          sx={{
            '@keyframes shimmer': {
              '0%': { left: '-100%' },
              '100%': { left: '100%' }
            }
          }}
          _hover={{
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            backgroundImage: useColorModeValue(
              'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.4)) border-box',
              'linear-gradient(rgba(26, 32, 44, 0.8), rgba(26, 32, 44, 0.8)) padding-box, linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.5)) border-box'
            )
          }}
          transition="all 0.2s ease"
        >

            <CardBody p={{ base: 2, sm: 3, md: 4, lg: 5 }} position="relative" zIndex={2}>
              <VStack spacing={responsiveStyles.addTransactionSection.card.spacing} align="stretch">
                {/* Header */}
                <Flex
                  direction={sectionHeaderStyles.container.direction}
                  align={sectionHeaderStyles.container.align}
                  justify={sectionHeaderStyles.container.justify}
                  gap={sectionHeaderStyles.container.gap}
                  w={sectionHeaderStyles.container.w}
                >
                  {/* Icon and Title Section */}
                  <HStack 
                    direction={sectionHeaderStyles.iconAndTitle.direction}
                    align={sectionHeaderStyles.iconAndTitle.align}
                    spacing={sectionHeaderStyles.iconAndTitle.spacing}
                    flex={sectionHeaderStyles.iconAndTitle.flex}
                    justify={sectionHeaderStyles.iconAndTitle.justify}
                  >
                    {/* Modern Icon Container */}
                    <Box
                      p={sectionHeaderStyles.icon.padding}
                      borderRadius={sectionHeaderStyles.icon.borderRadius}
                      bg={useColorModeValue(COLORS.income.bg, COLORS.income.bgDark)}
                      border="1px solid"
                      borderColor={useColorModeValue(COLORS.income.border, COLORS.income.borderDark)}
                      boxShadow={sectionHeaderStyles.icon.boxShadow}
                      _hover={{
                        transform: sectionHeaderStyles.icon.hover.transform,
                        boxShadow: sectionHeaderStyles.icon.hover.boxShadow,
                        borderColor: useColorModeValue('green.300', 'green.400')
                      }}
                      transition={sectionHeaderStyles.icon.transition}
                    >
                      <Icon 
                        as={Sparkles} 
                        boxSize={sectionHeaderStyles.icon.size} 
                        color={useColorModeValue(COLORS.income.color, COLORS.income.colorDark)}
                      />
                    </Box>

                    <VStack 
                      align={sectionHeaderStyles.titleContainer.align}
                      spacing={sectionHeaderStyles.titleContainer.spacing}
                      flex={sectionHeaderStyles.titleContainer.flex}
                    >
                      <Heading
                        size={sectionTitleStyles.size}
                        fontWeight={sectionTitleStyles.fontWeight}
                        textAlign={{ base: 'center', sm: 'left', md: 'left' }}
                        fontFamily={sectionTitleStyles.fontFamily}
                        letterSpacing={sectionTitleStyles.letterSpacing}
                        lineHeight={sectionTitleStyles.lineHeight}
                        display={{ base: 'none', sm: 'block', md: 'block' }}
                      >
                        Quick Actions
                      </Heading>
                      <Text
                        fontSize={responsiveStyles.addTransactionSection.header.title.fontSize}
                        color={useColorModeValue('gray.600', 'gray.300')}
                        fontWeight="500"
                        textAlign={{ base: 'center', sm: 'left', md: 'left' }}
                        display={{ base: 'none', sm: 'block', md: 'block' }}
                        fontFamily="system-ui, -apple-system, sans-serif"
                      >
                        Choose an action to quickly add a transaction
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Buttons Section */}
                  <HStack
                    spacing={responsiveStyles.addTransactionSection.buttons.container.spacing}
                    justify={responsiveStyles.addTransactionSection.buttons.container.justify}
                    align={responsiveStyles.addTransactionSection.buttons.container.align}
                    flexWrap={responsiveStyles.addTransactionSection.buttons.container.flexWrap as any}
                    w={responsiveStyles.addTransactionSection.buttons.container.width}
                  >
                    {[
                      {
                        label: 'Add Money',
                        mobileLabel: 'Add Money',
                        icon: Plus,
                        accent: TrendingUp,
                        type: 'INCOME' as const,
                      },
                      {
                        label: 'Add Expense',
                        mobileLabel: 'Add Expense',
                        icon: Minus,
                        accent: TrendingDown,
                        type: 'EXPENSE' as const,
                      },
                    ].map(({ label, mobileLabel, icon, accent, type: t }) => (
                      <Button
                        key={t}
                        aria-label={label}
                        onClick={() => handleOpen(t)}
                        size={responsiveStyles.addTransactionSection.buttons.button.size}
                        leftIcon={<Icon as={icon} boxSize={responsiveStyles.addTransactionSection.buttons.button.iconSize} />}
                        rightIcon={<Icon as={accent} boxSize={responsiveStyles.addTransactionSection.buttons.button.rightIconSize} />}
                        borderRadius="xl"
                        px={responsiveStyles.addTransactionSection.buttons.button.padding}
                        py={responsiveStyles.addTransactionSection.buttons.button.padding}
                        fontSize={responsiveStyles.addTransactionSection.buttons.button.fontSize}
                        fontWeight="500"
                        bg={useColorModeValue(getButtonColors(t).bg, getButtonColors(t).bgDark)}
                        color={useColorModeValue(getButtonColors(t).color, getButtonColors(t).colorDark)}
                        border="1px solid"
                        borderColor={useColorModeValue(getButtonColors(t).border, getButtonColors(t).borderDark)}
                        minW={responsiveStyles.addTransactionSection.buttons.button.minWidth}
                        maxW={responsiveStyles.addTransactionSection.buttons.button.maxWidth}
                        h={responsiveStyles.addTransactionSection.buttons.button.height}
                        fontFamily="system-ui, -apple-system, sans-serif"
                        backdropFilter="blur(10px)"
                        w={responsiveStyles.addTransactionSection.buttons.button.width}
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
                        <Text display={responsiveStyles.addTransactionSection.buttons.button.textDisplay.mobile}>
                          {mobileLabel}
                        </Text>
                        <Text display={responsiveStyles.addTransactionSection.buttons.button.textDisplay.desktop}>
                          {label}
                        </Text>
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