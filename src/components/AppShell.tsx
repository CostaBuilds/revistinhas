'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sparkles, Bell, LogOut, Menu, Search, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/context/auth'
import { useTheme } from '@/context/theme'
import { getEventos } from '@/lib/data'

const nav = [
  { href: '/',         label: 'Dashboard' },
  { href: '/colecao',  label: 'Coleção'   },
  { href: '/series',   label: 'Séries'    },
  { href: '/wishlist', label: 'Wishlist'  },
  { href: '/metas',    label: 'Metas'     },
  { href: '/agenda',   label: 'Agenda'    },
]

const USER_COLORS: Record<string, string> = {
  marcelo: '#EC1D24',
  walter:  '#0476F2',
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname               = usePathname()
  const router                 = useRouter()
  const { user, loading, logout } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [eventCount, setEventCount] = useState(0)

  useEffect(() => {
    getEventos().then((evs) => {
      const today = new Date()
      setEventCount(evs.filter(e => new Date(e.data + 'T00:00:00') >= today).length)
    })
  }, [])

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.replace('/login')
    }
  }, [loading, user, pathname, router])

  if (pathname === '/login') return <>{children}</>

  if (loading || !user) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="font-comic text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
        Carregando…
      </div>
    </div>
  )

  async function handleLogout() {
    await logout()
  }

  const userColor = user ? (USER_COLORS[user] ?? '#888') : '#888'

  return (
    <div className="flex flex-col h-screen bg-background">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 bg-card border-b-[3px] border-foreground/80 shrink-0">
        <div className="flex h-[60px] items-stretch">

          {/* Logo block — red corner box */}
          <Link
            href="/"
            className="flex items-center gap-2.5 px-4 shrink-0 bg-primary border-r-[3px] border-foreground/80 hover:opacity-90 transition-opacity"
          >
            <Sparkles size={14} className="text-primary-foreground" />
            <span className="font-comic text-[18px] tracking-[0.12em] text-primary-foreground uppercase">
              Revistinhas
            </span>
          </Link>

          {/* Desktop nav tabs */}
          <nav className="hidden md:flex items-stretch flex-1 px-2">
            {nav.map(({ href, label }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link key={href} href={href} className="flex items-stretch">
                  <span className={cn(
                    'flex items-center px-4 font-comic text-[13px] tracking-[0.1em] uppercase transition-all duration-150 select-none border-b-[3px]',
                    active
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground hover:text-foreground border-transparent hover:border-foreground/25'
                  )}>
                    {label}
                  </span>
                </Link>
              )
            })}
          </nav>

          {/* Right action group */}
          <div className="ml-auto flex items-center gap-1 px-3 border-l-[3px] border-foreground/80">

            {/* Search */}
            <button className="h-8 w-8 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              <Search size={14} />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              className="h-8 w-8 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Bell + badge */}
            <button className="relative h-8 w-8 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              <Bell size={14} />
              {eventCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 rounded-sm bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center px-0.5 leading-none border border-card">
                  {eventCount > 9 ? '9+' : eventCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="h-6 w-[2px] bg-foreground/20 mx-1" />

            {/* User */}
            {user && (
              <div className="flex items-center gap-2.5">
                <div
                  className="h-8 w-8 rounded-sm flex items-center justify-center text-[13px] font-black text-white border-2 border-foreground/70 shrink-0"
                  style={{ background: userColor }}
                >
                  {user[0].toUpperCase()}
                </div>
                <div className="hidden lg:block leading-none">
                  <p className="font-comic text-[14px] uppercase tracking-[0.08em]" style={{ color: userColor }}>
                    {user}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">colecionador</p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sair"
                  className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-sm hover:bg-muted/60"
                >
                  <LogOut size={13} />
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className={cn(
                buttonVariants({ variant: 'outline', size: 'icon' }),
                'h-8 w-8 md:hidden shrink-0 ml-1 rounded-sm border-2 border-foreground/60'
              )}>
                <Menu size={14} />
              </SheetTrigger>
              <SheetContent side="left" className="w-56 p-0 rounded-none border-r-2 border-foreground/60">
                <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-foreground/60 bg-primary">
                  <Sparkles size={13} className="text-primary-foreground" />
                  <span className="font-comic text-sm tracking-[0.1em] text-primary-foreground uppercase">Revistinhas</span>
                </div>
                <nav className="p-2 space-y-0.5">
                  {nav.map(({ href, label }) => {
                    const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
                    return (
                      <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                        <span className={cn(
                          'flex items-center rounded-sm px-3 py-2.5 font-comic text-sm uppercase tracking-wider transition-colors border-l-4',
                          active
                            ? 'bg-primary/10 text-primary border-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted border-transparent'
                        )}>
                          {label}
                        </span>
                      </Link>
                    )
                  })}
                </nav>
                {user && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 border-t-2 border-foreground/40">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-7 w-7 rounded-sm flex items-center justify-center text-xs font-black text-white border-2 border-foreground/60"
                        style={{ background: userColor }}
                      >
                        {user[0].toUpperCase()}
                      </div>
                      <p className="font-comic text-sm uppercase tracking-wider flex-1" style={{ color: userColor }}>
                        {user}
                      </p>
                      <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground p-1">
                        <LogOut size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-5">
          {children}
        </div>
      </main>
    </div>
  )
}
