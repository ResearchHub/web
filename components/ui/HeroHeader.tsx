'use client';

import { cn } from '@/utils/styles';

interface HeroHeaderProps {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  subtitle?: React.ReactNode;
  cta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  tabBar?: React.ReactNode;
  className?: string;
}

export function HeroHeader({
  title,
  eyebrow,
  subtitle,
  cta,
  actions,
  children,
  tabBar,
  className,
}: HeroHeaderProps) {
  const hasHeader = title || eyebrow || subtitle || actions || cta;

  return (
    <div className={cn('w-full bg-gray-50/80', !tabBar && 'border-b border-gray-200', className)}>
      <div
        className={cn(
          'max-w-[1180px] mx-auto px-4 tablet:!px-8',
          children || tabBar ? 'pt-6' : 'py-6'
        )}
      >
        {hasHeader && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex-1 min-w-0">
                {eyebrow && <div className="mb-2.5">{eyebrow}</div>}
                {title && (
                  <h1
                    className={cn(
                      'font-semibold tracking-tight leading-snug text-gray-900',
                      typeof title === 'string' && title.length > 100
                        ? 'text-2xl sm:text-3xl'
                        : 'text-2xl sm:text-4xl'
                    )}
                  >
                    {title}
                  </h1>
                )}
                {subtitle && <div className="mt-1">{subtitle}</div>}
                {actions && <div className="mt-3">{actions}</div>}
              </div>

              {cta && !children && <div className="flex flex-shrink-0 flex-col gap-2">{cta}</div>}

              {cta && children && (
                <div className="hidden sm:flex flex-shrink-0 flex-col gap-2">{cta}</div>
              )}
            </div>

            {cta && children && <div className="sm:hidden mt-3">{cta}</div>}
          </>
        )}

        {children}
      </div>

      {tabBar && (
        <div className="w-full border-b border-gray-200 mt-6">
          <div className="max-w-[1180px] mx-auto px-4 tablet:!px-8">{tabBar}</div>
        </div>
      )}
    </div>
  );
}
