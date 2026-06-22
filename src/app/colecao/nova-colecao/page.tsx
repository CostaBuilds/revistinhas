'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Image as ImageIcon, BookOpen } from 'lucide-react'
import { addCollection } from '@/lib/data'
import { Owner } from '@/types'
import { useAuth } from '@/context/auth'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const KNOWN_PUBLISHERS = [
  'DC Comics', 'Marvel Comics', 'Panini', 'DC/Vertigo',
  'Image Comics', 'Pipoca & Nanquim', 'Mythos', 'Darkside Books', 'Abril',
]

function NovaColecaoForm() {
  const router       = useRouter()
  const params       = useSearchParams()
  const { user }     = useAuth()

  const [name,         setName]         = useState('')
  const [publisher,    setPublisher]     = useState(params.get('publisher') ?? '')
  const [coverUrl,     setCoverUrl]      = useState('')
  const [totalVolumes, setTotalVolumes]  = useState('')
  const [description,  setDescription]   = useState('')
  const [omnibus,      setOmnibus]       = useState(false)
  const [saving,       setSaving]        = useState(false)
  const [previewOk,    setPreviewOk]     = useState(false)

  useEffect(() => {
    if (!coverUrl) { setPreviewOk(false); return }
    const img = new window.Image()
    img.onload  = () => setPreviewOk(true)
    img.onerror = () => setPreviewOk(false)
    img.src = coverUrl
  }, [coverUrl])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await addCollection({
        name:          name.trim(),
        publisher:     publisher.trim() || null,
        cover_url:     previewOk ? coverUrl.trim() : null,
        total_volumes: totalVolumes.trim() ? parseInt(totalVolumes) : null,
        created_by:    (user as Owner) ?? 'marcelo',
        description:   description.trim() || null,
        omnibus,
      })
      router.push('/colecao')
    } catch (err) {
      console.error('Erro ao criar coleção:', err)
      setSaving(false)
      alert('Erro ao salvar: ' + (err as Error).message)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/colecao" className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'h-8 w-8 rounded-sm border-2 border-foreground/60')}>
          <ArrowLeft size={14} />
        </Link>
        <div>
          <h1 className="font-comic text-[1.6rem] leading-none uppercase tracking-[0.05em]">Nova Coleção</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Defina a série e quantos volumes existem</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cover preview + URL */}
        <div className="border-2 border-foreground/70 rounded-sm overflow-hidden shadow-[3px_3px_0px_rgba(0,0,0,0.5)]">
          {/* Header strip */}
          <div className="px-4 py-2 bg-primary border-b-2 border-foreground/70">
            <span className="font-comic text-sm text-white uppercase tracking-widest">Capa da Coleção</span>
          </div>
          <div className="p-4 flex gap-4 items-start">
            {/* Cover preview */}
            <div className="w-24 aspect-[2/3] border-2 border-foreground/40 rounded-sm overflow-hidden flex items-center justify-center shrink-0 bg-muted/40">
              {previewOk ? (
                <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground p-2 text-center">
                  <ImageIcon size={20} className="opacity-30" />
                  <span className="text-[9px] uppercase tracking-wide opacity-50">Capa</span>
                </div>
              )}
            </div>
            {/* URL field */}
            <div className="flex-1 space-y-2">
              <Label className="font-comic text-[11px] uppercase tracking-widest">URL da imagem</Label>
              <Input
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://…"
                className="rounded-sm border-2 border-foreground/40 h-9 text-sm"
              />
              <p className="text-[10px] text-muted-foreground">
                Cole o link de uma imagem de capa (jpg, png, webp…)
              </p>
            </div>
          </div>
        </div>

        {/* Series info */}
        <div className="border-2 border-foreground/70 rounded-sm overflow-hidden shadow-[3px_3px_0px_rgba(0,0,0,0.5)]">
          <div className="px-4 py-2 bg-[#0476F2] border-b-2 border-foreground/70">
            <span className="font-comic text-sm text-white uppercase tracking-widest">Informações</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label className="font-comic text-[11px] uppercase tracking-widest">Nome da série *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Watchmen, Batman, Saga…"
                required
                className="rounded-sm border-2 border-foreground/40 h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-comic text-[11px] uppercase tracking-widest">Editora</Label>
              <div className="space-y-2">
                <Input
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="DC Comics, Marvel, Panini…"
                  list="publishers-list"
                  className="rounded-sm border-2 border-foreground/40 h-9"
                />
                <datalist id="publishers-list">
                  {KNOWN_PUBLISHERS.map((p) => <option key={p} value={p} />)}
                </datalist>
                {/* Quick select */}
                <div className="flex flex-wrap gap-1.5">
                  {KNOWN_PUBLISHERS.slice(0, 5).map((p) => (
                    <button
                      key={p} type="button"
                      onClick={() => setPublisher(p)}
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-medium rounded-sm border transition-colors',
                        publisher === p
                          ? 'border-foreground/60 bg-foreground text-background'
                          : 'border-foreground/30 hover:border-foreground/50'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-comic text-[11px] uppercase tracking-widest">
                Total de volumes <span className="text-muted-foreground normal-case font-sans text-[10px]">(opcional)</span>
              </Label>
              <Input
                type="number"
                min="1"
                max="9999"
                value={totalVolumes}
                onChange={(e) => setTotalVolumes(e.target.value)}
                placeholder="Em aberto"
                className="rounded-sm border-2 border-foreground/40 h-9 w-32"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-comic text-[11px] uppercase tracking-widest">Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Alan Moore, 1986–87… (opcional)"
                rows={2}
                className="rounded-sm border-2 border-foreground/40 resize-none text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox" id="omnibus-new"
                checked={omnibus}
                onChange={(e) => setOmnibus(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <Label htmlFor="omnibus-new" className="text-sm font-normal cursor-pointer">
                Omnibus <span className="text-[10px] text-yellow-500 font-comic">(edição que coleta múltiplos volumes)</span>
              </Label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!name.trim() || saving}
            className={cn(
              'flex-1 py-2.5 font-comic text-sm uppercase tracking-widest rounded-sm border-2 border-foreground/70 transition-all shadow-[3px_3px_0px_rgba(0,0,0,0.5)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]',
              name.trim() && !saving
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {saving ? 'Salvando…' : 'Criar Coleção'}
          </button>
          <Link href="/colecao" className={cn(buttonVariants({ variant: 'outline' }), 'rounded-sm border-2 border-foreground/50')}>
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}

export default function NovaColecaoPage() {
  return (
    <Suspense>
      <NovaColecaoForm />
    </Suspense>
  )
}
