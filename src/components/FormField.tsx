import { Input as ShadInput } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select as ShadSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea as ShadTextarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface FieldWrapProps {
  label: string
  error?: string
  children: React.ReactNode
  className?: string
}

function FieldWrap({ label, error, children, className }: FieldWrapProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <FieldWrap label={label} error={error} className={className}>
      <ShadInput {...props} />
    </FieldWrap>
  )
}

interface SelectOption { value: string; label: string }
interface SelectProps {
  label: string
  error?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export function Select({ label, error, value, onChange, options, placeholder, className }: SelectProps) {
  return (
    <FieldWrap label={label} error={error} className={className}>
      <ShadSelect value={value} onValueChange={(v) => onChange(v ?? '')}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder ?? 'Selecione…'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadSelect>
    </FieldWrap>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <FieldWrap label={label} error={error} className={className}>
      <ShadTextarea {...props} />
    </FieldWrap>
  )
}
