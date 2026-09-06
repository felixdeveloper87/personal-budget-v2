import { useState } from 'react'
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useI18n } from '../../i18n'
import { ToastService } from '../../services/toast'

interface CommunicationEmailModalProps {
  isOpen: boolean
  onClose: () => void
  recipientCount: number
  onSend: (subject: string, text: string) => Promise<void>
}

export function CommunicationEmailModal({ isOpen, onClose, recipientCount, onSend }: CommunicationEmailModalProps) {
  const { t } = useI18n()
  const [subject, setSubject] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const close = () => {
    if (!sending) onClose()
  }

  const send = async () => {
    if (!subject.trim() || !text.trim() || sending) return
    setSending(true)
    try {
      await onSend(subject, text)
      setSubject('')
      setText('')
      onClose()
    } catch {
      ToastService.error({
        title: t('admin.toast.communicationSendFailed'),
        description: t('admin.toast.communicationSendFailedDescription'),
        duration: 4000,
        dedupeKey: 'admin-communication-send-failed',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={close} isCentered size="lg" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent mx={3}>
        <ModalHeader>{t('admin.communication.modalTitle')}</ModalHeader>
        <ModalCloseButton isDisabled={sending} />
        <ModalBody>
          <Stack spacing={4}>
            <Text fontSize="sm" color="gray.500">
              {t('admin.communication.modalDescription', { count: recipientCount })}
            </Text>
            <FormControl isRequired>
              <FormLabel>{t('admin.communication.subject')}</FormLabel>
              <Input value={subject} maxLength={200} onChange={(event) => setSubject(event.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>{t('admin.communication.message')}</FormLabel>
              <Textarea value={text} minH="220px" maxLength={20000} onChange={(event) => setText(event.target.value)} />
            </FormControl>
          </Stack>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={close} isDisabled={sending}>{t('admin.cancel')}</Button>
          <Button colorScheme="blue" onClick={() => void send()} isLoading={sending} isDisabled={!subject.trim() || !text.trim()}>
            {t('admin.communication.send', { count: recipientCount })}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
