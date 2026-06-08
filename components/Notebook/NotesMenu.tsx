'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { ChevronDown, X } from 'lucide-react';
import { NotebookPrimaryNavigation } from '@/components/Notebook/NotebookPrimaryNavigation';
import Icon from '@/components/ui/icons/Icon';
import { useScreenSize } from '@/hooks/useScreenSize';
import { cn } from '@/utils/styles';

/**
 * Compact replacement for the persistent notebook left sidebar. Lives in the
 * editor top bar and reveals the note browser/creator in a dropdown so the
 * horizontal space can go to the (more important) publishing sidebar.
 *
 * On mobile it expands to a full-screen sheet. That sheet is rendered through a
 * portal because the top bar uses a CSS transform (for its show/hide
 * animation), which would otherwise trap a `position: fixed` child inside the
 * thin top-bar box instead of letting it cover the viewport.
 */
export function NotesMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  // Bottom inset so the mobile sheet stops above the (fixed) bottom nav rather
  // than covering it. The sheet intentionally covers the top bar.
  const [bottomInset, setBottomInset] = useState(0);
  const pathname = usePathname();
  const { smAndDown } = useScreenSize();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const isMobile = smAndDown === true;

  // Measure the bottom nav while the mobile sheet is open so it stops just
  // above it (accounts for safe areas).
  useEffect(() => {
    if (!isOpen || !isMobile) return;
    const measure = () => {
      const bottomNav = document.querySelector('[data-mobile-bottom-nav]');
      setBottomInset(bottomNav?.getBoundingClientRect().height ?? 0);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isOpen, isMobile]);

  return (
    <div className="relative">
      <button
        type="button"
        data-tour="notebook-notes"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-gray-700 transition-colors hover:bg-gray-100"
      >
        <Icon name="labNotebook2" size={18} color="#6b7280" />
        <span className="font-medium">My Notebook</span>
        <ChevronDown
          className={cn('h-4 w-4 text-gray-500 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {/* Desktop: anchored dropdown rendered inline next to the trigger. */}
      {isOpen && !isMobile && (
        <>
          {/* Click-catcher sits below the panel and any nested menus/modals. */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} aria-hidden />
          <div className="absolute left-0 top-full z-40 mt-0.5 max-h-[72vh] w-[320px] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
            <NotebookPrimaryNavigation />
          </div>
        </>
      )}

      {/* Mobile: sheet portaled to <body> so it escapes the top bar's
          transformed stacking context. It covers the top bar (z above its
          z-[60]) and stops just above the fixed bottom nav. */}
      {isOpen &&
        isMobile &&
        isMounted &&
        createPortal(
          <div
            className="fixed left-0 right-0 top-0 z-[70] flex flex-col bg-white shadow-lg"
            style={{ bottom: bottomInset }}
          >
            {/* Header with a close control. */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2 text-gray-800">
                <Icon name="labNotebook2" size={18} color="#6b7280" />
                <span className="font-medium">My Notebook</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <NotebookPrimaryNavigation />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
