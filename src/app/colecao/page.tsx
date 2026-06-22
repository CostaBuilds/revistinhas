'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, LayoutGrid, List, BookOpen, Copy, ArrowUpDown } from 'lucide-react'
import { Comic, Collection, Owner } from '@/types'
import { getComics, getCollections } from '@/lib/data'
import { useAuth } from '@/context/auth'
import { cn, formatCurrency, ownerColor } from '@/lib/utils'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { pubData } from '@/lib/publishers'
import PublisherLogo from '@/components/PublisherLogo'

function pubStyle(pub: string) { return pubData(pub) }

type Tab = 'colecoes' | 'hqs'
type ColSort = 'insercao_desc' | 'insercao_asc' | 'az' | 'za' | 'progresso_desc' | 'volumes_desc'
type HqSort  = 'insercao_desc' | 'insercao_asc' | 'az' | 'za' | 'ano_desc' | 'ano_asc' | 'valor_desc' | 'numero_asc'

const COL_SORT_LABELS: Record<ColSort, string> = {
  insercao_desc:  'Mais recentes',
  insercao_asc:   'Mais antigas',
  az:             'A → Z',
  za:             'Z → A',
  progresso_desc: 'Mais completas',
  volumes_desc:   'Mais volumes',
}
const HQ_SORT_LABELS: Record<HqSort, string> = {
  insercao_desc: 'Mais recentes',
  insercao_asc:  'Mais antigas',
  az:            'A → Z',
  za:            'Z → A',
  ano_desc:      'Ano ↓',
  ano_asc:       'Ano ↑',
  valor_desc:    'Maior valor',
  numero_asc:    'Número ↑',
}

