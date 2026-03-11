'use client';

import { cn } from '@/utils/styles';

interface HeroHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  cta?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function HeroHeader({ title, subtitle, cta, children, className }: HeroHeaderProps) {
  return (
    <div className={cn('w-full bg-gray-50/80 border-b border-gray-200', className)}>
      <div
        className={cn(
          'max-w-[1180px] mx-auto px-4 tablet:!px-8 relative',
          children ? 'pt-4 sm:pt-6' : 'py-4 sm:py-8'
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl sm:text-4xl font-semibold tracking-tight text-gray-900">
              {title}
            </h1>
            {subtitle && <div className="mt-2">{subtitle}</div>}
          </div>

          {cta && !children && <div className="flex flex-shrink-0 flex-col gap-2">{cta}</div>}
        </div>

        {cta && children && <div className="sm:hidden mt-3">{cta}</div>}

        {children}

        {cta && children && (
          <div className="hidden sm:flex absolute right-4 tablet:!right-8 top-0 bottom-0 items-center">
            {cta}
          </div>
        )}
      </div>
    </div>
  );
}
