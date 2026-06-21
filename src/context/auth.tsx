'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type AuthUser = 'marcelo' | 'walter'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
})

const STORAGE_KEY = 'revistinhas_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as AuthUser | null
    if (stored === 'marcelo' || stored === 'walter') setUser(stored)
    setLoading(false)
  }, [])

  function login(u: AuthUser) {
    localStorage.setItem(STORAGE_KEY, u)
    setUser(u)
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
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
