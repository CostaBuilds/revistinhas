'use client'

import { useEffect, useState } from 'react'
import { BookOpen, DollarSign, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import StatsCard from '@/components/StatsCard'
import { getComics, getWishlist, getGoals, getEventos } from '@/lib/data'
import { Comic, WishlistItem, Goal, Evento } from '@/types'
import { formatCurrency, ownerColor, cn } from '@/lib/utils'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// ─── Publisher identity map ───────────────────────────────────────
const PUB: Record<string, { abbr: string; bg: string; fg: string }> = {
  'DC Comics':         { abbr: 'DC',  bg: '#0476F2', fg: '#fff' },
  'Marvel Comics':     { abbr: 'MRV', bg: '#EC1D24', fg: '#fff' },
  'Panini':            { abbr: 'PAN', bg: '#FF5F00', fg: '#fff' },
  'DC/Vertigo':        { abbr: 'VRT', bg: '#6B21A8', fg: '#fff' },
  'Image Comics':      { abbr: 'IMG', bg: '#E53935', fg: '#fff' },
  'Pipoca & Nanquim':  { abbr: 'P&N', bg: '#D97706', fg: '#fff' },
  'Mythos':            { abbr: 'MYT', bg: '#7C3AED', fg: '#fff' },
  'Darkside Books':    { abbr: 'DSK', bg: '#1F2937', fg: '#fff' },
  'Abril':             { abbr: 'ABR', bg: '#16A34A', fg: '#fff' },
}
function pubStyle(pub: string) {
  return PUB[pub] ?? { abbr: pub.slice(0, 3).toUpperCase(), bg: '#64748b', fg: '#fff' }
}

// ─── Saga carousel types + compute ───────────────────────────────
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
    const goal = goals.find(g => g.type === 'serie' && g.title.toLowerCase().includes(name.toLowerCase()))
    const owned = goal?.progress_current ?? data.count
    const rawTotal = goal?.progress_target ?? (data.count + (wlCount[name] ?? 0))
    const total = Math.max(owned, rawTotal || data.count)
    return {
      name,
      owned,
      total,
      percent: Math.min(100, total > 0 ? (owned / total) * 100 : 100),
      publisher: data.pubs.size > 0 ? Array.from(data.pubs)[0] : null,
    }
  }).sort((a, b) => b.owned - a.owned || b.percent - a.percent)
}

// ─── Event colors ─────────────────────────────────────────────────
const EV = {
  lancamento: { bg: 'bg-primary/10', text: 'text-primary',     dot: 'bg-primary',     label: 'Lançamento' },
  pre_venda:  { bg: 'bg-amber-100',  text: 'text-amber-700',   dot: 'bg-amber-500',   label: 'Pré-venda'  },
  saldao:     { bg: 'bg-indigo-100', text: 'text-indigo-700',  dot: 'bg-indigo-500',  label: 'Saldão'     },
} as const

// ─── Calendar helpers ─────────────────────────────────────────────
const WD   = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
const MTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function calDays(year: number, month: number): (number | null)[] {
  const dow = new Date(year, month, 1).getDay()   // 0=Sun
  const dim = new Date(year, month + 1, 0).getDate()
  const off = dow === 0 ? 6 : dow - 1             // Mon-based offset
  const days: (number | null)[] = Array(off).fill(null)
  for (let d = 1; d <= dim; d++) days.push(d)
  while (days.length % 7) days.push(null)
  return days
}

