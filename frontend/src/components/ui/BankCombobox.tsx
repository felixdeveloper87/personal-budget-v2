import { Input } from '@chakra-ui/react'
import { useId } from 'react'
import { UK_BANKS } from './BankLogo'

interface BankComboboxProps {
  value: string
  onChange: (value: string) => void
  size?: string
  placeholder?: string
}

export default function BankCombobox({ value, onChange, size = 'sm', placeholder = 'e.g. NatWest' }: BankComboboxProps) {
  const listId = useId()

  return (
    <>
      <Input
        size={size}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        list={listId}
      />
      <datalist id={listId}>
        {UK_BANKS.map((bank) => (
          <option key={bank} value={bank} />
        ))}
      </datalist>
    </>
  )
}
