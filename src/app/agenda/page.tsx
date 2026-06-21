'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth'
import {
  Plus, Trash2, X, ChevronLeft, ChevronRight,
  Package, ShoppingCart, Percent, CalendarDays, Building2, Star, MapPin,
  type LucideIcon,
} from 'lucide-react'
import { Evento, EventoTipo, eventoTipoLabel } from '@/types'
import { getEventos, addEvento, deleteEvento } from '@/lib/data'
import { cn } from '@/lib/utils'

// ─── Event tipo config ────────────────────────────────────────────
const EV: Record<EventoTipo, { bg: string; dot: string; Icon: LucideIcon }> = {
  lancamento: { bg: '#EC1D24', dot: 'bg-red-500',    Icon: Package      },
  pre_venda:  { bg: '#0476F2', dot: 'bg-blue-500',   Icon: ShoppingCart },
  saldao:     { bg: '#D97706', dot: 'bg-amber-500',  Icon: Percent      },
  evento:     { bg: '#7C3AED', dot: 'bg-violet-500', Icon: CalendarDays },
  feira:      { bg: '#16A34A', dot: 'bg-green-500',  Icon: Building2    },
  sorteio:    { bg: '#DB2777', dot: 'bg-pink-500',   Icon: Star         },
}

const TIPOS = Object.keys(EV) as EventoTipo[]

const USER_COLOR: Record<string, string> = {
  marcelo: '#EC1D24',
  walter:  '#EAC400',
}

// ─── Calendar helpers ─────────────────────────────────────────────
const WD   = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
const MTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
              'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function calDays(yr: number, mo: number): (number | null)[] {
  const first = new Date(yr, mo, 1).getDay()
  const offset = first === 0 ? 6 : first - 1
  const total  = new Date(yr, mo + 1, 0).getDate()
  return [
    ...Array(offset).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ]
}

// ─── TipoBadge ───────────────────────────────────────────────────
function TipoBadge({ tipo }: { tipo: EventoTipo }) {
  const { bg, Icon } = EV[tipo]
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 font-comic text-[9px] uppercase tracking-widest rounded-sm border border-black/20"
      style={{ background: bg, color: '#fff' }}
    >
      <Icon size={8} strokeWidth={2.5} />
      {eventoTipoLabel[tipo]}
    </span>
  )
}

// ─── CreatorBadge ─────────────────────────────────────────────────
function CreatorBadge({ user }: { user: string }) {
  const color = USER_COLOR[user] ?? '#888'
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 font-comic text-[9px] uppercase tracking-widest rounded-sm border"
      style={{ color, borderColor: color + '60', background: color + '15' }}
    >
      {user}
    </span>
  )
}

// ─── Add Event Modal ──────────────────────────────────────────────
interface ModalProps {
  currentUser: string
  defaultDate?: string
  onSave: (e: Evento) => void
  onClose: () => void
}

