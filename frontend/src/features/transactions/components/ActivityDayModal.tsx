import type { ReactNode } from 'react'
import { Box, Flex, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Text } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'

type ActivityDayModalProps = {
  isOpen: boolean
  onClose: () => void
  label: string
  tone: 'income' | 'expense'
  title: string
  totalLabel: string
  total: string
  count: number
  dateContext: string
  children: ReactNode
}

export default function ActivityDayModal({
  isOpen,
  onClose,
  label,
  tone,
  title,
  totalLabel,
  total,
  count,
  dateContext,
  children,
}: ActivityDayModalProps) {
  const { t } = useI18n()
  const isIncome = tone === 'income'
  const tint = isIncome ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'
  const accent = isIncome ? 'var(--pb-income)' : 'var(--pb-coral)'
  const accentSoft = isIncome ? 'var(--pb-income-2)' : 'var(--pb-coral-2)'

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg" motionPreset="scale">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(6px)" />
      <ModalContent
        mx={{ base: 4, sm: 6 }}
        bg="var(--pb-surface)"
        border={`1px solid ${tint}`}
        borderRadius="22px"
        boxShadow="var(--pb-shadow-lift)"
        overflow="hidden"
        aria-label={label}
      >
        <ModalCloseButton
          zIndex={2}
          mt={1}
          mr={1}
          borderRadius="full"
          color="var(--pb-ink-soft)"
          _hover={{ bg: tint, color: accent }}
        />
        <ModalBody p={0}>
          <Box h="4px" bg={`linear-gradient(90deg, ${accent}, ${accentSoft}, transparent)`} />
          <Box px={{ base: 5, sm: 6 }} pt={{ base: 6, sm: 7 }} pb={{ base: 5, sm: 6 }} borderBottom={`1px solid ${tint}`}>
            <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} gap={4} direction={{ base: 'column', sm: 'row' }}>
              <Box>
                <Text fontFamily="var(--pb-mono)" fontSize="9.5px" letterSpacing="0.16em" textTransform="uppercase" color="var(--pb-ink-faint)">
                  {t('transactions.selectedDay')}
                </Text>
                <Text mt={1} fontFamily="var(--pb-serif)" fontSize="clamp(1.5rem, 4vw, 1.9rem)" lineHeight={1.05} color="var(--pb-ink)">
                  {title}
                </Text>
                <HStack mt={3} spacing={2} flexWrap="wrap">
                  <HStack spacing={1.5} px={2.5} py="4px" borderRadius="full" bg={tint} color={accent}>
                    <Box w="5px" h="5px" borderRadius="full" bg={accent} />
                    <Text fontFamily="var(--pb-mono)" fontSize="9px" fontWeight={600} letterSpacing="0.07em" textTransform="uppercase">
                      {t(count === 1 ? 'transactions.count' : 'transactions.countPlural', { count })}
                    </Text>
                  </HStack>
                  <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.06em" textTransform="uppercase" color="var(--pb-ink-faint)">
                    {dateContext}
                  </Text>
                </HStack>
              </Box>

              <Box minW={{ base: 'full', sm: '154px' }} bg={tint} border={`1px solid ${tint}`} borderRadius="15px" px={4} py={3.5} textAlign={{ base: 'left', sm: 'right' }}>
                <Text fontFamily="var(--pb-mono)" fontSize="9px" letterSpacing="0.13em" textTransform="uppercase" color="var(--pb-ink-faint)">
                  {totalLabel}
                </Text>
                <Text mt={1} fontFamily="var(--pb-serif)" fontSize="1.55rem" lineHeight={1} color={accent} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {total}
                </Text>
              </Box>
            </Flex>
          </Box>
          <Box px={{ base: 5, sm: 6 }} py={{ base: 5, sm: 6 }}>
            {children}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
