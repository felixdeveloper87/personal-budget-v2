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
        color={hasError ? C.coral : C.muted}
        fontFamily={F.mono}
        fontSize="9px"
        fontWeight={500}
        letterSpacing="0.13em"
        textTransform="uppercase"
      >
        {label}
      </FormLabel>
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
          h="50px"
          zIndex={1}
          color={hasError ? C.coral : C.mutedDim}
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
          h="50px"
          pl={11}
          pr={rightElement ? 11 : 4}
          bg={C.panelSoft}
          border="1px solid"
          borderColor={C.line}
          color={C.cream}
          fontFamily={F.body}
          fontSize="sm"
          borderRadius="12px"
          _placeholder={{ color: C.mutedDim }}
          _hover={{ borderColor: 'rgba(127, 230, 179, 0.32)', bg: 'rgba(244,246,242,0.055)' }}
          _focus={{
            borderColor: C.jade,
            boxShadow: '0 0 0 3px rgba(127, 230, 179, 0.14)',
            bg: 'rgba(244,246,242,0.065)',
          }}
          _focusVisible={{
            borderColor: C.jade,
            boxShadow: '0 0 0 3px rgba(127, 230, 179, 0.14)',
            bg: 'rgba(244,246,242,0.065)',
          }}
          _invalid={{
            borderColor: 'rgba(255, 154, 144, 0.72)',
            boxShadow: '0 0 0 3px rgba(255, 154, 144, 0.10)',
          }}
          _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
          transition="border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease"
          sx={{
            caretColor: C.jade,
            paddingInlineStart: '46px !important',
            paddingInlineEnd: rightElement ? '46px !important' : '16px !important',
            '&:-webkit-autofill': {
              WebkitTextFillColor: C.cream,
              WebkitBoxShadow: `0 0 0 1000px ${C.panel} inset`,
              caretColor: C.jade,
              transition: 'background-color 9999s ease-out',
            },
          }}
        />
        {rightElement && (
          <InputRightElement h="50px" color={C.muted}>
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
          color={C.coral}
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
