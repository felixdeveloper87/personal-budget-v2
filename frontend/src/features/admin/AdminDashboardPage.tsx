import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Select,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { Mail, Trash2, X } from '../../components/ui/icons'
import { useAuth } from '../../contexts/AuthContext'
import {
  approveAdminUser,
  deleteAdminUser,
  listAdminUsers,
  sendCommunicationEmail,
  updateAdminUserCommunicationEmail,
  updateAdminUserPlan,
} from '../../api'
import type { AdminUserRow, UserPlan } from '../../types'
import type { AppPage } from '../../components/layout/header/navigation.config'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'
import { CommunicationEmailModal } from './CommunicationEmailModal'

interface AdminDashboardPageProps {
  onPageChange?: (page: AppPage) => void
}

export default function AdminDashboardPage({ onPageChange }: AdminDashboardPageProps) {
  const { t } = useI18n()
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    isOpen: isCommunicationOpen,
    onOpen: openCommunication,
    onClose: closeCommunication,
  } = useDisclosure()
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<AdminUserRow | null>(null)
  const [communicationEmails, setCommunicationEmails] = useState<Record<number, string>>({})
  const [selectedCommunicationUserIds, setSelectedCommunicationUserIds] = useState<Set<number>>(new Set())
  const cancelRef = useRef<HTMLButtonElement>(null)

  const cardBg = useColorModeValue('white', 'gray.800')
  const border = useColorModeValue('gray.200', 'whiteAlpha.200')
  const muted = useColorModeValue('gray.600', 'gray.400')

  const load = useCallback(async () => {
    if (!user?.admin) return
    setLoading(true)
    setError(null)
    try {
      const data = await listAdminUsers()
      setRows(data)
      setCommunicationEmails(Object.fromEntries(data.map((row) => [row.id, row.communicationEmail ?? ''])))
      setSelectedCommunicationUserIds(new Set())
    } catch {
      setError(t('admin.loadError'))
      ToastService.error({
        title: t('admin.toast.loadFailed'),
        description: t('admin.toast.loadDescription'),
        duration: 4000,
        dedupeKey: 'admin-users-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [t, user?.admin])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (user && !user.admin) {
      onPageChange?.('dashboard')
    }
  }, [user, onPageChange])

  const openRemoveDialog = (row: AdminUserRow) => {
    setPendingDelete(row)
    onOpen()
  }

  const closeRemoveDialog = () => {
    setPendingDelete(null)
    onClose()
  }

  const confirmRemove = async () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    const wasPending = !pendingDelete.approved
    try {
      await deleteAdminUser(id)
      setRows((prev) => prev.filter((r) => r.id !== id))
      ToastService.success({
        title: wasPending ? t('admin.toast.registrationRejected') : t('admin.toast.userDeleted'),
        description: wasPending
          ? t('admin.toast.registrationRemoved')
          : t('admin.toast.accountRemoved'),
        duration: 3500,
        dedupeKey: `admin-user-deleted:${id}`,
      })
    } catch {
      ToastService.error({
        title: wasPending ? t('admin.toast.rejectFailed') : t('admin.toast.deleteFailed'),
        duration: 3000,
        dedupeKey: `admin-user-delete-failed:${id}`,
      })
    } finally {
      closeRemoveDialog()
    }
  }

  const onApprove = async (id: number) => {
    try {
      const updated = await approveAdminUser(id)
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)))
      ToastService.success({
        title: t('admin.toast.userApproved'),
        description: t('admin.toast.canSignIn'),
        duration: 3000,
        dedupeKey: `admin-user-approved:${id}`,
      })
    } catch {
      ToastService.error({
        title: t('admin.toast.approveFailed'),
        duration: 3000,
        dedupeKey: `admin-user-approve-failed:${id}`,
      })
    }
  }

  const onPlanChange = async (id: number, plan: UserPlan) => {
    try {
      const updated = await updateAdminUserPlan(id, plan)
      setRows((prev) => prev.map((r) => (r.id === id ? updated : r)))
      ToastService.success({
        title: t('admin.toast.planUpdated'),
        duration: 2000,
        dedupeKey: `admin-plan-updated:${id}`,
      })
    } catch {
      ToastService.error({
        title: t('admin.toast.planUpdateFailed'),
        duration: 3000,
        dedupeKey: `admin-plan-update-failed:${id}`,
      })
    }
  }

  const onCommunicationEmailSave = async (id: number) => {
    try {
      const updated = await updateAdminUserCommunicationEmail(id, communicationEmails[id] ?? '')
      setRows((prev) => prev.map((row) => (row.id === id ? updated : row)))
      setCommunicationEmails((prev) => ({ ...prev, [id]: updated.communicationEmail ?? '' }))
      setSelectedCommunicationUserIds((previous) => {
        const next = new Set(previous)
        if (!updated.approved || !updated.communicationEmail?.trim()) next.delete(id)
        return next
      })
      ToastService.success({
        title: t('admin.toast.communicationEmailSaved'),
        duration: 2000,
        dedupeKey: `admin-communication-email-saved:${id}`,
      })
    } catch {
      ToastService.error({
        title: t('admin.toast.communicationEmailSaveFailed'),
        duration: 3000,
        dedupeKey: `admin-communication-email-save-failed:${id}`,
      })
    }
  }

  if (!user?.admin) {
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          {t('admin.noAccess')}
        </Alert>
      </Container>
    )
  }

  const pending = rows.filter((r) => !r.approved)
  const communicationRecipients = rows.filter(
    (row) => row.approved && Boolean(row.communicationEmail?.trim()),
  )
  const selectedCommunicationRecipients = communicationRecipients.filter(
    (row) => selectedCommunicationUserIds.has(row.id),
  )
  const selectedCommunicationRecipientIds = selectedCommunicationRecipients.map((row) => row.id)
  const allCommunicationRecipientsSelected = communicationRecipients.length > 0
    && selectedCommunicationRecipients.length === communicationRecipients.length
  const toggleCommunicationRecipient = (id: number) => {
    setSelectedCommunicationUserIds((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleAllCommunicationRecipients = () => {
    setSelectedCommunicationUserIds(
      allCommunicationRecipientsSelected
        ? new Set()
        : new Set(communicationRecipients.map((row) => row.id)),
    )
  }
  const currentUserId = user.id

  return (
    <Box py={{ base: 6, md: 10 }} px={{ base: 3, md: 6 }}>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={closeRemoveDialog}>
        <AlertDialogOverlay />
        <AlertDialogContent mx={3}>
          <AlertDialogHeader>
            {pendingDelete && !pendingDelete.approved
              ? t('admin.dialog.rejectTitle')
              : t('admin.dialog.deleteTitle')}
          </AlertDialogHeader>
          <AlertDialogBody>
            {pendingDelete &&
              (!pendingDelete.approved ? (
                <Text>{t('admin.dialog.rejectDescription', { email: pendingDelete.email })}</Text>
              ) : (
                <Text>
                  {t('admin.dialog.deleteDescription', {
                    name: pendingDelete.name,
                    email: pendingDelete.email,
                  })}
                </Text>
              ))}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} variant="ghost" mr={3} onClick={closeRemoveDialog}>
              {t('admin.cancel')}
            </Button>
            <Button colorScheme="red" onClick={() => void confirmRemove()}>
              {pendingDelete && !pendingDelete.approved ? t('admin.reject') : t('admin.delete')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Container maxW="container.xl">

        {loading ? (
          <HStack spacing={3} py={10} justify="center">
            <Spinner />
            <Text color={muted}>{t('admin.loadingUsers')}</Text>
          </HStack>
        ) : error ? (
          <Alert status="error" borderRadius="lg" maxW="md">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <Stack spacing={8}>
            <Box borderWidth="1px" borderRadius="xl" borderColor={border} bg={cardBg} p={{ base: 4, md: 5 }}>
              <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ md: 'center' }} spacing={4}>
                <Box>
                  <Heading size="sm">{t('admin.communication.title')}</Heading>
                  <Text mt={1} color={muted} fontSize="sm">
                    {t('admin.communication.description', { count: communicationRecipients.length })}
                  </Text>
                  <Text mt={1} color={muted} fontSize="sm" fontWeight={600}>
                    {t('admin.communication.selected', { count: selectedCommunicationRecipients.length })}
                  </Text>
                </Box>
                <HStack flexWrap="wrap" spacing={2}>
                  <Button
                    variant="outline"
                    onClick={toggleAllCommunicationRecipients}
                    isDisabled={communicationRecipients.length === 0}
                  >
                    {allCommunicationRecipientsSelected
                      ? t('admin.communication.clearSelection')
                      : t('admin.communication.selectAll')}
                  </Button>
                  <Button
                    colorScheme="blue"
                    leftIcon={<Icon as={Mail} boxSize={4} />}
                    onClick={openCommunication}
                    isDisabled={selectedCommunicationRecipients.length === 0}
                  >
                    {t('admin.communication.compose')}
                  </Button>
                </HStack>
              </Stack>
            </Box>
            {pending.length > 0 && (
              <Box>
                <Heading size="sm" mb={3} color="orange.500">
                  {t('admin.pendingApproval', { count: pending.length })}
                </Heading>
                <UserTable
                  rows={pending}
                  cardBg={cardBg}
                  border={border}
                  currentUserId={currentUserId}
                  onApprove={onApprove}
                  onPlanChange={onPlanChange}
                  communicationEmails={communicationEmails}
                  onCommunicationEmailChange={(id, email) => setCommunicationEmails((prev) => ({ ...prev, [id]: email }))}
                  onCommunicationEmailSave={onCommunicationEmailSave}
                  onRemove={openRemoveDialog}
                  showApproveActions
                  showCommunicationSelection={false}
                  selectedCommunicationUserIds={selectedCommunicationUserIds}
                  onToggleCommunicationRecipient={toggleCommunicationRecipient}
                  onToggleAllCommunicationRecipients={toggleAllCommunicationRecipients}
                />
              </Box>
            )}

            <Box>
              <Heading size="sm" mb={3}>
                {t('admin.allUsers', { count: rows.length })}
              </Heading>
              <UserTable
                rows={rows}
                cardBg={cardBg}
                border={border}
                currentUserId={currentUserId}
                onApprove={onApprove}
                onPlanChange={onPlanChange}
                communicationEmails={communicationEmails}
                onCommunicationEmailChange={(id, email) => setCommunicationEmails((prev) => ({ ...prev, [id]: email }))}
                onCommunicationEmailSave={onCommunicationEmailSave}
                onRemove={openRemoveDialog}
                showApproveActions
                showCommunicationSelection
                selectedCommunicationUserIds={selectedCommunicationUserIds}
                onToggleCommunicationRecipient={toggleCommunicationRecipient}
                onToggleAllCommunicationRecipients={toggleAllCommunicationRecipients}
              />
            </Box>
          </Stack>
        )}
      </Container>
      <CommunicationEmailModal
        isOpen={isCommunicationOpen}
        onClose={closeCommunication}
        recipientCount={selectedCommunicationRecipients.length}
        onSend={async (subject, text) => {
          const result = await sendCommunicationEmail(subject, text, selectedCommunicationRecipientIds)
          ToastService.success({
            title: t('admin.toast.communicationSent'),
            description: t('admin.toast.communicationSentDescription', { count: result.recipientCount }),
            duration: 4500,
            dedupeKey: 'admin-communication-sent',
          })
        }}
      />
    </Box>
  )
}

