import { cn } from '@/utils/styles'
import { forwardRef } from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
  rightElement?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, rightElement, ...props }, ref) => {
    return (
      <div>
        <div className={cn(
          "relative flex rounded-lg border border-gray-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all",
          error && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20"
        )}>
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            className={cn(
              'w-full bg-white px-3 py-2 text-sm outline-none border-none focus:ring-0',
              'placeholder:text-gray-400',
              icon && 'pl-10',
              className
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