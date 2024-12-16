'use client'

import { useState } from 'react'
import { User as UserIcon } from 'lucide-react'
import { cn } from '@/utils/styles'

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12'
}

const iconSizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7'
}

export function Avatar({ src, alt = '', size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const baseClasses = 'rounded-full flex items-center justify-center bg-gray-200'
  const sizeClass = sizeClasses[size]
  const iconSizeClass = iconSizeClasses[size]

  if (!src || imageError) {
    return (
      <div className={cn(baseClasses, sizeClass, className)}>
        <UserIcon className={cn(iconSizeClass, 'text-gray-600')} />
      </div>
    )
  }

  return (
    <div className={cn(baseClasses, sizeClass, className)}>
      <img
        src={src}
        alt={alt}
        onError={handleImageError}
        className="h-full w-full rounded-full object-cover"
      />
    </div>
  )
} 
