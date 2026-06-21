'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, Check, X, Copy, Pencil, Trash2, BookOpen,
  Shield, Zap, Moon, Layers, Star,
  Sparkles, Globe, Book, type LucideIcon,
} from 'lucide-react'
import {
  getCollections, getComics, addComic, deleteCollection, updateCollection,
} from '@/lib/data'
import { Collection, Comic, Owner } from '@/types'
import { useAuth } from '@/context/auth'
import { cn, formatCurrency, ownerColor } from '@/lib/utils'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── Publisher map ────────────────────────────────────────────────
const PUB: Record<string, { Icon: LucideIcon; bg: string }> = {
  'DC Comics':        { Icon: Shield,       bg: '#0476F2' },
  'Marvel Comics':    { Icon: Zap,          bg: '#EC1D24' },
  'Panini':           { Icon: BookOpen,     bg: '#FF5F00' },
  'DC/Vertigo':       { Icon: Moon,         bg: '#6B21A8' },
  'Image Comics':     { Icon: Layers,       bg: '#E53935' },
  'Pipoca & Nanquim': { Icon: Star,         bg: '#D97706' },
  'Mythos':           { Icon: Sparkles,     bg: '#7C3AED' },
  'Darkside Books':   { Icon: Book,         bg: '#1F2937' },
  'Abril':            { Icon: Globe,        bg: '#16A34A' },
}
function pubStyle(pub: string | null) { return (pub && PUB[pub]) ? PUB[pub] : { Icon: BookOpen, bg: '#64748b' } }

