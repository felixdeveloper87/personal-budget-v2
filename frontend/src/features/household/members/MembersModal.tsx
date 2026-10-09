import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Box, Button, Flex, HStack, Icon, IconButton, Input, Modal, ModalBody, ModalContent, ModalHeader as ChakraModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { inviteHouseholdMember, removeHouseholdMember, revokeHouseholdInvitation, updateHousehold, updateHouseholdMemberName } from '../../../api'
import { useI18n } from '../../../i18n'
import { ToastService } from '../../../services/toast'
import type { HouseholdDashboard, HouseholdPageState } from '../../../types'
import { Check, Pencil, Trash2, X } from '../../../components/ui/icons'
import NuModalHeader from '../../../components/ui/NuModalHeader'
import { MOBILE_MEDIA, SHEET_SX, sheetContainerProps, sheetGrabberProps } from '../../../components/ui/modalLayout'

const BRAND = '#820ad1'
const BRAND_HOVER = '#6e08b3'
const BRAND_TINT = '#f3e8fc'

// The default sheet is a fixed 80dvh; this one hugs its content instead.
const FIT_SHEET_SX = {
  ...SHEET_SX,
  [MOBILE_MEDIA]: {
    ...(SHEET_SX?.[MOBILE_MEDIA] as Record<string, unknown>),
    height: 'auto !important',
    maxHeight: '88dvh !important',
  },
}

const brandButton = {
  bg: BRAND,
  color: 'white',
  borderRadius: 'full',
  fontWeight: 700,
  _hover: { bg: BRAND_HOVER },
  _active: { bg: BRAND_HOVER },
} as const

const nuInput = {
  h: '44px',
  borderRadius: '12px',
  bg: 'var(--pb-surface-2, #f5f5f7)',
  border: '1px solid transparent',
  color: 'var(--pb-ink)',
  _hover: { borderColor: 'var(--pb-hair-2, #e4e4e8)' },
  _focusVisible: { bg: 'white', borderColor: BRAND, boxShadow: `0 0 0 1px ${BRAND}` },
} as const

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
  const { t } = useI18n()
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
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
      <ModalContent
        className="nu-dashboard"
        bg="var(--nu-page, #ffffff)"
        color="var(--pb-ink)"
        w={{ md: 'min(520px, calc(100vw - 32px))' }}
        maxW={{ md: '520px' }}
        maxH={{ md: 'calc(100vh - 7.5rem)' }}
        my={{ md: 16 }}
        borderRadius={{ md: '28px' }}
        overflow="hidden"
        boxShadow="0 24px 64px -24px rgba(31,31,36,0.35)"
        containerProps={sheetContainerProps}
        sx={FIT_SHEET_SX}
      >
        <Box {...sheetGrabberProps} zIndex={2} bg="rgba(255,255,255,0.5)" />
        <ChakraModalHeader p={0}>
          <NuModalHeader
            title={t('household.manage.title')}
            caption={household.name}
            onClose={onClose}
          />
        </ChakraModalHeader>
        <ModalBody p={0} pb="max(1rem, env(safe-area-inset-bottom, 0px))">
          <Section title={t('household.manage.details')}>
            <HStack spacing={2}>
              <Input
                {...nuInput}
                aria-label={t('household.manage.name')}
                placeholder={t('household.manage.name')}
                value={name}
                maxLength={120}
                onChange={(event) => setName(event.target.value)}
              />
              <Button
                {...brandButton}
                h="44px"
                px={5}
                flexShrink={0}
                isLoading={busy === 'rename'}
                isDisabled={!name.trim() || name.trim() === household.name}
                onClick={() => void act(
                  'rename',
                  () => updateHousehold(household.id, name),
                  t('household.manage.renamedToast'),
                )}
              >
                {t('household.common.save')}
              </Button>
            </HStack>
          </Section>

          <Section title={t('household.manage.inviteTitle')} hint={t('household.manage.inviteHint')}>
            <HStack as="form" spacing={2} onSubmit={(event: FormEvent) => void invite(event)}>
              <Input
                {...nuInput}
                type="email"
                isRequired
                aria-label={t('household.manage.email')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('household.manage.emailPlaceholder')}
              />
              <Button type="submit" {...brandButton} h="44px" px={5} flexShrink={0} isLoading={busy === 'invite'}>
                {t('household.manage.invite')}
              </Button>
            </HStack>
          </Section>

          {household.pendingMemberInvitations.length > 0 && (
            <Section title={t('household.manage.pendingInvitations')} flush>
              {household.pendingMemberInvitations.map((invitation) => (
                <PersonRow key={invitation.id} name={invitation.targetName} detail={invitation.targetEmail} pending>
                  <IconButton
                    aria-label={t('household.manage.revokeAria', { name: invitation.targetName })}
                    icon={<Icon as={X} boxSize={4} />}
                    size="sm"
                    variant="ghost"
                    borderRadius="full"
                    color="var(--pb-ink-soft)"
                    isLoading={busy === `revoke-${invitation.id}`}
                    onClick={() => void act(
                      `revoke-${invitation.id}`,
                      () => revokeHouseholdInvitation(household.id, invitation.id),
                    )}
                  />
                </PersonRow>
              ))}
            </Section>
          )}

          <Section title={t('household.manage.activeMembers')} flush>
            {household.members.map((member) => editingMemberId === member.id ? (
              <HStack
                key={member.id}
                as="form"
                spacing={2}
                px={{ base: 4, md: 6 }}
                py={2.5}
                onSubmit={(event: FormEvent) => void renameMember(event, member.id)}
              >
                <Input
                  {...nuInput}
                  autoFocus
                  isRequired
                  aria-label={t('household.manage.memberNameLabel')}
                  value={memberName}
                  maxLength={120}
                  onChange={(event) => setMemberName(event.target.value)}
                  placeholder={t('household.manage.memberNamePlaceholder')}
                />
                <IconButton
                  type="button"
                  aria-label={t('household.manage.cancelMemberNameAria')}
                  icon={<Icon as={X} boxSize={4} />}
                  variant="ghost"
                  borderRadius="full"
                  color="var(--pb-ink-soft)"
                  flexShrink={0}
                  onClick={() => {
                    setEditingMemberId(null)
                    setMemberName('')
                  }}
                />
                <IconButton
                  type="submit"
                  aria-label={t('household.common.save')}
                  icon={<Icon as={Check} boxSize={4} />}
                  {...brandButton}
                  flexShrink={0}
                  isLoading={busy === `rename-member-${member.id}`}
                  isDisabled={!memberName.trim()}
                />
              </HStack>
            ) : (
              <PersonRow key={member.id} name={member.name} detail={member.email}>
                <IconButton
                  aria-label={t('household.manage.editNameAria', { name: member.name })}
                  icon={<Icon as={Pencil} boxSize={4} />}
                  size="sm"
                  variant="ghost"
                  borderRadius="full"
                  color="var(--pb-ink-soft)"
                  _hover={{ bg: BRAND_TINT, color: BRAND }}
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
                    borderRadius="full"
                    color="var(--pb-coral, #e5484d)"
                    _hover={{ bg: 'rgba(229, 72, 77, 0.08)' }}
                    isLoading={busy === `remove-${member.id}`}
                    onClick={() => {
                      if (!window.confirm(t('household.manage.removeConfirm', { name: member.name }))) return
                      void act(
                        `remove-${member.id}`,
                        () => removeHouseholdMember(household.id, member.id),
                        t('household.manage.removedToast'),
                      )
                    }}
                  />
                )}
              </PersonRow>
            ))}
          </Section>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

