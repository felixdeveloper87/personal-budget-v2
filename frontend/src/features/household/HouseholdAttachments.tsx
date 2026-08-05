import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Center,
  HStack,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  deleteHouseholdAttachment,
  getHouseholdAttachmentBlob,
} from '../../api'
import { ReceiptText, Trash2, Upload, X } from '../../components/ui/icons'
import { useEd } from '../../editorial'
import { ToastService } from '../../services/toast'
import type {
  HouseholdAttachment,
  HouseholdPageState,
} from '../../types'

const MAX_FILES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp'

export function AttachmentPicker({
  files,
  onChange,
  existingCount = 0,
}: {
  files: File[]
  onChange: (files: File[]) => void
  existingCount?: number
}) {
  const ed = useEd()
  const inputRef = useRef<HTMLInputElement>(null)
  const mutedFallback = useColorModeValue('gray.600', 'gray.400')
  const muted = ed?.muted ?? mutedFallback
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([])

  useEffect(() => {
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }))
    setPreviews(next)
    return () => next.forEach((preview) => URL.revokeObjectURL(preview.url))
  }, [files])

  const chooseFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (selected.length === 0) return

    const valid = selected.filter((file) => {
      if (!ALLOWED_TYPES.has(file.type)) {
        ToastService.warning({
          title: 'Unsupported image',
          description: 'Use JPEG, PNG, or WebP.',
          dedupeKey: 'household-attachment-type',
        })
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        ToastService.warning({
          title: `${file.name} is too large`,
          description: 'Each image must be 5 MB or smaller.',
          dedupeKey: `household-attachment-size:${file.name}`,
        })
        return false
      }
      return true
    })

    const availableSlots = Math.max(0, MAX_FILES - existingCount - files.length)
    if (valid.length > availableSlots) {
      ToastService.warning({
        title: `Up to ${MAX_FILES} images per record`,
        description: `You can add ${availableSlots} more image${availableSlots === 1 ? '' : 's'}.`,
        dedupeKey: 'household-attachment-count',
      })
    }
    onChange([...files, ...valid.slice(0, availableSlots)])
  }

  const total = existingCount + files.length

  return (
    <Box>
      <HStack justify="space-between" align="center">
        <Box>
          <Text fontWeight={800} fontSize="sm">Proof images</Text>
          <Text color={muted} fontSize="xs">
            {total}/{MAX_FILES} · JPEG, PNG, or WebP · 5 MB each
          </Text>
        </Box>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Upload size={16} />}
          isDisabled={total >= MAX_FILES}
          onClick={() => inputRef.current?.click()}
        >
          Add photos
        </Button>
      </HStack>
      <Input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGES}
        multiple
        display="none"
        onChange={chooseFiles}
      />
      {previews.length > 0 && (
        <SimpleGrid columns={{ base: 3, sm: 5 }} spacing={2} mt={3}>
          {previews.map(({ file, url }, index) => (
            <AspectRatio key={`${file.name}-${file.lastModified}-${index}`} ratio={1}>
              <Box
                overflow="hidden"
                borderRadius="lg"
                border="1px solid"
                borderColor={ed?.line ?? 'blackAlpha.200'}
                position="relative"
              >
                <Image src={url} alt={file.name} w="full" h="full" objectFit="cover" />
                <IconButton
                  aria-label={`Remove ${file.name}`}
                  icon={<X size={14} />}
                  size="xs"
                  colorScheme="blackAlpha"
                  position="absolute"
                  top={1}
                  right={1}
                  borderRadius="full"
                  onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}
                />
              </Box>
            </AspectRatio>
          ))}
        </SimpleGrid>
      )}
    </Box>
  )
}

