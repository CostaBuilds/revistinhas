export type Owner = 'marcelo' | 'walter' | 'ambos'

export type Condition =
  | 'mint'
  | 'near_mint'
  | 'very_fine'
  | 'fine'
  | 'very_good'
  | 'good'
  | 'fair'
  | 'poor'

export type Priority = 'alta' | 'media' | 'baixa'

export type GoalType = 'serie' | 'quantidade' | 'valor' | 'outro'

export interface Comic {
  id: string
  created_at: string
  title: string
  series: string | null
  issue_number: number | null
  volume: number | null
  publisher: string | null
  year: number | null
  condition: Condition | null
  purchase_price: number | null
  purchase_price_marcelo?: number | null
  purchase_price_walter?: number | null
  current_value: number | null
  owner: Owner
  cover_url: string | null
  notes: string | null
  read: boolean
  omnibus: boolean
  language: string
}

export interface WishlistItem {
  id: string
  created_at: string
  title: string
  series: string | null
  issue_number: number | null
  volume: number | null
  publisher: string | null
  priority: Priority
  notes: string | null
  owner: Owner
  estimated_price: number | null
}

export interface Goal {
  id: string
  created_at: string
  title: string
  description: string | null
  target_date: string | null
  completed: boolean
  owner: Owner
  type: GoalType
  progress_current: number | null
  progress_target: number | null
}

export const conditionLabels: Record<Condition, string> = {
  mint: 'Mint',
  near_mint: 'Near Mint',
  very_fine: 'Very Fine',
  fine: 'Fine',
  very_good: 'Very Good',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
}

export const ownerLabels: Record<Owner, string> = {
  marcelo: 'Marcelo',
  walter: 'Walter',
  ambos: 'Ambos',
}

export const priorityLabels: Record<Priority, string> = {
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
}

export const goalTypeLabels: Record<GoalType, string> = {
  serie: 'Completar Série',
  quantidade: 'Quantidade',
  valor: 'Valor',
  outro: 'Outro',
}

export interface Collection {
  id: string
  created_at: string
  name: string              // matches comic.series
  publisher: string | null
  cover_url: string | null
  total_volumes: number | null
  created_by: Owner
  description: string | null
  omnibus: boolean
}

export type EventoTipo = 'lancamento' | 'pre_venda' | 'saldao' | 'evento' | 'feira' | 'sorteio'

export interface Evento {
  id: string
  titulo: string
  data: string  // YYYY-MM-DD
  tipo: EventoTipo
  descricao?: string | null
  created_by: 'marcelo' | 'walter'
  local?: string | null
}

export const eventoTipoLabel: Record<EventoTipo, string> = {
  lancamento: 'Lançamento',
  pre_venda:  'Pré-venda',
  saldao:     'Saldão',
  evento:     'Evento',
  feira:      'Feira',
  sorteio:    'Sorteio',
}

export const eventoTipoCor: Record<EventoTipo, { bg: string; text: string }> = {
  lancamento: { bg: '#EC1D24', text: '#fff' },
  pre_venda:  { bg: '#0476F2', text: '#fff' },
  saldao:     { bg: '#D97706', text: '#fff' },
  evento:     { bg: '#7C3AED', text: '#fff' },
  feira:      { bg: '#16A34A', text: '#fff' },
  sorteio:    { bg: '#DB2777', text: '#fff' },
}
