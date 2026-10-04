import type { ReactNode } from 'react'
import { Box, Flex, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay, Text } from '@chakra-ui/react'
import { useI18n } from '../../../i18n'
import { AppCloseButton } from '../../../components/ui'

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
  appearance?: 'editorial' | 'nu'
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
  appearance = 'editorial',
}: ActivityDayModalProps) {
  const { t } = useI18n()
  const isIncome = tone === 'income'
  const isNu = appearance === 'nu'
  const tint = isIncome ? 'var(--pb-tint-income)' : 'var(--pb-tint-coral)'
  const accent = isIncome ? 'var(--pb-income)' : 'var(--pb-coral)'
  const accentSoft = isIncome ? 'var(--pb-income-2)' : 'var(--pb-coral-2)'

  if (isNu) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size="lg"
        motionPreset="scale"
        scrollBehavior="inside"
      >
        <ModalOverlay bg="rgba(31, 31, 36, 0.52)" backdropFilter="blur(8px)" />
        <ModalContent
          className="nu-dashboard"
          mx={{ base: 3, sm: 6 }}
          maxH={{ base: 'calc(100dvh - 1.5rem)', sm: 'calc(100dvh - 3rem)' }}
          bg="var(--nu-page)"
          border="1px solid var(--pb-hair)"
          borderRadius="22px"
          boxShadow="0 24px 64px -24px rgba(31, 31, 36, 0.38)"
          overflow="hidden"
          aria-label={label}
        >
          <ModalBody p={0}>
            <Box
              bg="var(--nu-brand)"
              px={{ base: 4, sm: 6 }}
              pt={{ base: 4, sm: 5 }}
              pb={{ base: 4, sm: 5 }}
              position="relative"
              overflow="hidden"
              flexShrink={0}
            >
              <Box
                aria-hidden="true"
                position="absolute"
                top="-90px"
                right="-70px"
                w="220px"
                h="220px"
                borderRadius="full"
                border="1px solid rgba(255,255,255,0.14)"
                boxShadow="0 0 0 36px rgba(255,255,255,0.03), 0 0 0 37px rgba(255,255,255,0.1)"
                pointerEvents="none"
              />

              <AppCloseButton
                onClick={onClose}
                position="absolute"
                top={{ base: 3, sm: 4 }}
                right={{ base: 3, sm: 4 }}
                zIndex={2}
                bg="rgba(255, 255, 255, 0.12)"
                borderColor="rgba(255, 255, 255, 0.24)"
                color="white"
                _hover={{
                  bg: 'rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(255, 255, 255, 0.38)',
                  color: 'white',
                }}
                _active={{ bg: 'rgba(255, 255, 255, 0.16)' }}
              />

              <Box position="relative" zIndex={1} pr={{ base: 12, sm: 14 }}>
                <Text fontSize="xs" fontWeight={600} color="rgba(255,255,255,0.78)">
                  {t('transactions.selectedDay')}
                </Text>
                <Text
                  mt={1}
                  color="white"
                  fontSize={{ base: 'xl', sm: '2xl' }}
                  fontWeight={700}
                  letterSpacing="-0.02em"
                  lineHeight={1.15}
                >
                  {title}
                </Text>
                <HStack mt={3} spacing={2} flexWrap="wrap">
                  <Text
                    px={2.5}
                    py={1}
                    borderRadius="full"
                    bg="rgba(255,255,255,0.14)"
                    color="white"
                    fontSize="xs"
                    fontWeight={700}
                  >
                    {t(count === 1 ? 'transactions.count' : 'transactions.countPlural', { count })}
                  </Text>
                  <Text fontSize="xs" color="rgba(255,255,255,0.78)">
                    {dateContext}
                  </Text>
                </HStack>
              </Box>
            </Box>

            <Box bg="var(--nu-page)" px={{ base: 4, sm: 6 }} py={{ base: 4, sm: 5 }}>
              <Flex
                align="center"
                justify="space-between"
                gap={4}
                bg="var(--nu-surface)"
                borderRadius="16px"
                px={{ base: 4, sm: 5 }}
                py={{ base: 3.5, sm: 4 }}
              >
                <Text color="var(--pb-ink-soft)" fontSize="sm" fontWeight={600}>
                  {totalLabel}
                </Text>
                <Text
                  color={accent}
                  fontSize={{ base: 'xl', sm: '2xl' }}
                  fontWeight={700}
                  letterSpacing="-0.02em"
                  lineHeight={1}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {total}
                </Text>
              </Flex>

              <Box mt={4}>{children}</Box>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

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
