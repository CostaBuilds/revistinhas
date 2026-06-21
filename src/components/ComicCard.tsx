'use client'

import { Comic, conditionLabels, ownerLabels } from '@/types'
import { cn, ownerColor, formatCurrency } from '@/lib/utils'
import { BookOpen, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ComicCardProps {
  comic: Comic
  onDelete?: (id: string) => void
}

export default function ComicCard({ comic, onDelete }: ComicCardProps) {
  return (
    <Card className="group overflow-hidden border-border/60 transition-colors hover:border-border bg-card p-0">
      <div className="aspect-[2/3] bg-muted/40 flex items-center justify-center relative overflow-hidden">
        {comic.cover_url ? (
          <img src={comic.cover_url} alt={comic.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
            <BookOpen size={28} className="opacity-30" />
            {comic.issue_number != null && (
              <span className="text-xl font-bold tabular-nums text-foreground/40">
                #{comic.issue_number}
              </span>
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Link href={`/colecao/${comic.id}`} className={cn(buttonVariants({ variant: 'secondary', size: 'icon' }), 'h-8 w-8')}>
            <Pencil size={13} />
          </Link>
          {onDelete && (
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8"
              onClick={() => onDelete(comic.id)}
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div>
          <p className="text-sm font-medium leading-tight line-clamp-2">{comic.title}</p>
          {comic.series && comic.series !== comic.title && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{comic.series}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-1">
          <span className={cn('text-xs font-medium', ownerColor(comic.owner))}>
            {ownerLabels[comic.owner]}
          </span>
          {comic.condition && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 border-border/60">
              {conditionLabels[comic.condition]}
            </Badge>
          )}
        </div>

        {comic.current_value != null && (
          <p className="text-xs font-medium text-muted-foreground">
            {formatCurrency(comic.current_value)}
          </p>
        )}
      </div>
    </Card>
  )
}
