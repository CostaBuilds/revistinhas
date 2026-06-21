'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, LayoutGrid, List, BookOpen, Copy } from 'lucide-react'
import { Comic, Collection, Owner } from '@/types'
import { getComics, getCollections } from '@/lib/data'
import { cn, formatCurrency, ownerColor } from '@/lib/utils'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Shield, Zap, BookOpen as BookOpenIcon, Moon, Layers, Star, Sparkles, Globe, Book,
  type LucideIcon,
} from 'lucide-react'

// ─── Publisher identity (same as dashboard) ───────────────────────
const PUB: Record<string, { Icon: LucideIcon; bg: string }> = {
  'DC Comics':        { Icon: Shield,       bg: '#0476F2' },
  'Marvel Comics':    { Icon: Zap,          bg: '#EC1D24' },
  'Panini':           { Icon: BookOpenIcon, bg: '#FF5F00' },
  'DC/Vertigo':       { Icon: Moon,         bg: '#6B21A8' },
  'Image Comics':     { Icon: Layers,       bg: '#E53935' },
  'Pipoca & Nanquim': { Icon: Star,         bg: '#D97706' },
  'Mythos':           { Icon: Sparkles,     bg: '#7C3AED' },
  'Darkside Books':   { Icon: Book,         bg: '#1F2937' },
  'Abril':            { Icon: Globe,        bg: '#16A34A' },
}
const PUB_DEFAULT = { Icon: BookOpen, bg: '#64748b' }
function pubStyle(pub: string) { return PUB[pub] ?? PUB_DEFAULT }

type Tab = 'colecoes' | 'hqs'

export default function ColecaoPage() {
  const [comics, setComics]         = useState<Comic[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [search, setSearch]         = useState('')
  const [ownerFilter, setOwnerFilter] = useState<Owner | 'todos'>('todos')
  const [tab, setTab]               = useState<Tab>('colecoes')
  const [listView, setListView]     = useState(false)

  useEffect(() => {
    setComics(getComics())
    setCollections(getCollections())
  }, [])

  // ── Filtered collections ──────────────────────────────────────
  const filteredCols = collections.filter((col) => {
    const q = search.toLowerCase()
    const matchSearch = !q || col.name.toLowerCase().includes(q) || (col.publisher ?? '').toLowerCase().includes(q)
    const matchOwner  = ownerFilter === 'todos' || col.created_by === ownerFilter || col.created_by === 'ambos'
    return matchSearch && matchOwner
  })

  // ── Filtered HQs ─────────────────────────────────────────────
  const filteredHqs = comics.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.title.toLowerCase().includes(q) || (c.series ?? '').toLowerCase().includes(q) || (c.publisher ?? '').toLowerCase().includes(q)
    const matchOwner  = ownerFilter === 'todos' || c.owner === ownerFilter || c.owner === 'ambos'
    return matchSearch && matchOwner
  })

  // ── Group collections by publisher ────────────────────────────
  const byPublisher = filteredCols.reduce<Record<string, Collection[]>>((acc, col) => {
    const pub = col.publisher ?? 'Outros'
    if (!acc[pub]) acc[pub] = []
    acc[pub].push(col)
    return acc
  }, {})

  const publishers = Object.keys(byPublisher).sort()

  const totalValue = filteredHqs.reduce((s, c) => s + (c.current_value ?? 0), 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-comic text-[1.8rem] leading-none uppercase tracking-[0.05em]">Coleção</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {tab === 'colecoes'
              ? `${filteredCols.length} coleção${filteredCols.length !== 1 ? 'ões' : ''}`
              : `${filteredHqs.length} HQ${filteredHqs.length !== 1 ? 's' : ''} · ${formatCurrency(totalValue)}`}
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
                    <s.Icon size={14} color="#fff" strokeWidth={2.5} />
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
                    <CollectionCard key={col.id} collection={col} comics={comics} pubBg={s.bg} />
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
        filteredHqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground text-sm">Nenhum quadrinho encontrado.</p>
            <Link href="/colecao/novo" className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'mt-1')}>Adicionar →</Link>
          </div>
        ) : listView ? (
          <HqListView comics={filteredHqs} />
        ) : (
          <HqGridView comics={filteredHqs} />
        )
      )}
    </div>
  )
}

// ─── Collection card (comic book cover style) ─────────────────────
function CollectionCard({ collection, comics, pubBg }: { collection: Collection; comics: Comic[]; pubBg: string }) {
  const owned = comics.filter(
    (c) => (c.series ?? c.title) === collection.name
  ).length
  const pct   = Math.min(100, collection.total_volumes > 0 ? (owned / collection.total_volumes) * 100 : 0)

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
        </div>

        {/* Bottom info strip */}
        <div className="border-t-2 border-foreground/70" style={{ background: pubBg }}>
          <div className="px-2 pt-1.5 pb-0.5">
            <p className="font-comic text-[11px] uppercase tracking-wide text-white leading-tight line-clamp-1">
              {collection.name}
            </p>
            <p className="font-comic text-[10px] text-white/70">
              {owned}/{collection.total_volumes}
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
                <s.Icon size={12} style={{ color: s.bg }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{comic.title}</p>
                <p className="text-[10px] text-muted-foreground">{[comic.publisher, comic.year].filter(Boolean).join(' · ')}</p>
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
                    <s.Icon size={24} style={{ color: s.bg }} className="opacity-50" />
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
            </div>
          </Link>
        )
      })}
    </div>
  )
}
