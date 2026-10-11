'use client';

import { Columns2, FileText, MessageSquare, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/styles';
import type { WorkspaceView } from './workspaceView';

const OPTIONS: Record<WorkspaceView, { readonly label: string; readonly icon: LucideIcon }> = {
  chat: { label: 'Chat', icon: MessageSquare },
  split: { label: 'Split', icon: Columns2 },
  document: { label: 'Document', icon: FileText },
};

interface ViewSwitchProps {
  /** The views offered, in order: all three on a wide screen, Chat and Document on a phone. */
  readonly views: readonly WorkspaceView[];
  readonly value: WorkspaceView;
  readonly onChange: (view: WorkspaceView) => void;
  readonly className?: string;
}

/**
 * What the workspace shows of the open document, in the top bar: a gray
 * track with the current view lifted out of it in white.
 */
export function ViewSwitch({ views, value, onChange, className }: ViewSwitchProps) {
  return (
    <div
      role="group"
      aria-label="View"
      className={cn('flex shrink-0 gap-0.5 rounded-full bg-gray-100 p-[3px]', className)}
    >
      {views.map((view) => {
        const { label, icon: Icon } = OPTIONS[view];
        const selected = view === value;
        return (
          <button
            key={view}
            type="button"
            onClick={() => onChange(view)}
            aria-pressed={selected}
            className={cn(
              'flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              selected ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            )}
          >
            <Icon className="h-[15px] w-[15px]" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
