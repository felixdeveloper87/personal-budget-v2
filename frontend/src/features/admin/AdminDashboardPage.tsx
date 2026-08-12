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
  Container,
  Heading,
  HStack,
  Icon,
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
import {  Trash2, X } from '../../components/ui/icons'
import { useAuth } from '../../contexts/AuthContext'
import {
  approveAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminUserPlan,
} from '../../api'
import type { AdminUserRow, UserPlan } from '../../types'
import type { AppPage } from '../../components/layout/header/navigation.config'
import { ToastService } from '../../services/toast'
import { useI18n } from '../../i18n'

interface AdminDashboardPageProps {
  onPageChange?: (page: AppPage) => void
}

export default function AdminDashboardPage({ onPageChange }: AdminDashboardPageProps) {
  const { t } = useI18n()
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<AdminUserRow | null>(null)
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
                  onRemove={openRemoveDialog}
                  showApproveActions
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
                onRemove={openRemoveDialog}
                showApproveActions
              />
            </Box>
          </Stack>
        )}
      </Container>
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
  onRemove,
  showApproveActions,
}: {
  rows: AdminUserRow[]
  cardBg: string
  border: string
  currentUserId: number
  onApprove: (id: number) => void
  onPlanChange: (id: number, plan: UserPlan) => void
  onRemove: (row: AdminUserRow) => void
  showApproveActions: boolean
}) {
  const { t, formatDate } = useI18n()
  const isSelf = (row: AdminUserRow) => row.id === currentUserId
  const joined = (iso: string) => {
    const date = new Date(iso)
    return Number.isNaN(date.getTime())
      ? iso
      : formatDate(date, { dateStyle: 'medium', timeStyle: 'short' })
  }

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
              <Th>{t('admin.table.name')}</Th>
              <Th>{t('admin.table.email')}</Th>
              <Th>{t('admin.table.joined')}</Th>
              <Th>{t('admin.table.status')}</Th>
              <Th>{t('admin.table.plan')}</Th>
              <Th>{t('admin.table.actions')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td fontWeight="600">{row.name}</Td>
                <Td fontSize="sm">{row.email}</Td>
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
