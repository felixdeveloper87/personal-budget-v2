import React, { useState } from 'react'
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
import { AlertTriangle, TrendingDown, TrendingUp } from './icons'
import { useThemeColors } from '../../hooks/useThemeColors'
import { deleteTransaction } from '../../api'
import { Transaction } from '../../types'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'

interface DeleteTransactionDialogProps {
  transaction: Transaction | null
  isOpen: boolean
  onClose: () => void
  onDeleted: () => void
}

/**
 * Confirmation dialog for deleting a transaction.
 *
 * Uses an `AlertDialog` (semantically destructive action) and surfaces the
 * specific transaction the user is about to remove so the action is unambiguous.
 */
export default function DeleteTransactionDialog({
  transaction,
  isOpen,
  onClose,
  onDeleted,
}: DeleteTransactionDialogProps) {
  const { t, formatCurrency, categoryLabel } = useI18n()
  const colors = useThemeColors()
  const [isDeleting, setIsDeleting] = useState(false)
  const cancelRef = React.useRef<HTMLButtonElement>(null)

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const previewBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const previewBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const warningChipBg = useColorModeValue('red.50', 'rgba(239,68,68,0.14)')
  const warningChipFg = useColorModeValue('red.600', 'red.300')

  const handleDelete = async () => {
    if (!transaction?.id) return
    setIsDeleting(true)
    try {
      await deleteTransaction(transaction.id)
      ToastService.success({
        title: t('transaction.delete.success'),
        description: t('transaction.delete.removed', {
          description: transaction.description || t('transaction.fallbackName'),
        }),
        duration: 2000,
        dedupeKey: `transaction-deleted:${transaction.id}`,
      })
      onDeleted()
      onClose()
    } catch (err: unknown) {
      ToastService.apiError(err, {
        title: t('transaction.delete.error'),
        duration: 3000,
        dedupeKey: `transaction-delete-failed:${transaction.id}`,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!transaction) return null

  const isIncome = transaction.type === 'INCOME'
  const TypeIcon = isIncome ? TrendingUp : TrendingDown

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
          <AlertDialogHeader
            px={6}
            pt={5}
            pb={3}
            display="flex"
            alignItems="center"
            gap={3}
          >
            <Box
              w={9}
              h={9}
              borderRadius="lg"
              bg={warningChipBg}
              color={warningChipFg}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Icon as={AlertTriangle} boxSize={4} strokeWidth={2.25} />
            </Box>
            <VStack align="flex-start" spacing={0}>
              <Text fontWeight={700} fontSize="md" color={titleColor} lineHeight="1.2">
                {t('transaction.delete.title')}
              </Text>
              <Text fontSize="xs" color={captionColor}>
                {t('common.cannotUndo')}
              </Text>
            </VStack>
          </AlertDialogHeader>

          <AlertDialogBody px={6} pb={4}>
            <Box
              p={4}
              bg={previewBg}
              border="1px solid"
              borderColor={previewBorder}
              borderRadius="lg"
            >
              <HStack spacing={3} align="flex-start">
                <Box
                  w={8}
                  h={8}
                  borderRadius="md"
                  bg={isIncome ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'}
                  color={isIncome ? 'green.500' : 'red.500'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Icon as={TypeIcon} boxSize={4} strokeWidth={2.25} />
                </Box>
                <VStack align="flex-start" spacing={0.5} flex={1} minW={0}>
                  <Text
                    fontSize="sm"
                    fontWeight={600}
                    color={titleColor}
                    noOfLines={1}
                  >
                    {transaction.description || t('transaction.noDescription')}
                  </Text>
                  <Text fontSize="xs" color={captionColor} noOfLines={1}>
                    {t(isIncome ? 'type.INCOME' : 'type.EXPENSE')} · {categoryLabel(transaction.category)}
                  </Text>
                </VStack>
                <Text
                  fontSize="md"
                  fontWeight={700}
                  color={isIncome ? 'green.500' : 'red.500'}
                  flexShrink={0}
                >
                  {isIncome ? '+' : '−'}{formatCurrency(transaction.amount)}
                </Text>
              </HStack>
            </Box>
          </AlertDialogBody>

          <AlertDialogFooter
            px={6}
            py={4}
            borderTop="1px solid"
            borderColor={previewBorder}
            gap={2}
          >
            <Button
              ref={cancelRef}
              onClick={onClose}
              variant="ghost"
              fontSize="sm"
              fontWeight={600}
              color={colors.text.secondary}
              _hover={{ bg: previewBg }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleDelete}
              isLoading={isDeleting}
              loadingText={t('common.deleting')}
              fontSize="sm"
              fontWeight={700}
              color="white"
              bg="linear-gradient(135deg, #f43f5e 0%, #dc2626 50%, #b91c1c 100%)"
              bgSize="200% 100%"
              bgPosition="0% 50%"
              boxShadow="0 8px 24px -10px rgba(244, 63, 94, 0.55)"
              _hover={{
                bgPosition: '100% 50%',
                transform: 'translateY(-1px)',
                boxShadow: '0 12px 30px -10px rgba(244, 63, 94, 0.65)',
              }}
              _active={{ transform: 'translateY(0)' }}
              transition="background-position 0.3s ease, transform 0.15s ease, box-shadow 0.2s ease"
            >
              {t('common.delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