// ─── Copy modal ───────────────────────────────────────────────────
function CopyModal({
  collection, comics, targetOwner, onClose,
}: {
  collection: Collection
  comics: Comic[]
  targetOwner: Owner
  onClose: () => void
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [saving,  setSaving]  = useState(false)

  const alreadyOwned = new Set(
    comics
      .filter(c => (c.series ?? c.title) === collection.name && (c.owner === targetOwner || c.owner === 'ambos'))
      .map(c => c.issue_number ?? c.volume ?? 0)
  )

  function toggle(n: number) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(n) ? next.delete(n) : next.add(n)
      return next
    })
  }

  function selectAll() {
    const all = new Set<number>()
    for (let i = 1; i <= collection.total_volumes; i++) {
      if (!alreadyOwned.has(i)) all.add(i)
    }
    setChecked(all)
  }

  async function handleConfirm() {
    setSaving(true)
    for (const vol of Array.from(checked).sort((a, b) => a - b)) {
      if (!alreadyOwned.has(vol)) {
        await addComic({
          title:          `${collection.name} #${vol}`,
          series:         collection.name,
          issue_number:   vol,
          volume:         null,
          publisher:      collection.publisher,
          year:           null,
          condition:      null,
          purchase_price: null,
          current_value:  null,
          owner:          targetOwner,
          cover_url:      null,
          notes:          null,
          read:           false,
          language:       'pt',
        })
      }
    }
    onClose()
  }

  const vol = Array.from({ length: collection.total_volumes }, (_, i) => i + 1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} />
      <div className="relative border-2 border-foreground/80 bg-card rounded-sm shadow-[6px_6px_0px_rgba(0,0,0,0.7)] w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b-2 border-foreground/70 bg-primary shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-comic text-sm uppercase tracking-widest text-white">Copiar coleção</p>
              <p className="font-comic text-[11px] text-white/70">{collection.name}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-sm">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1">
          <p className="text-xs text-muted-foreground mb-3">
            Marque os volumes que você já tem. Os selecionados serão adicionados à sua coleção como{' '}
            <span className={cn('font-semibold capitalize', ownerColor(targetOwner))}>{targetOwner}</span>.
          </p>

          <div className="flex items-center justify-between mb-2">
            <span className="font-comic text-[11px] uppercase tracking-wider text-muted-foreground">
              {checked.size} selecionado{checked.size !== 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={selectAll}
              className="text-[10px] font-comic uppercase tracking-wider text-primary hover:underline"
            >
              Selecionar todos
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {vol.map((n) => {
              const owned   = alreadyOwned.has(n)
              const selected = checked.has(n)
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => !owned && toggle(n)}
                  disabled={owned}
                  className={cn(
                    'aspect-square rounded-sm border-2 flex items-center justify-center font-comic text-sm transition-all',
                    owned
                      ? 'bg-emerald-500 border-emerald-600 text-white cursor-default'
                      : selected
                        ? 'bg-primary border-primary text-white shadow-[2px_2px_0px_rgba(0,0,0,0.4)]'
                        : 'border-foreground/30 hover:border-foreground/60 hover:bg-muted/50'
                  )}
                  title={owned ? 'Você já tem este volume' : `Volume ${n}`}
                >
                  {owned ? <Check size={12} /> : n}
                </button>
              )
            })}
          </div>

          {alreadyOwned.size > 0 && (
            <p className="text-[10px] text-muted-foreground mt-3">
              <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500 mr-1 align-middle" />
              Verde = você já possui
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t-2 border-foreground/70 flex gap-2 shrink-0">
          <button
            onClick={handleConfirm}
            disabled={checked.size === 0 || saving}
            className={cn(
              'flex-1 py-2 font-comic text-sm uppercase tracking-widest rounded-sm border-2 border-foreground/70 transition-all shadow-[3px_3px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]',
              checked.size > 0 && !saving
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {saving ? 'Adicionando…' : `Adicionar ${checked.size} volume${checked.size !== 1 ? 's' : ''}`}
          </button>
          <button
            onClick={onClose}
            className={cn(buttonVariants({ variant: 'outline' }), 'rounded-sm border-2 border-foreground/50')}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit cover modal ─────────────────────────────────────────────
function EditCoverModal({ collection, onSave, onClose }: {
  collection: Collection
  onSave: (url: string) => void
  onClose: () => void
}) {
  const [url,       setUrl]       = useState(collection.cover_url ?? '')
  const [previewOk, setPreviewOk] = useState(false)

  useEffect(() => {
    if (!url) { setPreviewOk(false); return }
    const img = new window.Image()
    img.onload  = () => setPreviewOk(true)
    img.onerror = () => setPreviewOk(false)
    img.src = url
  }, [url])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50" onClick={onClose} />
      <div className="relative border-2 border-foreground/80 bg-card rounded-sm shadow-[6px_6px_0px_rgba(0,0,0,0.7)] w-full max-w-sm overflow-hidden">
        <div className="px-4 py-3 border-b-2 border-foreground/70 bg-[#0476F2]">
          <p className="font-comic text-sm uppercase tracking-widest text-white">Editar capa</p>
        </div>
        <div className="p-4 space-y-4">
          {/* Preview */}
          <div className="flex gap-3 items-start">
            <div className="w-20 aspect-[2/3] border-2 border-foreground/40 rounded-sm overflow-hidden shrink-0 bg-muted/40 flex items-center justify-center">
              {previewOk
                ? <img src={url} alt="Preview" className="w-full h-full object-cover" />
                : <BookOpen size={20} className="text-muted-foreground opacity-30" />
              }
            </div>
            <div className="flex-1 space-y-2">
              <Label className="font-comic text-[11px] uppercase tracking-widest">URL da imagem</Label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="rounded-sm border-2 border-foreground/40 h-9"
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground">jpg, png, webp…</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSave(url)}
              className="flex-1 py-2 font-comic text-sm uppercase tracking-widest rounded-sm border-2 border-foreground/70 bg-primary text-primary-foreground shadow-[3px_3px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]"
            >
              Salvar
            </button>
            <button onClick={onClose} className={cn(buttonVariants({ variant: 'outline' }), 'rounded-sm border-2 border-foreground/50')}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────
export default function CollectionDetailPage() {
  const { id }            = useParams<{ id: string }>()
  const router            = useRouter()
  const { user }          = useAuth()

  const [collection, setCollection] = useState<Collection | null>(null)
  const [comics,     setComics]     = useState<Comic[]>([])
  const [showCopy,   setShowCopy]   = useState(false)
  const [showEdit,   setShowEdit]   = useState(false)

  useEffect(() => {
    getCollections().then((cols) => setCollection(cols.find((c) => c.id === id) ?? null))
    getComics().then(setComics)
  }, [id])

  if (!collection) return (
    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
      Coleção não encontrada.
    </div>
  )

  const s         = pubStyle(collection.publisher)
  const allComics = comics.filter((c) => (c.series ?? c.title) === collection.name)

  // Per-user owned volumes
  const marceloOwned = new Set(allComics.filter(c => c.owner === 'marcelo' || c.owner === 'ambos').map(c => c.issue_number ?? c.volume ?? 0))
  const walterOwned  = new Set(allComics.filter(c => c.owner === 'walter'  || c.owner === 'ambos').map(c => c.issue_number ?? c.volume ?? 0))

  const currentOwned = user === 'walter' ? walterOwned : marceloOwned
  const currentPct   = Math.min(100, collection.total_volumes > 0 ? (currentOwned.size / collection.total_volumes) * 100 : 0)

  const canCopy      = user !== collection.created_by || collection.created_by === 'ambos'
  const targetOwner  = (user as Owner) ?? 'marcelo'

  async function handleDelete() {
    if (!confirm(`Remover a coleção "${collection!.name}"? Os quadrinhos não serão apagados.`)) return
    await deleteCollection(id)
    router.push('/colecao')
  }

  async function handleSaveCover(url: string) {
    await updateCollection(id, { cover_url: url || null })
    setCollection(prev => prev ? { ...prev, cover_url: url || null } : prev)
    setShowEdit(false)
  }

  const vol = Array.from({ length: collection.total_volumes }, (_, i) => i + 1)

  return (
    <>
      <div className="space-y-5 max-w-3xl mx-auto">
        {/* Back */}
        <div className="flex items-center gap-2">
          <Link href="/colecao" className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'h-8 w-8 rounded-sm border-2 border-foreground/60')}>
            <ArrowLeft size={14} />
          </Link>
          <span className="text-xs text-muted-foreground">{collection.publisher}</span>
        </div>

        {/* Hero card */}
        <div className="border-2 border-foreground/80 rounded-sm overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,0.6)]">
          {/* Publisher header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-foreground/80" style={{ background: s.bg }}>
            <div className="flex items-center gap-2">
              <s.Icon size={13} color="#fff" strokeWidth={2.5} />
              <span className="font-comic text-sm uppercase tracking-[0.18em] text-white">{collection.publisher ?? 'Sem editora'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors text-[10px] font-comic uppercase tracking-wider"
              >
                <Pencil size={10} /> Capa
              </button>
              <button
                onClick={handleDelete}
                className="text-white/60 hover:text-white transition-colors p-0.5"
                title="Remover coleção"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex gap-5 p-4">
            {/* Cover */}
            <div
              className="w-28 aspect-[2/3] border-2 border-foreground/40 rounded-sm overflow-hidden shrink-0 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
              style={{ background: s.bg + '15' }}
              onClick={() => setShowEdit(true)}
              title="Clique para editar a capa"
            >
              {collection.cover_url ? (
                <img src={collection.cover_url} alt={collection.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-center p-2">
                  <s.Icon size={28} style={{ color: s.bg }} className="opacity-40" />
                  <span className="font-comic text-[9px] uppercase tracking-wide opacity-40">Add capa</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <h1 className="font-comic text-[1.6rem] leading-none uppercase tracking-[0.05em]">{collection.name}</h1>
                {collection.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{collection.description}</p>
                )}
              </div>

              {/* Per-user progress */}
              <div className="space-y-2 pt-1">
                {(['marcelo', 'walter'] as Owner[]).map((owner) => {
                  const owned = owner === 'marcelo' ? marceloOwned : walterOwned
                  const pct   = Math.min(100, collection.total_volumes > 0 ? (owned.size / collection.total_volumes) * 100 : 0)
                  return (
                    <div key={owner}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn('font-comic text-[11px] uppercase tracking-wider', ownerColor(owner))}>
                          {owner}
                        </span>
                        <span className="font-comic text-[11px] text-muted-foreground tabular-nums">
                          {owned.size}/{collection.total_volumes}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-sm border border-foreground/20 overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: owner === 'marcelo' ? '#EC1D24' : '#0476F2' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Link
                  href={`/colecao/novo?series=${encodeURIComponent(collection.name)}&publisher=${encodeURIComponent(collection.publisher ?? '')}`}
                  className={cn(buttonVariants({ size: 'sm' }), 'rounded-sm border-2 border-foreground/60 shadow-[2px_2px_0px_rgba(0,0,0,0.45)] font-comic text-[11px] uppercase tracking-wider')}
                >
                  <Plus size={12} className="mr-1" />
                  Add volume
                </Link>
                {canCopy && (
                  <button
                    onClick={() => setShowCopy(true)}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'rounded-sm border-2 border-foreground/60 shadow-[2px_2px_0px_rgba(0,0,0,0.45)] font-comic text-[11px] uppercase tracking-wider')}
                  >
                    <Copy size={12} className="mr-1" />
                    Copiar para minha coleção
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Volumes grid */}
        <div className="border-2 border-foreground/70 rounded-sm overflow-hidden shadow-[3px_3px_0px_rgba(0,0,0,0.5)]">
          <div className="px-4 py-2.5 border-b-2 border-foreground/70" style={{ background: s.bg }}>
            <span className="font-comic text-sm uppercase tracking-[0.18em] text-white">
              Volumes · {collection.total_volumes} total
            </span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-2">
              {vol.map((n) => {
                const mHas = marceloOwned.has(n)
                const wHas = walterOwned.has(n)
                const both = mHas && wHas
                const none = !mHas && !wHas

                // Find comic for this volume
                const comic = allComics.find(c => (c.issue_number ?? c.volume) === n)

                return (
                  <div key={n} className="relative group">
                    <Link
                      href={comic ? `/colecao/${comic.id}` : `/colecao/novo?series=${encodeURIComponent(collection.name)}&issue=${n}&publisher=${encodeURIComponent(collection.publisher ?? '')}`}
                      className={cn(
                        'aspect-[2/3] rounded-sm border-2 flex flex-col items-center justify-center gap-0.5 transition-all font-comic text-sm',
                        both  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[2px_2px_0px_#059669]'
                              : mHas ? 'border-red-400 bg-red-50 text-red-700 shadow-[2px_2px_0px_#DC2626]'
                              : wHas ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-[2px_2px_0px_#2563EB]'
                              : 'border-foreground/20 bg-muted/20 text-muted-foreground hover:border-foreground/40 hover:bg-muted/40'
                      )}
                      title={
                        both  ? `Vol. ${n} — Ambos têm`
                              : mHas ? `Vol. ${n} — Marcelo tem`
                              : wHas ? `Vol. ${n} — Walter tem`
                              : `Vol. ${n} — Nenhum tem · Clique para adicionar`
                      }
                    >
                      <span className="tabular-nums text-[11px] leading-none">{n}</span>
                      {(mHas || wHas) && (
                        <span className="text-[8px] leading-none opacity-70">
                          {both ? 'M+W' : mHas ? 'M' : 'W'}
                        </span>
                      )}
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-foreground/15">
              {[
                { color: 'bg-emerald-500', label: 'Ambos têm' },
                { color: 'bg-red-400',     label: 'Marcelo' },
                { color: 'bg-blue-400',    label: 'Walter' },
                { color: 'bg-muted',       label: 'Nenhum tem' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={cn('w-3 h-3 rounded-sm border border-foreground/20', color)} />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comics list */}
        {allComics.length > 0 && (
          <div className="border-2 border-foreground/70 rounded-sm overflow-hidden shadow-[3px_3px_0px_rgba(0,0,0,0.5)]">
            <div className="px-4 py-2.5 border-b-2 border-foreground/70 bg-foreground">
              <span className="font-comic text-sm uppercase tracking-[0.18em] text-background">
                {allComics.length} HQ{allComics.length !== 1 ? 's' : ''} cadastrada{allComics.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="divide-y divide-foreground/10">
              {allComics
                .sort((a, b) => (a.issue_number ?? a.volume ?? 0) - (b.issue_number ?? b.volume ?? 0))
                .map((comic) => (
                  <Link
                    key={comic.id}
                    href={`/colecao/${comic.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors"
                  >
                    <div
                      className="h-7 w-7 rounded-sm flex items-center justify-center border border-foreground/20 shrink-0"
                      style={{ background: s.bg + '20' }}
                    >
                      <span className="font-comic text-[11px]" style={{ color: s.bg }}>
                        {comic.issue_number ?? comic.volume ?? '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{comic.title}</p>
                      {comic.year && <p className="text-[10px] text-muted-foreground">{comic.year}</p>}
                    </div>
                    <span className={cn('font-comic text-sm shrink-0', ownerColor(comic.owner))}>
                      {comic.owner === 'ambos' ? 'M+W' : comic.owner === 'marcelo' ? 'M' : 'W'}
                    </span>
                    <span className="font-comic text-sm tabular-nums text-muted-foreground shrink-0 w-20 text-right">
                      {formatCurrency(comic.current_value)}
                    </span>
                  </Link>
                ))
              }
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCopy && (
        <CopyModal
          collection={collection}
          comics={comics}
          targetOwner={targetOwner}
          onClose={() => {
            setShowCopy(false)
            getComics().then(setComics)
          }}
        />
      )}
      {showEdit && (
        <EditCoverModal
          collection={collection}
          onSave={handleSaveCover}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  )
}
