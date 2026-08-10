import { useRef } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react'
import { EyeOff } from '../../../components/ui/icons'

interface HideSpendingPaceDialogProps {
  isOpen: boolean
  itemName: string | null
  onClose: () => void
  onConfirm: () => void
}

export default function HideSpendingPaceDialog({
  isOpen,
  itemName,
  onClose,
  onConfirm,
}: HideSpendingPaceDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

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
          bg="var(--pb-surface)"
          border="1px solid var(--pb-hair)"
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
              bg="var(--pb-tint-gold)"
              color="var(--pb-gold)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Icon as={EyeOff} boxSize={4} weight="duotone" />
            </Box>
            <VStack align="flex-start" spacing={0}>
              <Text fontWeight={700} fontSize="md" color="var(--pb-ink)" lineHeight="1.2">
                Hide {itemName ?? 'spending pace'} chart?
              </Text>
              <Text fontSize="xs" color="var(--pb-ink-soft)">
                Personal dashboard preference
              </Text>
            </VStack>
          </AlertDialogHeader>

          <AlertDialogBody px={6} pb={5}>
            <VStack align="stretch" spacing={3}>
              <Text fontSize="sm" color="var(--pb-ink-soft)" lineHeight={1.6}>
                This will remove the spending pace chart for {itemName ?? 'this item'} from your dashboard.
                Your transactions and financial data will not be deleted.
              </Text>
              <Box
                px={4}
                py={3}
                borderRadius="lg"
                border="1px solid var(--pb-hair)"
                bg="var(--pb-surface-2)"
              >
                <Text fontSize="xs" color="var(--pb-ink-soft)">
                  You can restore it anytime with “Show hidden”.
                </Text>
              </Box>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter px={6} py={4} borderTop="1px solid var(--pb-hair)" gap={2}>
            <Button ref={cancelRef} onClick={onClose} variant="ghost" fontSize="sm" fontWeight={600}>
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              fontSize="sm"
              fontWeight={700}
              color="var(--pb-on-accent)"
              bg="var(--pb-forest-2)"
              _hover={{ bg: 'var(--pb-forest)', transform: 'translateY(-1px)' }}
              _active={{ transform: 'translateY(0)' }}
            >
              Hide chart
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
