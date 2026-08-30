import { useEffect, useState, type FormEvent } from 'react'
import { Box, Button, Divider, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { createHouseholdSettlement, uploadHouseholdSettlementAttachments } from '../../../api'
import { useEd } from '../../../editorial'
import { useI18n } from '../../../i18n'
import { ToastService } from '../../../services/toast'
import type { HouseholdDashboard, HouseholdDebt, HouseholdPageState } from '../../../types'
import { AttachmentPicker } from '../HouseholdAttachments'
import { today } from '../householdDates'

export function SettlementModal({
  isOpen,
  onClose,
  household,
  debt,
  onChanged,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  debt: HouseholdDebt | null
  onChanged: (page: HouseholdPageState) => void
}) {
  const ed = useEd()
  const { formatCurrency, t } = useI18n()
  const [amount, setAmount] = useState('')
  const [settlementDate, setSettlementDate] = useState(today())
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen || !debt) return
    setAmount(String(debt.amount))
    setSettlementDate(today())
    setFiles([])
  }, [debt, isOpen])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!debt) return
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > debt.amount) {
      ToastService.warning({ title: t('household.settlementModal.invalidAmount') })
      return
    }
    setSaving(true)
    let savedPage: HouseholdPageState | null = null
    try {
      const created = await createHouseholdSettlement(household.id, {
        toMemberId: debt.toMemberId,
        amount: numericAmount,
        settlementDate,
      })
      savedPage = created.page
      const settlementId = created.recordId
      if (files.length > 0) {
        if (!settlementId) {
          throw new Error(t('household.settlementModal.uploadTargetError'))
        }
        savedPage = await uploadHouseholdSettlementAttachments(
          household.id,
          settlementId,
          files,
        )
      }
      onChanged(savedPage)
      ToastService.success({
        title: t('household.settlementModal.sentToast'),
        description: t('household.settlementModal.confirmHint', {
          name: debt.toMemberName,
        }),
      })
      onClose()
    } catch (error) {
      if (savedPage) {
        onChanged(savedPage)
        ToastService.apiError(error, {
          title: t('household.settlementModal.imagesFailed'),
        })
        onClose()
      } else {
        ToastService.apiError(error, { title: t('household.settlementModal.saveFailed') })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent
        bg={ed?.modal}
        color={ed?.cream}
        borderColor={ed?.lineStrong}
        borderWidth={ed ? '1px' : 0}
        maxW={{ base: '100vw', md: 'md' }}
        minH={{ base: '100dvh', md: 'auto' }}
        maxH={{ base: '100dvh', md: 'calc(100vh - 7.5rem)' }}
        my={{ base: 0, md: 16 }}
        borderRadius={{ base: 0, md: 'md' }}
      >
        <ModalHeader>{t('household.settlementModal.title')}</ModalHeader>
        <ModalCloseButton aria-label={t('household.common.close')} />
        <ModalBody as="form" id="household-settlement-form" onSubmit={submit}>
          <VStack align="stretch" spacing={4}>
            <Box p={4} borderRadius="xl" bg={ed?.panelRaised ?? 'blackAlpha.50'}>
              <Text fontSize="sm">{t('household.settlementModal.paying')}</Text>
              <Text fontSize="xl" fontWeight={900}>{debt?.toMemberName}</Text>
              <Text fontSize="sm">
                {t('household.settlementModal.currentDebt', {
                  amount: formatCurrency(debt?.amount ?? 0),
                })}
              </Text>
            </Box>
            <FormControl isRequired>
              <FormLabel>{t('household.settlementModal.amountSent')}</FormLabel>
              <Input
                type="number"
                min="0.01"
                max={debt?.amount}
                step="0.01"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>{t('household.settlementModal.date')}</FormLabel>
              <Input type="date" value={settlementDate} onChange={(event) => setSettlementDate(event.target.value)} />
            </FormControl>
            <Divider borderColor={ed?.line} />
            <AttachmentPicker files={files} onChange={setFiles} />
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button flex={{ base: 1, sm: 'initial' }} variant="ghost" onClick={onClose}>{t('household.common.cancel')}</Button>
          <Button
            flex={{ base: 1, sm: 'initial' }}
            type="submit"
            form="household-settlement-form"
            colorScheme="teal"
            isLoading={saving}
          >
            {t('household.settlementModal.submit')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