export default function ColecaoPage() {
  const { user }                    = useAuth()
  const [comics, setComics]         = useState<Comic[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [search, setSearch]         = useState('')
  const [ownerFilter, setOwnerFilter] = useState<Owner | 'todos'>('todos')
  const [tab, setTab]               = useState<Tab>('colecoes')
  const [listView, setListView]     = useState(false)
  const [colSort, setColSort]       = useState<ColSort>('az')
  const [hqSort, setHqSort]         = useState<HqSort>('az')

  useEffect(() => {
    if (user) setOwnerFilter(user)
  }, [user])

  useEffect(() => {
    if (!user) return
    getComics().then(setComics)
    getCollections().then(setCollections)
  }, [user])

  // ── Filtered collections ──────────────────────────────────────
  const filteredCols = collections.filter((col) => {
    const q = search.toLowerCase()
    const matchSearch = !q || col.name.toLowerCase().includes(q) || (col.publisher ?? '').toLowerCase().includes(q)
    let matchOwner: boolean
    if (ownerFilter === 'todos') {
      matchOwner = true
    } else {
      const createdByUser = col.created_by === ownerFilter || col.created_by === 'ambos'
      const hasVolumes    = comics.some(c =>
        (c.series ?? c.title) === col.name &&
        (c.owner === ownerFilter || c.owner === 'ambos')
      )
      matchOwner = createdByUser || hasVolumes
    }
    return matchSearch && matchOwner
  })

  // ── Sorted collections ────────────────────────────────────────
  const sortedCols = [...filteredCols].sort((a, b) => {
    switch (colSort) {
      case 'insercao_desc':  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'insercao_asc':   return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'az':             return a.name.localeCompare(b.name, 'pt')
      case 'za':             return b.name.localeCompare(a.name, 'pt')
      case 'progresso_desc': {
        const u = user ?? 'marcelo'
        const aPct = a.total_volumes
          ? comics.filter(c => (c.series ?? c.title) === a.name && (c.owner === u || c.owner === 'ambos')).length / a.total_volumes
          : 0
        const bPct = b.total_volumes
          ? comics.filter(c => (c.series ?? c.title) === b.name && (c.owner === u || c.owner === 'ambos')).length / b.total_volumes
          : 0
        return bPct - aPct
      }
      case 'volumes_desc':   return (b.total_volumes ?? 0) - (a.total_volumes ?? 0)
    }
  })

  // ── Filtered HQs ─────────────────────────────────────────────
  const filteredHqs = comics.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.title.toLowerCase().includes(q) || (c.series ?? '').toLowerCase().includes(q) || (c.publisher ?? '').toLowerCase().includes(q)
    const matchOwner  = ownerFilter === 'todos' || c.owner === ownerFilter || c.owner === 'ambos'
    return matchSearch && matchOwner
  })

  // ── Sorted HQs ───────────────────────────────────────────────
  const sortedHqs = [...filteredHqs].sort((a, b) => {
    switch (hqSort) {
      case 'insercao_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'insercao_asc':  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'az':            return a.title.localeCompare(b.title, 'pt')
      case 'za':            return b.title.localeCompare(a.title, 'pt')
      case 'ano_desc':      return (b.year ?? 0) - (a.year ?? 0)
      case 'ano_asc':       return (a.year ?? 0) - (b.year ?? 0)
      case 'valor_desc':    return (b.current_value ?? 0) - (a.current_value ?? 0)
      case 'numero_asc':    return (a.issue_number ?? a.volume ?? 0) - (b.issue_number ?? b.volume ?? 0)
    }
  })

  // ── Group sorted collections by publisher ─────────────────────
  const byPublisher = sortedCols.reduce<Record<string, Collection[]>>((acc, col) => {
    const pub = col.publisher ?? 'Outros'
    if (!acc[pub]) acc[pub] = []
    acc[pub].push(col)
    return acc
  }, {})

  const publishers = Object.keys(byPublisher).sort()

  const totalValue = sortedHqs.reduce((s, c) => s + (c.current_value ?? 0), 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-comic text-[1.8rem] leading-none uppercase tracking-[0.05em]">Coleção</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {tab === 'colecoes'
              ? `${sortedCols.length} coleção${sortedCols.length !== 1 ? 'ões' : ''}`
              : `${sortedHqs.length} HQ${sortedHqs.length !== 1 ? 's' : ''} · ${formatCurrency(totalValue)}`}
          </p>
        </div>
        <div className="flex gap-2">
          {tab === 'colecoes' ? (
            <Link href="/colecao/nova-colecao" className={cn(buttonVariants({ size: 'sm' }), 'rounded-sm border-2 border-foreground/60 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]')}>
              <Plus size={13} className="mr-1.5" />
              Nova coleção
            </Link>
          ) : (
            <Link href="/colecao/novo" className={cn(buttonVariants({ size: 'sm' }), 'rounded-sm border-2 border-foreground/60 shadow-[2px_2px_0px_rgba(0,0,0,0.5)]')}>
              <Plus size={13} className="mr-1.5" />
              Adicionar HQ
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-2 border-foreground/70 rounded-sm w-fit overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,0.45)]">
        {(['colecoes', 'hqs'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-1.5 font-comic text-[12px] uppercase tracking-widest transition-colors',
              tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {t === 'colecoes' ? 'Coleções' : 'Todas as HQs'}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === 'colecoes' ? 'Buscar coleção, editora…' : 'Buscar título, série, editora…'}
            className="pl-9 rounded-sm border-2 border-foreground/50 h-9"
          />
        </div>
        <div className="flex items-center border-2 border-foreground/50 rounded-sm overflow-hidden">
          {(['todos', 'marcelo', 'walter'] as const).map((o) => (
            <button
              key={o}
              onClick={() => setOwnerFilter(o)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors capitalize',
                ownerFilter === o ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {o === 'todos' ? 'Todos' : o.charAt(0).toUpperCase() + o.slice(1)}
            </button>
          ))}
        </div>
        {/* Sort selector */}
        <div className="flex items-center border-2 border-foreground/50 rounded-sm overflow-hidden">
          <span className="px-2 text-muted-foreground border-r border-foreground/20">
            <ArrowUpDown size={12} />
          </span>
          {tab === 'colecoes' ? (
            <select
              value={colSort}
              onChange={(e) => setColSort(e.target.value as ColSort)}
              className="bg-transparent text-xs font-medium px-2 py-1.5 outline-none cursor-pointer text-foreground"
            >
              {(Object.keys(COL_SORT_LABELS) as ColSort[]).map((k) => (
                <option key={k} value={k}>{COL_SORT_LABELS[k]}</option>
              ))}
            </select>
          ) : (
            <select
              value={hqSort}
              onChange={(e) => setHqSort(e.target.value as HqSort)}
              className="bg-transparent text-xs font-medium px-2 py-1.5 outline-none cursor-pointer text-foreground"
            >
              {(Object.keys(HQ_SORT_LABELS) as HqSort[]).map((k) => (
                <option key={k} value={k}>{HQ_SORT_LABELS[k]}</option>
              ))}
            </select>
          )}
        </div>

        {tab === 'hqs' && (
          <div className="flex items-center border-2 border-foreground/50 rounded-sm overflow-hidden">
            <button onClick={() => setListView(false)} className={cn('p-1.5 transition-colors', !listView ? 'bg-foreground text-background' : 'text-muted-foreground')}>
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => setListView(true)} className={cn('p-1.5 transition-colors', listView ? 'bg-foreground text-background' : 'text-muted-foreground')}>
              <List size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── Collections tab ── */}
      {tab === 'colecoes' && (
        <div className="space-y-8">
          {publishers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen size={36} className="text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma coleção encontrada.</p>
              <Link href="/colecao/nova-colecao" className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'mt-1')}>
                Criar primeira coleção →
              </Link>
            </div>
          ) : publishers.map((pub) => {
            const s = pubStyle(pub)
            const cols = byPublisher[pub]
            return (
              <div key={pub}>
                {/* Publisher header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5 border-2 border-foreground/70 rounded-sm mb-3 shadow-[2px_2px_0px_rgba(0,0,0,0.45)]"
                  style={{ background: s.bg }}
                >
                  <div className="flex items-center gap-2">
                    <PublisherLogo publisher={pub} size={14} inverted />
                    <span className="font-comic text-sm uppercase tracking-[0.18em] text-white">{pub}</span>
                    <span className="font-comic text-[10px] text-white/70 tracking-wider">
                      {cols.length} coleção{cols.length !== 1 ? 'ões' : ''}
                    </span>
                  </div>
                  <Link
                    href={`/colecao/nova-colecao?publisher=${encodeURIComponent(pub)}`}
                    className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-[10px] font-comic uppercase tracking-wider"
                  >
                    <Plus size={11} />
                    Nova
                  </Link>
                </div>

                {/* Collection cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {cols.map((col) => (
                    <CollectionCard key={col.id} collection={col} comics={comics} pubBg={s.bg} user={user ?? 'marcelo'} />
                  ))}
                  {/* Add new */}
                  <Link
                    href={`/colecao/nova-colecao?publisher=${encodeURIComponent(pub)}`}
                    className="aspect-[2/3] border-2 border-dashed border-foreground/30 rounded-sm flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground/60 transition-colors"
                  >
                    <Plus size={20} className="opacity-50" />
                    <span className="font-comic text-[10px] uppercase tracking-wider opacity-60">Nova</span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── HQs tab ── */}
      {tab === 'hqs' && (
        sortedHqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground text-sm">Nenhum quadrinho encontrado.</p>
            <Link href="/colecao/novo" className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'mt-1')}>Adicionar →</Link>
          </div>
        ) : listView ? (
          <HqListView comics={sortedHqs} />
        ) : (
          <HqGridView comics={sortedHqs} />
        )
      )}
    </div>
  )
}

