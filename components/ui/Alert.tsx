'use client'

import { cn } from '@/utils/styles'
import { Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

type AlertVariant = 'info' | 'warning' | 'error' | 'success'

interface AlertProps {
  /**
   * The variant of the alert
   */
  variant?: AlertVariant
  /**
   * The content of the alert
   */
  children: React.ReactNode
  /**
   * Optional CSS class name
   */
  className?: string
}

const variantStyles = {
  info: {
    container: 'bg-blue-50 text-blue-800',
    icon: <Info className="h-4 w-4 text-blue-500" />,
  },
  warning: {
    container: 'bg-yellow-50 text-yellow-800',
    icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  },
  error: {
    container: 'bg-red-50 text-red-800',
    icon: <AlertCircle className="h-4 w-4 text-red-500" />,
  },
  success: {
    container: 'bg-green-50 text-green-800',
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
  },
}

export function Alert({ 
  variant = 'info',
  children,
  className,
}: AlertProps) {
  const styles = variantStyles[variant]

  return (
    <div 
      className={cn(
        'flex items-start gap-3 rounded-lg px-4 py-3',
        styles.container,
        className
      )}
    >
      <div className="shrink-0 mt-0.5">
        {styles.icon}
      </div>
      <div className="text-sm font-medium">
        {children}
      </div>
    </div>
  )
} 