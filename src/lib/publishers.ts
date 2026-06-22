import {
  BookOpen, Shield, Zap, Moon, Layers, Star,
  Sparkles, Globe, Book, type LucideIcon,
} from 'lucide-react'

export interface PublisherData {
  Icon: LucideIcon
  bg: string
  logo: string        // path under /public/publishers/
}

export const PUBLISHERS: Record<string, PublisherData> = {
  'DC Comics':        { Icon: Shield,   bg: '#0476F2', logo: '/publishers/dc-comics.png'      },
  'Marvel Comics':    { Icon: Zap,      bg: '#EC1D24', logo: '/publishers/marvel-comics.png'  },
  'Panini':           { Icon: BookOpen, bg: '#FF5F00', logo: '/publishers/panini.png'          },
  'DC/Vertigo':       { Icon: Moon,     bg: '#6B21A8', logo: '/publishers/dc-vertigo.png'      },
  'Image Comics':     { Icon: Layers,   bg: '#E53935', logo: '/publishers/image-comics.png'    },
  'Pipoca & Nanquim': { Icon: Star,     bg: '#D97706', logo: '/publishers/pipoca-nanquim.png'  },
  'Mythos':           { Icon: Sparkles, bg: '#7C3AED', logo: '/publishers/mythos.png'          },
  'Darkside Books':   { Icon: Book,     bg: '#1F2937', logo: '/publishers/darkside-books.png'  },
  'Abril':            { Icon: Globe,    bg: '#16A34A', logo: '/publishers/abril.png'           },
}

export const PUBLISHER_DEFAULT: PublisherData = {
  Icon: BookOpen,
  bg: '#64748b',
  logo: '',
}

export function pubData(pub: string | null | undefined): PublisherData {
  return (pub && PUBLISHERS[pub]) ? PUBLISHERS[pub] : PUBLISHER_DEFAULT
}
