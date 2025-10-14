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
import { animations, getGradients } from '../utils/ui'

// 🎨 Constantes para gradientes e animações
const GRADIENTS = {
  income: 'linear-gradient(135deg, #22c55e, #16a34a, #15803d)',
  expense: 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
}

interface AddTransactionSectionProps {
  transactions: Transaction[]
  onRefresh: () => void
}

export default function AddTransactionSection({ transactions, onRefresh }: AddTransactionSectionProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const colors = useThemeColors()
  const gradients = getGradients()

  const handleOpen = (t: 'INCOME' | 'EXPENSE') => {
    setType(t)
    onOpen()
  }

  const handleTransactionCreated = () => {
    onRefresh()
    onClose()
  }

  return (
    <>
      {/* 💳 Add Transaction Section */}
      <Box
        w="full"
        px={{ base: 0.5, md: 1, lg: 1.5 }}
        sx={{
          paddingLeft: 'max(2px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(2px, env(safe-area-inset-right, 0px))',
        }}
      >
        <Box position="relative">
          {/* Background Blur Glow */}
          <Box
            position="absolute"
            top="-50px"
            left="-50px"
            right="-50px"
            height="200px"
            background={gradients.decorative}
            borderRadius="3xl"
            filter="blur(40px)"
            opacity={0.6}
            zIndex={0}
          />

          {/* Card Principal */}
          <Card
            position="relative"
            bg={useColorModeValue('rgba(255,255,255,0.9)', 'rgba(17,17,17,0.9)')}
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={useColorModeValue('rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)')}
            borderRadius="3xl"
            shadow="2xl"
            overflow="hidden"
            sx={{
              animation: animations.slideIn,
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
                to: { opacity: 1, transform: 'translateY(0) scale(1)' },
              },
            }}
          >
            {/* Linha Superior Animada */}
            <Box
              height="4px"
              background="linear-gradient(90deg, #22c55e, #3b82f6, #ef4444, #8b5cf6, #f59e0b)"
              backgroundSize="300% 100%"
              sx={{
                animation: animations.shimmer,
                '@keyframes shimmer': {
                  '0%': { backgroundPosition: '-200% 0' },
                  '100%': { backgroundPosition: '200% 0' },
                },
              }}
            />

            <CardBody p={{ base: 4, sm: 5, md: 8 }}>
              <VStack spacing={{ base: 6, md: 8 }} align="stretch">
                {/* Header */}
                <Flex
                  direction={{ base: 'column', md: 'row' }}
                  align={{ base: 'center', md: 'center' }}
                  justify="space-between"
                  gap={{ base: 4, md: 6 }}
                  textAlign={{ base: 'center', md: 'left' }}
                >
                  <HStack spacing={{ base: 3, sm: 4 }} align="center">
                    <Box
                      p={{ base: 2.5, sm: 3 }}
                      borderRadius="2xl"
                      bg={useColorModeValue(
                        'linear-gradient(135deg, #22c55e, #16a34a)',
                        'linear-gradient(135deg, #4ade80, #22c55e)'
                      )}
                      boxShadow="lg"
                      sx={{
                        animation: animations.glow,
                        '@keyframes glow': {
                          '0%,100%': { boxShadow: '0 0 5px rgba(34,197,94,0.3)' },
                          '50%': {
                            boxShadow:
                              '0 0 20px rgba(34,197,94,0.6), 0 0 30px rgba(34,197,94,0.4)',
                          },
                        },
                      }}
                    >
                      <Icon as={Sparkles} boxSize={{ base: 5, sm: 6 }} color="white" />
                    </Box>

                    <VStack align={{ base: 'center', md: 'start' }} spacing={0}>
                      <Heading
                        size={{ base: 'md', sm: 'lg' }}
                        bg={useColorModeValue(
                          'linear-gradient(135deg, #1e293b, #475569)',
                          'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                        )}
                        bgClip="text"
                        fontWeight="800"
                      >
                        Quick Actions
                      </Heading>
                      <Text
                        fontSize={{ base: '2xs', sm: 'xs' }}
                        color={colors.text.secondary}
                        fontWeight="400"
                        opacity={0.8}
                      >
                        Choose an action to quickly add a transaction
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Botões - Agora ao lado do header no desktop */}
                  <HStack
                    spacing={{ base: 3, sm: 4 }}
                    justify={{ base: 'center', md: 'flex-end' }}
                    flexWrap="wrap"
                    direction={{ base: 'column', sm: 'row' }}
                    w={{ base: 'full', md: 'auto' }}
                  >
                    {[
                      {
                        label: 'Add Money',
                        icon: Plus,
                        accent: TrendingUp,
                        gradient: GRADIENTS.income,
                        type: 'INCOME' as const,
                      },
                      {
                        label: 'Add Expense',
                        icon: Minus,
                        accent: TrendingDown,
                        gradient: GRADIENTS.expense,
                        type: 'EXPENSE' as const,
                      },
                    ].map(({ label, icon, accent, gradient, type: t }, i) => (
                      <Button
                        key={t}
                        aria-label={label}
                        onClick={() => handleOpen(t)}
                        size={{ base: 'lg', md: 'md' }}
                        leftIcon={<Icon as={icon} boxSize={{ base: 5, md: 4 }} />}
                        rightIcon={<Icon as={accent} boxSize={{ base: 4, md: 3 }} />}
                        borderRadius="2xl"
                        px={{ base: 8, md: 6 }}
                        py={{ base: 6, md: 4 }}
                        fontSize={{ base: 'lg', md: 'md' }}
                        fontWeight="800"
                        bg={gradient}
                        color="white"
                        position="relative"
                        overflow="hidden"
                        minW={{ base: '160px', md: '140px' }}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        letterSpacing="wide"
                        sx={{
                          animation: `${animations.float} ${i ? '1.5s' : '0s'} infinite`,
                          '@keyframes float': {
                            '0%,100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-5px)' },
                          },
                        }}
                        _hover={{
                          transform: 'translateY(-8px) scale(1.02)',
                          boxShadow: `0 25px 50px -12px ${
                            t === 'INCOME'
                              ? 'rgba(34,197,94,0.4)'
                              : 'rgba(239,68,68,0.4)'
                          }`,
                        }}
                        boxShadow={`0 10px 25px ${
                          t === 'INCOME'
                            ? 'rgba(34,197,94,0.3)'
                            : 'rgba(239,68,68,0.3)'
                        }`}
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
