import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  accent?: 'primary' | 'sky' | 'violet' | 'emerald' | 'rose'
  trend?: string
  trendUp?: boolean
}

const accentMap = {
  primary: { bg: '#EC1D24', text: '#fff' },
  sky:     { bg: '#0476F2', text: '#fff' },
  violet:  { bg: '#7C3AED', text: '#fff' },
  emerald: { bg: '#059669', text: '#fff' },
  rose:    { bg: '#E11D48', text: '#fff' },
}

export default function StatsCard({
  title, value, subtitle, icon: Icon, accent = 'primary', trend, trendUp = true,
}: StatsCardProps) {
  const a = accentMap[accent]
  return (
    <div className="border-2 border-foreground/80 bg-card rounded-sm overflow-hidden shadow-[3px_3px_0px_rgba(0,0,0,0.55)]">
      {/* Corner-box header strip */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b-2 border-foreground/80"
        style={{ background: a.bg }}
      >
        <Icon size={11} color={a.text} strokeWidth={2.5} />
        <span
          className="font-comic text-[11px] uppercase tracking-[0.15em]"
          style={{ color: a.text }}
        >
          {title}
        </span>
      </div>

      {/* Big number — like an issue # */}
      <div className="px-3 pt-2.5 pb-3">
        <p className="font-comic text-[2.6rem] leading-none tracking-tight text-foreground">
          {value}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {trend && (
            <span
              className="text-[10px] font-bold"
              style={{ color: a.bg }}
            >
              {trendUp ? '▲' : '▼'} {trend}
            </span>
          )}
          {subtitle && (
            <p className="text-[11px] text-muted-foreground leading-none">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}
