import React from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  HStack,
  Icon,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { Sparkles } from '../ui/icons'
import { challengeYearTotal, expectedCumulativeToday } from '../../utils/pennyChallenge'

const money = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value)

export interface StartChallengeDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
}

/**
 * Confirmation dialog shown before the penny-a-day challenge is created. Spells
 * out the year's total and the amount it will start seeded with (caught up to
 * today) so starting it is a deliberate choice, not a one-click surprise.
 */
export default function StartChallengeDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: StartChallengeDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const previewBg = useColorModeValue('orange.50', 'rgba(245,158,11,0.12)')
  const previewBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const chipBg = useColorModeValue('orange.50', 'rgba(245,158,11,0.12)')
  const chipFg = useColorModeValue('orange.600', 'orange.300')

  const today = new Date()
  const year = today.getFullYear()
  const total = challengeYearTotal(year)
  const seed = expectedCumulativeToday(year, today)

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
    >
      <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(8px)">
        <AlertDialogContent
          bg={surfaceBg}
          borderRadius="xl"
          boxShadow="0 20px 60px -20px rgba(0,0,0,0.4)"
          maxW="440px"
          mx={4}
          overflow="hidden"
        >
          <AlertDialogHeader px={6} pt={5} pb={3} display="flex" alignItems="center" gap={3}>
            <Box
              w={9}
              h={9}
              borderRadius="lg"
              bg={chipBg}
              color={chipFg}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Icon as={Sparkles} boxSize={4} weight="duotone" />
            </Box>
            <VStack align="flex-start" spacing={0}>
              <Text fontWeight={700} fontSize="md" color={titleColor} lineHeight="1.2">
                Start penny-a-day challenge
              </Text>
              <Text fontSize="xs" color={captionColor}>
                {year}
              </Text>
            </VStack>
          </AlertDialogHeader>

          <AlertDialogBody px={6} pb={4}>
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" color={captionColor}>
                Save £0.01 on Jan 1, £0.02 on Jan 2, increasing by a penny every day up to the
                last day of the year — {money(total)} in total.
              </Text>
              <Box p={4} bg={previewBg} border="1px solid" borderColor={previewBorder} borderRadius="lg">
                <HStack justify="space-between">
                  <Text fontSize="sm" color={captionColor}>
                    Starts caught up to today
                  </Text>
                  <Text fontSize="md" fontWeight={800} color={titleColor}>
                    {money(seed)}
                  </Text>
                </HStack>
                <Text fontSize="xs" color={captionColor} mt={1}>
                  A goal will be created already holding this amount. You can adjust or archive it
                  anytime.
                </Text>
              </Box>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter px={6} py={4} borderTop="1px solid" borderColor={previewBorder} gap={2}>
            <Button ref={cancelRef} onClick={onClose} variant="ghost" fontSize="sm" fontWeight={600}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              isLoading={isLoading}
              loadingText="Starting…"
              colorScheme="orange"
              fontSize="sm"
              fontWeight={700}
              leftIcon={<Icon as={Sparkles} boxSize={4} />}
            >
              Start challenge
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
