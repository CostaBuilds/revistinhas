'use client'

import { useState } from 'react'
import { pubData } from '@/lib/publishers'
import { cn } from '@/lib/utils'

interface Props {
  publisher: string | null | undefined
  size?: number
  className?: string
  /** When true, renders white version (for colored backgrounds) */
  inverted?: boolean
}

export default function PublisherLogo({ publisher, size = 16, className, inverted = false }: Props) {
  const [imgFailed, setImgFailed] = useState(false)
  const data = pubData(publisher)

  if (data.logo && !imgFailed) {
    return (
      <img
        src={data.logo}
        alt={publisher ?? ''}
        width={size}
        height={size}
        className={cn('object-contain', inverted && 'brightness-0 invert', className)}
        onError={() => setImgFailed(true)}
        style={{ maxHeight: size, maxWidth: size * 2.5 }}
      />
    )
  }

  return <data.Icon size={size} className={className} color={inverted ? '#fff' : data.bg} strokeWidth={2.5} />
}
