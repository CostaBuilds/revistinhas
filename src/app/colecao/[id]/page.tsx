'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Pencil, Check, X } from 'lucide-react'
import Link from 'next/link'
import { Comic, Condition, Owner, conditionLabels, ownerLabels } from '@/types'
import { getComics, updateComic, deleteComic } from '@/lib/data'
import { Input, Select, Textarea } from '@/components/FormField'
import { formatCurrency, ownerColor } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'

const CONDITIONS = [
  { value: 'mint', label: 'Mint' }, { value: 'near_mint', label: 'Near Mint' },
  { value: 'very_fine', label: 'Very Fine' }, { value: 'fine', label: 'Fine' },
  { value: 'very_good', label: 'Very Good' }, { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' }, { value: 'poor', label: 'Poor' },
]
const OWNERS = [
  { value: 'marcelo', label: 'Marcelo' },
  { value: 'walter', label: 'Walter' },
  { value: 'ambos', label: 'Ambos' },
]

export default function ComicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [comic, setComic] = useState<Comic | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Comic>>({})
  const [id, setId] = useState('')

  useEffect(() => {
    params.then(async ({ id }) => {
      setId(id)
      const comics = await getComics()
      const found = comics.find((c) => c.id === id)
      if (found) { setComic(found); setForm(found) }
    })
  }, [params])

  function set(key: keyof Comic, value: string | boolean | null) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    if (!id) return
    try {
      await updateComic(id, form)
      const comics = await getComics()
      const updated = comics.find((c) => c.id === id)
      if (updated) setComic(updated)
      setEditing(false)
    } catch (err) {
      console.error('Erro ao salvar:', err)
      alert('Erro: ' + (err as Error).message)
    }
  }

  async function handleDelete() {
    if (!confirm('Remover este quadrinho?')) return
    try {
      await deleteComic(id)
      router.push('/colecao')
    } catch (err) {
      console.error('Erro ao deletar:', err)
      alert('Erro: ' + (err as Error).message)
    }
  }

  if (!comic) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
      Quadrinho não encontrado.
    </div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/colecao" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8')}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight line-clamp-1">{comic.title}</h1>
            {comic.series && <p className="text-sm text-muted-foreground mt-0.5">{comic.series}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(false); setForm(comic) }}>
                <X size={15} />
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Check size={14} className="mr-1.5" />Salvar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={handleDelete}>
                <Trash2 size={15} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil size={13} className="mr-1.5" />Editar
              </Button>
            </>
          )}
        </div>
      </div>

      {!editing ? (
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-5">
              <div className="flex gap-5">
                <div className="w-28 h-40 rounded-md bg-muted/40 flex items-center justify-center flex-shrink-0 border border-border/40 text-xs text-muted-foreground/50 text-center p-2 overflow-hidden">
                  {comic.cover_url
                    ? <img src={comic.cover_url} alt={comic.title} className="w-full h-full object-cover" />
                    : comic.title}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className={cn('text-xs', ownerColor(comic.owner))}>
                      {ownerLabels[comic.owner]}
                    </Badge>
                    {comic.condition && (
                      <Badge variant="secondary" className="text-xs">
                        {conditionLabels[comic.condition]}
                      </Badge>
                    )}
                    {comic.read && (
                      <Badge variant="secondary" className="text-xs">Lido</Badge>
                    )}
                    {comic.omnibus && (
                      <Badge className="text-xs bg-yellow-400 text-yellow-950 border border-yellow-600 hover:bg-yellow-400">Omnibus</Badge>
                    )}
                  </div>
                  <div className="text-sm space-y-1.5">
                    {[
                      ['Editora', comic.publisher],
                      ['Ano', comic.year],
                      ['Número', comic.issue_number != null ? `#${comic.issue_number}` : null],
                      ['Volume', comic.volume],
                      ['Idioma', comic.language === 'pt' ? 'Português' : comic.language === 'en' ? 'Inglês' : comic.language],
                    ].filter(([, v]) => v != null).map(([k, v]) => (
                      <div key={String(k)} className="flex gap-2">
                        <span className="text-muted-foreground w-16 flex-shrink-0">{k}</span>
                        <span className="text-foreground/90">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            {comic.owner === 'ambos' ? (
              <Card className="border-border/60 col-span-2">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">Preço pago</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Marcelo</p>
                      <p className="text-lg font-semibold tabular-nums">{formatCurrency(comic.purchase_price_marcelo ?? null)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Walter</p>
                      <p className="text-lg font-semibold tabular-nums">{formatCurrency(comic.purchase_price_walter ?? null)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/60">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Preço pago</p>
                  <p className="text-xl font-semibold mt-0.5 tabular-nums">{formatCurrency(comic.purchase_price)}</p>
                </CardContent>
              </Card>
            )}
            <Card className={comic.owner === 'ambos' ? 'border-border/60 col-span-2' : 'border-border/60'}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Valor atual</p>
                <p className="text-xl font-semibold mt-0.5 tabular-nums">{formatCurrency(comic.current_value)}</p>
              </CardContent>
            </Card>
          </div>

          {comic.notes && (
            <Card className="border-border/60">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1.5">Notas</p>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comic.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-5 space-y-4">
            <Input label="Título *" value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Série" value={form.series ?? ''} onChange={(e) => set('series', e.target.value)} />
              <Input label="Editora" value={form.publisher ?? ''} onChange={(e) => set('publisher', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Número" type="number" value={form.issue_number ?? ''} onChange={(e) => set('issue_number', e.target.value)} />
              <Input label="Volume" type="number" value={form.volume ?? ''} onChange={(e) => set('volume', e.target.value)} />
              <Input label="Ano" type="number" value={form.year ?? ''} onChange={(e) => set('year', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Condição" value={form.condition ?? ''} onChange={(v) => set('condition', v as Condition)} options={CONDITIONS} />
              <Select label="Dono" value={form.owner ?? 'marcelo'} onChange={(v) => set('owner', v as Owner)} options={OWNERS} />
            </div>
            {form.owner === 'ambos' ? (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Preço pago — Marcelo (R$)" type="text" value={String(form.purchase_price_marcelo ?? '')} onChange={(e) => set('purchase_price_marcelo', e.target.value)} />
                <Input label="Preço pago — Walter (R$)" type="text" value={String(form.purchase_price_walter ?? '')} onChange={(e) => set('purchase_price_walter', e.target.value)} />
              </div>
            ) : (
              <Input label="Preço pago (R$)" type="text" value={String(form.purchase_price ?? '')} onChange={(e) => set('purchase_price', e.target.value)} />
            )}
            <Input label="Valor atual (R$)" type="text" value={String(form.current_value ?? '')} onChange={(e) => set('current_value', e.target.value)} />
            <Input label="URL da capa" type="url" value={form.cover_url ?? ''} onChange={(e) => set('cover_url', e.target.value)} />
            <Textarea label="Notas" value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="read-edit" checked={form.read ?? false} onChange={(e) => set('read', e.target.checked)} className="h-4 w-4 rounded" />
                <Label htmlFor="read-edit" className="text-sm font-normal cursor-pointer">Já li</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="omnibus-edit" checked={form.omnibus ?? false} onChange={(e) => set('omnibus', e.target.checked)} className="h-4 w-4 rounded" />
                <Label htmlFor="omnibus-edit" className="text-sm font-normal cursor-pointer">
                  Omnibus <span className="text-[10px] text-yellow-500 font-comic">(OT)</span>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
