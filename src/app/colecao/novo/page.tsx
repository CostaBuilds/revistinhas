'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Input, Select, Textarea } from '@/components/FormField'
import { addComic } from '@/lib/data'
import { cn } from '@/lib/utils'
import { Condition, Owner } from '@/types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'

const CONDITIONS = [
  { value: 'mint', label: 'Mint' },
  { value: 'near_mint', label: 'Near Mint' },
  { value: 'very_fine', label: 'Very Fine' },
  { value: 'fine', label: 'Fine' },
  { value: 'very_good', label: 'Very Good' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
]

const OWNERS = [
  { value: 'marcelo', label: 'Marcelo' },
  { value: 'walter', label: 'Walter' },
  { value: 'ambos', label: 'Ambos' },
]

const LANGS = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'Inglês' },
  { value: 'es', label: 'Espanhol' },
  { value: 'other', label: 'Outro' },
]

function NovoComicForm() {
  const router  = useRouter()
  const params  = useSearchParams()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(() => {
    const series = params.get('series') ?? ''
    const issue  = params.get('issue')  ?? ''
    const pub    = params.get('publisher') ?? ''
    return {
      title: series && issue ? `${series} #${issue}` : '',
      series, issue_number: issue, volume: '', publisher: pub,
      year: '', condition: '', purchase_price: '', purchase_price_marcelo: '', purchase_price_walter: '', current_value: '',
      owner: 'marcelo', cover_url: '', notes: '', read: false, omnibus: false, language: 'pt',
    }
  })

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await addComic({
        title: form.title.trim(),
        series: form.series.trim() || null,
        issue_number: form.issue_number ? parseInt(form.issue_number) : null,
        volume: form.volume ? parseInt(form.volume) : null,
        publisher: form.publisher.trim() || null,
        year: form.year ? parseInt(form.year) : null,
        condition: (form.condition as Condition) || null,
        purchase_price: form.owner !== 'ambos' && form.purchase_price ? parseFloat(form.purchase_price.replace(',', '.')) : null,
        purchase_price_marcelo: form.owner === 'ambos' && form.purchase_price_marcelo ? parseFloat(form.purchase_price_marcelo.replace(',', '.')) : null,
        purchase_price_walter: form.owner === 'ambos' && form.purchase_price_walter ? parseFloat(form.purchase_price_walter.replace(',', '.')) : null,
        current_value: form.current_value ? parseFloat(form.current_value.replace(',', '.')) : null,
        owner: form.owner as Owner,
        cover_url: form.cover_url.trim() || null,
        notes: form.notes.trim() || null,
        read: form.read,
        omnibus: form.omnibus as boolean,
        language: form.language,
      })
      router.push('/colecao')
    } catch (err) {
      console.error('Erro ao salvar HQ:', err)
      setSaving(false)
      alert('Erro ao salvar: ' + (err as Error).message)
    }
  }

  const fromSeries = !!params.get('series')

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={fromSeries ? `/colecao` : '/colecao'} className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-8 w-8')}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Adicionar quadrinho</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Novo item para a coleção</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-border/60">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Identificação</p>
            <Input label="Título *" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex: Batman #1" required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Série" value={form.series} onChange={(e) => set('series', e.target.value)} placeholder="Ex: Batman" />
              <Input label="Editora" value={form.publisher} onChange={(e) => set('publisher', e.target.value)} placeholder="Ex: DC Comics" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Número" type="number" value={form.issue_number} onChange={(e) => set('issue_number', e.target.value)} placeholder="1" min="0" />
              <Input label="Volume" type="number" value={form.volume} onChange={(e) => set('volume', e.target.value)} placeholder="1" min="0" />
              <Input label="Ano" type="number" value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="1986" min="1900" max="2099" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado & Valor</p>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Condição" value={form.condition} onChange={(v) => set('condition', v)} options={CONDITIONS} />
              <Select label="Idioma" value={form.language} onChange={(v) => set('language', v)} options={LANGS} />
            </div>
            {form.owner === 'ambos' ? (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Preço pago — Marcelo (R$)" type="text" inputMode="decimal" value={form.purchase_price_marcelo} onChange={(e) => set('purchase_price_marcelo', e.target.value)} placeholder="0,00" />
                <Input label="Preço pago — Walter (R$)" type="text" inputMode="decimal" value={form.purchase_price_walter} onChange={(e) => set('purchase_price_walter', e.target.value)} placeholder="0,00" />
              </div>
            ) : (
              <Input label="Preço pago (R$)" type="text" inputMode="decimal" value={form.purchase_price} onChange={(e) => set('purchase_price', e.target.value)} placeholder="0,00" />
            )}
            <Input label="Valor atual (R$)" type="text" inputMode="decimal" value={form.current_value} onChange={(e) => set('current_value', e.target.value)} placeholder="0,00" />
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dono & Extras</p>
            <Select label="Dono" value={form.owner} onChange={(v) => set('owner', v)} options={OWNERS} />
            <Input label="URL da capa" type="url" value={form.cover_url} onChange={(e) => set('cover_url', e.target.value)} placeholder="https://…" />
            <Textarea label="Notas" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Anotações…" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="read" checked={form.read} onChange={(e) => set('read', e.target.checked)} className="h-4 w-4 rounded" />
                <Label htmlFor="read" className="text-sm font-normal cursor-pointer">Já li</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="omnibus" checked={form.omnibus as boolean} onChange={(e) => set('omnibus', e.target.checked)} className="h-4 w-4 rounded" />
                <Label htmlFor="omnibus" className="text-sm font-normal cursor-pointer">
                  Omnibus <span className="text-[10px] text-yellow-500 font-comic">(OT)</span>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 pb-8">
          <Link href="/colecao" className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 text-center')}>
            Cancelar
          </Link>
          <Button type="submit" className="flex-1" disabled={saving || !form.title.trim()}>
            {saving ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function NovoComicPage() {
  return <Suspense><NovoComicForm /></Suspense>
}
