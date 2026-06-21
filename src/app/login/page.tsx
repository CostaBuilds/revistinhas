'use client'

import { useAuth, AuthUser } from '@/context/auth'

// Place images in public/covers/ folder
const CENTER_COVER  = '/cover.jpg'
const WALTER_COVER  = '/covers/walter.jpg'
const MARCELO_COVER = '/covers/marcelo.jpg'

// ── Center 3D floating comic ──────────────────────────────────────
function ComicCover() {
  return (
    <div
      style={{
        filter:
          'drop-shadow(0 36px 72px rgba(0,0,0,0.9)) drop-shadow(0 0 48px rgba(236,29,36,0.20))',
      }}
    >
      <svg
        viewBox="0 0 302 426"
        width="254"
        height="358"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          <clipPath id="cc">
            <rect x="0" y="0" width="302" height="426" rx="6" ry="6" />
          </clipPath>
          <linearGradient id="cSpine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0.60)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
          <radialGradient id="cVig" cx="50%" cy="50%" r="70%">
            <stop offset="55%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.50)" />
          </radialGradient>
          <linearGradient id="cShine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.13)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <pattern id="cDots" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="0.85" fill="rgba(0,0,0,0.20)" />
          </pattern>
        </defs>

        {/* Spine offset for 3D depth */}
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

// ── User corner-box cover ─────────────────────────────────────────
interface BoxProps {
  id: AuthUser
  coverUrl: string
  glow: string
  onLogin: (id: AuthUser) => void
}

function CornerBox({ id, coverUrl, glow, onLogin }: BoxProps) {
  const suffix = id // unique SVG id suffix

  return (
    <button
      onClick={() => onLogin(id)}
      className="group flex flex-col items-center gap-3 focus:outline-none"
      aria-label={`Entrar como ${id}`}
    >
      {/* Book wrapper */}
      <div
        className="relative transition-transform duration-200 ease-out group-hover:scale-[1.05] group-hover:-translate-y-1.5"
        style={{
          filter: 'drop-shadow(0 20px 44px rgba(0,0,0,0.9))',
        }}
      >
        {/* 3D spine */}
        <div
          className="absolute rounded-[5px] bg-[#060606]"
          style={{ top: 6, right: -6, bottom: 0, left: 0 }}
        />

        {/* Cover image frame */}
        <div
          className="relative z-10 overflow-hidden rounded-[5px]"
          style={{ width: 168, aspectRatio: '605 / 1000', border: '3px solid rgba(0,0,0,0.80)' }}
        >
          <img
            src={coverUrl}
            alt={id}
            className="w-full h-full object-cover select-none"
            draggable={false}
          />
          {/* Halftone overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)',
              backgroundSize: '4px 4px',
            }}
          />
          {/* Left spine darkening */}
          <div
            className="absolute left-0 top-0 bottom-0 w-3 pointer-events-none"
            style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.38), transparent)' }}
          />
          {/* Top-left shine */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(130deg, rgba(255,255,255,0.10) 0%, transparent 45%)' }}
          />
        </div>

        {/* Hover glow ring */}
        <div
          className="absolute -inset-[3px] z-20 rounded-[7px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ boxShadow: `0 0 0 3px ${glow}, 0 0 40px ${glow}55` }}
        />
      </div>

      {/* "Entrar" hint */}
      <p
        className="font-comic text-[10px] uppercase tracking-[0.22em] transition-colors duration-150 select-none"
        style={{ color: 'rgba(255,255,255,0.28)' }}
      >
        <span className="group-hover:text-white/70 transition-colors">Entrar →</span>
      </p>
    </button>
  )
}

// ── Login page ────────────────────────────────────────────────────
export default function LoginPage() {
  const { login } = useAuth()

  function handleLogin(user: AuthUser) {
    login(user)
    window.location.href = '/'
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden gap-8 px-6"
      style={{ background: '#0c1630' }}
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

      {/* Ambient center glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 640,
          height: 640,
          background: 'radial-gradient(circle, rgba(27,80,212,0.13) 0%, transparent 65%)',
          borderRadius: '50%',
        }}
      />

      {/* Title */}
      <p
        className="relative z-10 font-comic uppercase tracking-[0.35em] text-white/30 text-xs select-none"
      >
        Quem está acessando?
      </p>

      {/* ── Three-column row ── */}
      <div className="relative z-10 flex items-center gap-10 lg:gap-16">

        {/* LEFT: Walter */}
        <CornerBox
          id="walter"
          coverUrl={WALTER_COVER}
          glow="#EAC400"
          onLogin={handleLogin}
        />

        {/* CENTER: floating comic + ground shadow */}
        <div className="relative hidden lg:flex flex-col items-center">
          <div style={{ animation: 'comicFloat 4.5s ease-in-out infinite' }}>
            <ComicCover />
          </div>
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: -18,
              width: 190,
              height: 13,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(0,0,0,0.80) 0%, transparent 80%)',
              animation: 'comicShadow 4.5s ease-in-out infinite',
            }}
          />
        </div>

        {/* RIGHT: Marcelo */}
        <CornerBox
          id="marcelo"
          coverUrl={MARCELO_COVER}
          glow="#EC1D24"
          onLogin={handleLogin}
        />
      </div>

      {/* Bottom credit */}
      <p
        className="relative z-10 font-comic uppercase tracking-[0.3em] text-white/15 text-[10px] select-none"
      >
        Coleção compartilhada · Revistinhas
      </p>
    </div>
  )
}
