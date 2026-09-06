import { useEffect, useState, type FormEvent } from 'react'
import { Box, Button, Divider, FormControl, FormLabel, Heading, HStack, Icon, IconButton, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader as ChakraModalHeader, ModalOverlay, Stack, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { inviteHouseholdMember, removeHouseholdMember, revokeHouseholdInvitation, updateHousehold, updateHouseholdMemberName } from '../../../api'
import { useEd } from '../../../editorial'
import { useI18n } from '../../../i18n'
import { ToastService } from '../../../services/toast'
import type { HouseholdDashboard, HouseholdPageState } from '../../../types'
import { Check, Pencil, Trash2, X } from '../../../components/ui/icons'
import { ModalHeader as AppModalHeader } from '../../../components/ui'

export function MembersModal({
  isOpen,
  onClose,
  household,
  onChanged,
}: {
  isOpen: boolean
  onClose: () => void
  household: HouseholdDashboard
  onChanged: (page: HouseholdPageState) => void
}) {
  const ed = useEd()
  const { t } = useI18n()
  const mutedFallback = useColorModeValue('gray.600', 'gray.400')
  const muted = ed?.muted ?? mutedFallback
  const [name, setName] = useState(household.name)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [memberName, setMemberName] = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(household.name)
      setEditingMemberId(null)
      setMemberName('')
    }
  }, [household.name, isOpen])

  const act = async (
    key: string,
    action: () => Promise<HouseholdPageState>,
    success?: string,
  ) => {
    setBusy(key)
    try {
      onChanged(await action())
      if (success) ToastService.success({ title: success })
      return true
    } catch (error) {
      ToastService.apiError(error, { title: t('household.manage.updateFailed') })
      return false
    } finally {
      setBusy(null)
    }
  }

  const invite = async (event: FormEvent) => {
    event.preventDefault()
    const saved = await act(
      'invite',
      () => inviteHouseholdMember(household.id, email),
      t('household.manage.invitedToast'),
    )
    if (saved) setEmail('')
  }

  const renameMember = async (event: FormEvent, memberId: number) => {
    event.preventDefault()
    const normalizedName = memberName.trim()
    if (!normalizedName) return
    const saved = await act(
      `rename-member-${memberId}`,
      () => updateHouseholdMemberName(household.id, memberId, normalizedName),
      t('household.manage.memberRenamedToast'),
    )
    if (saved) {
      setEditingMemberId(null)
      setMemberName('')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent
        bg={ed?.modal}
        color={ed?.cream}
        borderColor={ed?.lineStrong}
        borderWidth={ed ? '1px' : 0}
        maxW={{ base: '100vw', md: 'xl' }}
        minH={{ base: '100dvh', md: 'auto' }}
        maxH={{ base: '100dvh', md: 'calc(100vh - 7.5rem)' }}
        my={{ base: 0, md: 16 }}
        borderRadius={{ base: 0, md: 'md' }}
      >
        <ChakraModalHeader p={0}>
          <AppModalHeader
            title={t('household.manage.title')}
            caption={household.name}
            onClose={onClose}
          />
        </ChakraModalHeader>
        <ModalBody>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading size="sm" mb={3}>{t('household.manage.details')}</Heading>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={{ base: 'stretch', sm: 'flex-end' }}
              >
                <FormControl>
                  <FormLabel>{t('household.manage.name')}</FormLabel>
                  <Input value={name} maxLength={120} onChange={(event) => setName(event.target.value)} />
                </FormControl>
                <Button
                  isLoading={busy === 'rename'}
                  onClick={() => void act(
                    'rename',
                    () => updateHousehold(household.id, name),
                    t('household.manage.renamedToast'),
                  )}
                >
                  {t('household.common.save')}
                </Button>
              </Stack>
            </Box>

            <Divider borderColor={ed?.line} />

            <Box>
              <Heading size="sm" mb={1}>{t('household.manage.inviteTitle')}</Heading>
              <Text color={muted} fontSize="sm" mb={3}>
                {t('household.manage.inviteHint')}
              </Text>
              <Stack
                as="form"
                direction={{ base: 'column', sm: 'row' }}
                align={{ base: 'stretch', sm: 'flex-end' }}
                onSubmit={(event) => void invite(event)}
              >
                <FormControl isRequired>
                  <FormLabel>{t('household.manage.email')}</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t('household.manage.emailPlaceholder')}
                  />
                </FormControl>
                <Button type="submit" colorScheme="teal" isLoading={busy === 'invite'}>
                  {t('household.manage.invite')}
                </Button>
              </Stack>
            </Box>

            {household.pendingMemberInvitations.length > 0 && (
              <Box>
                <Heading size="xs" mb={3}>{t('household.manage.pendingInvitations')}</Heading>
                <VStack align="stretch" spacing={2}>
                  {household.pendingMemberInvitations.map((invitation) => (
                    <HStack
                      key={invitation.id}
                      justify="space-between"
                      p={3}
                      borderRadius="lg"
                      bg={ed?.panelRaised ?? 'blackAlpha.50'}
                    >
                      <Box minW={0}>
                        <Text fontWeight={800} noOfLines={1}>{invitation.targetName}</Text>
                        <Text color={muted} fontSize="xs" noOfLines={1}>{invitation.targetEmail}</Text>
                      </Box>
                      <IconButton
                        aria-label={t('household.manage.revokeAria', {
                          name: invitation.targetName,
                        })}
                        icon={<Icon as={X} boxSize={4} />}
                        size="sm"
                        variant="ghost"
                        isLoading={busy === `revoke-${invitation.id}`}
                        onClick={() => void act(
                          `revoke-${invitation.id}`,
                          () => revokeHouseholdInvitation(household.id, invitation.id),
                        )}
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}

            <Divider borderColor={ed?.line} />

            <Box>
              <Heading size="sm" mb={3}>{t('household.manage.activeMembers')}</Heading>
              <VStack align="stretch" spacing={2}>
                {household.members.map((member) => {
                  const isEditing = editingMemberId === member.id
                  return (
                    <Box
                      key={member.id}
                      p={3}
                      borderRadius="lg"
                      bg={ed?.panelRaised ?? 'blackAlpha.50'}
                    >
                      {isEditing ? (
                        <Stack
                          as="form"
                          direction={{ base: 'column', sm: 'row' }}
                          align={{ base: 'stretch', sm: 'flex-end' }}
                          spacing={2}
                          onSubmit={(event) => void renameMember(event, member.id)}
                        >
                          <FormControl isRequired flex={1}>
                            <FormLabel fontSize="xs">
                              {t('household.manage.memberNameLabel')}
                            </FormLabel>
                            <Input
                              autoFocus
                              value={memberName}
                              maxLength={120}
                              onChange={(event) => setMemberName(event.target.value)}
                              placeholder={t('household.manage.memberNamePlaceholder')}
                            />
                          </FormControl>
                          <HStack justify={{ base: 'flex-end', sm: 'initial' }}>
                            <IconButton
                              type="button"
                              aria-label={t('household.manage.cancelMemberNameAria')}
                              icon={<Icon as={X} boxSize={4} />}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingMemberId(null)
                                setMemberName('')
                              }}
                            />
                            <Button
                              type="submit"
                              size="sm"
                              colorScheme="teal"
                              leftIcon={<Icon as={Check} boxSize={4} />}
                              isLoading={busy === `rename-member-${member.id}`}
                              isDisabled={!memberName.trim()}
                            >
                              {t('household.common.save')}
                            </Button>
                          </HStack>
                        </Stack>
                      ) : (
                        <HStack justify="space-between" spacing={3}>
                          <Box minW={0}>
                            <Text fontWeight={800} noOfLines={1}>{member.name}</Text>
                            <Text color={muted} fontSize="xs" noOfLines={1}>{member.email}</Text>
                          </Box>
                          <HStack spacing={1} flexShrink={0}>
                            <IconButton
                              aria-label={t('household.manage.editNameAria', {
                                name: member.name,
                              })}
                              icon={<Icon as={Pencil} boxSize={4} />}
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingMemberId(member.id)
                                setMemberName(member.name)
                              }}
                            />
                            {member.role !== 'OWNER' && (
                              <IconButton
                                aria-label={t('household.manage.removeAria', { name: member.name })}
                                icon={<Icon as={Trash2} boxSize={4} />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                isLoading={busy === `remove-${member.id}`}
                                onClick={() => {
                                  if (!window.confirm(t('household.manage.removeConfirm', {
                                    name: member.name,
                                  }))) return
                                  void act(
                                    `remove-${member.id}`,
                                    () => removeHouseholdMember(household.id, member.id),
                                    t('household.manage.removedToast'),
                                  )
                                }}
                              />
                            )}
                          </HStack>
                        </HStack>
                      )}
                    </Box>
                  )
                })}
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>{t('household.common.done')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
