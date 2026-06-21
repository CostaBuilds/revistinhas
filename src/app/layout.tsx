import type { Metadata } from 'next'
import './globals.css'
import { Geist } from 'next/font/google'
import { AuthProvider } from '@/context/auth'
import AuthGuard from '@/components/AuthGuard'
import AppShell from '@/components/AppShell'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Revistinhas',
  description: 'Dashboard de coleção de quadrinhos — Marcelo & Walter',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className="bg-background text-foreground antialiased">
        <AuthProvider>
          <AuthGuard>
            <AppShell>{children}</AppShell>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
