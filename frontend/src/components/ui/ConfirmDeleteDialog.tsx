import React, { useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Code,
  FormControl,
  Input,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { AlertTriangle } from './icons'

export interface ConfirmDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  /** Heading, e.g. "Delete card". */
  title: string
  /** What is being deleted, shown in the body (e.g. the card name). */
  itemName?: string
  /** Extra context shown above the confirmation input. */
  description?: string
  /** Word the user must type to enable the destructive action. Defaults to "DELETE". */
  confirmWord?: string
  isLoading?: boolean
}

/**
 * Destructive confirmation dialog that requires the user to type (or paste) a
 * specific word before the delete button is enabled. Prevents accidental,
 * one-click destruction of important records.
 */
export default function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  description,
  confirmWord = 'DELETE',
  isLoading = false,
}: ConfirmDeleteDialogProps) {
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const [typed, setTyped] = useState('')

  // Reset the typed value whenever the dialog opens.
  useEffect(() => {
    if (isOpen) setTyped('')
  }, [isOpen])

  const surfaceBg = useColorModeValue('#ffffff', '#0a0a0a')
  const previewBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const previewBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const captionColor = useColorModeValue('gray.500', 'gray.400')
  const warningChipBg = useColorModeValue('red.50', 'rgba(239,68,68,0.14)')
  const warningChipFg = useColorModeValue('red.600', 'red.300')

  const confirmed = typed.trim() === confirmWord

  const handleConfirm = async () => {
    if (!confirmed) return
    await onConfirm()
  }

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
          <AlertDialogHeader px={6} pt={5} pb={3} display="flex" alignItems="center" gap={3}>
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
              <Box as={AlertTriangle} w={4} h={4} strokeWidth={2.25} />
            </Box>
            <VStack align="flex-start" spacing={0}>
              <Text fontWeight={700} fontSize="md" color={titleColor} lineHeight="1.2">
                {title}
              </Text>
              <Text fontSize="xs" color={captionColor}>
                This cannot be undone.
              </Text>
            </VStack>
          </AlertDialogHeader>

          <AlertDialogBody px={6} pb={4}>
            <VStack align="stretch" spacing={3}>
              {(itemName || description) && (
                <Box p={4} bg={previewBg} border="1px solid" borderColor={previewBorder} borderRadius="lg">
                  {itemName && (
                    <Text fontSize="sm" fontWeight={700} color={titleColor} noOfLines={1}>
                      {itemName}
                    </Text>
                  )}
                  {description && (
                    <Text fontSize="xs" color={captionColor} mt={itemName ? 0.5 : 0}>
                      {description}
                    </Text>
                  )}
                </Box>
              )}

              <FormControl>
                <Text fontSize="sm" color={captionColor} mb={2}>
                  Type <Code fontWeight={700} colorScheme="red">{confirmWord}</Code> to confirm.
                </Text>
                <Input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={confirmWord}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && confirmed && !isLoading) void handleConfirm()
                  }}
                />
              </FormControl>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter px={6} py={4} borderTop="1px solid" borderColor={previewBorder} gap={2}>
            <Button ref={cancelRef} onClick={onClose} variant="ghost" fontSize="sm" fontWeight={600}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              isLoading={isLoading}
              loadingText="Deleting…"
              isDisabled={!confirmed}
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
              _disabled={{ opacity: 0.45, cursor: 'not-allowed', _hover: { transform: 'none' } }}
              transition="background-position 0.3s ease, transform 0.15s ease, box-shadow 0.2s ease"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
