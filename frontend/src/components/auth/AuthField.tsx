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
import { AlertCircle, type LucideIcon } from '../ui/icons'
import { AUTH_COLORS as C, AUTH_FONTS as F } from './authTheme'

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
        mb={2}
        color={hasError ? C.danger : C.ink}
        fontFamily={F.body}
        fontSize="sm"
        fontWeight={600}
      >
        {label}
      </FormLabel>
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          h="52px"
          zIndex={1}
          color={hasError ? C.danger : C.inkFaint}
          transition="color 0.18s ease"
        >
          <Icon as={icon} boxSize="17px" />
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
          h="52px"
          pl={11}
          pr={rightElement ? 11 : 4}
          bg={C.surface}
          border="1.5px solid"
          borderColor="transparent"
          color={C.ink}
          fontFamily={F.body}
          fontSize="md"
          borderRadius="14px"
          _placeholder={{ color: C.inkFaint }}
          _hover={{ bg: C.surfaceHover }}
          _focus={{
            borderColor: C.brand,
            boxShadow: 'none',
            bg: C.panel,
          }}
          _focusVisible={{
            borderColor: C.brand,
            boxShadow: 'none',
            bg: C.panel,
          }}
          _invalid={{
            borderColor: C.danger,
            boxShadow: 'none',
          }}
          _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
          transition="border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease"
          sx={{
            caretColor: C.brand,
            paddingInlineStart: '46px !important',
            paddingInlineEnd: rightElement ? '46px !important' : '16px !important',
            '&:-webkit-autofill': {
              WebkitTextFillColor: C.ink,
              WebkitBoxShadow: `0 0 0 1000px ${C.panel} inset`,
              caretColor: C.brand,
              transition: 'background-color 9999s ease-out',
            },
          }}
        />
        {rightElement && (
          <InputRightElement h="52px" color={C.inkSoft}>
            {rightElement}
          </InputRightElement>
        )}
      </InputGroup>
      {hasError && (
        <FormErrorMessage
          role="alert"
          display="flex"
          alignItems="center"
          gap={1.5}
          mt={2}
          color={C.danger}
          fontFamily={F.body}
          fontSize="xs"
          lineHeight={1.35}
        >
          <Icon as={AlertCircle} boxSize="14px" flexShrink={0} />
          <span>{error}</span>
        </FormErrorMessage>
      )}
    </FormControl>
  )
})

export default AuthField
