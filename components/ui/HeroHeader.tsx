'use client';

import { cn } from '@/utils/styles';

interface HeroHeaderProps {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  preTitle?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  tabBar?: React.ReactNode;
  className?: string;
  contentWidth?: 'default' | 'narrow';
}

export function HeroHeader({
  title,
  eyebrow,
  preTitle,
  subtitle,
  actions,
  children,
  tabBar,
  className,
  contentWidth = 'default',
}: HeroHeaderProps) {
  const hasHeader = title || eyebrow || preTitle || subtitle || actions;
  const contentMaxWidth = contentWidth === 'narrow' ? 'max-w-[1012px]' : 'max-w-[1180px]';

  const heading = (
    <>
      {eyebrow && <div className="mb-2.5">{eyebrow}</div>}
      {preTitle && <div className="mb-2">{preTitle}</div>}
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
    </>
  );

  return (
    <div className={cn('w-full bg-gray-50/80', !tabBar && 'border-b border-gray-200', className)}>
      <div
        className={cn(
          contentMaxWidth,
          'mx-auto px-4 tablet:!px-8',
          children || tabBar ? 'pt-6' : 'py-6'
        )}
      >
        {hasHeader && <div className="min-w-0">{heading}</div>}
        {children}
      </div>

      {tabBar && (
        <div className="w-full border-b border-gray-200 mt-6">
          <div className={cn(contentMaxWidth, 'mx-auto px-4 tablet:!px-8')}>{tabBar}</div>
        </div>
      )}
    </div>
  );
}
