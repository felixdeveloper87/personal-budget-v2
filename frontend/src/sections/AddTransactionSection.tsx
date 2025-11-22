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
  Image,
} from '@chakra-ui/react'
import { Plus, Minus } from 'lucide-react'
import { AddTransactionModal } from '../components/transactions'
import { Transaction } from '../types'
import quickActionsImage from '../../assets/quickActions.png'

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

  return (
    <>
      {/* 💳 Add Transaction Section */}
      <Box
        w="full"
        h="full"
        px={{ base: 1, sm: 2, md: 3 }}
      >
        <Box
          h="full"
          bg={useColorModeValue('rgba(255, 255, 255, 0.6)', 'rgba(0, 0, 0, 0.4)')}
          backdropFilter="blur(20px)"
          border="1px solid"
          borderColor={useColorModeValue('whiteAlpha.400', 'whiteAlpha.100')}
          borderRadius="2xl"
          boxShadow={useColorModeValue(
            '0 8px 32px rgba(31, 38, 135, 0.07)',
            '0 8px 32px rgba(0, 0, 0, 0.3)'
          )}
          overflow="hidden"
          position="relative"
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={{
            boxShadow: useColorModeValue(
              '0 12px 40px rgba(31, 38, 135, 0.12)',
              '0 12px 40px rgba(0, 0, 0, 0.5)'
            ),
            transform: 'translateY(-2px)'
          }}
        >
          {/* Decorative gradient blob */}
          <Box
            position="absolute"
            top="-50%"
            left="-5%"
            width="100px"
            height="300px"
            bg="radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)"
            filter="blur(40px)"
            zIndex={0}
            pointerEvents="none"
          />

          <Box p={{ base: 5, sm: 6 }} position="relative" zIndex={1}>
            <VStack spacing={6} align="stretch">
              {/* Header */}
              <HStack justify="space-between" align="center">
                <HStack spacing={4}>
                  <Box
                    p={2}
                    bg="transparent"
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      src={quickActionsImage}
                      alt="Quick Actions"
                      boxSize={{ base: 10, sm: 10, md: 12 }}
                      objectFit="contain"
                    />
                  </Box>
                  <VStack align="start" spacing={0.5}>
                    <Heading
                      size="md"
                      fontWeight="700"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      letterSpacing="-0.02em"
                      fontSize={{ base: 'lg', sm: 'xl' }}
                      bgGradient={useColorModeValue(
                        'linear(to-r, gray.800, gray.600)',
                        'linear(to-r, white, gray.300)'
                      )}
                      bgClip="text"
                    >
                      Quick Actions
                    </Heading>
                    <Text
                      fontSize={{ base: 'xs', sm: 'xl' }}
                      color={useColorModeValue('gray.500', 'gray.400')}
                      fontWeight="600"
                    >
                      Manage your finances instantly
                    </Text>
                  </VStack>
                </HStack>
              </HStack>

              {/* Buttons Section */}
              <HStack
                spacing={4}
                w="full"
                justify="stretch"
              >
                {[
                  {
                    label: 'Income',
                    icon: Plus,
                    type: 'INCOME' as const,
                    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    shadowColor: 'rgba(16, 185, 129, 0.4)'
                  },
                  {
                    label: 'Expense',
                    icon: Minus,
                    type: 'EXPENSE' as const,
                    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    shadowColor: 'rgba(239, 68, 68, 0.4)'
                  },
                ].map(({ label, icon, type: t, gradient, shadowColor }) => (
                  <Button
                    key={t}
                    onClick={() => handleOpen(t)}
                    flex={1}
                    height={{ base: '40px', sm: '48px' }}
                    variant="unstyled"
                    position="relative"
                    role="group"
                    transition="all 0.3s ease"
                    _hover={{ transform: 'translateY(-2px)' }}
                    _active={{ transform: 'scale(0.98)' }}
                  >
                    <Box
                      position="absolute"
                      inset={0}
                      bg={gradient}
                      borderRadius="xl"
                      opacity={0.9}
                      boxShadow={`0 4px 15px ${shadowColor}`}
                      transition="all 0.3s ease"
                      _groupHover={{
                        opacity: 1,
                        boxShadow: `0 8px 25px ${shadowColor}`,
                      }}
                    />

                    {/* Glass overlay for shine effect */}
                    <Box
                      position="absolute"
                      inset={0}
                      bg="linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)"
                      borderRadius="xl"
                      opacity={0.5}
                    />

                    <HStack
                      position="relative"
                      zIndex={1}
                      justify="center"
                      spacing={3}
                      color="white"
                    >
                      <Box
                        p={1.5}
                        bg="transparent"
                        borderRadius="full"
                      >
                        <Icon as={icon} boxSize={{ base: 4, sm: 5 }} strokeWidth={3} />
                      </Box>
                      <Text
                        fontSize={'md'}
                        fontWeight="700"
                        letterSpacing="wide"
                      >
                        {label}
                      </Text>
                    </HStack>
                  </Button>
                ))}
              </HStack>
            </VStack>
          </Box>
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