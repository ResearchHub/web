'use client';

import { cn } from '@/utils/styles';

interface HeroHeaderProps {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  preTitle?: React.ReactNode;
  subtitle?: React.ReactNode;
  cta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  tabBar?: React.ReactNode;
  className?: string;
  contentWidth?: 'default' | 'narrow';
  /**
   * Top-align the title/subtitle with the CTA column instead of vertically
   * centering them. Use when the CTA can vary in height (e.g. it contains a
   * stats panel) so the title doesn't shift down as the CTA grows.
   */
  alignTop?: boolean;
  /**
   * Keep the children (the tabs) in the title's column, beside the CTA,
   * instead of on a row of their own beneath both. With a tall CTA — a
   * stats panel — the tabs then fill the space under the title, sitting on
   * the header's bottom edge level with the CTA's foot, rather than pushing
   * the whole header down past it. Below `sm` the CTA still comes between
   * the title and the tabs.
   */
  inlineChildren?: boolean;
}

export function HeroHeader({
  title,
  eyebrow,
  preTitle,
  subtitle,
  cta,
  actions,
  children,
  tabBar,
  className,
  contentWidth = 'default',
  alignTop = false,
  inlineChildren = false,
}: HeroHeaderProps) {
  const hasHeader = title || eyebrow || preTitle || subtitle || actions || cta;
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

  const inline = inlineChildren && Boolean(cta) && Boolean(children);

  return (
    <div className={cn('w-full bg-gray-50/80', !tabBar && 'border-b border-gray-200', className)}>
      <div
        className={cn(
          contentMaxWidth,
          'mx-auto px-4 tablet:!px-8',
          children || tabBar ? 'pt-6' : 'py-6'
        )}
      >
        {inline ? (
          // Two columns from `sm`: the title over the tabs on the left, the
          // CTA spanning both rows on the right. One column below, in the
          // order title, CTA, tabs.
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:grid-rows-[auto_minmax(0,1fr)] sm:gap-x-6 sm:gap-y-0">
            <div className="min-w-0 sm:col-start-1 sm:row-start-1">{heading}</div>
            <div className="flex flex-col gap-2 sm:col-start-2 sm:row-start-1 sm:row-span-2 sm:self-start">
              {cta}
            </div>
            <div className="min-w-0 sm:col-start-1 sm:row-start-2 sm:self-end">{children}</div>
          </div>
        ) : (
          <>
            {hasHeader && (
              <>
                <div
                  className={cn(
                    'flex flex-col sm:flex-row gap-3 sm:gap-6',
                    alignTop ? 'sm:items-start' : 'sm:items-center'
                  )}
                >
                  <div className="flex-1 min-w-0">{heading}</div>

                  {cta && !children && (
                    <div className="flex flex-shrink-0 flex-col gap-2">{cta}</div>
                  )}

                  {cta && children && (
                    <div className="hidden sm:flex flex-shrink-0 flex-col gap-2">{cta}</div>
                  )}
                </div>

                {cta && children && <div className="sm:hidden mt-3">{cta}</div>}
              </>
            )}

            {children}
          </>
        )}
      </div>

      {tabBar && (
        <div className="w-full border-b border-gray-200 mt-6">
          <div className={cn(contentMaxWidth, 'mx-auto px-4 tablet:!px-8')}>{tabBar}</div>
        </div>
      )}
    </div>
  );
}
