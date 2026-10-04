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
  VStack,
} from '@chakra-ui/react'
import { Sparkles } from '../ui/icons'
import { challengeYearTotal, expectedCumulativeToday } from '../../utils/pennyChallenge'
import { useI18n } from '../../i18n'

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
  const { t, formatCurrency } = useI18n()
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const surfaceBg = 'var(--pb-surface)'
  const previewBg = 'var(--nu-brand-tint, #f3e8fc)'
  const previewBorder = 'var(--pb-hair)'
  const titleColor = 'var(--pb-ink)'
  const captionColor = 'var(--pb-ink-soft)'
  const chipBg = 'var(--nu-brand-tint, #f3e8fc)'
  const chipFg = 'var(--nu-brand, #820ad1)'

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
          borderRadius="24px"
          boxShadow="0 20px 60px -20px rgba(0,0,0,0.4)"
          maxW="440px"
          mx={4}
          overflow="hidden"
        >
          <AlertDialogHeader px={6} pt={5} pb={3} display="flex" alignItems="center" gap={3}>
            <Box
              w={9}
              h={9}
              borderRadius="full"
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
                {t('goals.challenge.start')}
              </Text>
              <Text fontSize="xs" color={captionColor}>
                {year}
              </Text>
            </VStack>
          </AlertDialogHeader>

          <AlertDialogBody px={6} pb={4}>
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" color={captionColor}>
                {t('goals.challenge.dialog.description', {
                  first: formatCurrency(0.01),
                  second: formatCurrency(0.02),
                  total: formatCurrency(total),
                })}
              </Text>
              <Box p={4} bg={previewBg} borderRadius="16px">
                <HStack justify="space-between">
                  <Text fontSize="sm" color={captionColor}>
                    {t('goals.challenge.dialog.seedLabel')}
                  </Text>
                  <Text fontSize="md" fontWeight={800} color={titleColor}>
                    {formatCurrency(seed)}
                  </Text>
                </HStack>
                <Text fontSize="xs" color={captionColor} mt={1}>
                  {t('goals.challenge.dialog.seedDescription')}
                </Text>
              </Box>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter px={6} py={4} borderTop="1px solid" borderColor={previewBorder} gap={2}>
            <Button ref={cancelRef} onClick={onClose} variant="ghost" borderRadius="full" fontSize="sm" fontWeight={600}>
              {t('goals.challenge.dialog.cancel')}
            </Button>
            <Button
              onClick={onConfirm}
              isLoading={isLoading}
              loadingText={t('goals.challenge.dialog.starting')}
              borderRadius="full"
              bg="var(--nu-brand, #820ad1)"
              color="white"
              _hover={{ bg: '#6f00b8' }}
              fontSize="sm"
              fontWeight={700}
              leftIcon={<Icon as={Sparkles} boxSize={4} />}
            >
              {t('goals.challenge.dialog.start')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
