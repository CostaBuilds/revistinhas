'use client'

import { useEffect, useState } from 'react'
import {
  ChevronLeft, ChevronRight,
  Shield, Zap, BookOpen, Moon, Layers, Star, Sparkles, Globe, Book,
  Package, ShoppingCart, Percent,
  BarChart3, BookMarked, Target, Clock, Building2, CalendarDays,
  Library, DollarSign, TrendingUp, Bookmark,
  type LucideIcon,
} from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import { getComics, getWishlist, getGoals, getEventos } from '@/lib/data'
import { Comic, WishlistItem, Goal, Evento } from '@/types'
import { formatCurrency, ownerColor, cn } from '@/lib/utils'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// ─── Publisher identity map ───────────────────────────────────────
const PUB: Record<string, { Icon: LucideIcon; bg: string }> = {
  'DC Comics':         { Icon: Shield,   bg: '#0476F2' },
  'Marvel Comics':     { Icon: Zap,      bg: '#EC1D24' },
  'Panini':            { Icon: BookOpen, bg: '#FF5F00' },
  'DC/Vertigo':        { Icon: Moon,     bg: '#6B21A8' },
  'Image Comics':      { Icon: Layers,   bg: '#E53935' },
  'Pipoca & Nanquim':  { Icon: Star,     bg: '#D97706' },
  'Mythos':            { Icon: Sparkles, bg: '#7C3AED' },
  'Darkside Books':    { Icon: Book,     bg: '#1F2937' },
  'Abril':             { Icon: Globe,    bg: '#16A34A' },
}
const PUB_DEFAULT: { Icon: LucideIcon; bg: string } = { Icon: BookOpen, bg: '#64748b' }

function pubStyle(pub: string) { return PUB[pub] ?? PUB_DEFAULT }

// ─── Saga types + compute ─────────────────────────────────────────
type SagaInfo = { name: string; owned: number; total: number; percent: number; publisher: string | null }

function computeSagas(comics: Comic[], wishlist: WishlistItem[], goals: Goal[]): SagaInfo[] {
  const map = new Map<string, { count: number; pubs: Set<string> }>()
  for (const c of comics) {
    const k = c.series ?? c.title
    if (!map.has(k)) map.set(k, { count: 0, pubs: new Set() })
    const e = map.get(k)!
    e.count++
    if (c.publisher) e.pubs.add(c.publisher)
  }
  const wlCount: Record<string, number> = {}
  for (const w of wishlist) {
    const k = w.series ?? w.title
    wlCount[k] = (wlCount[k] ?? 0) + 1
  }
  return Array.from(map.entries()).map(([name, data]) => {
    const goal     = goals.find(g => g.type === 'serie' && g.title.toLowerCase().includes(name.toLowerCase()))
    const owned    = goal?.progress_current ?? data.count
    const rawTotal = goal?.progress_target ?? (data.count + (wlCount[name] ?? 0))
    const total    = Math.max(owned, rawTotal || data.count)
    return {
      name, owned, total,
      percent: Math.min(100, total > 0 ? (owned / total) * 100 : 100),
      publisher: data.pubs.size > 0 ? Array.from(data.pubs)[0] : null,
    }
  }).sort((a, b) => b.owned - a.owned || b.percent - a.percent)
}

// ─── Event map ───────────────────────────────────────────────────
const EV = {
  lancamento: { bg: '#0476F2', light: '#EFF6FF', text: '#1E40AF', dot: 'bg-blue-500',   label: 'Lançamento', Icon: Package      },
  pre_venda:  { bg: '#D97706', light: '#FFFBEB', text: '#92400E', dot: 'bg-amber-500',  label: 'Pré-venda',  Icon: ShoppingCart },
  saldao:     { bg: '#7C3AED', light: '#F5F3FF', text: '#5B21B6', dot: 'bg-violet-500', label: 'Saldão',     Icon: Percent      },
} as const

// ─── Calendar helpers ─────────────────────────────────────────────
const WD   = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
const MTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function calDays(year: number, month: number): (number | null)[] {
  const dow = new Date(year, month, 1).getDay()
  const dim = new Date(year, month + 1, 0).getDate()
  const off = dow === 0 ? 6 : dow - 1
  const days: (number | null)[] = Array(off).fill(null)
  for (let d = 1; d <= dim; d++) days.push(d)
  while (days.length % 7) days.push(null)
  return days
}

