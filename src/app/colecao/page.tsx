'use client'

import { useEffect, useState } from 'react'
import { Plus, LayoutGrid, List, Search } from 'lucide-react'
import { Comic, ownerLabels, conditionLabels, Owner } from '@/types'
import { getComics, deleteComic } from '@/lib/data'
import ComicCard from '@/components/ComicCard'
import { cn, formatCurrency, ownerColor } from '@/lib/utils'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type ViewMode = 'grid' | 'list'

export default function ColecaoPage() {
  const [comics, setComics] = useState<Comic[]>([])
  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState<Owner | 'todos'>('todos')
  const [view, setView] = useState<ViewMode>('grid')

  useEffect(() => { setComics(getComics()) }, [])

  function handleDelete(id: string) {
    if (!confirm('Remover este quadrinho?')) return
    deleteComic(id)
    setComics(getComics())
  }

  const filtered = comics.filter((c) => {
    const matchOwner = ownerFilter === 'todos' || c.owner === ownerFilter || c.owner === 'ambos'
    const q = search.toLowerCase()
    const matchSearch = !q || c.title.toLowerCase().includes(q) || (c.series ?? '').toLowerCase().includes(q) || (c.publisher ?? '').toLowerCase().includes(q)
    return matchOwner && matchSearch
  })

  const totalValue = filtered.reduce((s, c) => s + (c.current_value ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Coleção</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} quadrinho{filtered.length !== 1 ? 's' : ''} · {formatCurrency(totalValue)}
          </p>
        </div>
        <Link href="/colecao/novo" className={cn(buttonVariants({ size: 'sm' }))}>
          <Plus size={14} className="mr-1.5" />
          Adicionar
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar título, série, editora…"
            className="pl-9"
          />
        </div>

        <div className="flex items-center rounded-md border border-border/60 bg-muted/30 overflow-hidden">
          {(['todos', 'marcelo', 'walter'] as const).map((o) => (
            <button
              key={o}
              onClick={() => setOwnerFilter(o)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors capitalize',
                ownerFilter === o ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {o === 'todos' ? 'Todos' : o.charAt(0).toUpperCase() + o.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center rounded-md border border-border/60 bg-muted/30 overflow-hidden">
          <button
            onClick={() => setView('grid')}
            className={cn('p-1.5 transition-colors', view === 'grid' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn('p-1.5 transition-colors', view === 'list' ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground text-sm">Nenhum quadrinho encontrado.</p>
          <Link href="/colecao/novo" className={cn(buttonVariants({ variant: 'link', size: 'sm' }), 'mt-1')}>
            Adicionar →
          </Link>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((comic) => (
            <ComicCard key={comic.id} comic={comic} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          {filtered.map((comic, i) => (
            <div key={comic.id}>
              {i > 0 && <Separator />}
              <Link
                href={`/colecao/${comic.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="h-12 w-8 bg-muted/60 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground">
                  {comic.issue_number ? `#${comic.issue_number}` : '—'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{comic.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {[comic.series, comic.publisher, comic.year].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {comic.condition && (
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                      {conditionLabels[comic.condition]}
                    </Badge>
                  )}
                  <span className={cn('text-xs font-medium', ownerColor(comic.owner))}>
                    {ownerLabels[comic.owner]}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums w-20 text-right">
                    {formatCurrency(comic.current_value)}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
