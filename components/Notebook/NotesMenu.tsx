'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, NotebookPen } from 'lucide-react';
import { LeftSidebar } from '@/components/Notebook/LeftSidebar';
import { cn } from '@/utils/styles';

/**
 * Compact replacement for the persistent notebook left sidebar. Lives in the
 * editor top bar and reveals the note browser/creator in a dropdown so the
 * horizontal space can go to the (more important) publishing sidebar.
 */
export function NotesMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close when navigating to/creating a note (NoteListItem pushes routes
  // directly, so we key off the pathname instead of an explicit callback).
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-gray-700 transition-colors hover:bg-gray-100"
      >
        <NotebookPen className="h-4 w-4 text-gray-500" />
        <span className="font-medium">My Notebook</span>
        <ChevronDown
          className={cn('h-4 w-4 text-gray-500 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <>
          {/* Click-catcher sits below the panel and any nested menus/modals. */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} aria-hidden />
          <div className="absolute left-0 top-full z-40 mt-0.5 max-h-[72vh] w-[320px] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
            <LeftSidebar />
          </div>
        </>
      )}
    </div>
  );
}
