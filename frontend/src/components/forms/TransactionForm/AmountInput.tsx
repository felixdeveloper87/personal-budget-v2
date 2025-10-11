import {
  Box,
  Text,
  Button,
  Wrap,
  WrapItem,
  NumberInput,
  NumberInputField,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  useDisclosure,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import NumberPad from '../../ui/NumberPad'

interface AmountInputProps {
  amount: number
  onChange: (a: number) => void
  type: 'INCOME' | 'EXPENSE'
}

/**
 * 💰 AmountInput component
 * - Displays a transaction amount input.
 * - Includes quick amount buttons and a modal with confirm/cancel logic.
 */
export default function AmountInput({ amount, onChange, type }: AmountInputProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const colors = useThemeColors()

  // --- Local modal state for temporary editing ---
  const [tempAmount, setTempAmount] = useState(amount)

  // Quick presets
  const quickAmounts = type === 'INCOME' ? [100, 500, 1000, 2000] : [10, 25, 50, 100]

  // When opening the modal, copy the current confirmed amount
  const handleOpen = () => {
    setTempAmount(amount)
    onOpen()
  }

  // Cancel → revert changes
  const handleCancel = () => {
    setTempAmount(amount)
    onClose()
  }

  // Done → confirm temp amount and close
  const handleDone = () => {
    onChange(tempAmount)
    onClose()
  }

  return (
    <Box>
      <Text fontWeight="600" mb={3} color={colors.text.label}>
        Amount
      </Text>

      {/* Main input (opens modal) */}
      <NumberInput
        value={amount}
        onChange={(_, val) => onChange(val || 0)}
        precision={2}
        step={0.01}
        min={0}
      >
        <NumberInputField
          placeholder="£0.00"
          fontSize={{ base: '2xl', sm: 'xl' }}
          fontWeight="700"
          borderRadius="xl"
          border="2px solid"
          borderColor={colors.border}
          onClick={handleOpen}
          cursor="pointer"
          aria-label="Enter amount"
          h={{ base: '70px', sm: '56px' }}
          textAlign="center"
          _focus={{ borderColor: colors.accent, shadow: 'md' }}
          _hover={{ borderColor: colors.accent }}
          transition="all 0.2s"
        />
      </NumberInput>

      {/* Quick-select preset buttons */}
      <Wrap mt={{ base: 4, sm: 3 }} spacing={{ base: 2, sm: 2 }} justify="center">
        {quickAmounts.map((qa) => (
          <WrapItem key={qa}>
            <Button
              size={{ base: 'lg', sm: 'md' }}
              h={{ base: '52px', sm: '42px' }}
              variant={amount === qa ? 'solid' : 'outline'}
              colorScheme="blue"
              borderRadius="xl"
              borderWidth="2px"
              onClick={() => onChange(qa)}
              fontSize={{ base: 'lg', sm: 'md' }}
              fontWeight="bold"
              px={{ base: 8, sm: 6 }}
              minW={{ base: '80px', sm: '70px' }}
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'md',
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              transition="all 0.2s"
            >
              £{qa}
            </Button>
          </WrapItem>
        ))}
      </Wrap>

      {/* Modal with confirm/cancel behavior */}
      <Modal isOpen={isOpen} onClose={handleCancel} size={{ base: 'full', sm: 'sm' }}>
        <ModalOverlay />
        <ModalContent
          borderRadius={{ base: 'none', sm: '2xl' }}
          m={0}
          h={{ base: '100vh', sm: 'auto' }}
          maxH={{ base: '100vh', sm: '90vh' }}
        >
          <ModalHeader
            textAlign="center"
            fontSize={{ base: 'xl', sm: 'lg' }}
            fontWeight="bold"
            py={{ base: 6, sm: 4 }}
          >
            Enter Amount
          </ModalHeader>

          <ModalCloseButton
            size={{ base: 'lg', sm: 'md' }}
            top={{ base: 4, sm: 2 }}
            right={{ base: 4, sm: 2 }}
            bg="white"
            borderRadius="full"
            boxShadow="lg"
            _hover={{ bg: 'gray.100' }}
            _dark={{
              bg: 'gray.800',
              _hover: { bg: 'gray.700' },
            }}
          />

          <ModalBody pb={{ base: 8, sm: 6 }}>
            {/* Custom NumberPad works with tempAmount */}
            <NumberPad value={tempAmount} onValueChange={setTempAmount} />

            <HStack mt={{ base: 8, sm: 6 }} justify="space-between" spacing={{ base: 4, sm: 2 }}>
              <Button
                variant="ghost"
                onClick={handleCancel}
                size={{ base: 'lg', sm: 'md' }}
                fontSize={{ base: 'lg', sm: 'md' }}
                fontWeight="bold"
                flex="1"
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleDone}
                size={{ base: 'lg', sm: 'md' }}
                fontSize={{ base: 'lg', sm: 'md' }}
                fontWeight="bold"
                flex="1"
                isDisabled={tempAmount <= 0}
              >
                Done
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}