/** Flat section on the white sheet — small label, optional hint, content below. */
function Section({
  title,
  hint,
  flush = false,
  children,
}: {
  title: string
  hint?: string
  flush?: boolean
  children: ReactNode
}) {
  return (
    <Box pt={4} pb={flush ? 1 : 4} borderBottom="1px solid var(--pb-hair)" _last={{ borderBottom: 'none' }}>
      <Box px={{ base: 4, md: 6 }} mb={flush ? 1 : 2.5}>
        <Text fontSize="sm" fontWeight={700} color="var(--pb-ink)">{title}</Text>
        {hint && <Text mt={0.5} fontSize="xs" color="var(--pb-ink-soft)">{hint}</Text>}
      </Box>
      {flush ? (
        <VStack align="stretch" spacing={0}>{children}</VStack>
      ) : (
        <Box px={{ base: 4, md: 6 }}>{children}</Box>
      )}
    </Box>
  )
}

/** Initials avatar · name · email · trailing actions. */
function PersonRow({
  name,
  detail,
  pending = false,
  children,
}: {
  name: string
  detail: string
  pending?: boolean
  children: ReactNode
}) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('')
  return (
    <Flex px={{ base: 4, md: 6 }} py={2.5} align="center" gap={3}>
      <Flex
        w="38px"
        h="38px"
        flexShrink={0}
        align="center"
        justify="center"
        borderRadius="full"
        bg={pending ? 'var(--pb-surface-2, #f5f5f7)' : BRAND_TINT}
        color={pending ? 'var(--pb-ink-soft)' : BRAND}
        border={pending ? '1px dashed var(--pb-hair-2, #d4d4da)' : undefined}
        fontSize="13px"
        fontWeight={800}
      >
        {initials || '?'}
      </Flex>
      <Box minW={0} flex={1}>
        <Text fontSize="sm" fontWeight={600} color="var(--pb-ink)" noOfLines={1}>{name}</Text>
        <Text fontSize="xs" color="var(--pb-ink-soft)" noOfLines={1}>{detail}</Text>
      </Box>
      <HStack spacing={0.5} flexShrink={0}>{children}</HStack>
    </Flex>
  )
}