// ─── Collection card (comic book cover style) ─────────────────────
function CollectionCard({ collection, comics, pubBg, user }: { collection: Collection; comics: Comic[]; pubBg: string; user: 'marcelo' | 'walter' }) {
  const owned = comics.filter(
    (c) => (c.series ?? c.title) === collection.name && (c.owner === user || c.owner === 'ambos')
  ).length
  const pct   = collection.total_volumes ? Math.min(100, (owned / collection.total_volumes) * 100) : 0

  return (
    <Link href={`/colecao/c/${collection.id}`} className="group block">
      <div className="border-2 border-foreground/70 rounded-sm overflow-hidden shadow-[3px_3px_0px_rgba(0,0,0,0.55)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.7)] transition-all">
        {/* Cover area */}
        <div className="aspect-[2/3] relative overflow-hidden" style={{ background: pubBg + '15' }}>
          {collection.cover_url ? (
            <img src={collection.cover_url} alt={collection.name} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
              <div
                className="h-12 w-12 rounded-sm flex items-center justify-center border-2 border-foreground/20"
                style={{ background: pubBg + '30' }}
              >
                <BookOpen size={22} style={{ color: pubBg }} />
              </div>
              <p className="font-comic text-[10px] uppercase tracking-wider text-center leading-tight opacity-50">
                sem capa
              </p>
            </div>
          )}
          {/* Copy badge */}
          {owned === 0 && (
            <div className="absolute top-1.5 right-1.5">
              <div className="bg-card/90 border border-foreground/20 rounded-sm px-1.5 py-0.5">
                <Copy size={9} className="text-muted-foreground" />
              </div>
            </div>
          )}
          {/* Omnibus badge */}
          {collection.omnibus && (
            <span className="absolute bottom-1 right-1 bg-yellow-400 text-yellow-950 font-comic text-[7px] uppercase tracking-wide px-1.5 py-0.5 border border-yellow-600 shadow-[1px_1px_0px_rgba(0,0,0,0.4)] leading-none">
              omnibus
            </span>
          )}
        </div>

        {/* Bottom info strip */}
        <div className="border-t-2 border-foreground/70" style={{ background: pubBg }}>
          <div className="px-2 pt-1.5 pb-0.5">
            <p className="font-comic text-[11px] uppercase tracking-wide text-white leading-tight line-clamp-1">
              {collection.name}
            </p>
            <p className="font-comic text-[10px] text-white/70">
              {owned}{collection.total_volumes ? `/${collection.total_volumes}` : ''}
            </p>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-white/20">
            <div
              className="h-full bg-white/80 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── HQ list view ─────────────────────────────────────────────────
function HqListView({ comics }: { comics: Comic[] }) {
  return (
    <div className="border-2 border-foreground/70 rounded-sm overflow-hidden shadow-[3px_3px_0px_rgba(0,0,0,0.55)]">
      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-foreground/15 bg-muted/40">
        <div className="w-7" />
        <span>Título</span>
        <span className="w-16 text-center">Dono</span>
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
              <div className="h-7 w-7 rounded-sm flex items-center justify-center border border-foreground/20" style={{ background: s.bg + '20' }}>
                <PublisherLogo publisher={comic.publisher} size={12} />
              </div>
              <div className="min-w-0 flex items-center gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{comic.title}</p>
                  <p className="text-[10px] text-muted-foreground">{[comic.publisher, comic.year].filter(Boolean).join(' · ')}</p>
                </div>
                {comic.omnibus && (
                  <span className="shrink-0 bg-yellow-400 text-yellow-950 font-comic text-[7px] uppercase tracking-wide px-1.5 py-0.5 border border-yellow-600 leading-none">
                    omnibus
                  </span>
                )}
              </div>
              <span className={cn('font-comic text-sm w-16 text-center shrink-0', ownerColor(comic.owner))}>
                {comic.owner === 'ambos' ? 'Ambos' : comic.owner === 'marcelo' ? 'M' : 'W'}
              </span>
              <span className="font-comic text-sm text-right w-20 tabular-nums shrink-0">
                {formatCurrency(comic.current_value)}
              </span>
            </Link>
          </div>
        )
      })}
    </div>
  )
}

