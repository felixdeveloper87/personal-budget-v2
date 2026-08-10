import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Eye } from '../../../components/ui/icons'

export interface HiddenSpendingPace {
  key: string
  name: string
}

interface RestoreSpendingPaceDialogProps {
  isOpen: boolean
  items: HiddenSpendingPace[]
  onClose: () => void
  onConfirm: (keys: string[]) => void
}

export default function RestoreSpendingPaceDialog({
  isOpen,
  items,
  onClose,
  onConfirm,
}: RestoreSpendingPaceDialogProps) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    if (isOpen) setSelectedKeys(new Set())
  }, [isOpen])

  const toggleItem = (key: string, checked: boolean) => {
    setSelectedKeys((current) => {
      const next = new Set(current)
      if (checked) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const confirmSelection = () => {
    if (selectedKeys.size === 0) return
    onConfirm([...selectedKeys])
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
      <ModalContent
        bg="var(--pb-surface)"
        border="1px solid var(--pb-hair)"
        borderRadius="xl"
        boxShadow="0 20px 60px -20px rgba(0,0,0,0.4)"
        maxW="460px"
        mx={4}
        overflow="hidden"
      >
        <ModalHeader px={6} pt={5} pb={3}>
          <HStack spacing={3} pr={8}>
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
              <Icon as={Eye} boxSize={4} weight="duotone" />
            </Box>
            <VStack align="flex-start" spacing={0}>
              <Text fontWeight={700} fontSize="md" color="var(--pb-ink)" lineHeight="1.2">
                Show hidden charts
              </Text>
              <Text fontSize="xs" color="var(--pb-ink-soft)" fontWeight={400}>
                Select only the charts you want back
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="var(--pb-ink-faint)" />

        <ModalBody px={6} pb={5}>
          <VStack align="stretch" spacing={2} maxH="360px" overflowY="auto" pr={1}>
            {items.map((item) => (
              <Checkbox
                key={item.key}
                isChecked={selectedKeys.has(item.key)}
                onChange={(event) => toggleItem(item.key, event.target.checked)}
                colorScheme="green"
                px={3.5}
                py={3}
                borderRadius="12px"
                border="1px solid var(--pb-hair)"
                bg={selectedKeys.has(item.key) ? 'var(--pb-tint-green)' : 'var(--pb-surface-2)'}
                color="var(--pb-ink)"
                transition="background-color 0.15s ease, border-color 0.15s ease"
                _hover={{ borderColor: 'var(--pb-hair-2)' }}
              >
                <Text fontFamily="var(--pb-serif)" fontSize="sm" noOfLines={1}>
                  {item.name}
                </Text>
              </Checkbox>
            ))}
          </VStack>
        </ModalBody>

        <ModalFooter px={6} py={4} borderTop="1px solid var(--pb-hair)" gap={2}>
          <Button onClick={onClose} variant="ghost" fontSize="sm" fontWeight={600}>
            Cancel
          </Button>
          <Button
            onClick={confirmSelection}
            isDisabled={selectedKeys.size === 0}
            fontSize="sm"
            fontWeight={700}
            color="var(--pb-on-accent)"
            bg="var(--pb-forest-2)"
            _hover={{ bg: 'var(--pb-forest)', transform: 'translateY(-1px)' }}
            _active={{ transform: 'translateY(0)' }}
            _disabled={{ opacity: 0.45, cursor: 'not-allowed', _hover: { transform: 'none' } }}
          >
            Show selected{selectedKeys.size > 0 ? ` (${selectedKeys.size})` : ''}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
