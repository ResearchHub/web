'use client'

import { FC } from 'react'
import { cn } from '@/utils/styles'
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon'
import { Plus } from 'lucide-react'

interface RSCBadgeProps {
  amount: number
  className?: string
  size?: 'xs' | 'sm' | 'md'
  variant?: 'inline' | 'badge' | 'contribute'
  /** Whether to show "RSC" text after the amount */
  showText?: boolean
  /** Whether to show the RSC icon */
  showIcon?: boolean
}

export const RSCBadge: FC<RSCBadgeProps> = ({ 
  amount,
  className,
  size = 'sm',
  variant = 'badge',
  showText = true,
  showIcon = true
}) => {
  const sizeClasses = {
    xs: 'text-xs gap-1',
    sm: 'text-sm gap-1.5',
    md: 'text-base gap-2'
  }

  const variantClasses = {
    badge: 'rounded-full border border-orange-200 bg-orange-50 py-1 px-2',
    inline: '',
    contribute: 'rounded-full border border-orange-200 hover:border-orange-300 hover:bg-orange-50 py-1 px-2'
  }

  const iconSizes = {
    xs: 16,
    sm: 18,
    md: 20
  }

  return (
    <div className={cn(
      "flex items-center",
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {showIcon && (
        <ResearchCoinIcon 
          size={iconSizes[size]} 
          outlined={variant === 'inline'}
        />
      )}
      <span className="text-orange-500">
        {amount.toLocaleString()}{showText && ' RSC'}
      </span>
    </div>
  )
} 