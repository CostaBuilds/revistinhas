import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  accent?: 'primary' | 'sky' | 'violet' | 'emerald' | 'rose'
}

const accentMap = {
  primary: 'text-primary bg-primary/10',
  sky: 'text-sky-400 bg-sky-400/10',
  violet: 'text-violet-400 bg-violet-400/10',
  emerald: 'text-emerald-400 bg-emerald-400/10',
  rose: 'text-rose-400 bg-rose-400/10',
}

export default function StatsCard({ title, value, subtitle, icon: Icon, accent = 'primary' }: StatsCardProps) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-0.5 tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={cn('rounded-lg p-2.5', accentMap[accent])}>
            <Icon size={18} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
