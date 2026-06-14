import { forwardRef, useId, type ReactNode } from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react'
import type { LucideIcon } from '../ui/icons'

export interface AuthFieldProps {
  label: string
  icon: LucideIcon
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  autoComplete?: string
  rightElement?: ReactNode
  isRequired?: boolean
  isDisabled?: boolean
  name?: string
}

const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  {
    label,
    icon,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    autoComplete,
    rightElement,
    isRequired = true,
    isDisabled,
    name,
  },
  ref,
) {
  const generatedId = useId()
  const id = name ?? generatedId
  const hasError = Boolean(error)

  return (
    <FormControl isInvalid={hasError} isRequired={isRequired}>
      <FormLabel
        htmlFor={id}
        fontSize="xs"
        fontWeight={600}
        color="#94a398"
        mb={1.5}
        fontFamily="'Spline Sans Mono', monospace"
        letterSpacing="0.1em"
        textTransform="uppercase"
      >
        {label}
      </FormLabel>
      <InputGroup>
        <InputLeftElement pointerEvents="none" h="44px" color="#94a398">
          <Icon as={icon} boxSize={4} />
        </InputLeftElement>
        <Input
          ref={ref}
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          isDisabled={isDisabled}
          h="44px"
          pl={10}
          pr={rightElement ? 10 : 4}
          bg="rgba(18, 26, 21, 0.6)"
          border="1px solid"
          borderColor="rgba(239, 234, 224, 0.1)"
          color="#efeae0"
          fontSize="sm"
          borderRadius="10px"
          _placeholder={{ color: 'rgba(148, 163, 152, 0.5)' }}
          _hover={{ borderColor: 'rgba(127, 230, 179, 0.4)' }}
          _focus={{
            borderColor: '#7fe6b3',
            boxShadow: '0 0 0 3px rgba(127, 230, 179, 0.18)',
            bg: 'rgba(18, 26, 21, 0.8)',
          }}
          _focusVisible={{
            borderColor: '#7fe6b3',
            boxShadow: '0 0 0 3px rgba(127, 230, 179, 0.18)',
            bg: 'rgba(18, 26, 21, 0.8)',
          }}
          _invalid={{
            borderColor: 'rgba(239, 68, 68, 0.7)',
            boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.14)',
          }}
          _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
          transition="border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease"
        />
        {rightElement && (
          <InputRightElement h="44px" color="#94a398">
            {rightElement}
          </InputRightElement>
        )}
      </InputGroup>
      {hasError && (
        <FormErrorMessage fontSize="xs" mt={1.5} color="rgba(239, 68, 68, 0.85)">
          {error}
        </FormErrorMessage>
      )}
    </FormControl>
  )
})

export default AuthField
