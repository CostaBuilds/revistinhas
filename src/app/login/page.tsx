'use client'

import { useRef, useState } from 'react'
import { useAuth, AuthUser } from '@/context/auth'

const CENTER_COVER  = '/cover.jpg'
const WALTER_COVER  = '/covers/walter.jpg'
const MARCELO_COVER = '/covers/marcelo.jpg'

// ── Center 3D floating comic ──────────────────────────────────────
function ComicCover() {
  return (
    <div style={{ filter: 'drop-shadow(0 36px 72px rgba(0,0,0,0.9)) drop-shadow(0 0 48px rgba(236,29,36,0.20))' }}>
      <svg viewBox="0 0 302 426" width="254" height="358" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
        <defs>
          <clipPath id="cc"><rect x="0" y="0" width="302" height="426" rx="6" ry="6" /></clipPath>
          <linearGradient id="cSpine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0.60)" /><stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
          <radialGradient id="cVig" cx="50%" cy="50%" r="70%">
            <stop offset="55%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor="rgba(0,0,0,0.50)" />
          </radialGradient>
          <linearGradient id="cShine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.13)" /><stop offset="45%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <pattern id="cDots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="0.85" fill="rgba(0,0,0,0.20)" />
          </pattern>
        </defs>
        <rect x="9" y="6" width="293" height="420" rx="6" fill="#080808" />
        <g clipPath="url(#cc)">
          <image href={CENTER_COVER} x="0" y="0" width="302" height="426" preserveAspectRatio="xMidYMid slice" />
          <rect x="0" y="0" width="11" height="426" fill="url(#cSpine)" />
          <rect x="0" y="0" width="302" height="426" rx="6" fill="url(#cVig)" />
          <rect x="0" y="0" width="302" height="426" fill="url(#cDots)" opacity="0.38" />
          <rect x="0" y="0" width="302" height="426" rx="6" fill="url(#cShine)" />
          <rect x="0" y="0" width="302" height="426" rx="6" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  )
}

// ── User corner-box ───────────────────────────────────────────────
interface BoxProps {
  id: AuthUser
  coverUrl: string
  glow: string
  selected: boolean
  password: string
  error: string | null
  submitting: boolean
  onSelect: () => void
  onPasswordChange: (v: string) => void
  onSubmit: () => void
}

function CornerBox({ id, coverUrl, glow, selected, password, error, submitting, onSelect, onPasswordChange, onSubmit }: BoxProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Cover + overlay wrapper */}
      <div className="relative" style={{ width: 168 }}>
        {/* Book button */}
        <button
          onClick={onSelect}
          className="group relative w-full focus:outline-none"
          aria-label={`Entrar como ${id}`}
        >
          <div
            className="relative transition-transform duration-200 ease-out group-hover:scale-[1.04] group-hover:-translate-y-1"
            style={{ filter: 'drop-shadow(0 20px 44px rgba(0,0,0,0.9))' }}
          >
            <div className="absolute rounded-[5px] bg-[#060606]" style={{ top: 6, right: -6, bottom: 0, left: 0 }} />
            <div
              className="relative z-10 overflow-hidden rounded-[5px]"
              style={{ width: 168, aspectRatio: '605 / 1000', border: '3px solid rgba(0,0,0,0.80)' }}
            >
              <img src={coverUrl} alt={id} className="w-full h-full object-cover select-none" draggable={false} />
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
              <div className="absolute left-0 top-0 bottom-0 w-3 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.38), transparent)' }} />
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(130deg, rgba(255,255,255,0.10) 0%, transparent 45%)' }} />
            </div>
            {/* Glow ring when selected */}
            <div
              className="absolute -inset-[3px] z-20 rounded-[7px] pointer-events-none transition-opacity duration-200"
              style={{
                opacity: selected ? 1 : 0,
                boxShadow: `0 0 0 3px ${glow}, 0 0 40px ${glow}66`,
              }}
            />
          </div>
        </button>

        {/* Password overlay — floats above the cover */}
        {selected && (
          <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2.5 rounded-[5px]"
            style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(2px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-comic text-[11px] uppercase tracking-[0.25em] text-white/70">Senha</p>
            <input
              ref={inputRef}
              autoFocus
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
              className="w-[82%] px-3 py-2 text-sm text-center rounded-sm border border-white/20 bg-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 transition-colors"
            />
            {error && (
              <p className="font-comic text-[10px] uppercase tracking-wider text-red-400">{error}</p>
            )}
            <button
              onClick={onSubmit}
              disabled={submitting || !password}
              className="px-5 py-1.5 font-comic text-[11px] uppercase tracking-[0.2em] rounded-sm transition-all disabled:opacity-40"
              style={{
                background: glow,
                color: '#fff',
                boxShadow: submitting || !password ? 'none' : `0 2px 12px ${glow}66`,
              }}
            >
              {submitting ? '...' : 'Entrar'}
            </button>
          </div>
        )}
      </div>

      <p className="font-comic text-[10px] uppercase tracking-[0.22em] text-white/30 select-none">
        {selected ? 'Esc para cancelar' : 'Entrar →'}
      </p>
    </div>
  )
}