export function AttachmentGalleryModal({
  isOpen,
  onClose,
  householdId,
  title,
  attachments,
  canAttach,
  onUpload,
  onChanged,
}: {
  isOpen: boolean
  onClose: () => void
  householdId: number
  title: string
  attachments: HouseholdAttachment[]
  canAttach: boolean
  onUpload: (files: File[]) => Promise<HouseholdPageState>
  onChanged: (page: HouseholdPageState) => void
}) {
  const ed = useEd()
  const mutedFallback = useColorModeValue('gray.600', 'gray.400')
  const muted = ed?.muted ?? mutedFallback
  const [files, setFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({})
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const attachmentKey = useMemo(
    () => attachments.map((attachment) => `${attachment.id}:${attachment.status}`).join('|'),
    [attachments],
  )

  useEffect(() => {
    if (!isOpen) {
      setFiles([])
      return
    }
    let cancelled = false
    const createdUrls: string[] = []
    setImageUrls({})

    void Promise.all(
      attachments
        .filter((attachment) => attachment.status === 'AVAILABLE')
        .map(async (attachment) => {
          try {
            const blob = await getHouseholdAttachmentBlob(householdId, attachment.id)
            const url = URL.createObjectURL(blob)
            createdUrls.push(url)
            if (!cancelled) {
              setImageUrls((current) => ({ ...current, [attachment.id]: url }))
            }
          } catch {
            if (!cancelled) {
              setImageUrls((current) => ({ ...current, [attachment.id]: null }))
            }
          }
        }),
    )

    return () => {
      cancelled = true
      createdUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [attachmentKey, attachments, householdId, isOpen])

  const availableCount = attachments.filter(
    (attachment) => attachment.status === 'AVAILABLE',
  ).length

  const upload = async () => {
    if (files.length === 0) return
    setUploading(true)
    try {
      onChanged(await onUpload(files))
      setFiles([])
      ToastService.success({
        title: `${files.length} image${files.length === 1 ? '' : 's'} added`,
      })
    } catch (error) {
      ToastService.apiError(error, { title: 'Could not upload the images' })
    } finally {
      setUploading(false)
    }
  }

  const remove = async (attachment: HouseholdAttachment) => {
    if (!window.confirm(`Remove ${attachment.originalFilename}?`)) return
    setDeletingId(attachment.id)
    try {
      onChanged(await deleteHouseholdAttachment(householdId, attachment.id))
      ToastService.success({ title: 'Image removed' })
    } catch (error) {
      ToastService.apiError(error, { title: 'Could not remove the image' })
    } finally {
      setDeletingId(null)
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
        <ModalHeader>
          <Text fontSize="lg">Proof images</Text>
          <Text color={muted} fontSize="sm" fontWeight={500} noOfLines={1}>{title}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={5}>
            {attachments.length === 0 ? (
              <Center
                minH={32}
                flexDirection="column"
                border="1px dashed"
                borderColor={ed?.line ?? 'blackAlpha.300'}
                borderRadius="xl"
              >
                <ReceiptText size={26} color={muted} />
                <Text mt={2} fontWeight={800}>No proof images yet</Text>
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={3}>
                {attachments.map((attachment) => {
                  const url = imageUrls[attachment.id]
                  const expired = attachment.status === 'EXPIRED'
                  return (
                    <Box key={attachment.id}>
                      <AspectRatio ratio={1}>
                        <Box
                          overflow="hidden"
                          borderRadius="xl"
                          border="1px solid"
                          borderColor={ed?.line ?? 'blackAlpha.200'}
                          bg={ed?.panelRaised ?? 'blackAlpha.50'}
                          position="relative"
                        >
                          {expired ? (
                            <Center flexDirection="column" color={muted} textAlign="center" p={3}>
                              <ReceiptText size={24} />
                              <Badge mt={2}>Expired</Badge>
                            </Center>
                          ) : url === undefined ? (
                            <Spinner size="sm" />
                          ) : url === null ? (
                            <Center flexDirection="column" color={muted} textAlign="center" p={3}>
                              <ReceiptText size={22} />
                              <Text mt={1} fontSize="xs">Unavailable</Text>
                            </Center>
                          ) : (
                            <Image
                              as="a"
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              src={url}
                              alt={attachment.originalFilename}
                              w="full"
                              h="full"
                              objectFit="cover"
                              cursor="zoom-in"
                            />
                          )}
                          {attachment.canDelete && !expired && (
                            <IconButton
                              aria-label={`Remove ${attachment.originalFilename}`}
                              icon={<Trash2 size={14} />}
                              size="xs"
                              colorScheme="red"
                              variant="solid"
                              position="absolute"
                              top={2}
                              right={2}
                              borderRadius="full"
                              isLoading={deletingId === attachment.id}
                              onClick={() => void remove(attachment)}
                            />
                          )}
                        </Box>
                      </AspectRatio>
                      <Text mt={1} fontSize="xs" noOfLines={1}>
                        {attachment.originalFilename}
                      </Text>
                      <Text color={muted} fontSize="10px" noOfLines={1}>
                        Added by {attachment.uploadedByName}
                      </Text>
                    </Box>
                  )
                })}
              </SimpleGrid>
            )}

            {canAttach && availableCount < MAX_FILES && (
              <Box pt={4} borderTop="1px solid" borderColor={ed?.line ?? 'blackAlpha.100'}>
                <AttachmentPicker
                  files={files}
                  onChange={setFiles}
                  existingCount={availableCount}
                />
                {files.length > 0 && (
                  <Button
                    mt={3}
                    w={{ base: 'full', sm: 'auto' }}
                    colorScheme="teal"
                    leftIcon={<Upload size={16} />}
                    isLoading={uploading}
                    onClick={() => void upload()}
                  >
                    Upload {files.length} image{files.length === 1 ? '' : 's'}
                  </Button>
                )}
              </Box>
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Done</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
