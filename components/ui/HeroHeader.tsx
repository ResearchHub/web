'use client';

import { cn } from '@/utils/styles';

interface HeroHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  cta?: React.ReactNode;
  className?: string;
}

export function HeroHeader({ title, subtitle, cta, className }: HeroHeaderProps) {
  return (
    <div className={cn('w-full bg-gray-50/80 border-b border-gray-200', className)}>
      <div className="max-w-[1180px] mx-auto pl-4 tablet:!pl-8 pr-4 tablet:!pr-0 py-8">
        <div className="flex items-center gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              {title}
            </h1>
            {subtitle && <div className="mt-2.5">{subtitle}</div>}
          </div>

          {cta && <div className="flex-shrink-0 flex flex-col gap-2">{cta}</div>}
        </div>
      </div>
    </div>
  );
}
