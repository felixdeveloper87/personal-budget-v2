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
          size={{ base: "xl", sm: "lg" }}
          precision={2}
          step={0.01}
          min={0}
        >
          <NumberInputField
            placeholder="£0.00"
            fontSize={{ base: "xl", sm: "lg" }}
            fontWeight="600"
            borderRadius="xl"
            border="2px"
            borderColor={colors.border}
            onClick={onOpen}
            cursor="pointer"
            h={{ base: "60px", sm: "48px" }}
            _focus={{ borderColor: colors.accent }}
          />
        </NumberInput>
  
        <Wrap mt={{ base: 4, sm: 3 }} spacing={{ base: 3, sm: 2 }}>
          {quickAmounts.map((qa) => (
            <WrapItem key={qa}>
              <Button
                size={{ base: "md", sm: "sm" }}
                h={{ base: "45px", sm: "36px" }}
                variant={amount === qa ? 'solid' : 'outline'}
                colorScheme="blue"
                borderRadius="full"
                onClick={() => onChange(qa)}
                fontSize={{ base: "md", sm: "sm" }}
                fontWeight="bold"
                px={{ base: 6, sm: 4 }}
              >
                £{qa}
              </Button>
            </WrapItem>
          ))}
        </Wrap>
  
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'full', sm: 'sm' }}>
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
              _hover={{ bg: "gray.100" }}
              _dark={{ 
                bg: "gray.800", 
                _hover: { bg: "gray.700" } 
              }}
            />
            <ModalBody pb={{ base: 8, sm: 6 }}>
              <NumberPad value={amount} onValueChange={onChange} />
              <HStack 
                mt={{ base: 8, sm: 6 }} 
                justify="space-between"
                spacing={{ base: 4, sm: 2 }}
              >
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  size={{ base: 'lg', sm: 'md' }}
                  fontSize={{ base: 'lg', sm: 'md' }}
                  fontWeight="bold"
                  flex="1"
                >
                  Cancel
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={onClose}
                  size={{ base: 'lg', sm: 'md' }}
                  fontSize={{ base: 'lg', sm: 'md' }}
                  fontWeight="bold"
                  flex="1"
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
  