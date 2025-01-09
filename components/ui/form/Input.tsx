import { cn } from '@/utils/styles'
import { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
  rightElement?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, rightElement, ...props }, ref) => {
    const isRoundedFull = className?.includes('rounded-full')
    const roundedClass = isRoundedFull ? 'rounded-full' : 'rounded-lg'

    return (
      <div>
        <div className={cn(
          "relative flex border border-gray-200 transition-all",
          roundedClass,
          error && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20",
          className
        )}>
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              {icon}
            </div>
          )}
          <input
            className={cn(
              'w-full px-4 py-2 text-sm outline-none border-none',
              roundedClass,
              'placeholder:text-gray-500',
              icon && 'pl-11',
              className?.includes('bg-') ? className : 'bg-white'
            )}
            ref={ref}
            {...props}
          />
          {rightElement && (
            <div className="flex">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input' 