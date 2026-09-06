import {
  ChangeEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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
  ModalContent,
  ModalFooter,
  ModalHeader as ChakraModalHeader,
  ModalOverlay,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  usePrefersReducedMotion,
} from '@chakra-ui/react'
import {
  deleteHouseholdAttachment,
  getHouseholdAttachmentBlob,
} from '../../api'
import {
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  Trash2,
  Upload,
  X,
} from '../../components/ui/icons'
import { ModalHeader as AppModalHeader } from '../../components/ui'
import { useEd } from '../../editorial'
import { useI18n } from '../../i18n'
import { ToastService } from '../../services/toast'
import type {
  HouseholdAttachment,
  HouseholdPageState,
} from '../../types'

const MAX_FILES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp'

type ViewableAttachment = {
  attachment: HouseholdAttachment
  url: string
}

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
  const { formatNumber, t } = useI18n()
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
          title: t('household.attachments.unsupported'),
          description: t('household.attachments.useFormats'),
          dedupeKey: 'household-attachment-type',
        })
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        ToastService.warning({
          title: t('household.attachments.tooLarge', { filename: file.name }),
          description: t('household.attachments.maxSize'),
          dedupeKey: `household-attachment-size:${file.name}`,
        })
        return false
      }
      return true
    })

    const availableSlots = Math.max(0, MAX_FILES - existingCount - files.length)
    if (valid.length > availableSlots) {
      ToastService.warning({
        title: t('household.attachments.limit', { maximum: formatNumber(MAX_FILES) }),
        description: t(
          availableSlots === 1
            ? 'household.attachments.slots.one'
            : 'household.attachments.slots.other',
          { count: formatNumber(availableSlots) },
        ),
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
          <Text fontWeight={800} fontSize="sm">{t('household.attachments.title')}</Text>
          <Text color={muted} fontSize="xs">
            {t('household.attachments.formats', {
              current: formatNumber(total),
              maximum: formatNumber(MAX_FILES),
            })}
          </Text>
        </Box>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Upload size={16} />}
          isDisabled={total >= MAX_FILES}
          onClick={() => inputRef.current?.click()}
        >
          {t('household.attachments.addPhotos')}
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
                  aria-label={t('household.attachments.removeAria', { filename: file.name })}
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

function AttachmentLightbox({
  isOpen,
  onClose,
  images,
  selectedId,
  onSelect,
}: {
  isOpen: boolean
  onClose: () => void
  images: ViewableAttachment[]
  selectedId: number | null
  onSelect: (attachmentId: number) => void
}) {
  const { formatNumber, t } = useI18n()
  const prefersReducedMotion = usePrefersReducedMotion()
  const dragStartRef = useRef<{
    pointerId: number
    startX: number
    startY: number
    startedAt: number
    axis: 'horizontal' | 'vertical' | null
  } | null>(null)
  const dismissTimerRef = useRef<number | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)

  const selectedIndex = Math.max(
    0,
    images.findIndex(({ attachment }) => attachment.id === selectedId),
  )
  const selectedImage = images[selectedIndex]
  const hasCarousel = images.length > 1

  const selectRelative = (distance: number) => {
    if (!hasCarousel) return
    const nextIndex = (selectedIndex + distance + images.length) % images.length
    onSelect(images[nextIndex].attachment.id)
  }

  useEffect(() => {
    if (!isOpen) {
      setDragOffset({ x: 0, y: 0 })
      setIsDragging(false)
      setIsDismissing(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && hasCarousel) {
        event.preventDefault()
        selectRelative(-1)
      } else if (event.key === 'ArrowRight' && hasCarousel) {
        event.preventDefault()
        selectRelative(1)
      } else if (event.key === 'Home' && hasCarousel) {
        event.preventDefault()
        onSelect(images[0].attachment.id)
      } else if (event.key === 'End' && hasCarousel) {
        event.preventDefault()
        onSelect(images[images.length - 1].attachment.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasCarousel, images, isOpen, selectedIndex])

  useEffect(() => () => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current)
    }
  }, [])

  const dismissWithSlide = () => {
    if (prefersReducedMotion) {
      onClose()
      return
    }

    setIsDismissing(true)
    setDragOffset({ x: 0, y: window.innerHeight })
    dismissTimerRef.current = window.setTimeout(() => {
      dismissTimerRef.current = null
      setIsDismissing(false)
      setDragOffset({ x: 0, y: 0 })
      onClose()
    }, 180)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType === 'mouse'
      || (event.target as HTMLElement).closest('button')
      || isDismissing
    ) {
      return
    }

    dragStartRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startedAt: performance.now(),
      axis: null,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current
    if (!dragStart || dragStart.pointerId !== event.pointerId) return

    const deltaX = event.clientX - dragStart.startX
    const deltaY = event.clientY - dragStart.startY
    if (
      dragStart.axis === null
      && Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= 8
    ) {
      dragStart.axis = Math.abs(deltaY) > Math.abs(deltaX)
        ? 'vertical'
        : 'horizontal'
    }

    if (dragStart.axis === 'vertical') {
      setDragOffset({ x: 0, y: Math.max(0, deltaY) })
    } else if (dragStart.axis === 'horizontal' && hasCarousel) {
      setDragOffset({ x: deltaX, y: 0 })
    }
  }

  const finishPointerGesture = (
    event: ReactPointerEvent<HTMLDivElement>,
    cancelled = false,
  ) => {
    const dragStart = dragStartRef.current
    if (!dragStart || dragStart.pointerId !== event.pointerId) return

    dragStartRef.current = null
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const elapsed = Math.max(1, performance.now() - dragStart.startedAt)
    const downwardVelocity = dragOffset.y / elapsed
    if (
      !cancelled
      && dragStart.axis === 'vertical'
      && (dragOffset.y >= 96 || (dragOffset.y >= 42 && downwardVelocity >= 0.55))
    ) {
      dismissWithSlide()
      return
    }

    if (
      !cancelled
      && dragStart.axis === 'horizontal'
      && hasCarousel
      && Math.abs(dragOffset.x) >= 56
    ) {
      selectRelative(dragOffset.x < 0 ? 1 : -1)
    }
    setDragOffset({ x: 0, y: 0 })
  }

  const viewportHeight = typeof window === 'undefined' ? 1 : window.innerHeight
  const backdropOpacity = Math.max(0.28, 0.94 - (dragOffset.y / viewportHeight) * 0.72)
  const transition = isDragging
    ? 'none'
    : 'transform 180ms ease-out, opacity 180ms ease-out'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      isCentered
      motionPreset="scale"
      closeOnOverlayClick={!isDragging && !isDismissing}
    >
      <ModalOverlay
        bg={`rgba(0, 0, 0, ${backdropOpacity})`}
        backdropFilter="blur(12px)"
      />
      <ModalContent
        bg="transparent"
        color="white"
        w={{ base: '100vw', lg: 'calc(100vw - 3rem)' }}
        h={{ base: '100dvh', lg: 'calc(100dvh - 3rem)' }}
        maxW="100vw"
        maxH="100dvh"
        m={{ base: 0, lg: 6 }}
        borderRadius={{ base: 0, lg: '2xl' }}
        overflow="hidden"
        boxShadow={{ base: 'none', lg: '2xl' }}
      >
        <Box
          position="relative"
          w="full"
          h="full"
          overflow="hidden"
          bg="rgba(5, 7, 10, 0.96)"
          borderRadius="inherit"
          transform={`translate3d(0, ${dragOffset.y}px, 0)`}
          opacity={Math.max(0.35, 1 - dragOffset.y / viewportHeight)}
          transition={transition}
        >
          <Box
            position="absolute"
            top="calc(env(safe-area-inset-top, 0px) + 12px)"
            left="50%"
            zIndex={3}
            transform="translateX(-50%)"
            textAlign="center"
            pointerEvents="none"
          >
            <Box
              display={{ base: 'block', xl: 'none' }}
              w={10}
              h={1}
              mx="auto"
              mb={2}
              borderRadius="full"
              bg="whiteAlpha.700"
            />
            {hasCarousel && (
              <Text
                display="inline-block"
                px={3}
                py={1}
                borderRadius="full"
                bg="blackAlpha.600"
                fontSize="sm"
                fontWeight={800}
              >
                {formatNumber(selectedIndex + 1)} / {formatNumber(images.length)}
              </Text>
            )}
          </Box>

          <IconButton
            aria-label={t('household.attachments.closeViewer')}
            icon={<X size={24} weight="bold" />}
            position="absolute"
            top="calc(env(safe-area-inset-top, 0px) + 12px)"
            right="calc(env(safe-area-inset-right, 0px) + 12px)"
            zIndex={4}
            size="lg"
            minW={12}
            minH={12}
            borderRadius="full"
            color="white"
            bg="blackAlpha.700"
            border="1px solid"
            borderColor="whiteAlpha.400"
            boxShadow="lg"
            onClick={onClose}
            _hover={{ bg: 'blackAlpha.900', transform: 'scale(1.04)' }}
            _focusVisible={{ boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.7)' }}
          />

          <Center
            w="full"
            h="full"
            px={{ base: 3, sm: 14, lg: 24 }}
            pt={{ base: 20, lg: 16 }}
            pb={{ base: hasCarousel ? 32 : 20, lg: hasCarousel ? 36 : 20 }}
            cursor={{ base: 'grab', lg: 'default' }}
            userSelect="none"
            sx={{ touchAction: 'none' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointerGesture}
            onPointerCancel={(event) => finishPointerGesture(event, true)}
          >
            {selectedImage && (
              <Image
                src={selectedImage.url}
                alt={selectedImage.attachment.originalFilename}
                draggable={false}
                maxW="full"
                maxH="full"
                objectFit="contain"
                borderRadius={{ base: 'md', lg: 'lg' }}
                boxShadow="0 18px 70px rgba(0, 0, 0, 0.45)"
                transform={`translate3d(${dragOffset.x}px, 0, 0)`}
                opacity={Math.max(0.45, 1 - Math.abs(dragOffset.x) / Math.max(1, viewportHeight))}
                transition={transition}
              />
            )}
          </Center>

          {hasCarousel && (
            <>
              <IconButton
                aria-label={t('household.attachments.previous')}
                icon={<ChevronLeft size={28} weight="bold" />}
                position="absolute"
                left={{ base: 2, sm: 4, lg: 6 }}
                top="50%"
                zIndex={3}
                transform="translateY(-50%)"
                size="lg"
                minW={12}
                minH={12}
                borderRadius="full"
                color="white"
                bg="blackAlpha.600"
                border="1px solid"
                borderColor="whiteAlpha.300"
                onClick={() => selectRelative(-1)}
                _hover={{ bg: 'blackAlpha.800' }}
                _focusVisible={{ boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.7)' }}
              />
              <IconButton
                aria-label={t('household.attachments.next')}
                icon={<ChevronRight size={28} weight="bold" />}
                position="absolute"
                right={{ base: 2, sm: 4, lg: 6 }}
                top="50%"
                zIndex={3}
                transform="translateY(-50%)"
                size="lg"
                minW={12}
                minH={12}
                borderRadius="full"
                color="white"
                bg="blackAlpha.600"
                border="1px solid"
                borderColor="whiteAlpha.300"
                onClick={() => selectRelative(1)}
                _hover={{ bg: 'blackAlpha.800' }}
                _focusVisible={{ boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.7)' }}
              />
            </>
          )}

          {selectedImage && (
            <Box
              position="absolute"
              left={0}
              right={0}
              bottom="calc(env(safe-area-inset-bottom, 0px) + 12px)"
              zIndex={3}
              px={4}
              textAlign="center"
              pointerEvents="none"
            >
              <Text
                maxW="min(80vw, 42rem)"
                mx="auto"
                mb={hasCarousel ? 3 : 0}
                fontSize="sm"
                fontWeight={700}
                noOfLines={1}
                textShadow="0 1px 8px rgba(0, 0, 0, 0.9)"
              >
                {selectedImage.attachment.originalFilename}
              </Text>
              {hasCarousel && (
                <HStack
                  justify="center"
                  spacing={2}
                  overflowX="auto"
                  pointerEvents="auto"
                  sx={{
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  {images.map(({ attachment, url }, index) => {
                    const isSelected = index === selectedIndex
                    return (
                      <Box
                        as="button"
                        type="button"
                        key={attachment.id}
                        flex="0 0 auto"
                        w={{ base: 12, sm: 14 }}
                        h={{ base: 12, sm: 14 }}
                        p={0}
                        overflow="hidden"
                        borderRadius="lg"
                        border="2px solid"
                        borderColor={isSelected ? 'white' : 'whiteAlpha.400'}
                        opacity={isSelected ? 1 : 0.62}
                        boxShadow={isSelected ? '0 0 0 2px rgba(0, 0, 0, 0.75)' : 'none'}
                        aria-label={t('household.attachments.viewAria', {
                          index: formatNumber(index + 1),
                          filename: attachment.originalFilename,
                        })}
                        aria-current={isSelected ? 'true' : undefined}
                        onClick={() => onSelect(attachment.id)}
                        _hover={{ opacity: 1 }}
                        _focusVisible={{ boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.7)' }}
                      >
                        <Image
                          src={url}
                          alt=""
                          w="full"
                          h="full"
                          objectFit="cover"
                          pointerEvents="none"
                        />
                      </Box>
                    )
                  })}
                </HStack>
              )}
            </Box>
          )}
        </Box>
      </ModalContent>
    </Modal>
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
  const { formatNumber, t } = useI18n()
  const mutedFallback = useColorModeValue('gray.600', 'gray.400')
  const muted = ed?.muted ?? mutedFallback
  const [files, setFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<Record<number, string | null>>({})
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null)
  const attachmentKey = useMemo(
    () => attachments.map((attachment) => `${attachment.id}:${attachment.status}`).join('|'),
    [attachments],
  )
  const viewableImages = useMemo(
    () => attachments.flatMap((attachment) => {
      const url = imageUrls[attachment.id]
      return attachment.status === 'AVAILABLE' && typeof url === 'string'
        ? [{ attachment, url }]
        : []
    }),
    [attachments, imageUrls],
  )

  useEffect(() => {
    if (!isOpen) {
      setFiles([])
      setSelectedImageId(null)
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

  useEffect(() => {
    if (
      selectedImageId !== null
      && !viewableImages.some(({ attachment }) => attachment.id === selectedImageId)
    ) {
      setSelectedImageId(null)
    }
  }, [selectedImageId, viewableImages])

  const availableCount = attachments.filter(
    (attachment) => attachment.status === 'AVAILABLE',
  ).length

  const closeGallery = () => {
    setSelectedImageId(null)
    onClose()
  }

  const upload = async () => {
    if (files.length === 0) return
    setUploading(true)
    try {
      onChanged(await onUpload(files))
      setFiles([])
      ToastService.success({
        title: t(
          files.length === 1
            ? 'household.attachments.added.one'
            : 'household.attachments.added.other',
          { count: formatNumber(files.length) },
        ),
      })
    } catch (error) {
      ToastService.apiError(error, { title: t('household.attachments.uploadFailed') })
    } finally {
      setUploading(false)
    }
  }

  const remove = async (attachment: HouseholdAttachment) => {
    if (!window.confirm(t('household.attachments.removeConfirm', {
      filename: attachment.originalFilename,
    }))) return
    setDeletingId(attachment.id)
    try {
      onChanged(await deleteHouseholdAttachment(householdId, attachment.id))
      ToastService.success({ title: t('household.attachments.removed') })
    } catch (error) {
      ToastService.apiError(error, { title: t('household.attachments.removeFailed') })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={closeGallery} size="xl" scrollBehavior="inside">
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
              title={t('household.attachments.title')}
              caption={title}
              onClose={closeGallery}
            />
          </ChakraModalHeader>
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
                  <Text mt={2} fontWeight={800}>{t('household.attachments.empty')}</Text>
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
                                <Badge mt={2}>{t('household.attachments.expired')}</Badge>
                              </Center>
                            ) : url === undefined ? (
                              <Spinner size="sm" />
                            ) : url === null ? (
                              <Center flexDirection="column" color={muted} textAlign="center" p={3}>
                                <ReceiptText size={22} />
                                <Text mt={1} fontSize="xs">{t('household.attachments.unavailable')}</Text>
                              </Center>
                            ) : (
                              <Box
                                as="button"
                                type="button"
                                display="block"
                                w="full"
                                h="full"
                                p={0}
                                cursor="zoom-in"
                                aria-label={t('household.attachments.openAria', {
                                  filename: attachment.originalFilename,
                                })}
                                aria-haspopup="dialog"
                                onClick={() => setSelectedImageId(attachment.id)}
                                _focusVisible={{
                                  outline: '3px solid',
                                  outlineColor: 'teal.300',
                                  outlineOffset: '-3px',
                                }}
                              >
                                <Image
                                  src={url}
                                  alt={attachment.originalFilename}
                                  w="full"
                                  h="full"
                                  objectFit="cover"
                                  pointerEvents="none"
                                />
                              </Box>
                            )}
                            {attachment.canDelete && !expired && (
                              <IconButton
                                aria-label={t('household.attachments.removeAria', {
                                  filename: attachment.originalFilename,
                                })}
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
                          {t('household.attachments.addedBy', { name: attachment.uploadedByName })}
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
                      {t(
                        files.length === 1
                          ? 'household.attachments.upload.one'
                          : 'household.attachments.upload.other',
                        { count: formatNumber(files.length) },
                      )}
                    </Button>
                  )}
                </Box>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeGallery}>{t('household.common.done')}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AttachmentLightbox
        isOpen={selectedImageId !== null}
        onClose={() => setSelectedImageId(null)}
        images={viewableImages}
        selectedId={selectedImageId}
        onSelect={setSelectedImageId}
      />
    </>
  )
}
