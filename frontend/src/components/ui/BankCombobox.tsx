import { Select } from '@chakra-ui/react'
import { UK_BANKS } from './BankLogo'
import { useI18n } from '../../i18n'

interface BankComboboxProps {
  value: string
  onChange: (value: string) => void
  size?: string
  placeholder?: string
}

export default function BankCombobox({ value, onChange, size = 'sm', placeholder }: BankComboboxProps) {
  const { t } = useI18n()
  const hasCustomValue = value.trim() !== '' && !UK_BANKS.includes(value)

  return (
    <Select
      size={size}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? t('common.selectBank')}
    >
      {hasCustomValue && <option value={value}>{value}</option>}
      {UK_BANKS.map((bank) => (
        <option key={bank} value={bank}>{bank}</option>
      ))}
    </Select>
  )
}
