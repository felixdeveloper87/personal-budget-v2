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
import { animations, getGradients, getResponsiveStyles } from '../utils/ui'

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
  const responsiveStyles = getResponsiveStyles()

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
        px={responsiveStyles.addTransactionSection.container.padding}
        sx={{
          paddingLeft: responsiveStyles.addTransactionSection.container.safeArea.paddingLeft,
          paddingRight: responsiveStyles.addTransactionSection.container.safeArea.paddingRight,
        }}
      >
        <Box position="relative">
          {/* Background Blur Glow */}
          <Box
            position="absolute"
            top={{ base: "-30px", md: "-50px" }}
            left={{ base: "-20px", md: "-50px" }}
            right={{ base: "-20px", md: "-50px" }}
            height={{ base: "120px", md: "200px" }}
            background={gradients.decorative}
            borderRadius={{ base: "2xl", md: "3xl" }}
            filter={{ base: "blur(20px)", md: "blur(40px)" }}
            opacity={{ base: 0.4, md: 0.6 }}
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

            <CardBody p={responsiveStyles.addTransactionSection.card.padding}>
              <VStack spacing={responsiveStyles.addTransactionSection.card.spacing} align="stretch">
                {/* Header */}
                <Flex
                  direction={{ base: 'column', sm: 'row' }}
                  align={{ base: 'stretch', sm: 'center' }}
                  justify="space-between"
                  gap={responsiveStyles.addTransactionSection.header.gap}
                  w="full"
                >
                  <HStack spacing={{ base: 2, sm: 3, md: 4 }} align="center" flex="1">
                    <Box
                      p={responsiveStyles.addTransactionSection.header.icon.padding}
                      borderRadius={responsiveStyles.addTransactionSection.header.icon.borderRadius}
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
                      <Icon as={Sparkles} boxSize={responsiveStyles.addTransactionSection.header.icon.size} color="white" />
                    </Box>

                    <VStack align="start" spacing={0} flex="1">
                      <Heading
                        size={responsiveStyles.addTransactionSection.header.title.size}
                        bg={useColorModeValue(
                          'linear-gradient(135deg, #1e293b, #475569)',
                          'linear-gradient(135deg, #f8fafc, #e2e8f0)'
                        )}
                        bgClip="text"
                        fontWeight="800"
                        textAlign="left"
                      >
                        Quick Actions
                      </Heading>
                      <Text
                        fontSize={responsiveStyles.addTransactionSection.header.title.fontSize}
                        color={colors.text.secondary}
                        fontWeight="400"
                        opacity={0.8}
                        textAlign="left"
                        display={{ base: 'none', sm: 'block' }}
                      >
                        Choose an action to quickly add a transaction
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Botões - Responsivos para mobile */}
                  <HStack
                    spacing={responsiveStyles.addTransactionSection.buttons.spacing}
                    justify={{ base: 'center', sm: 'flex-end' }}
                    flexWrap="wrap"
                    direction={{ base: 'row', sm: 'row' }}
                    w={responsiveStyles.addTransactionSection.buttons.width}
                    flex={responsiveStyles.addTransactionSection.buttons.flex}
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
                        size={responsiveStyles.buttons.action.size}
                        leftIcon={<Icon as={icon} boxSize={responsiveStyles.buttons.action.iconSize} />}
                        rightIcon={<Icon as={accent} boxSize={responsiveStyles.buttons.action.rightIconSize} />}
                        borderRadius="2xl"
                        px={responsiveStyles.buttons.action.padding}
                        py={responsiveStyles.buttons.action.padding}
                        fontSize={responsiveStyles.buttons.action.fontSize}
                        fontWeight="800"
                        bg={gradient}
                        color="white"
                        position="relative"
                        overflow="hidden"
                        minW={responsiveStyles.buttons.action.minWidth}
                        h={responsiveStyles.buttons.action.height}
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