function UserTable({
  rows,
  cardBg,
  border,
  currentUserId,
  onApprove,
  onPlanChange,
  communicationEmails,
  onCommunicationEmailChange,
  onCommunicationEmailSave,
  onRemove,
  showApproveActions,
  showCommunicationSelection,
  selectedCommunicationUserIds,
  onToggleCommunicationRecipient,
  onToggleAllCommunicationRecipients,
}: {
  rows: AdminUserRow[]
  cardBg: string
  border: string
  currentUserId: number
  onApprove: (id: number) => void
  onPlanChange: (id: number, plan: UserPlan) => void
  communicationEmails: Record<number, string>
  onCommunicationEmailChange: (id: number, email: string) => void
  onCommunicationEmailSave: (id: number) => void
  onRemove: (row: AdminUserRow) => void
  showApproveActions: boolean
  showCommunicationSelection: boolean
  selectedCommunicationUserIds: ReadonlySet<number>
  onToggleCommunicationRecipient: (id: number) => void
  onToggleAllCommunicationRecipients: () => void
}) {
  const { t, formatDate } = useI18n()
  const isSelf = (row: AdminUserRow) => row.id === currentUserId
  const joined = (iso: string) => {
    const date = new Date(iso)
    return Number.isNaN(date.getTime())
      ? iso
      : formatDate(date, { dateStyle: 'medium', timeStyle: 'short' })
  }
  const canReceiveCommunication = (row: AdminUserRow) => (
    row.approved && Boolean(row.communicationEmail?.trim())
  )
  const selectableRows = rows.filter(canReceiveCommunication)
  const selectedSelectableCount = selectableRows.filter((row) => selectedCommunicationUserIds.has(row.id)).length
  const allSelectableRowsSelected = selectableRows.length > 0
    && selectedSelectableCount === selectableRows.length

  return (
    <>
      <Box
        display={{ base: 'none', md: 'block' }}
        borderWidth="1px"
        borderRadius="xl"
        borderColor={border}
        overflow="hidden"
        bg={cardBg}
      >
        <Table size="sm" variant="simple">
          <Thead bg="blackAlpha.50" _dark={{ bg: 'whiteAlpha.50' }}>
            <Tr>
              {showCommunicationSelection && (
                <Th>
                  <Checkbox
                    aria-label={t('admin.communication.selectAll')}
                    isChecked={allSelectableRowsSelected}
                    isIndeterminate={selectedSelectableCount > 0 && !allSelectableRowsSelected}
                    isDisabled={selectableRows.length === 0}
                    onChange={onToggleAllCommunicationRecipients}
                  />
                </Th>
              )}
              <Th>{t('admin.table.name')}</Th>
              <Th>{t('admin.table.email')}</Th>
              <Th>{t('admin.table.communicationEmail')}</Th>
              <Th>{t('admin.table.joined')}</Th>
              <Th>{t('admin.table.status')}</Th>
              <Th>{t('admin.table.plan')}</Th>
              <Th>{t('admin.table.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row.id}>
                {showCommunicationSelection && (
                  <Td>
                    <Checkbox
                      aria-label={t('admin.communication.selectRecipient')}
                      isChecked={selectedCommunicationUserIds.has(row.id)}
                      isDisabled={!canReceiveCommunication(row)}
                      onChange={() => onToggleCommunicationRecipient(row.id)}
                    />
                  </Td>
                )}
                <Td fontWeight="600">{row.name}</Td>
                <Td fontSize="sm">{row.email}</Td>
                <Td minW="260px">
                  <HStack spacing={2}>
                    <Input
                      size="sm"
                      type="email"
                      placeholder={t('admin.communication.emailPlaceholder')}
                      value={communicationEmails[row.id] ?? ''}
                      onChange={(event) => onCommunicationEmailChange(row.id, event.target.value)}
                    />
                    <Button size="sm" onClick={() => void onCommunicationEmailSave(row.id)}>
                      {t('admin.save')}
                    </Button>
                  </HStack>
                </Td>
                <Td fontSize="xs" whiteSpace="nowrap">
                  {joined(row.createdAt)}
                </Td>
                <Td>
                  <HStack spacing={2} flexWrap="wrap">
                    {isSelf(row) && (
                      <Badge colorScheme="cyan">{t('admin.status.you')}</Badge>
                    )}
                    {!row.approved ? (
                      <Badge colorScheme="orange">{t('admin.status.pending')}</Badge>
                    ) : (
                      <Badge colorScheme="green">{t('admin.status.approved')}</Badge>
                    )}
                    {row.admin && <Badge colorScheme="purple">{t('admin.status.admin')}</Badge>}
                  </HStack>
                </Td>
                <Td>
                  <Select
                    size="sm"
                    maxW="140px"
                    value={row.plan}
                    onChange={(e) => onPlanChange(row.id, e.target.value as UserPlan)}
                    isDisabled={row.admin}
                  >
                    <option value="STANDARD">{t('admin.plan.standard')}</option>
                    <option value="PREMIUM">{t('admin.plan.premium')}</option>
                  </Select>
                </Td>
                <Td>
                  <HStack spacing={2} flexWrap="wrap" justify="flex-end">
                    {showApproveActions && !row.approved && (
                      <>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => onApprove(row.id)}
                          isDisabled={isSelf(row)}
                        >
                          {t('admin.approve')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          leftIcon={<Icon as={X} boxSize={3.5} />}
                          onClick={() => onRemove(row)}
                          isDisabled={isSelf(row)}
                        >
                          {t('admin.reject')}
                        </Button>
                      </>
                    )}
                    {row.approved && (
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="red"
                        leftIcon={<Icon as={Trash2} boxSize={3.5} />}
                        onClick={() => onRemove(row)}
                        isDisabled={isSelf(row)}
                      >
                        {t('admin.delete')}
                      </Button>
                    )}
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Stack spacing={3} display={{ base: 'flex', md: 'none' }}>
        {rows.map((row) => (
          <Box
            key={row.id}
            borderWidth="1px"
            borderRadius="xl"
            borderColor={border}
            p={4}
            bg={cardBg}
          >
            <Text fontWeight="700">{row.name}</Text>
            <Text fontSize="sm" color="gray.500">
              {row.email}
            </Text>
            {showCommunicationSelection && canReceiveCommunication(row) && (
              <Checkbox
                mt={3}
                isChecked={selectedCommunicationUserIds.has(row.id)}
                onChange={() => onToggleCommunicationRecipient(row.id)}
              >
                {t('admin.communication.selectRecipient')}
              </Checkbox>
            )}
            <FormControl mt={3}>
              <FormLabel fontSize="xs">{t('admin.table.communicationEmail')}</FormLabel>
              <HStack>
                <Input
                  size="sm"
                  type="email"
                  placeholder={t('admin.communication.emailPlaceholder')}
                  value={communicationEmails[row.id] ?? ''}
                  onChange={(event) => onCommunicationEmailChange(row.id, event.target.value)}
                />
                <Button size="sm" onClick={() => void onCommunicationEmailSave(row.id)}>
                  {t('admin.save')}
                </Button>
              </HStack>
            </FormControl>
            <Text fontSize="xs" mt={1} color="gray.500">
              {joined(row.createdAt)}
            </Text>
            <HStack mt={2} spacing={2} flexWrap="wrap">
              {isSelf(row) && <Badge colorScheme="cyan">{t('admin.status.you')}</Badge>}
              {!row.approved ? (
                <Badge colorScheme="orange">{t('admin.status.pending')}</Badge>
              ) : (
                <Badge colorScheme="green">{t('admin.status.approved')}</Badge>
              )}
              {row.admin && <Badge colorScheme="purple">{t('admin.status.admin')}</Badge>}
            </HStack>
            <Stack mt={3} spacing={2}>
              <Select
                size="sm"
                value={row.plan}
                onChange={(e) => onPlanChange(row.id, e.target.value as UserPlan)}
                isDisabled={row.admin}
              >
                <option value="STANDARD">{t('admin.plan.standard')}</option>
                <option value="PREMIUM">{t('admin.plan.premium')}</option>
              </Select>
              {showApproveActions && !row.approved && (
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    flex={1}
                    onClick={() => onApprove(row.id)}
                    isDisabled={isSelf(row)}
                  >
                    {t('admin.approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    flex={1}
                    onClick={() => onRemove(row)}
                    isDisabled={isSelf(row)}
                  >
                    {t('admin.reject')}
                  </Button>
                </HStack>
              )}
              {row.approved && (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="red"
                  leftIcon={<Icon as={Trash2} boxSize={3.5} />}
                  onClick={() => onRemove(row)}
                  isDisabled={isSelf(row)}
                  w="full"
                >
                  {t('admin.deleteAccount')}
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </>
  )
}
