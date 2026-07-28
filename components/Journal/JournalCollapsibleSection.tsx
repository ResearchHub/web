'use client';

import { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/styles';

interface JournalCollapsibleSectionProps {
  title: string;
  /** Rendered element rather than a component, so server components can pass it. */
  icon: ReactNode;
  /** Shown in the header row only while collapsed, e.g. an avatar stack. */
  collapsedPreview?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

export function JournalCollapsibleSection({
  title,
  icon,
  collapsedPreview,
  defaultOpen = false,
  children,
  className,
}: JournalCollapsibleSectionProps) {
  return (
    <details open={defaultOpen} className={cn('group border-t border-gray-200 pt-3', className)}>
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-gray-800 hover:text-primary-600">
        <span className="flex-shrink-0 text-gray-400" aria-hidden="true">
          {icon}
        </span>
        <span>{title}</span>
        {collapsedPreview && (
          <span className="ml-auto flex items-center group-open:hidden">{collapsedPreview}</span>
        )}
        <ChevronDown
          size={16}
          className={cn(
            'flex-shrink-0 text-gray-400 transition-transform group-open:rotate-180',
            collapsedPreview ? 'ml-2 group-open:ml-auto' : 'ml-auto'
          )}
          aria-hidden="true"
        />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}
