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
  Heading,
} from '@chakra-ui/react'
import { Plus, Minus } from 'lucide-react'
import { AddTransactionModal } from '../components/transactions'
import { Transaction } from '../types'

// 🎨 Modern banking app colors (Revolut/Monzo inspired)
const COLORS = {
  income: {
    gradientLight: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    gradientDark: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    bg: 'white',
    bgDark: '#0a0a0a',
    color: 'white',
    colorDark: 'white',
    border: 'transparent',
    borderDark: 'transparent',
    hoverShadow: '0 8px 25px rgba(16, 185, 129, 0.25)',
    hoverShadowDark: '0 8px 25px rgba(34, 197, 94, 0.3)'
  },
  expense: {
    gradientLight: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    gradientDark: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    bg: 'white',
    bgDark: '#0a0a0a',
    color: 'white',
    colorDark: 'white',
    border: 'transparent',
    borderDark: 'transparent',
    hoverShadow: '0 8px 25px rgba(239, 68, 68, 0.25)',
    hoverShadowDark: '0 8px 25px rgba(239, 68, 68, 0.3)'
  }
}

interface AddTransactionSectionProps {
  transactions: Transaction[]
  onRefresh: () => void
}

export default function AddTransactionSection({ transactions, onRefresh }: AddTransactionSectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')

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
          bg={useColorModeValue('white', '#0a0a0a')}
          backgroundImage={useColorModeValue(
            'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23000" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/%3E%3C/svg%3E',
            'data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 5 L20 5 M50 10 L55 10 M5 40 L15 40 M30 20 L45 20" stroke="%23fff" stroke-width="0.5" opacity="0.1" stroke-linecap="round"/%3E%3C/svg%3E'
          )}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.800')}
          borderRadius="2xl"
          shadow={useColorModeValue('0 1px 3px rgba(0,0,0,0.05)', '0 1px 3px rgba(0,0,0,0.2)')}
          overflow="hidden"
          position="relative"
          _hover={{
            shadow: useColorModeValue('0 4px 12px rgba(0,0,0,0.08)', '0 4px 12px rgba(0,0,0,0.3)')
          }}
          transition="all 0.2s ease"
        >

            <CardBody p={{ base: 4, sm: 5, md: 6, lg: 6 }} position="relative" zIndex={2}>
              <VStack spacing={4} align="stretch">
                {/* Header */}
                <HStack spacing={2} align="baseline">
                  <Heading
                    size="md"
                    fontWeight="600"
                    textAlign="left"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    letterSpacing="-0.015em"
                    fontSize={{ base: 'lg', sm: 'xl' }}
                    color={useColorModeValue('gray.800', 'white')}
                  >
                    Quick Actions
                  </Heading>
                  <Text
                    fontSize={{ base: 'sm', sm: 'sm' }}
                    color={useColorModeValue('gray.600', 'gray.400')}
                    fontWeight="400"
                    textAlign="left"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    • Add income or expense quickly
                  </Text>
                </HStack>

                  {/* Buttons Section */}
                  <HStack
                    spacing={3}
                    w="full"
                    justify={{ base: 'stretch', sm: 'flex-start' }}
                    align="stretch"
                  >
                    {[
                      {
                        label: 'Add Money',
                        mobileLabel: 'Money',
                        icon: Plus,
                        type: 'INCOME' as const,
                      },
                      {
                        label: 'Add Expense',
                        mobileLabel: 'Expense',
                        icon: Minus,
                        type: 'EXPENSE' as const,
                      },
                    ].map(({ label, mobileLabel, icon, type: t }) => {
                      const colors = getButtonColors(t)
                      const gradient = useColorModeValue(colors.gradientLight, colors.gradientDark)
                      const shadow = useColorModeValue(colors.hoverShadow, colors.hoverShadowDark)
                      
                      return (
                        <Button
                          key={t}
                          aria-label={label}
                          onClick={() => handleOpen(t)}
                          size="md"
                          leftIcon={<Icon as={icon} boxSize={4} />}
                          borderRadius="lg"
                          px={4}
                          py={4}
                          fontSize="sm"
                          fontWeight="600"
                          bg={gradient}
                          color="white"
                          border="none"
                          flex={1}
                          h={{ base: '42px', sm: '44px' }}
                          fontFamily="system-ui, -apple-system, sans-serif"
                          letterSpacing="-0.01em"
                          shadow="0 2px 8px rgba(0,0,0,0.08)"
                          _hover={{
                            transform: 'translateY(-1px)',
                            shadow: shadow,
                          }}
                          _active={{
                            transform: 'translateY(0) scale(0.98)',
                          }}
                          transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                        >
                          <Text as="span">
                            {mobileLabel}
                          </Text>
                        </Button>
                      )
                    })}
                  </HStack>
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