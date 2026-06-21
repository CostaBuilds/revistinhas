import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Condition } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function conditionVariant(condition: Condition | null): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (condition) {
    case 'mint':
    case 'near_mint': return 'default'
    case 'very_fine':
    case 'fine': return 'secondary'
    default: return 'outline'
  }
}

export function ownerColor(owner: string): string {
  switch (owner) {
    case 'marcelo': return 'text-amber-600'
    case 'walter': return 'text-sky-700'
    case 'ambos': return 'text-indigo-600'
    default: return 'text-muted-foreground'
  }
}

export function ownerDot(owner: string): string {
  switch (owner) {
    case 'marcelo': return 'bg-amber-500'
    case 'walter': return 'bg-sky-600'
    case 'ambos': return 'bg-indigo-500'
    default: return 'bg-muted-foreground'
  }
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case 'alta': return 'text-rose-600'
    case 'media': return 'text-amber-600'
    case 'baixa': return 'text-muted-foreground'
    default: return 'text-muted-foreground'
  }
}
