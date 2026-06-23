'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, LogOut, Menu, Search, Moon, Sun } from 'lucide-react'
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
      <header className="sticky top-0 z-40 shrink-0 border-b border-border/60 bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center gap-2 px-3 md:px-5">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center shrink-0 mr-1 transition-opacity hover:opacity-80"
          >
            <img src="/logo.png" alt="Revistinhas" className="h-11 w-auto" />
          </Link>

          {/* Desktop nav tabs (pills) */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(({ href, label }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 font-comic text-[12.5px] uppercase tracking-[0.08em] transition-colors select-none',
                    active
                      ? 'bg-primary/12 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  )}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right action group */}
          <div className="ml-auto flex items-center gap-1">

            {/* Search */}
            <button className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors">
              <Search size={16} />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              className="h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Bell + badge */}
            <button className="relative h-9 w-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors">
              <Bell size={16} />
              {eventCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[15px] h-[15px] rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center px-1 leading-none ring-2 ring-card">
                  {eventCount > 9 ? '9+' : eventCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="h-5 w-px bg-border mx-1.5" />

            {/* User */}
            {user && (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleLogout}
                  title="Sair"
                  className="group flex items-center gap-2 rounded-full py-1 pl-1 pr-1 lg:pr-3 hover:bg-muted/70 transition-colors"
                >
                  <span
                    className="h-8 w-8 rounded-full flex items-center justify-center text-[13px] font-black text-white shrink-0 ring-2 ring-card"
                    style={{ background: userColor }}
                  >
                    {user[0].toUpperCase()}
                  </span>
                  <span className="hidden lg:block leading-none text-left">
                    <span className="block font-comic text-[13px] uppercase tracking-[0.08em]" style={{ color: userColor }}>
                      {user}
                    </span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5 group-hover:hidden">colecionador</span>
                    <span className="hidden text-[10px] text-muted-foreground mt-0.5 group-hover:flex items-center gap-1">
                      <LogOut size={9} /> sair
                    </span>
                  </span>
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'h-9 w-9 md:hidden shrink-0 ml-1 rounded-full'
              )}>
                <Menu size={16} />
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0 border-r border-border">
                <div className="flex items-center px-4 py-4 border-b border-border">
                  <img src="/logo.png" alt="Revistinhas" className="h-10 w-auto" />
                </div>
                <nav className="p-2 space-y-1">
                  {nav.map(({ href, label }) => {
                    const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
                    return (
                      <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                        <span className={cn(
                          'flex items-center rounded-xl px-3 py-2.5 font-comic text-sm uppercase tracking-wider transition-colors',
                          active
                            ? 'bg-primary/12 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}>
                          {label}
                        </span>
                      </Link>
                    )
                  })}
                </nav>
                {user && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black text-white ring-2 ring-card shrink-0"
                        style={{ background: userColor }}
                      >
                        {user[0].toUpperCase()}
                      </div>
                      <p className="font-comic text-sm uppercase tracking-wider flex-1" style={{ color: userColor }}>
                        {user}
                      </p>
                      <button onClick={handleLogout} title="Sair" className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors">
                        <LogOut size={14} />
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
