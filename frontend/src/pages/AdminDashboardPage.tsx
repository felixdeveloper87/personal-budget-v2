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
import { Shield, Trash2, X } from '../components/ui/icons'
import { PageHeader } from '../components/ui'
import { useAuth } from '../contexts/AuthContext'
import {
  approveAdminUser,
  deleteAdminUser,
  listAdminUsers,
  updateAdminUserPlan,
} from '../api'
import type { AdminUserRow, UserPlan } from '../types'
import type { AppPage } from '../components/layout/header/navigation.config'
import { ToastService } from '../services/toast'

interface AdminDashboardPageProps {
  onPageChange?: (page: AppPage) => void
}

export default function AdminDashboardPage({ onPageChange }: AdminDashboardPageProps) {
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
      setError('Could not load users.')
      ToastService.error({
        title: 'Failed to load',
        description: 'Could not fetch user list.',
        duration: 4000,
        dedupeKey: 'admin-users-load-failed',
      })
    } finally {
      setLoading(false)
    }
  }, [user?.admin])

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
        title: wasPending ? 'Registration rejected' : 'User deleted',
        description: wasPending
          ? 'That sign-up request was removed.'
          : 'The account and its data were removed.',
        duration: 3500,
        dedupeKey: `admin-user-deleted:${id}`,
      })
    } catch {
      ToastService.error({
        title: wasPending ? 'Reject failed' : 'Delete failed',
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
        title: 'User approved',
        description: 'They can sign in now.',
        duration: 3000,
        dedupeKey: `admin-user-approved:${id}`,
      })
    } catch {
      ToastService.error({
        title: 'Approve failed',
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
        title: 'Plan updated',
        duration: 2000,
        dedupeKey: `admin-plan-updated:${id}`,
      })
    } catch {
      ToastService.error({
        title: 'Could not update plan',
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
          You do not have access to the admin panel.
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
            {pendingDelete && !pendingDelete.approved ? 'Reject sign-up?' : 'Delete user?'}
          </AlertDialogHeader>
          <AlertDialogBody>
            {pendingDelete &&
              (!pendingDelete.approved ? (
                <Text>
                  Remove <strong>{pendingDelete.email}</strong> — they will not be able to sign in with
                  this registration.
                </Text>
              ) : (
                <Text>
                  Permanently delete <strong>{pendingDelete.name}</strong> ({pendingDelete.email})?
                  Their transactions and related data will be removed.
                </Text>
              ))}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} variant="ghost" mr={3} onClick={closeRemoveDialog}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={() => void confirmRemove()}>
              {pendingDelete && !pendingDelete.approved ? 'Reject' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Container maxW="container.xl">
        <Box mb={6}>
          <PageHeader
            icon={Shield}
            title="Admin"
            subtitle="Manage users, approvals and subscription access."
          />
        </Box>

        {loading ? (
          <HStack spacing={3} py={10} justify="center">
            <Spinner />
            <Text color={muted}>Loading users…</Text>
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
                  Pending approval ({pending.length})
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
                All users ({rows.length})
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

function formatJoined(iso: string) {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleString()
  } catch {
    return iso
  }
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
  const isSelf = (row: AdminUserRow) => row.id === currentUserId

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
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Joined</Th>
              <Th>Status</Th>
              <Th>Plan</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td fontWeight="600">{row.name}</Td>
                <Td fontSize="sm">{row.email}</Td>
                <Td fontSize="xs" whiteSpace="nowrap">
                  {formatJoined(row.createdAt)}
                </Td>
                <Td>
                  <HStack spacing={2} flexWrap="wrap">
                    {isSelf(row) && (
                      <Badge colorScheme="cyan">You</Badge>
                    )}
                    {!row.approved ? (
                      <Badge colorScheme="orange">Pending</Badge>
                    ) : (
                      <Badge colorScheme="green">Approved</Badge>
                    )}
                    {row.admin && <Badge colorScheme="purple">Admin</Badge>}
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
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
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
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          leftIcon={<Icon as={X} boxSize={3.5} />}
                          onClick={() => onRemove(row)}
                          isDisabled={isSelf(row)}
                        >
                          Reject
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
                        Delete
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
              {formatJoined(row.createdAt)}
            </Text>
            <HStack mt={2} spacing={2} flexWrap="wrap">
              {isSelf(row) && <Badge colorScheme="cyan">You</Badge>}
              {!row.approved ? (
                <Badge colorScheme="orange">Pending</Badge>
              ) : (
                <Badge colorScheme="green">Approved</Badge>
              )}
              {row.admin && <Badge colorScheme="purple">Admin</Badge>}
            </HStack>
            <Stack mt={3} spacing={2}>
              <Select
                size="sm"
                value={row.plan}
                onChange={(e) => onPlanChange(row.id, e.target.value as UserPlan)}
                isDisabled={row.admin}
              >
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
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
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    flex={1}
                    onClick={() => onRemove(row)}
                    isDisabled={isSelf(row)}
                  >
                    Reject
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
                  Delete account
                </Button>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </>
  )
}
