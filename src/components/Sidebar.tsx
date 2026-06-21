'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LayoutDashboard, Star, TrendingUp, Target, Menu, LogOut } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/context/auth'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/colecao', label: 'Coleção', icon: BookOpen },
  { href: '/series', label: 'Séries', icon: TrendingUp },
  { href: '/wishlist', label: 'Wishlist', icon: Star },
  { href: '/metas', label: 'Metas', icon: Target },
]

const userMeta = {
  marcelo: { color: 'text-amber-400', dot: 'bg-amber-400', border: 'border-amber-400/20', bg: 'bg-amber-400/5' },
  walter:  { color: 'text-sky-400',   dot: 'bg-sky-400',   border: 'border-sky-400/20',   bg: 'bg-sky-400/5'   },
}

function NavContent({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const meta = user ? userMeta[user] : null

  function handleLogout() {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen size={14} className="text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">Revistinhas</p>
            <p className="text-xs text-muted-foreground mt-0.5">Marcelo & Walter</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} onClick={onNav}>
              <span
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <Icon size={16} />
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Current user + logout */}
      {user && meta && (
        <div className="p-3">
          <div className={cn('flex items-center gap-3 rounded-lg border px-3 py-2.5', meta.border, meta.bg)}>
            <div className={cn('flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold', meta.color)}>
              {user[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-semibold capitalize leading-none', meta.color)}>{user}</p>
              <p className="text-xs text-muted-foreground mt-0.5">logado</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'h-9 w-9')}>
            <Menu size={16} />
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0 bg-sidebar border-sidebar-border">
            <NavContent onNav={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <aside className="hidden md:flex w-56 flex-col border-r border-border/60 bg-sidebar shrink-0">
        <NavContent />
      </aside>
    </>
  )
}
