'use client'

import { useEffect, useState } from 'react'
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react'
import { Comic, ownerLabels } from '@/types'
import { getComics } from '@/lib/data'
import { cn, formatCurrency, ownerColor } from '@/lib/utils'
import { conditionLabels } from '@/types'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

interface SeriesData {
  name: string
  comics: Comic[]
  totalValue: number
  publishers: string[]
  owners: string[]
}

export default function SeriesPage() {
  const [series, setSeries] = useState<SeriesData[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  useEffect(() => {
    getComics().then((comics) => {
    const map = new Map<string, Comic[]>()
    comics.forEach((c) => {
      const key = c.series ?? `— ${c.title}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    })
    const list: SeriesData[] = Array.from(map.entries()).map(([name, items]) => ({
      name,
      comics: items.sort((a, b) => (a.issue_number ?? 0) - (b.issue_number ?? 0)),
      totalValue: items.reduce((s, c) => s + (c.current_value ?? 0), 0),
      publishers: [...new Set(items.map((c) => c.publisher).filter(Boolean))] as string[],
      owners: [...new Set(items.map((c) => c.owner))],
    }))
    setSeries(list.sort((a, b) => b.comics.length - a.comics.length))
    })
  }, [])

  function toggle(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const filtered = series.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Séries</h1>
        <p className="text-sm text-muted-foreground mt-1">{series.length} série{series.length !== 1 ? 's' : ''}</p>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar série…"
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">Nenhuma série encontrada.</p>
      ) : (
        <div className="rounded-lg border border-border/60 overflow-hidden divide-y divide-border/60">
          {filtered.map((s) => {
            const isOpen = expanded.has(s.name)
            const issues = s.comics.map((c) => c.issue_number).filter(Boolean) as number[]
            const maxIssue = issues.length > 0 ? Math.max(...issues) : 0
            const pct = maxIssue > 0 ? Math.round((issues.length / maxIssue) * 100) : 100
            const missing = maxIssue > 0
              ? Array.from({ length: maxIssue }, (_, i) => i + 1).filter((n) => !issues.includes(n))
              : []

            return (
              <div key={s.name}>
                <button
                  onClick={() => toggle(s.name)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="h-12 w-8 bg-muted/50 rounded flex items-center justify-center flex-shrink-0">
                    <BookOpen size={13} className="text-muted-foreground/60" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{s.name}</span>
                      {s.owners.map((o) => (
                        <span key={o} className={cn('text-xs font-medium', ownerColor(o))}>
                          {ownerLabels[o as keyof typeof ownerLabels]}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{s.comics.length} exemplar{s.comics.length !== 1 ? 'es' : ''}</span>
                      {s.publishers[0] && <span>{s.publishers[0]}</span>}
                      <span className="ml-auto">{formatCurrency(s.totalValue)}</span>
                    </div>

                    {maxIssue > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={pct} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
                      </div>
                    )}
                  </div>

                  <div className="text-muted-foreground flex-shrink-0 ml-2">
                    {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="bg-muted/10 px-5 py-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {s.comics.map((comic) => (
                        <div key={comic.id} className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-card border border-border/40">
                          <span className="text-primary text-xs font-mono font-semibold w-8 flex-shrink-0">
                            {comic.issue_number != null ? `#${comic.issue_number}` : comic.volume != null ? `v${comic.volume}` : '—'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium truncate">{comic.title}</p>
                            {comic.year && <p className="text-xs text-muted-foreground">{comic.year}</p>}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            {comic.condition && (
                              <Badge variant="outline" className="text-xs px-1 py-0 h-4 hidden sm:inline-flex">
                                {conditionLabels[comic.condition]}
                              </Badge>
                            )}
                            <span className={cn('text-xs font-medium', ownerColor(comic.owner))}>
                              {comic.owner === 'ambos' ? 'A' : comic.owner === 'marcelo' ? 'M' : 'W'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {missing.length > 0 && (
                      <div className="rounded-md border border-dashed border-border/60 px-3 py-2">
                        <p className="text-xs text-muted-foreground mb-1">Faltando:</p>
                        <p className="text-xs font-medium text-muted-foreground/70">
                          {missing.map((n) => `#${n}`).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
