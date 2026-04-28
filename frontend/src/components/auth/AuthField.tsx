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
  useColorModeValue,
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
  /** Override the default native input id. Useful when label/aria need pairing. */
  name?: string
}

/**
 * Shared auth-form field: label + icon-prefixed input + inline error helper.
 *
 * Resolves color tokens once (no useColorModeValue inside .map() callers) and
 * uses tight, GPU-cheap transitions (border-color, box-shadow) instead of
 * `transition: all` so the modal stays responsive while animating in.
 */
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

  const labelColor = useColorModeValue('gray.700', 'gray.200')
  const inputBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const inputBorder = useColorModeValue('gray.200', 'whiteAlpha.200')
  const inputColor = useColorModeValue('gray.900', 'gray.50')
  const placeholderColor = useColorModeValue('gray.400', 'gray.600')
  const iconColor = useColorModeValue('gray.400', 'gray.500')
  const focusBorder = useColorModeValue('#3b82f6', '#60a5fa')
  const focusGlow = useColorModeValue(
    'rgba(59, 130, 246, 0.18)',
    'rgba(96, 165, 250, 0.28)',
  )

  const hasError = Boolean(error)

  return (
    <FormControl isInvalid={hasError} isRequired={isRequired}>
      <FormLabel
        htmlFor={id}
        fontSize="sm"
        fontWeight={600}
        color={labelColor}
        mb={1.5}
      >
        {label}
      </FormLabel>
      <InputGroup>
        <InputLeftElement pointerEvents="none" h="44px" color={iconColor}>
          <Icon as={icon} boxSize={4} weight="bold" />
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
          bg={inputBg}
          border="1px solid"
          borderColor={inputBorder}
          color={inputColor}
          fontSize="sm"
          _placeholder={{ color: placeholderColor }}
          _hover={{ borderColor: focusBorder }}
          _focus={{
            borderColor: focusBorder,
            boxShadow: `0 0 0 3px ${focusGlow}`,
          }}
          _focusVisible={{
            borderColor: focusBorder,
            boxShadow: `0 0 0 3px ${focusGlow}`,
          }}
          _invalid={{
            borderColor: 'red.400',
            boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.18)',
          }}
          transition="border-color 0.15s ease, box-shadow 0.15s ease"
        />
        {rightElement && <InputRightElement h="44px">{rightElement}</InputRightElement>}
      </InputGroup>
      {hasError && (
        <FormErrorMessage fontSize="xs" mt={1.5}>
          {error}
        </FormErrorMessage>
      )}
    </FormControl>
  )
})

export default AuthField
