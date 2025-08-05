'use client';

import { cn } from '@/utils/styles';
import { ReactNode } from 'react';

type CalloutVariant = 'info' | 'warning' | 'error' | 'success' | 'gray';

interface CalloutProps {
  /**
   * The variant of the callout
   */
  variant?: CalloutVariant;
  /**
   * The message content of the callout
   */
  message: ReactNode;
  /**
   * Optional CSS class name
   */
  className?: string;
  /**
   * Whether to show the left border accent
   */
  showBorder?: boolean;
}

const variantStyles = {
  info: {
    container: 'bg-blue-50 text-blue-800',
    border: 'border-blue-300',
    icon: 'text-blue-600',
    iconBorder: 'border-blue-600',
  },
  warning: {
    container: 'bg-yellow-50 text-gray-900',
    border: 'border-yellow-500',
    icon: 'text-yellow-600',
    iconBorder: 'border-yellow-600',
  },
  error: {
    container: 'bg-red-50 text-red-800',
    border: 'border-red-300',
    icon: 'text-red-600',
    iconBorder: 'border-red-600',
  },
  success: {
    container: 'bg-green-50 text-green-800',
    border: 'border-green-300',
    icon: 'text-green-600',
    iconBorder: 'border-green-600',
  },
  gray: {
    container: 'bg-gray-50 text-gray-700',
    border: 'border-gray-300',
    icon: 'text-gray-500',
    iconBorder: 'border-gray-500',
  },
};

/**
 * Callout component for displaying informational, warning, or error messages
 *
 * @example
 * <Callout variant="warning" showBorder={true} message="This is a warning message" />
 *
 * @example
 * <Callout variant="info" message={
 *   <>This is an info message with a <a href="#">link</a></>
 * } />
 */
export function Callout({
  variant = 'info',
  message,
  className,
  showBorder = false,
}: CalloutProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-md text-sm',
        showBorder && `border-l-4 ${styles.border}`,
        styles.container,
        className
      )}
    >
      <div
        className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${styles.iconBorder}`}
      >
        <span className={`text-xs font-bold leading-none ${styles.icon}`}>!</span>
      </div>
      <div className="flex-1">{message}</div>
    </div>
  );
}
