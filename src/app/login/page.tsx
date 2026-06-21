'use client'

import { useAuth, AuthUser } from '@/context/auth'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

const users: { id: AuthUser; label: string; color: string; ring: string; desc: string }[] = [
  {
    id: 'marcelo',
    label: 'Marcelo',
    color: 'text-amber-600',
    ring: 'hover:border-amber-500/60 focus-visible:border-amber-500',
    desc: 'Entrar como Marcelo',
  },
  {
    id: 'walter',
    label: 'Walter',
    color: 'text-sky-700',
    ring: 'hover:border-sky-600/60 focus-visible:border-sky-600',
    desc: 'Entrar como Walter',
  },
]

// Center of the cover's dark area
const CX = 151
const CY = 218

// Radial speed lines from center
const SPEED_LINES = Array.from({ length: 30 }, (_, i) => {
  const angle = (i / 30) * 2 * Math.PI
  return {
    x1: CX + 70 * Math.cos(angle),
    y1: CY + 70 * Math.sin(angle),
    x2: CX + 245 * Math.cos(angle),
    y2: CY + 245 * Math.sin(angle),
    thick: i % 5 === 0,
  }
})

function ComicCover() {
  return (
    <div
      style={{
        position: 'relative',
        filter:
          'drop-shadow(0 36px 72px rgba(0,0,0,0.85)) drop-shadow(0 0 48px rgba(27,80,212,0.22))',
      }}
    >
      {/* Sweeping shine */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 8,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-60%',
            width: '32%',
            height: '120%',
            background:
              'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.065) 50%, transparent 80%)',
            animation: 'comicShine 6s ease-in-out infinite',
          }}
        />
      </div>

      <svg
        viewBox="0 0 302 426"
        width="272"
        height="384"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <defs>
          {/* Clip everything to rounded cover shape */}
          <clipPath id="coverClip">
            <rect x="0" y="0" width="302" height="426" rx="7" ry="7" />
          </clipPath>

          {/* Halftone Ben-Day dots */}
          <pattern id="benDay" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1.15" fill="rgba(100,150,255,0.07)" />
          </pattern>

          {/* Radial glow behind the R */}
          <radialGradient id="rGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(27,80,212,0.30)" />
            <stop offset="100%" stopColor="rgba(27,80,212,0)" />
          </radialGradient>

          {/* Blur for R glow layer */}
          <filter id="rBlur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        {/* 3-D book spine (sits behind cover) */}
        <rect x="9" y="6" width="293" height="420" rx="7" fill="#040c20" />

        {/* ── Everything below is clipped to cover outline ── */}
        <g clipPath="url(#coverClip)">

          {/* Base background — FF dark navy */}
          <rect x="0" y="0" width="302" height="426" fill="#0b1530" />

          {/* Ben-Day halftone — subtle blue tint */}
          <rect x="0" y="64" width="302" height="333" fill="url(#benDay)" />

          {/* Slowly rotating speed lines (SMIL) */}
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${CX} ${CY}`}
              to={`360 ${CX} ${CY}`}
              dur="48s"
              repeatCount="indefinite"
            />
            {SPEED_LINES.map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke="#ffffff"
                strokeWidth={l.thick ? 1.6 : 0.7}
                strokeOpacity={l.thick ? 0.28 : 0.10}
              />
            ))}
          </g>

          {/* Pulsing radial glow — FF blue */}
          <ellipse cx={CX} cy={CY} rx="145" ry="145" fill="url(#rGlow)"
            style={{ animation: 'comicGlow 3s ease-in-out infinite' }} />

          {/* R — blurred glow layer (FF blue halo) */}
          <text
            x={CX}
            y="295"
            textAnchor="middle"
            fontFamily="Impact, Arial Black, sans-serif"
            fontSize="205"
            fontWeight="900"
            fill="#4b7fff"
            opacity="0.25"
            filter="url(#rBlur)"
          >R</text>

          {/* R — main (white) */}
          <text
            x={CX}
            y="295"
            textAnchor="middle"
            fontFamily="Impact, Arial Black, sans-serif"
            fontSize="205"
            fontWeight="900"
            fill="#ffffff"
            style={{ animation: 'comicGlow 3s ease-in-out infinite' }}
          >R</text>

          {/* Collector credit */}
          <text
            x={CX}
            y="368"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="9.5"
            fontWeight="700"
            letterSpacing="5.5"
            fill="#8aaeff"
            opacity="0.55"
          >MARCELO &amp; WALTER</text>

          {/* ── TOP BANNER — FF blue ── */}
          <rect x="0" y="0" width="302" height="64" fill="#1B50D4" />
          <rect x="0" y="60" width="302" height="4" fill="#0d36a8" />

          {/* Publisher corner box */}
          <rect x="0" y="0" width="56" height="56" fill="#0b1530" />
          <rect x="5" y="5" width="46" height="46" rx="3" fill="#1B50D4" />
          <text
            x="28"
            y="38"
            textAnchor="middle"
            fontFamily="Impact, sans-serif"
            fontSize="30"
            fontWeight="900"
            fill="#ffffff"
          >R</text>

          {/* Title — white on FF blue */}
          <text
            x="186"
            y="43"
            textAnchor="middle"
            fontFamily="Impact, Arial Black, sans-serif"
            fontSize="27"
            fontWeight="900"
            fill="#ffffff"
            letterSpacing="1.5"
          >REVISTINHAS</text>

          {/* ── BOTTOM STRIP — FF blue ── */}
          <rect x="0" y="396" width="302" height="30" fill="#1B50D4" />
          <rect x="0" y="396" width="302" height="3" fill="#0d36a8" />
          <text
            x="14"
            y="416"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="10"
            fontWeight="800"
            fill="#ffffff"
          >ISSUE #1</text>
          <text
            x="288"
            y="416"
            textAnchor="end"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="10"
            fontWeight="800"
            fill="#ffffff"
          >2025</text>

          {/* Cover outer border */}
          <rect
            x="0" y="0" width="302" height="426" rx="7"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
          />

          {/* Inner decorative frame */}
          <rect
            x="6" y="70" width="290" height="320"
            fill="none"
            stroke="rgba(27,80,212,0.18)"
            strokeWidth="1"
          />
        </g>
      </svg>
    </div>
  )
}

export default function LoginPage() {
  const { login } = useAuth()

  function handleLogin(user: AuthUser) {
    login(user)
    window.location.href = '/'
  }

  return (
    <div className="flex min-h-screen bg-background">

      {/* ── LEFT: Hero panel (desktop only) ── */}
      <div
        className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{ background: '#0c1630' }}
      >
        {/* Very subtle comic-panel grid background */}
        <div className="absolute inset-0" style={{ opacity: 0.038 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="panelGrid"
                x="0" y="0"
                width="220" height="220"
                patternUnits="userSpaceOnUse"
              >
                <rect x="8" y="8" width="96" height="96" fill="none" stroke="white" strokeWidth="2.5" rx="2" />
                <rect x="116" y="8" width="96" height="96" fill="none" stroke="white" strokeWidth="2.5" rx="2" />
                <rect x="8" y="116" width="204" height="96" fill="none" stroke="white" strokeWidth="2.5" rx="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#panelGrid)" />
          </svg>
        </div>

        {/* Ambient amber glow centered on book */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 480,
            height: 480,
            background:
              'radial-gradient(circle, rgba(27,80,212,0.18) 0%, transparent 65%)',
            borderRadius: '50%',
          }}
        />

        {/* Floating book */}
        <div
          className="relative z-10"
          style={{ animation: 'comicFloat 4.5s ease-in-out infinite' }}
        >
          <ComicCover />
        </div>

        {/* Ground shadow that pulses with the float */}
        <div
          className="absolute z-0 pointer-events-none"
          style={{
            bottom: '16%',
            left: '50%',
            width: 200,
            height: 14,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.8) 0%, transparent 80%)',
            animation: 'comicShadow 4.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* ── RIGHT: Login panel ── */}
      <div className="flex min-w-0 flex-1 lg:max-w-[400px] flex-col items-center justify-center px-8 py-12 border-l border-border/20">
        <div className="w-full max-w-sm space-y-8">

          {/* Logo + title */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <BookOpen size={22} className="text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">Revistinhas</h1>
              <p className="text-sm text-muted-foreground mt-1">Quem está acessando?</p>
            </div>
          </div>

          {/* User cards */}
          <div className="space-y-3">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleLogin(u.id)}
                className={cn(
                  'group w-full rounded-xl border border-border/60 bg-card px-5 py-4',
                  'flex items-center gap-4 text-left transition-all duration-150',
                  'hover:bg-muted/40 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  u.ring
                )}
              >
                <div
                  className={cn(
                    'h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold bg-muted flex-shrink-0',
                    u.color
                  )}
                >
                  {u.label[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-semibold text-base leading-none', u.color)}>
                    {u.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{u.desc}</p>
                </div>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors text-lg leading-none">
                  →
                </span>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground/50">
            Coleção compartilhada de quadrinhos
          </p>
        </div>
      </div>

    </div>
  )
}
