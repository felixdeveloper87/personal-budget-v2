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
  import { useThemeColors } from '../../../hooks/useThemeColors'
  import NumberPad from '../../ui/NumberPad'
  
  interface AmountInputProps {
    amount: number
    onChange: (a: number) => void
    type: 'INCOME' | 'EXPENSE'
  }
  
  export default function AmountInput({ amount, onChange, type }: AmountInputProps) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const colors = useThemeColors()
    const quickAmounts = type === 'INCOME' ? [100, 500, 1000, 2000] : [10, 25, 50, 100]
  
    return (
      <Box>
        <Text fontWeight="600" mb={3} color={colors.text.label}>
          Amount
        </Text>
        <NumberInput
          value={amount}
          onChange={(_, val) => onChange(val || 0)}
          size="lg"
          precision={2}
          step={0.01}
          min={0}
        >
          <NumberInputField
            placeholder="£0.00"
            fontSize="lg"
            fontWeight="600"
            borderRadius="xl"
            border="2px"
            borderColor={colors.border}
            onClick={onOpen}
            cursor="pointer"
          />
        </NumberInput>
  
        <Wrap mt={3} spacing={2}>
          {quickAmounts.map((qa) => (
            <WrapItem key={qa}>
              <Button
                size="sm"
                variant={amount === qa ? 'solid' : 'outline'}
                colorScheme="blue"
                borderRadius="full"
                onClick={() => onChange(qa)}
              >
                £{qa}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
  
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', sm: 'sm' }}>
          <ModalOverlay />
          <ModalContent borderRadius={{ base: 'none', sm: '2xl' }} m={0} h={{ base: '100vh', sm: 'auto' }}>
            <ModalHeader textAlign="center">Enter Amount</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <NumberPad value={amount} onValueChange={onChange} />
              <HStack mt={6} justify="space-between">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={onClose}>
                  Done
                </Button>
              </HStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    )
  }
  