// ─── Value Breakdown (left column) ───────────────────────────────
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
    <Card className="border-border/60 h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Valor por Editora</CardTitle>
          <span className="text-xs text-muted-foreground">{formatCurrency(total)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados.</p>
        ) : sorted.map(([pub, data]) => {
          const pct = total > 0 ? (data.value / total) * 100 : 0
          const s = pubStyle(pub)
          return (
            <div key={pub}>
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="h-5 w-7 rounded flex-shrink-0 flex items-center justify-center text-[8px] font-black"
                  style={{ background: s.bg, color: s.fg }}
                >
                  {s.abbr.slice(0, 3)}
                </div>
                <span className="text-xs flex-1 truncate text-foreground/80">{pub}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">{data.count} HQ</span>
                <span className="text-xs font-semibold tabular-nums w-20 text-right">{formatCurrency(data.value)}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: s.bg }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ─── Featured comic (like "The Somerset") ─────────────────────────
function FeaturedComicCard({ comic }: { comic: Comic | null }) {
  if (!comic) return (
    <Card className="border-border/60">
      <CardContent className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Adicione quadrinhos à coleção.</p>
      </CardContent>
    </Card>
  )
  const s = pubStyle(comic.publisher ?? 'Outros')
  return (
    <Card className="border-border/60 overflow-hidden">
      <CardContent className="p-0 flex">
        {/* Cover placeholder */}
        <div
          className="w-28 flex-shrink-0 flex items-center justify-center select-none"
          style={{ background: `linear-gradient(135deg, ${s.bg}18, ${s.bg}38)`, minHeight: 128 }}
        >
          <span className="text-3xl font-black" style={{ color: s.bg }}>{s.abbr.slice(0, 2)}</span>
        </div>
        {/* Info */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">{comic.series ?? 'Sem série'}</p>
              <p className="text-sm font-semibold leading-snug line-clamp-2 mt-0.5">{comic.title}</p>
            </div>
            <Badge variant="secondary" className="text-[10px] shrink-0">Recente</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {[comic.publisher, comic.year].filter(Boolean).join(' · ')}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Valor</p>
              <p className="text-sm font-bold text-primary">{formatCurrency(comic.current_value)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Pago</p>
              <p className="text-sm font-semibold">{formatCurrency(comic.purchase_price)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Dono</p>
              <p className={cn('text-sm font-semibold capitalize', ownerColor(comic.owner))}>
                {comic.owner === 'ambos' ? 'Ambos' : comic.owner}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Saga carousel (like "Deals") ────────────────────────────────
function SagaCarouselCard({ sagas }: { sagas: SagaInfo[] }) {
  const [idx, setIdx]   = useState(0)
  const [fade, setFade] = useState(false)

  function goTo(i: number) {
    setFade(true)
    setTimeout(() => { setIdx(i); setFade(false) }, 180)
  }

  useEffect(() => {
    if (sagas.length <= 1) return
    const t = setInterval(() => {
      setFade(true)
      setTimeout(() => {
        setIdx(p => (p + 1) % sagas.length)
        setFade(false)
      }, 180)
    }, 4000)
    return () => clearInterval(t)
  }, [sagas.length])

  if (sagas.length === 0) return null
  const saga = sagas[idx]
  const s    = pubStyle(saga.publisher ?? 'Outros')

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Sagas em andamento</CardTitle>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goTo((idx - 1 + sagas.length) % sagas.length)}
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[11px] text-muted-foreground tabular-nums w-10 text-center">
              {idx + 1} / {sagas.length}
            </span>
            <button
              onClick={() => goTo((idx + 1) % sagas.length)}
              className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ opacity: fade ? 0 : 1, transition: 'opacity 0.18s ease' }}>
          {/* Saga header */}
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-xl font-bold leading-tight">{saga.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{saga.publisher ?? 'Série'}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black tabular-nums" style={{ color: s.bg }}>{saga.owned}</p>
              <p className="text-[11px] text-muted-foreground">de {saga.total} issues</p>
            </div>
          </div>

          {/* Progress bar — like the Deals bar in reference */}
          <div className="relative h-10 rounded-xl overflow-hidden bg-muted">
            <div
              className="absolute inset-y-0 left-0 rounded-xl transition-all duration-700 ease-in-out"
              style={{ width: `${Math.max(6, saga.percent)}%`, background: s.bg }}
            />
            <div
              className="absolute inset-y-0 right-0"
              style={{
                width: `${100 - saga.percent}%`,
                backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(0,0,0,0.04) 4px,rgba(0,0,0,0.04) 8px)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <span className="text-xs font-bold text-white drop-shadow-sm">
                {saga.percent.toFixed(0)}% completa
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {saga.total - saga.owned} restantes
              </span>
            </div>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {sagas.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === idx ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                )}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Goals card ───────────────────────────────────────────────────
function GoalsCard({ goals }: { goals: Goal[] }) {
  const active = goals.filter(g => !g.completed).slice(0, 3)
  if (active.length === 0) return null
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Metas</CardTitle>
          <Link href="/metas" className="text-xs text-primary hover:underline underline-offset-4">Ver todas</Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {active.map(goal => {
          const pct = goal.progress_current != null && goal.progress_target != null
            ? Math.min(100, (goal.progress_current / goal.progress_target) * 100) : 0
          return (
            <div key={goal.id}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium truncate pr-2">{goal.title}</span>
                <span className="text-muted-foreground tabular-nums shrink-0">{pct.toFixed(0)}%</span>
              </div>
              <Progress value={pct} className="h-1.5" />
              {goal.progress_current != null && goal.progress_target != null && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  {goal.type === 'valor'
                    ? `${formatCurrency(goal.progress_current)} de ${formatCurrency(goal.progress_target)}`
                    : `${goal.progress_current} de ${goal.progress_target}`}
                </p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
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
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{MTHS[mo]} {yr}</CardTitle>
          <div className="flex items-center gap-0.5">
            <button onClick={prev} className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronLeft size={13} />
            </button>
            <button onClick={next} className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted transition-colors">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WD.map(d => (
            <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col items-center py-0.5 min-h-[28px]">
              {day !== null && (
                <>
                  <span className={cn(
                    'w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-medium',
                    isToday(day)
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-foreground/80 hover:bg-muted cursor-default'
                  )}>
                    {day}
                  </span>
                  {(byDay[day] ?? []).length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {(byDay[day] ?? []).slice(0, 3).map((ev, ei) => (
                        <span key={ei} className={cn('w-1 h-1 rounded-full', EV[ev.tipo].dot)} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-3 flex-wrap">
          {(Object.entries(EV) as [keyof typeof EV, typeof EV[keyof typeof EV]][]).map(([tipo, style]) => (
            <div key={tipo} className="flex items-center gap-1">
              <span className={cn('w-2 h-2 rounded-full', style.dot)} />
              <span className="text-[10px] text-muted-foreground">{style.label}</span>
            </div>
          ))}
        </div>

        <Separator className="my-3" />

        {/* Upcoming events */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Próximos eventos</p>
          {upcoming.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem eventos próximos.</p>
          ) : upcoming.map(ev => {
            const style = EV[ev.tipo]
            const date  = new Date(ev.data + 'T00:00:00')
            const day   = date.getDate()
            const mon   = date.toLocaleDateString('pt-BR', { month: 'short' })
            return (
              <div key={ev.id} className={cn('rounded-lg px-3 py-2 flex gap-3 items-start', style.bg)}>
                <div className="flex-shrink-0 text-center w-6">
                  <p className={cn('text-[13px] font-black leading-none', style.text)}>{day}</p>
                  <p className={cn('text-[9px] uppercase font-medium', style.text)}>{mon}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold leading-snug truncate">{ev.titulo}</p>
                  {ev.descricao && (
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{ev.descricao}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Recent comics table ──────────────────────────────────────────
function RecentComicsCard({ comics }: { comics: Comic[] }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Adicionados recentemente</CardTitle>
          <Link href="/colecao" className="text-xs text-primary hover:underline underline-offset-4">Ver todos</Link>
        </div>
      </CardHeader>
      <CardContent className="p-0 mt-3">
        {comics.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">Nenhum quadrinho ainda.</p>
        ) : (
          <>
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-6 py-2 text-[11px] text-muted-foreground font-semibold border-y border-border/40 bg-muted/30">
              <div className="w-7" />
              <span>Título</span>
              <span className="w-12 text-center">Dono</span>
              <span className="w-24 text-right">Valor</span>
            </div>
            {comics.map((comic, i) => {
              const s = pubStyle(comic.publisher ?? 'Outros')
              return (
                <div key={comic.id}>
                  {i > 0 && <Separator />}
                  <Link
                    href={`/colecao/${comic.id}`}
                    className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-6 py-3 hover:bg-muted/40 transition-colors items-center"
                  >
                    <div
                      className="h-8 w-7 rounded flex items-center justify-center text-[8px] font-black shrink-0"
                      style={{ background: s.bg + '20', color: s.bg }}
                    >
                      {s.abbr.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{comic.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {[comic.publisher, comic.year].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <span className={cn('text-xs font-semibold w-12 text-center shrink-0', ownerColor(comic.owner))}>
                      {comic.owner === 'ambos' ? 'Ambos' : comic.owner === 'marcelo' ? 'M' : 'W'}
                    </span>
                    <span className="text-xs font-semibold text-right w-24 tabular-nums shrink-0">
                      {formatCurrency(comic.current_value)}
                    </span>
                  </Link>
                </div>
              )
            })}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Publisher collection (like "Leads Contact") ──────────────────
function PublisherCollectionCard({ comics }: { comics: Comic[] }) {
  const byPub = comics.reduce<Record<string, number>>((acc, c) => {
    const p = c.publisher ?? 'Outros'
    acc[p] = (acc[p] ?? 0) + 1
    return acc
  }, {})
  const sorted  = Object.entries(byPub).sort(([, a], [, b]) => b - a)
  const maxCount = sorted[0]?.[1] ?? 1

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Coleção por Editora</CardTitle>
          <Link href="/colecao" className="text-xs text-primary hover:underline underline-offset-4">
            Ver coleção
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-1">
        {sorted.length === 0 ? (
          <p className="px-3 text-sm text-muted-foreground">Sem dados.</p>
        ) : sorted.map(([pub, count]) => {
          const s = pubStyle(pub)
          return (
            <div
              key={pub}
              className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-muted/50 transition-colors"
            >
              {/* Publisher logo */}
              <div
                className="h-10 w-10 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-black shadow-sm"
                style={{ background: s.bg, color: s.fg }}
              >
                {s.abbr}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-none truncate">{pub}</p>
                {/* mini bar */}
                <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%`, background: s.bg }}
                  />
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-base font-black tabular-nums" style={{ color: s.bg }}>{count}</p>
                <p className="text-[10px] text-muted-foreground">HQs</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────
export default function DashboardPage() {
  const [comics,  setComics]  = useState<Comic[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [goals,   setGoals]   = useState<Goal[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])

  useEffect(() => {
    setComics(getComics())
    setWishlist(getWishlist())
    setGoals(getGoals())
    setEventos(getEventos())
  }, [])

  const totalValue = comics.reduce((s, c) => s + (c.current_value ?? 0), 0)
  const totalPaid  = comics.reduce((s, c) => s + (c.purchase_price ?? 0), 0)
  const gain       = totalValue - totalPaid
  const gainPct    = totalPaid > 0 ? ((gain / totalPaid) * 100).toFixed(1) : '0'

  const marceloCount = comics.filter(c => c.owner === 'marcelo' || c.owner === 'ambos').length
  const walterCount  = comics.filter(c => c.owner === 'walter'  || c.owner === 'ambos').length

  const recentComics = [...comics]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  const sagas = computeSagas(comics, wishlist, goals)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral da coleção de Marcelo &amp; Walter</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatsCard title="Quadrinhos" value={String(comics.length)}
          subtitle={`${marceloCount} Marcelo · ${walterCount} Walter`} icon={BookOpen} accent="primary" />
        <StatsCard title="Valor total" value={formatCurrency(totalValue)}
          subtitle={`Pago: ${formatCurrency(totalPaid)}`} icon={DollarSign} accent="emerald" />
        <StatsCard title="Valorização" value={`+${gainPct}%`}
          subtitle={gain > 0 ? `+${formatCurrency(gain)}` : '—'} icon={TrendingUp} accent="sky" />
        <StatsCard title="Wishlist" value={String(wishlist.length)}
          subtitle="itens desejados" icon={Star} accent="violet" />
      </div>

      {/* Main 3-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left: value breakdown chart */}
        <div className="xl:col-span-4">
          <ValueBreakdownCard comics={comics} />
        </div>

        {/* Center: featured comic + saga carousel + goals */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <FeaturedComicCard comic={recentComics[0] ?? null} />
          <SagaCarouselCard sagas={sagas} />
          <GoalsCard goals={goals} />
        </div>

        {/* Right: agenda/calendar */}
        <div className="xl:col-span-3">
          <AgendaCalendarCard eventos={eventos} />
        </div>
      </div>

      {/* Bottom: recent table + publisher collection */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
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
