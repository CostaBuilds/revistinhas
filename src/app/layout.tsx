import type { Metadata } from 'next'
import './globals.css'
import { Geist, Bangers } from 'next/font/google'
import { AuthProvider } from '@/context/auth'
import { ThemeProvider } from '@/context/theme'
import AuthGuard from '@/components/AuthGuard'
import AppShell from '@/components/AppShell'

const geist   = Geist({ subsets: ['latin'], variable: '--font-sans' })
const bangers = Bangers({ subsets: ['latin'], weight: '400', variable: '--font-comic' })

export const metadata: Metadata = {
  title: 'Revistinhas',
  description: 'Dashboard de coleção de quadrinhos — Marcelo & Walter',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${bangers.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>
          <AuthProvider>
            <AuthGuard>
              <AppShell>{children}</AppShell>
            </AuthGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
