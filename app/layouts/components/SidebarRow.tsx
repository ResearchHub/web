'use client';

import type { ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface SidebarRowProps {
  readonly title: string;
  /** Something before the title: a document's icon. */
  readonly leading?: ReactNode;
  /** Something after the title: the assistant's activity dot. */
  readonly trailing?: ReactNode;
  readonly isActive: boolean;
  readonly onSelect: () => void;
}

/** One entry in a list in the left sidebar: a document, say. */
export function SidebarRow({ title, leading, trailing, isActive, onSelect }: SidebarRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? 'true' : undefined}
      title={title}
      className={cn(
        'mb-0.5 flex w-full items-center gap-2.5 rounded-lg py-2 pr-3 text-left transition-colors',
        leading ? 'pl-2.5' : 'pl-3',
        isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
      )}
    >
      {leading}
      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-800">{title}</span>
      {trailing}
    </button>
  );
}