// ── Login page ────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth()

  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null)
  const [password,     setPassword]     = useState('')
  const [loginError,   setLoginError]   = useState<string | null>(null)
  const [submitting,   setSubmitting]   = useState(false)

  function handleSelect(id: AuthUser) {
    if (selectedUser === id) {
      setSelectedUser(null)
    } else {
      setSelectedUser(id)
    }
    setPassword('')
    setLoginError(null)
  }

  async function handleSubmit() {
    if (!selectedUser || !password || submitting) return
    setSubmitting(true)
    setLoginError(null)
    const err = await login(selectedUser, password)
    if (err) {
      setLoginError(err)
      setSubmitting(false)
    } else {
      window.location.href = '/'
    }
  }

  const users: { id: AuthUser; coverUrl: string; glow: string }[] = [
    { id: 'walter',  coverUrl: WALTER_COVER,  glow: '#EAC400' },
    { id: 'marcelo', coverUrl: MARCELO_COVER, glow: '#EC1D24' },
  ]

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden gap-8 px-6"
      style={{ background: '#0c1630' }}
      onKeyDown={(e) => e.key === 'Escape' && (setSelectedUser(null), setPassword(''), setLoginError(null))}
      tabIndex={-1}
    >
      {/* Panel grid bg */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.032 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pg" x="0" y="0" width="220" height="220" patternUnits="userSpaceOnUse">
              <rect x="8" y="8" width="96" height="96" fill="none" stroke="white" strokeWidth="2.5" rx="2" />
              <rect x="116" y="8" width="96" height="96" fill="none" stroke="white" strokeWidth="2.5" rx="2" />
              <rect x="8" y="116" width="204" height="96" fill="none" stroke="white" strokeWidth="2.5" rx="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pg)" />
        </svg>
      </div>

      <div className="absolute pointer-events-none" style={{ width: 640, height: 640, background: 'radial-gradient(circle, rgba(27,80,212,0.13) 0%, transparent 65%)', borderRadius: '50%' }} />

      <p className="relative z-10 font-comic uppercase tracking-[0.35em] text-white/30 text-xs select-none">
        Quem está acessando?
      </p>

      {/* Three-column row */}
      <div className="relative z-10 flex items-center gap-10 lg:gap-16">

        {/* LEFT: Walter */}
        <CornerBox
          id="walter"
          coverUrl={users[0].coverUrl}
          glow={users[0].glow}
          selected={selectedUser === 'walter'}
          password={selectedUser === 'walter' ? password : ''}
          error={selectedUser === 'walter' ? loginError : null}
          submitting={submitting}
          onSelect={() => handleSelect('walter')}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
        />

        {/* CENTER: floating comic */}
        <div className="relative hidden lg:flex flex-col items-center">
          <div style={{ animation: 'comicFloat 4.5s ease-in-out infinite' }}>
            <ComicCover />
          </div>
          <div
            className="absolute pointer-events-none"
            style={{ bottom: -18, width: 190, height: 13, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(0,0,0,0.80) 0%, transparent 80%)', animation: 'comicShadow 4.5s ease-in-out infinite' }}
          />
        </div>

        {/* RIGHT: Marcelo */}
        <CornerBox
          id="marcelo"
          coverUrl={users[1].coverUrl}
          glow={users[1].glow}
          selected={selectedUser === 'marcelo'}
          password={selectedUser === 'marcelo' ? password : ''}
          error={selectedUser === 'marcelo' ? loginError : null}
          submitting={submitting}
          onSelect={() => handleSelect('marcelo')}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
        />
      </div>

      <p className="relative z-10 font-comic uppercase tracking-[0.3em] text-white/15 text-[10px] select-none">
        Coleção compartilhada · Revistinhas
      </p>
    </div>
  )
}