// ─── HQ grid view ─────────────────────────────────────────────────
function HqGridView({ comics }: { comics: Comic[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {comics.map((comic) => {
        const s = pubStyle(comic.publisher ?? 'Outros')
        return (
          <Link key={comic.id} href={`/colecao/${comic.id}`} className="group block">
            <div className="border-2 border-foreground/70 rounded-sm overflow-hidden shadow-[3px_3px_0px_rgba(0,0,0,0.55)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.7)] transition-all">
              <div className="aspect-[2/3] flex items-center justify-center relative" style={{ background: s.bg + '15' }}>
                {comic.cover_url ? (
                  <img src={comic.cover_url} alt={comic.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 p-3 text-center">
                    <PublisherLogo publisher={comic.publisher} size={24} className="opacity-50" />
                    {comic.issue_number != null && (
                      <span className="font-comic text-xl tabular-nums" style={{ color: s.bg }}>#{comic.issue_number}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="border-t-2 border-foreground/70 px-2 py-1.5" style={{ background: s.bg }}>
                <p className="font-comic text-[10px] uppercase tracking-wide text-white leading-tight line-clamp-2">{comic.title}</p>
                <p className={cn('font-comic text-[9px] text-white/70 mt-0.5')}>{formatCurrency(comic.current_value)}</p>
              </div>
              {comic.omnibus && (
                <span className="absolute bottom-9 right-1 bg-yellow-400 text-yellow-950 font-comic text-[7px] uppercase tracking-wide px-1.5 py-0.5 border border-yellow-600 shadow-[1px_1px_0px_rgba(0,0,0,0.4)] leading-none">
                  omnibus
                </span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