// ─── Comic panel primitives ───────────────────────────────────────
function ComicCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(
      'border-2 border-foreground/80 bg-card rounded-sm overflow-hidden shadow-[3px_3px_0px_rgba(0,0,0,0.55)]',
      className
    )}>
      {children}
    </div>
  )
}

function ComicHeader({
  icon: Icon, label, bg, textColor = '#fff', right,
}: {
  icon: LucideIcon; label: string; bg: string; textColor?: string; right?: React.ReactNode
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 border-b-2 border-foreground/80"
      style={{ background: bg }}
    >
      <div className="flex items-center gap-2">
        <Icon size={12} color={textColor} strokeWidth={2.5} />
        <span className="font-comic text-[12px] uppercase tracking-[0.18em]" style={{ color: textColor }}>
          {label}
        </span>
      </div>
      {right && <div>{right}</div>}
    </div>
  )
}

// ─── Publisher badge ──────────────────────────────────────────────
function PubBadge({ pub, size = 'sm' }: { pub: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = pubStyle(pub)
  const { cls, iconSize } = {
    sm: { cls: 'h-6 w-6 rounded-sm',  iconSize: 11 },
    md: { cls: 'h-8 w-8 rounded-sm',  iconSize: 14 },
    lg: { cls: 'h-10 w-10 rounded-sm', iconSize: 18 },
  }[size]
  return (
    <div
      className={cn('flex items-center justify-center shrink-0 border border-foreground/30', cls)}
      style={{ background: s.bg + '25' }}
      title={pub}
    >
      <s.Icon size={iconSize} style={{ color: s.bg }} />
    </div>
  )
}

// ─── Value Breakdown ──────────────────────────────────────────────
function ValueBreakdownCard({ comics }: { comics: Comic[] }) {
  const byPub = comics.reduce<Record<string, { count: number; value: number }>>((acc, c) => {
    const p = c.publisher ?? 'Outros'
    if (!acc[p]) acc[p] = { count: 0, value: 0 }
    acc[p].count++
    acc[p].value += c.current_value ?? 0
    return acc
  }, {})
  const sorted = Object.entries(byPub).sort(([, a], [, b]) => b.value - a.value)
  const total  = comics.reduce((s, c) => s + (c.current_value ?? 0), 0)

  return (
    <ComicCard className="h-full">
      <ComicHeader
        icon={BarChart3} label="Valor por Editora" bg="#00A651"
        right={
          <span className="font-comic text-[12px] text-white tracking-wide">{formatCurrency(total)}</span>
        }
      />
      <div className="space-y-3 px-4 py-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados.</p>
        ) : sorted.map(([pub, data]) => {
          const pct = total > 0 ? (data.value / total) * 100 : 0
          const s = pubStyle(pub)
          return (
            <div key={pub}>
              <div className="flex items-center gap-2 mb-1">
                <PubBadge pub={pub} size="sm" />
                <span className="text-xs flex-1 truncate font-medium">{pub}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">{data.count} HQ</span>
                <span className="font-comic text-xs tabular-nums">{formatCurrency(data.value)}</span>
              </div>
              <div className="h-2 bg-muted rounded-sm overflow-hidden border border-foreground/20">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: s.bg }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </ComicCard>
  )
}

// ─── Featured comic ───────────────────────────────────────────────
function FeaturedComicCard({ comic }: { comic: Comic | null }) {
  if (!comic) return (
    <ComicCard>
      <div className="p-6 text-center text-sm text-muted-foreground">
        Adicione quadrinhos à coleção.
      </div>
    </ComicCard>
  )
  const s = pubStyle(comic.publisher ?? 'Outros')
  return (
    <ComicCard className="overflow-hidden">
      {/* Colored publisher header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b-2 border-foreground/80"
        style={{ background: s.bg }}
      >
        <div className="flex items-center gap-2">
          <s.Icon size={12} color="#fff" strokeWidth={2.5} />
          <span className="font-comic text-[12px] uppercase tracking-[0.18em] text-white">
            {comic.publisher ?? 'Outros'}
          </span>
        </div>
        <Badge variant="secondary" className="text-[9px] h-4 rounded-sm border-0 bg-white/20 text-white">
          Recente
        </Badge>
      </div>
      {/* Content */}
      <div className="flex">
        <div
          className="w-20 shrink-0 flex flex-col items-center justify-center gap-2 border-r-2 border-foreground/40"
          style={{ background: s.bg + '15', minHeight: 96 }}
        >
          <div
            className="h-9 w-9 rounded-sm flex items-center justify-center border border-foreground/25"
            style={{ background: s.bg + '30' }}
          >
            <s.Icon size={18} style={{ color: s.bg }} />
          </div>
        </div>
        <div className="flex-1 p-3 min-w-0">
          <p className="text-[10px] text-muted-foreground">{comic.series ?? 'Sem série'}</p>
          <p className="text-sm font-bold leading-snug line-clamp-2 mt-0.5">{comic.title}</p>
          <div className="flex items-center gap-4 mt-2.5">
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Valor</p>
              <p className="font-comic text-base leading-none" style={{ color: s.bg }}>
                {formatCurrency(comic.current_value)}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Pago</p>
              <p className="font-comic text-base leading-none">{formatCurrency(comic.purchase_price)}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Dono</p>
              <p className={cn('font-comic text-base leading-none capitalize', ownerColor(comic.owner))}>
                {comic.owner === 'ambos' ? 'Ambos' : comic.owner}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ComicCard>
  )
}

// ─── Saga carousel ────────────────────────────────────────────────
function SagaCarouselCard({ sagas }: { sagas: SagaInfo[] }) {
  const [idx, setIdx]   = useState(0)
  const [fade, setFade] = useState(false)

  function goTo(i: number) {
    setFade(true)
    setTimeout(() => { setIdx(i); setFade(false) }, 160)
  }

  useEffect(() => {
    if (sagas.length <= 1) return
    const t = setInterval(() => {
      setFade(true)
      setTimeout(() => { setIdx(p => (p + 1) % sagas.length); setFade(false) }, 160)
    }, 4000)
    return () => clearInterval(t)
  }, [sagas.length])

  if (sagas.length === 0) return null
  const saga = sagas[idx]
  const s    = pubStyle(saga.publisher ?? 'Outros')

  return (
    <ComicCard>
      <ComicHeader
        icon={BookMarked} label="Sagas em andamento" bg="#0476F2"
        right={
          <div className="flex items-center gap-0.5">
            <button onClick={() => goTo((idx - 1 + sagas.length) % sagas.length)}
              className="h-5 w-5 rounded-sm flex items-center justify-center hover:bg-white/20 transition-colors text-white">
              <ChevronLeft size={12} />
            </button>
            <span className="font-comic text-[10px] text-white/90 w-8 text-center tabular-nums">
              {idx + 1}/{sagas.length}
            </span>
            <button onClick={() => goTo((idx + 1) % sagas.length)}
              className="h-5 w-5 rounded-sm flex items-center justify-center hover:bg-white/20 transition-colors text-white">
              <ChevronRight size={12} />
            </button>
          </div>
        }
      />
      <div className="px-4 py-3">
        <div style={{ opacity: fade ? 0 : 1, transition: 'opacity 0.16s ease' }}>
          <div className="flex items-end justify-between mb-3">
            <div className="min-w-0 pr-2">
              <p className="font-comic text-xl leading-tight truncate">{saga.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <s.Icon size={10} style={{ color: s.bg }} />
                <p className="text-xs text-muted-foreground">{saga.publisher ?? 'Série'}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="font-comic text-[2.8rem] leading-none tabular-nums" style={{ color: s.bg }}>
                {saga.owned}
              </p>
              <p className="text-[10px] text-muted-foreground">de {saga.total}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-8 rounded-sm overflow-hidden bg-muted border border-foreground/25">
            <div
              className="absolute inset-y-0 left-0 transition-all duration-700 ease-in-out"
              style={{ width: `${Math.max(6, saga.percent)}%`, background: s.bg }}
            />
            <div
              className="absolute inset-y-0 right-0"
              style={{
                width: `${100 - saga.percent}%`,
                backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(0,0,0,0.06) 4px,rgba(0,0,0,0.06) 8px)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-3">
              <span className="font-comic text-[11px] text-white drop-shadow-sm tracking-wider">
                {saga.percent.toFixed(0)}%
              </span>
              <span className="text-[10px] text-muted-foreground">{saga.total - saga.owned} restantes</span>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1 mt-3">
            {sagas.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={cn('h-1 rounded-sm transition-all duration-300',
                  i === idx ? 'w-5 bg-primary' : 'w-1 bg-muted-foreground/30')} />
            ))}
          </div>
        </div>
      </div>
    </ComicCard>
  )
}

// ─── Goals card ───────────────────────────────────────────────────
function GoalsCard({ goals }: { goals: Goal[] }) {
  const active = goals.filter(g => !g.completed).slice(0, 3)
  if (active.length === 0) return null
  return (
    <ComicCard>
      <ComicHeader
        icon={Target} label="Metas" bg="#F59E0B" textColor="#1C1917"
        right={
          <Link href="/metas">
            <span className="font-comic text-[10px] uppercase tracking-wider text-[#1C1917]/80 hover:text-[#1C1917]">
              Ver todas →
            </span>
          </Link>
        }
      />
      <div className="space-y-2.5 px-4 py-3">
        {active.map(goal => {
          const pct = goal.progress_current != null && goal.progress_target != null
            ? Math.min(100, (goal.progress_current / goal.progress_target) * 100) : 0
          return (
            <div key={goal.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium truncate pr-2">{goal.title}</span>
                <span className="font-comic text-[11px] text-muted-foreground tabular-nums shrink-0">
                  {pct.toFixed(0)}%
                </span>
              </div>
              <Progress value={pct} className="h-2 rounded-sm" />
              {goal.progress_current != null && goal.progress_target != null && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {goal.type === 'valor'
                    ? `${formatCurrency(goal.progress_current)} de ${formatCurrency(goal.progress_target)}`
                    : `${goal.progress_current} de ${goal.progress_target}`}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </ComicCard>
  )
}

// ─── Agenda / Calendar ────────────────────────────────────────────
function AgendaCalendarCard({ eventos }: { eventos: Evento[] }) {
  const today = new Date()
  const [yr, setYr] = useState(today.getFullYear())
  const [mo, setMo] = useState(today.getMonth())

  const days = calDays(yr, mo)
  const byDay = eventos.reduce<Record<number, Evento[]>>((acc, e) => {
    const d = new Date(e.data + 'T00:00:00')
    if (d.getFullYear() === yr && d.getMonth() === mo) {
      const day = d.getDate()
      if (!acc[day]) acc[day] = []
      acc[day].push(e)
    }
    return acc
  }, {})

  const upcoming = [...eventos]
    .filter(e => new Date(e.data + 'T00:00:00') >= new Date(today.toDateString()))
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 4)

  function prev() { if (mo === 0) { setMo(11); setYr(y => y - 1) } else setMo(m => m - 1) }
  function next() { if (mo === 11) { setMo(0); setYr(y => y + 1) } else setMo(m => m + 1) }
  const isToday = (d: number | null) =>
    d !== null && today.getFullYear() === yr && today.getMonth() === mo && today.getDate() === d

  return (
    <ComicCard>
      <ComicHeader
        icon={CalendarDays} label={`${MTHS[mo]} ${yr}`} bg="#EC1D24"
        right={
          <div className="flex items-center gap-0.5">
            <button onClick={prev} className="h-5 w-5 rounded-sm flex items-center justify-center hover:bg-white/20 transition-colors text-white">
              <ChevronLeft size={12} />
            </button>
            <button onClick={next} className="h-5 w-5 rounded-sm flex items-center justify-center hover:bg-white/20 transition-colors text-white">
              <ChevronRight size={12} />
            </button>
          </div>
        }
      />
      <div className="px-3 py-2">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-0.5">
          {WD.map(d => (
            <div key={d} className="text-center text-[9px] text-muted-foreground font-bold py-1 uppercase tracking-wider">
              {d[0]}
            </div>
          ))}
        </div>
        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col items-center min-h-[26px] py-0.5">
              {day !== null && (
                <>
                  <span className={cn(
                    'w-6 h-6 flex items-center justify-center rounded-sm text-[11px] font-medium',
                    isToday(day)
                      ? 'bg-primary text-primary-foreground font-bold border border-foreground/40'
                      : 'text-foreground/80'
                  )}>{day}</span>
                  {(byDay[day] ?? []).length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {(byDay[day] ?? []).slice(0, 3).map((ev, ei) => (
                        <span key={ei} className={cn('w-1 h-1 rounded-sm', EV[ev.tipo].dot)} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-1.5 flex-wrap border-t border-foreground/15 pt-2">
          {(Object.entries(EV) as [keyof typeof EV, typeof EV[keyof typeof EV]][]).map(([tipo, style]) => (
            <div key={tipo} className="flex items-center gap-1">
              <span className={cn('w-1.5 h-1.5 rounded-sm', style.dot)} />
              <span className="text-[9px] text-muted-foreground">{style.label}</span>
            </div>
          ))}
        </div>

        <Separator className="my-2" />

        {/* Upcoming events */}
        <div className="space-y-1.5">
          <p className="font-comic text-[10px] text-muted-foreground uppercase tracking-[0.15em]">
            Próximos eventos
          </p>
          {upcoming.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem eventos próximos.</p>
          ) : upcoming.map(ev => {
            const style = EV[ev.tipo]
            const date  = new Date(ev.data + 'T00:00:00')
            const day   = date.getDate()
            const mon   = date.toLocaleDateString('pt-BR', { month: 'short' })
            return (
              <div
                key={ev.id}
                className="rounded-sm px-2.5 py-2 flex gap-2.5 items-center border border-foreground/15"
                style={{ background: style.light }}
              >
                <div
                  className="h-6 w-6 rounded-sm flex items-center justify-center shrink-0 border border-foreground/20"
                  style={{ background: style.bg }}
                >
                  <style.Icon size={11} color="#fff" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold leading-snug truncate">{ev.titulo}</p>
                  <p className="font-comic text-[10px]" style={{ color: style.bg }}>{day} {mon}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ComicCard>
  )
}

// ─── Recent comics table ──────────────────────────────────────────
function RecentComicsCard({ comics }: { comics: Comic[] }) {
  return (
    <ComicCard>
      <ComicHeader
        icon={Clock} label="Adicionados recentemente" bg="#1A1A2E"
        right={
          <Link href="/colecao">
            <span className="font-comic text-[10px] uppercase tracking-wider text-white/80 hover:text-white">
              Ver todos →
            </span>
          </Link>
        }
      />
      {comics.length === 0 ? (
        <p className="px-6 py-6 text-sm text-muted-foreground">Nenhum quadrinho ainda.</p>
      ) : (
        <>
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-4 py-1.5 text-[10px] text-muted-foreground font-bold border-b border-foreground/15 bg-muted/40 uppercase tracking-wider">
            <div className="w-7" />
            <span>Título</span>
            <span className="w-10 text-center">Dono</span>
            <span className="w-20 text-right">Valor</span>
          </div>
          {comics.map((comic, i) => {
            const s = pubStyle(comic.publisher ?? 'Outros')
            return (
              <div key={comic.id}>
                {i > 0 && <Separator className="bg-foreground/10" />}
                <Link
                  href={`/colecao/${comic.id}`}
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors items-center"
                >
                  <div
                    className="h-7 w-7 rounded-sm flex items-center justify-center shrink-0 border border-foreground/20"
                    style={{ background: s.bg + '20' }}
                    title={comic.publisher ?? ''}
                  >
                    <s.Icon size={12} style={{ color: s.bg }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{comic.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {[comic.publisher, comic.year].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className={cn('font-comic text-sm w-10 text-center shrink-0', ownerColor(comic.owner))}>
                    {comic.owner === 'ambos' ? 'A' : comic.owner === 'marcelo' ? 'M' : 'W'}
                  </span>
                  <span className="font-comic text-sm text-right w-20 tabular-nums shrink-0">
                    {formatCurrency(comic.current_value)}
                  </span>
                </Link>
              </div>
            )
          })}
        </>
      )}
    </ComicCard>
  )
}

// ─── Publisher collection ─────────────────────────────────────────
function PublisherCollectionCard({ comics }: { comics: Comic[] }) {
  const byPub    = comics.reduce<Record<string, number>>((acc, c) => {
    const p = c.publisher ?? 'Outros'
    acc[p] = (acc[p] ?? 0) + 1
    return acc
  }, {})
  const sorted   = Object.entries(byPub).sort(([, a], [, b]) => b - a)
  const maxCount = sorted[0]?.[1] ?? 1

  return (
    <ComicCard>
      <ComicHeader
        icon={Building2} label="Coleção por Editora" bg="#7C3AED"
        right={
          <Link href="/colecao">
            <span className="font-comic text-[10px] uppercase tracking-wider text-white/80 hover:text-white">
              Ver coleção →
            </span>
          </Link>
        }
      />
      <div className="px-3 py-2 space-y-0.5">
        {sorted.length === 0 ? (
          <p className="px-3 text-sm text-muted-foreground">Sem dados.</p>
        ) : sorted.map(([pub, count]) => {
          const s = pubStyle(pub)
          return (
            <div key={pub} className="flex items-center gap-3 px-2 py-2 rounded-sm hover:bg-muted/50 transition-colors">
              <div
                className="h-9 w-9 rounded-sm shrink-0 flex items-center justify-center border border-foreground/25"
                style={{ background: s.bg + '22' }}
                title={pub}
              >
                <s.Icon size={17} style={{ color: s.bg }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-none truncate">{pub}</p>
                <div className="mt-1.5 h-1.5 bg-muted rounded-sm overflow-hidden border border-foreground/15">
                  <div className="h-full transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%`, background: s.bg }} />
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-comic text-xl tabular-nums leading-none" style={{ color: s.bg }}>{count}</p>
                <p className="text-[9px] text-muted-foreground uppercase font-semibold">HQs</p>
              </div>
            </div>
          )
        })}
      </div>
    </ComicCard>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────
export default function DashboardPage() {
  const [comics,   setComics]   = useState<Comic[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [goals,    setGoals]    = useState<Goal[]>([])
  const [eventos,  setEventos]  = useState<Evento[]>([])

  useEffect(() => {
    setComics(getComics())
    setWishlist(getWishlist())
    setGoals(getGoals())
    setEventos(getEventos())
  }, [])

  const totalValue   = comics.reduce((s, c) => s + (c.current_value ?? 0), 0)
  const totalPaid    = comics.reduce((s, c) => s + (c.purchase_price ?? 0), 0)
  const gain         = totalValue - totalPaid
  const gainPct      = totalPaid > 0 ? ((gain / totalPaid) * 100).toFixed(1) : '0'

  const marceloCount = comics.filter(c => c.owner === 'marcelo' || c.owner === 'ambos').length
  const walterCount  = comics.filter(c => c.owner === 'walter'  || c.owner === 'ambos').length

  const recentComics = [...comics]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  const sagas = computeSagas(comics, wishlist, goals)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="font-comic text-[1.8rem] leading-none uppercase tracking-[0.05em]">Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Coleção de Marcelo &amp; Walter · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatsCard
          title="Quadrinhos"
          value={String(comics.length)}
          subtitle={`${marceloCount} Marcelo · ${walterCount} Walter`}
          icon={Library}
          accent="sky"
          trend="+12%"
        />
        <StatsCard
          title="Valor total"
          value={formatCurrency(totalValue)}
          subtitle={`Pago: ${formatCurrency(totalPaid)}`}
          icon={DollarSign}
          accent="emerald"
        />
        <StatsCard
          title="Valorização"
          value={`+${gainPct}%`}
          subtitle={gain > 0 ? `+${formatCurrency(gain)}` : '—'}
          icon={TrendingUp}
          accent="primary"
          trend={`+${gainPct}%`}
        />
        <StatsCard
          title="Wishlist"
          value={String(wishlist.length)}
          subtitle="itens desejados"
          icon={Bookmark}
          accent="violet"
        />
      </div>

      {/* Main 3-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
        <div className="xl:col-span-4">
          <ValueBreakdownCard comics={comics} />
        </div>
        <div className="xl:col-span-5 flex flex-col gap-3">
          <FeaturedComicCard comic={recentComics[0] ?? null} />
          <SagaCarouselCard sagas={sagas} />
          <GoalsCard goals={goals} />
        </div>
        <div className="xl:col-span-3">
          <AgendaCalendarCard eventos={eventos} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-start">
        <div className="xl:col-span-7">
          <RecentComicsCard comics={recentComics} />
        </div>
        <div className="xl:col-span-5">
          <PublisherCollectionCard comics={comics} />
        </div>
      </div>
    </div>
  )
}
