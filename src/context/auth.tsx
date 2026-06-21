'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type AuthUser = 'marcelo' | 'walter'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (user: AuthUser, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => null,
  logout: async () => {},
})

function emailToUser(email: string | undefined): AuthUser | null {
  const prefix = email?.split('@')[0]
  if (prefix === 'marcelo' || prefix === 'walter') return prefix
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(emailToUser(session?.user.email))
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(emailToUser(session?.user.email))
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(u: AuthUser, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({
      email: `${u}@revistinhas.app`,
      password,
    })
    if (error) return 'Senha incorreta'
    return null
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
