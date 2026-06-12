import { Input } from '@/components/ui/input'
import { sanitizeMobileInput } from '@/lib/utils'

export default function PhoneInput({ value, onChange, ...props }) {
  return (
    <Input
      type="tel"
      inputMode="numeric"
      maxLength={10}
      placeholder="10-digit mobile"
      value={value}
      onChange={(e) => onChange(sanitizeMobileInput(e.target.value))}
      {...props}
    />
  )
}