function AddEventoModal({ currentUser, defaultDate, onSave, onClose }: ModalProps) {
  const [titulo,   setTitulo]   = useState('')
  const [data,     setData]     = useState(defaultDate ?? new Date().toISOString().slice(0, 10))
  const [tipo,     setTipo]     = useState<EventoTipo>('lancamento')
  const [descricao, setDescricao] = useState('')
  const [local,    setLocal]    = useState('')
  const [saving,   setSaving]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    setSaving(true)
    try {
      const novo = await addEvento({
        titulo:    titulo.trim(),
        data,
        tipo,
        descricao: descricao.trim() || null,
        local:     local.trim() || null,
        created_by: currentUser as 'marcelo' | 'walter',
      })
      onSave(novo)
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar evento: ' + (err as Error).message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} />
      <div className="relative w-full max-w-md border-2 border-foreground/80 bg-card rounded-sm shadow-[6px_6px_0px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-primary border-b-2 border-foreground/70">
          <p className="font-comic text-sm uppercase tracking-widest text-white">Novo Evento</p>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Titulo */}
          <div className="space-y-1">
            <label className="font-comic text-[10px] uppercase tracking-widest text-muted-foreground">Título *</label>
            <input
              autoFocus
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Amazing Fantasy #15 — Panini"
              required
              className="w-full px-3 py-2 text-sm rounded-sm border-2 border-foreground/40 bg-background focus:outline-none focus:border-foreground/70"
            />
          </div>

          {/* Data + tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-comic text-[10px] uppercase tracking-widest text-muted-foreground">Data *</label>
              <input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-sm border-2 border-foreground/40 bg-background focus:outline-none focus:border-foreground/70"
              />
            </div>
            <div className="space-y-1">
              <label className="font-comic text-[10px] uppercase tracking-widest text-muted-foreground">Local</label>
              <input
                value={local}
                onChange={e => setLocal(e.target.value)}
                placeholder="Ex: FNAC, online…"
                className="w-full px-3 py-2 text-sm rounded-sm border-2 border-foreground/40 bg-background focus:outline-none focus:border-foreground/70"
              />
            </div>
          </div>

          {/* Tipo — tag selector */}
          <div className="space-y-1.5">
            <label className="font-comic text-[10px] uppercase tracking-widest text-muted-foreground">Tipo</label>
            <div className="flex flex-wrap gap-1.5">
              {TIPOS.map(t => {
                const { bg, Icon } = EV[t]
                const sel = tipo === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 font-comic text-[10px] uppercase tracking-wider rounded-sm border-2 transition-all',
                      sel ? 'text-white border-black/30 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]'
                          : 'border-foreground/30 text-muted-foreground hover:border-foreground/60 bg-transparent'
                    )}
                    style={sel ? { background: bg } : {}}
                  >
                    <Icon size={9} strokeWidth={2.5} />
                    {eventoTipoLabel[t]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="font-comic text-[10px] uppercase tracking-widest text-muted-foreground">Descrição</label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Detalhes, link, observações…"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-sm border-2 border-foreground/40 bg-background focus:outline-none focus:border-foreground/70 resize-none"
            />
          </div>

          {/* Creator info */}
          <p className="text-[10px] text-muted-foreground font-comic uppercase tracking-wider">
            Criado por <span className="capitalize" style={{ color: USER_COLOR[currentUser] }}>{currentUser}</span>
          </p>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 font-comic text-xs uppercase tracking-widest border-2 border-foreground/40 rounded-sm hover:bg-muted/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!titulo.trim() || saving}
              className="flex-1 py-2 font-comic text-xs uppercase tracking-widest border-2 border-foreground/80 rounded-sm bg-primary text-white disabled:opacity-40 shadow-[2px_2px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────
export default function AgendaPage() {
  const { user }    = useAuth()
  const today       = new Date()
  const [yr, setYr] = useState(today.getFullYear())
  const [mo, setMo] = useState(today.getMonth())
  const [eventos,   setEventos]   = useState<Evento[]>([])
  const [showModal, setShowModal] = useState(false)
  const [clickDate, setClickDate] = useState<string | undefined>()
  const [showPast,  setShowPast]  = useState(false)

  useEffect(() => { getEventos().then(setEventos) }, [])

  function refresh() { getEventos().then(setEventos) }

  async function handleDelete(id: string) {
    if (!confirm('Remover este evento?')) return
    try { await deleteEvento(id); refresh() }
    catch (err) { console.error(err) }
  }

  function openModal(date?: string) {
    setClickDate(date)
    setShowModal(true)
  }

  // Calendar
  const days  = calDays(yr, mo)
  const byDay = eventos.reduce<Record<number, Evento[]>>((acc, e) => {
    const d = new Date(e.data + 'T00:00:00')
    if (d.getFullYear() === yr && d.getMonth() === mo) {
      const day = d.getDate()
      if (!acc[day]) acc[day] = []
      acc[day].push(e)
    }
    return acc
  }, {})

  const isToday = (d: number | null) =>
    d !== null && today.getFullYear() === yr && today.getMonth() === mo && today.getDate() === d

  function prev() { if (mo === 0) { setMo(11); setYr(y => y - 1) } else setMo(m => m - 1) }
  function next() { if (mo === 11) { setMo(0); setYr(y => y + 1) } else setMo(m => m + 1) }

  function clickDay(day: number) {
    const dateStr = `${yr}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    openModal(dateStr)
  }

  // Split events
  const todayStr   = today.toISOString().slice(0, 10)
  const upcoming   = eventos.filter(e => e.data >= todayStr).sort((a, b) => a.data.localeCompare(b.data))
  const pastEvents = eventos.filter(e => e.data < todayStr).sort((a, b) => b.data.localeCompare(a.data))

  function fmtDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  function daysUntil(dateStr: string) {
    const ms   = new Date(dateStr + 'T00:00:00').getTime() - new Date(todayStr + 'T00:00:00').getTime()
    const days = Math.round(ms / 86400000)
    if (days === 0) return 'Hoje'
    if (days === 1) return 'Amanhã'
    return `em ${days} dias`
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-comic text-[1.8rem] leading-none uppercase tracking-[0.05em]">Agenda</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {eventos.length} evento{eventos.length !== 1 ? 's' : ''} · {upcoming.length} próximo{upcoming.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-1.5 px-4 py-2 font-comic text-xs uppercase tracking-widest border-2 border-foreground/70 rounded-sm bg-primary text-white shadow-[3px_3px_0px_rgba(0,0,0,0.5)] hover:opacity-90 active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
        >
          <Plus size={13} />
          Novo evento
        </button>
      </div>

      {/* ── Calendar ── */}
      <div className="border-2 border-foreground/70 rounded-sm overflow-hidden shadow-[3px_3px_0px_rgba(0,0,0,0.5)]">
        {/* Month header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-primary border-b-2 border-foreground/70">
          <button onClick={prev} className="h-7 w-7 rounded-sm flex items-center justify-center hover:bg-white/20 text-white transition-colors">
            <ChevronLeft size={14} />
          </button>
          <p className="font-comic text-sm uppercase tracking-[0.2em] text-white">
            {MTHS[mo]} {yr}
          </p>
          <button onClick={next} className="h-7 w-7 rounded-sm flex items-center justify-center hover:bg-white/20 text-white transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="p-3">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WD.map(d => (
              <div key={d} className="text-center text-[9px] text-muted-foreground font-bold py-1 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {days.map((day, i) => {
              if (day === null) return <div key={i} />
              const evs = byDay[day] ?? []
              return (
                <button
                  key={i}
                  onClick={() => clickDay(day)}
                  className={cn(
                    'flex flex-col items-center py-1 rounded-sm transition-colors hover:bg-muted/50 min-h-[42px]',
                    isToday(day) && 'ring-2 ring-primary'
                  )}
                >
                  <span className={cn(
                    'w-7 h-7 flex items-center justify-center rounded-sm text-sm font-medium',
                    isToday(day) ? 'bg-primary text-white font-bold' : 'text-foreground/80'
                  )}>
                    {day}
                  </span>
                  {evs.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {evs.slice(0, 3).map((ev, ei) => (
                        <span key={ei} className={cn('w-1.5 h-1.5 rounded-sm', EV[ev.tipo].dot)} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-3 mt-2 pt-2 border-t border-foreground/15 flex-wrap">
            {TIPOS.map(t => (
              <div key={t} className="flex items-center gap-1">
                <span className={cn('w-1.5 h-1.5 rounded-sm', EV[t].dot)} />
                <span className="font-comic text-[9px] text-muted-foreground uppercase tracking-wider">
                  {eventoTipoLabel[t]}
                </span>
              </div>
            ))}
            <p className="text-[9px] text-muted-foreground ml-auto font-comic tracking-wider">
              Clique num dia para adicionar
            </p>
          </div>
        </div>
      </div>

      {/* ── Upcoming events ── */}
      <div className="space-y-2">
        <p className="font-comic text-[11px] uppercase tracking-widest text-muted-foreground">
          Próximos eventos
        </p>
        {upcoming.length === 0 ? (
          <div className="border-2 border-dashed border-foreground/20 rounded-sm py-10 text-center">
            <p className="font-comic text-xs uppercase tracking-wider text-muted-foreground/50">
              Nenhum evento próximo
            </p>
            <button
              onClick={() => openModal()}
              className="mt-2 font-comic text-[10px] uppercase tracking-widest text-primary hover:underline"
            >
              + Adicionar
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {upcoming.map(ev => <EventRow key={ev.id} ev={ev} label={daysUntil(ev.data)} fmtDate={fmtDate} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      {/* ── Past events ── */}
      {pastEvents.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowPast(p => !p)}
            className="font-comic text-[11px] uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center gap-1.5"
          >
            <ChevronRight size={12} className={cn('transition-transform', showPast && 'rotate-90')} />
            Passados ({pastEvents.length})
          </button>
          {showPast && (
            <div className="space-y-1.5 opacity-60">
              {pastEvents.map(ev => <EventRow key={ev.id} ev={ev} fmtDate={fmtDate} onDelete={handleDelete} />)}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && user && (
        <AddEventoModal
          currentUser={user}
          defaultDate={clickDate}
          onSave={(novo) => { setEventos(prev => [...prev, novo]); setShowModal(false) }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

// ─── Event row card ───────────────────────────────────────────────
function EventRow({
  ev, label, fmtDate, onDelete,
}: {
  ev: Evento
  label?: string
  fmtDate: (d: string) => string
  onDelete: (id: string) => void
}) {
  const { bg, Icon } = EV[ev.tipo]

  return (
    <div className="flex items-start gap-3 border-2 border-foreground/60 rounded-sm overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,0.35)] group">
      {/* Color strip */}
      <div
        className="w-1.5 self-stretch shrink-0"
        style={{ background: bg }}
      />

      {/* Icon */}
      <div
        className="h-9 w-9 rounded-sm flex items-center justify-center shrink-0 mt-2.5"
        style={{ background: bg + '20' }}
      >
        <Icon size={15} style={{ color: bg }} />
      </div>

      {/* Content */}
      <div className="flex-1 py-2.5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight">{ev.titulo}</p>
          <button
            onClick={() => onDelete(ev.id)}
            className="text-muted-foreground/30 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0 mt-0.5"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {/* Date */}
          <span className="font-comic text-[10px] uppercase tracking-wider text-muted-foreground">
            {fmtDate(ev.data)}
          </span>
          {label && (
            <span
              className="font-comic text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm"
              style={{ background: bg + '20', color: bg }}
            >
              {label}
            </span>
          )}

          <TipoBadge tipo={ev.tipo} />
          {ev.created_by && <CreatorBadge user={ev.created_by} />}
        </div>

        {ev.local && (
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
            <MapPin size={9} />
            {ev.local}
          </p>
        )}
        {ev.descricao && (
          <p className="text-[11px] text-muted-foreground mt-1 leading-snug line-clamp-2">
            {ev.descricao}
          </p>
        )}
      </div>
    </div>
  )
}
