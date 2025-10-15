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
import { animations, getGradients, getResponsiveStyles, getShimmerStyles } from '../utils/ui'

// 🎨 Constantes para gradientes e animações
const GRADIENTS = {
  income: 'linear-gradient(135deg, #10b981, #059669, #047857)',
  expense: 'linear-gradient(135deg, #f87171, #ef4444, #dc2626)',
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
            bg={useColorModeValue('linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(241, 245, 249, 0.9) 50%, rgba(226, 232, 240, 0.9) 100%)', 'rgba(17,17,17,0.9)')}
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
              sx={getShimmerStyles()}
            />

            <CardBody p={responsiveStyles.addTransactionSection.card.padding}>
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
                    {/* Icon Container with Advanced Effects */}
                    <Box
                      position="relative"
                      p={responsiveStyles.addTransactionSection.header.icon.padding}
                      borderRadius={responsiveStyles.addTransactionSection.header.icon.borderRadius}
                      bg={useColorModeValue(
                        'linear-gradient(135deg, #10b981, #059669, #047857)',
                        'linear-gradient(135deg, #34d399, #10b981, #059669)'
                      )}
                      boxShadow="xl"
                      opacity={0.9}
                      sx={{
                        animation: 'addTransactionGlow 3s ease-in-out infinite, iconFloat 4s ease-in-out infinite',
                        '@keyframes addTransactionGlow': {
                          '0%,100%': { 
                            boxShadow: '0 0 20px rgba(16,185,129,0.3), 0 0 40px rgba(16,185,129,0.1), 0 0 60px rgba(16,185,129,0.05)',
                            transform: 'scale(1)'
                          },
                          '50%': {
                            boxShadow: '0 0 30px rgba(16,185,129,0.5), 0 0 60px rgba(16,185,129,0.2), 0 0 90px rgba(16,185,129,0.1)',
                            transform: 'scale(1.05)'
                          },
                        },
                        '@keyframes iconFloat': {
                          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
                          '25%': { transform: 'translateY(-2px) rotate(1deg)' },
                          '50%': { transform: 'translateY(-4px) rotate(0deg)' },
                          '75%': { transform: 'translateY(-1px) rotate(-1deg)' }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '-2px',
                          left: '-2px',
                          right: '-2px',
                          bottom: '-2px',
                          background: 'linear-gradient(45deg, rgba(16,185,129,0.3), rgba(52,211,153,0.3), rgba(16,185,129,0.3))',
                          borderRadius: 'inherit',
                          zIndex: -1,
                          filter: 'blur(8px)',
                          opacity: 0.6,
                          animation: 'shimmer 3s ease-in-out infinite'
                        }
                      }}
                    >
                      <Icon 
                        as={Sparkles} 
                        boxSize={responsiveStyles.addTransactionSection.header.icon.size} 
                        color="white"
                        sx={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                          animation: 'sparkle 2s ease-in-out infinite',
                          '@keyframes sparkle': {
                            '0%,100%': { transform: 'scale(1) rotate(0deg)', filter: 'brightness(1)' },
                            '25%': { transform: 'scale(1.1) rotate(5deg)', filter: 'brightness(1.2)' },
                            '50%': { transform: 'scale(1.05) rotate(0deg)', filter: 'brightness(1.1)' },
                            '75%': { transform: 'scale(1.1) rotate(-5deg)', filter: 'brightness(1.2)' }
                          }
                        }}
                      />
                    </Box>

                    <VStack align={{ base: 'center', sm: 'start' }} spacing={1} flex="1">
                      <Heading
                        size={responsiveStyles.addTransactionSection.header.title.size}
                        bg={useColorModeValue(
                          'linear-gradient(135deg, #1e293b, #475569, #64748b, #334155)',
                          'linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1, #94a3b8)'
                        )}
                        bgClip="text"
                        fontWeight="900"
                        textAlign={{ base: 'center', sm: 'left' }}
                        sx={{
                          animation: 'titleShimmer 4s ease-in-out infinite',
                          '@keyframes titleShimmer': {
                            '0%,100%': { backgroundPosition: '0% 50%' },
                            '50%': { backgroundPosition: '100% 50%' }
                          },
                          backgroundSize: '200% 200%',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                      >
                        Quick Actions
                      </Heading>
                      <Text
                        fontSize={responsiveStyles.addTransactionSection.header.title.fontSize}
                        color={colors.text.secondary}
                        fontWeight="500"
                        opacity={0.9}
                        textAlign={{ base: 'center', sm: 'left' }}
                        display={{ base: 'none', sm: 'block' }}
                        sx={{
                          animation: 'fadeInUp 0.8s ease-out 0.2s both',
                          '@keyframes fadeInUp': {
                            '0%': { opacity: 0, transform: 'translateY(10px)' },
                            '100%': { opacity: 0.9, transform: 'translateY(0)' }
                          }
                        }}
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
                        opacity={0.8}
                        w={{ base: 'full', sm: 'auto', md: 'auto' }}
                        sx={{
                          animation: `${animations.float} ${i ? '1.5s' : '0s'} infinite`,
                          '@keyframes float': {
                            '0%,100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-5px)' },
                          },
                        }}
                        _hover={{
                          transform: 'translateY(-2px) scale(1.01)',
                          boxShadow: `0 8px 25px -8px ${
                            t === 'INCOME'
                              ? 'rgba(16,185,129,0.4)'
                              : 'rgba(248,113,113,0.4)'
                          }`,
                        }}
                        boxShadow={`0 10px 25px ${
                          t === 'INCOME'
                            ? 'rgba(16,185,129,0.2)'
                            : 'rgba(248,113,113,0.2)'
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