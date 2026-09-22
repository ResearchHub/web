'use client';

import type { ReactNode } from 'react';
import { cn } from '@/utils/styles';

interface SidebarRowProps {
  readonly title: string;
  /** Something before the title — a document's kind, say. */
  readonly leading?: ReactNode;
  /** Beside the title, inside its line — a spinner for a running turn. */
  readonly titleAdornment?: ReactNode;
  /** Controls at the row's right edge, shown on hover, focus, or while active. */
  readonly menu?: ReactNode;
  readonly isActive: boolean;
  readonly onSelect: () => void;
  /** Replaces the row's face — an inline rename field. */
  readonly editing?: ReactNode;
}

/** One entry in the workspace sidebar: a conversation, a document. */
export function SidebarRow({
  title,
  leading,
  titleAdornment,
  menu,
  isActive,
  onSelect,
  editing,
}: SidebarRowProps) {
  return (
    <div
      className={cn(
        'group relative mb-0.5 rounded-lg transition-colors',
        isActive ? 'bg-gray-200/70' : 'hover:bg-gray-200/40'
      )}
    >
      {editing ? (
        <div className="px-2 py-1.5">{editing}</div>
      ) : (
        <button
          type="button"
          onClick={onSelect}
          aria-current={isActive ? 'true' : undefined}
          className={cn(
            'flex w-full items-center gap-2.5 py-2 pr-9 text-left',
            leading ? 'pl-2.5' : 'pl-3'
          )}
        >
          {leading}
          <span className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="min-w-0 truncate text-[13px] font-medium text-gray-800">{title}</span>
            {titleAdornment}
          </span>
        </button>
      )}

      {!editing && menu && (
        <div
          className={cn(
            'absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100',
            isActive && 'opacity-100'
          )}
        >
          {menu}
        </div>
      )}
    </div>
  );
}
