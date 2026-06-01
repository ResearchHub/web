'use client';

import { cn } from '@/utils/styles';

export type NotebookTab = 'document' | 'details';

interface NotebookTabsProps {
  active: NotebookTab;
  onChange: (tab: NotebookTab) => void;
}

/** Segmented control used in the notebook top bar to switch between the
 *  document editor and the publishing details. */
export function NotebookTabs({ active, onChange }: NotebookTabsProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5">
      <TabPill active={active === 'document'} onClick={() => onChange('document')}>
        Document
      </TabPill>
      <TabPill
        active={active === 'details'}
        onClick={() => onChange('details')}
        dataTour="notebook-publish"
      >
        Details
      </TabPill>
    </div>
  );
}

function TabPill({
  active,
  onClick,
  dataTour,
  children,
}: Readonly<{
  active: boolean;
  onClick: () => void;
  dataTour?: string;
  children: React.ReactNode;
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tour={dataTour}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      )}
    >
      {children}
    </button>
  );
}
