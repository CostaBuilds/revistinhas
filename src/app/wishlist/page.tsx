'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, ShoppingCart } from 'lucide-react'
import { WishlistItem, Priority, Owner, priorityLabels, ownerLabels } from '@/types'
import { getWishlist, addWishlistItem, deleteWishlistItem, acquireWishlistItem } from '@/lib/data'
import { cn, formatCurrency, ownerColor, priorityColor } from '@/lib/utils'
import Modal from '@/components/Modal'
import { Input, Select, Textarea } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const PRIORITIES: Priority[] = ['alta', 'media', 'baixa']

const PRIORITY_OPTS = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
]

const OWNER_OPTS = [
  { value: 'marcelo', label: 'Marcelo' },
  { value: 'walter', label: 'Walter' },
  { value: 'ambos', label: 'Ambos' },
]

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [ownerFilter, setOwnerFilter] = useState<Owner | 'todos'>('todos')
  const [form, setForm] = useState({
    title: '', series: '', issue_number: '', volume: '', publisher: '',
    priority: 'media' as Priority, owner: 'marcelo' as Owner,
    estimated_price: '', notes: '',
  })

  useEffect(() => { getWishlist().then(setWishlist) }, [])

  function refresh() { getWishlist().then(setWishlist) }

  function setF(key: string, value: string) { setForm((f) => ({ ...f, [key]: value })) }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    await addWishlistItem({
      title: form.title.trim(),
      series: form.series.trim() || null,
      issue_number: form.issue_number ? parseInt(form.issue_number) : null,
      volume: form.volume ? parseInt(form.volume) : null,
      publisher: form.publisher.trim() || null,
      priority: form.priority,
      owner: form.owner,
      estimated_price: form.estimated_price ? parseFloat(form.estimated_price.replace(',', '.')) : null,
      notes: form.notes.trim() || null,
    })
    setForm({ title: '', series: '', issue_number: '', volume: '', publisher: '', priority: 'media', owner: 'marcelo', estimated_price: '', notes: '' })
    setShowModal(false)
    refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover da wishlist?')) return
    await deleteWishlistItem(id)
    refresh()
  }

  async function handleAcquire(id: string) {
    if (!confirm('Mover para a coleção?')) return
    await acquireWishlistItem(id)
    refresh()
  }

  const filtered = wishlist.filter((w) => ownerFilter === 'todos' || w.owner === ownerFilter || w.owner === 'ambos')
  const totalEstimated = filtered.reduce((s, w) => s + (w.estimated_price ?? 0), 0)
  const byPriority: Record<Priority, WishlistItem[]> = {
    alta: filtered.filter((w) => w.priority === 'alta'),
    media: filtered.filter((w) => w.priority === 'media'),
    baixa: filtered.filter((w) => w.priority === 'baixa'),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Wishlist</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} iten{filtered.length !== 1 ? 's' : ''} · {formatCurrency(totalEstimated)}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} className="mr-1.5" />Adicionar
        </Button>
      </div>

      <div className="flex items-center rounded-md border border-border/60 bg-muted/30 overflow-hidden w-fit">
        {(['todos', 'marcelo', 'walter'] as const).map((o) => (
          <button
            key={o}
            onClick={() => setOwnerFilter(o)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors',
              ownerFilter === o ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {o === 'todos' ? 'Todos' : o.charAt(0).toUpperCase() + o.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-sm text-muted-foreground">Wishlist vazia.</p>
          <Button variant="link" size="sm" onClick={() => setShowModal(true)} className="mt-1">
            Adicionar item →
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {PRIORITIES.filter((p) => byPriority[p].length > 0).map((priority) => (
            <div key={priority}>
              <div className="flex items-center gap-2 mb-3">
                <span className={cn('text-xs font-semibold uppercase tracking-wider', priorityColor(priority))}>
                  {priorityLabels[priority]}
                </span>
                <span className="text-xs text-muted-foreground">{byPriority[priority].length}</span>
              </div>
              <div className="rounded-lg border border-border/60 overflow-hidden divide-y divide-border/60">
                {byPriority[priority].map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {[item.series, item.publisher, item.issue_number ? `#${item.issue_number}` : null].filter(Boolean).join(' · ')}
                      </p>
                      {item.notes && <p className="text-xs text-muted-foreground/60 mt-1 italic">{item.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn('text-xs font-medium hidden sm:inline', ownerColor(item.owner))}>
                        {ownerLabels[item.owner]}
                      </span>
                      {item.estimated_price != null && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatCurrency(item.estimated_price)}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-emerald-400"
                        onClick={() => handleAcquire(item.id)}
                        title="Marcar como adquirido"
                      >
                        <ShoppingCart size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal title="Adicionar à Wishlist" open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleAdd} className="space-y-3 mt-2">
          <Input label="Título *" value={form.title} onChange={(e) => setF('title', e.target.value)} placeholder="Ex: Watchmen #4" required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Série" value={form.series} onChange={(e) => setF('series', e.target.value)} />
            <Input label="Editora" value={form.publisher} onChange={(e) => setF('publisher', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Número" type="number" value={form.issue_number} onChange={(e) => setF('issue_number', e.target.value)} placeholder="#" />
            <Input label="Volume" type="number" value={form.volume} onChange={(e) => setF('volume', e.target.value)} placeholder="v" />
            <Input label="Preço est." value={form.estimated_price} onChange={(e) => setF('estimated_price', e.target.value)} placeholder="0,00" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Prioridade" value={form.priority} onChange={(v) => setF('priority', v)} options={PRIORITY_OPTS} />
            <Select label="Dono" value={form.owner} onChange={(v) => setF('owner', v)} options={OWNER_OPTS} />
          </div>
          <Textarea label="Notas" value={form.notes} onChange={(e) => setF('notes', e.target.value)} placeholder="Notas opcionais…" rows={2} />
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Adicionar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
