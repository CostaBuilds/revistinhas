'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { Goal, GoalType, Owner, goalTypeLabels, ownerLabels } from '@/types'
import { getGoals, addGoal, updateGoal, deleteGoal } from '@/lib/data'
import { cn, formatCurrency, ownerColor } from '@/lib/utils'
import Modal from '@/components/Modal'
import { Input, Select, Textarea } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

const GOAL_TYPES = [
  { value: 'serie', label: 'Completar Série' },
  { value: 'quantidade', label: 'Quantidade' },
  { value: 'valor', label: 'Valor' },
  { value: 'outro', label: 'Outro' },
]

const OWNER_OPTS = [
  { value: 'ambos', label: 'Ambos' },
  { value: 'marcelo', label: 'Marcelo' },
  { value: 'walter', label: 'Walter' },
]

export default function MetasPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'todas' | 'ativas' | 'concluidas'>('todas')
  const [form, setForm] = useState({
    title: '', description: '', type: 'outro' as GoalType, owner: 'ambos' as Owner,
    target_date: '', progress_current: '', progress_target: '',
  })

  useEffect(() => { getGoals().then(setGoals) }, [])

  function refresh() { getGoals().then(setGoals) }

  function setF(key: string, value: string) { setForm((f) => ({ ...f, [key]: value })) }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    try {
      await addGoal({
        title: form.title.trim(),
        description: form.description.trim() || null,
        type: form.type,
        owner: form.owner,
        target_date: form.target_date || null,
        completed: false,
        progress_current: form.progress_current ? parseFloat(form.progress_current) : null,
        progress_target: form.progress_target ? parseFloat(form.progress_target) : null,
      })
      setForm({ title: '', description: '', type: 'outro', owner: 'ambos', target_date: '', progress_current: '', progress_target: '' })
      setShowModal(false)
      refresh()
    } catch (err) {
      console.error('Erro ao salvar meta:', err)
      alert('Erro: ' + (err as Error).message)
    }
  }

  async function handleToggle(goal: Goal) {
    try { await updateGoal(goal.id, { completed: !goal.completed }); refresh() }
    catch (err) { console.error(err) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta meta?')) return
    try { await deleteGoal(id); refresh() }
    catch (err) { console.error(err) }
  }

  async function handleSlider(id: string, value: number) {
    try { await updateGoal(id, { progress_current: value }); refresh() }
    catch (err) { console.error(err) }
  }

  const filtered = goals.filter((g) =>
    filter === 'ativas' ? !g.completed : filter === 'concluidas' ? g.completed : true
  )
  const active = goals.filter((g) => !g.completed).length
  const done = goals.filter((g) => g.completed).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Metas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {active} ativa{active !== 1 ? 's' : ''} · {done} concluída{done !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} className="mr-1.5" />Nova meta
        </Button>
      </div>

      <div className="flex items-center rounded-md border border-border/60 bg-muted/30 overflow-hidden w-fit">
        {(['todas', 'ativas', 'concluidas'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors capitalize',
              filter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma meta aqui.</p>
          <Button variant="link" size="sm" onClick={() => setShowModal(true)} className="mt-1">Criar meta →</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((goal) => {
            const pct = goal.progress_current != null && goal.progress_target != null
              ? Math.min(100, (goal.progress_current / goal.progress_target) * 100)
              : null

            return (
              <div
                key={goal.id}
                className={cn(
                  'rounded-lg border border-border/60 p-4 transition-opacity',
                  goal.completed && 'opacity-50'
                )}
              >
                <div className="flex items-start gap-3">
                  <button onClick={() => handleToggle(goal)} className="mt-0.5 flex-shrink-0">
                    {goal.completed
                      ? <CheckCircle2 size={18} className="text-primary" />
                      : <Circle size={18} className="text-muted-foreground hover:text-primary transition-colors" />
                    }
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={cn('text-sm font-medium', goal.completed && 'line-through text-muted-foreground')}>
                          {goal.title}
                        </p>
                        {goal.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {goalTypeLabels[goal.type]}
                      </Badge>
                      <span className={cn('text-xs font-medium', ownerColor(goal.owner))}>
                        {ownerLabels[goal.owner]}
                      </span>
                      {goal.target_date && (
                        <span className="text-xs text-muted-foreground">
                          até {new Date(goal.target_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>

                    {pct !== null && !goal.completed && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {goal.type === 'valor'
                              ? `${formatCurrency(goal.progress_current)} de ${formatCurrency(goal.progress_target)}`
                              : `${goal.progress_current} de ${goal.progress_target}`}
                          </span>
                          <span className="text-muted-foreground tabular-nums">{pct.toFixed(0)}%</span>
                        </div>
                        <Progress value={pct} className="h-1.5" />
                        {goal.progress_target != null && (
                          <input
                            type="range"
                            min={0}
                            max={goal.progress_target}
                            value={goal.progress_current ?? 0}
                            onChange={(e) => handleSlider(goal.id, parseFloat(e.target.value))}
                            className="w-full accent-primary h-1 mt-1"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal title="Nova Meta" open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleAdd} className="space-y-3 mt-2">
          <Input label="Título *" value={form.title} onChange={(e) => setF('title', e.target.value)} placeholder="Ex: Completar Watchmen" required />
          <Textarea label="Descrição" value={form.description} onChange={(e) => setF('description', e.target.value)} placeholder="Detalhes…" rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo" value={form.type} onChange={(v) => setF('type', v)} options={GOAL_TYPES} />
            <Select label="Dono" value={form.owner} onChange={(v) => setF('owner', v)} options={OWNER_OPTS} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Atual" type="number" value={form.progress_current} onChange={(e) => setF('progress_current', e.target.value)} placeholder="0" />
            <Input label="Meta" type="number" value={form.progress_target} onChange={(e) => setF('progress_target', e.target.value)} placeholder="100" />
            <Input label="Prazo" type="date" value={form.target_date} onChange={(e) => setF('target_date', e.target.value)} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Criar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
