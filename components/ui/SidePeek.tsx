'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/pro-solid-svg-icons';
import { cn } from '@/utils/styles';

interface SidePeekProps {
  readonly children: React.ReactNode;
  readonly title?: string;
  readonly closeHref?: string;
  readonly className?: string;
  readonly widthClassName?: string;
  readonly fullHref?: string;
}

export const SidePeek: React.FC<SidePeekProps> = ({
  children,
  title,
  closeHref,
  className,
  widthClassName = 'w-full max-w-[720px]',
  fullHref,
}) => {
  const router = useRouter();

  useEffect(() => {
    // Focus management: focus header close button on mount; restore on unmount
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (closeHref) router.push(closeHref);
        else router.back();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    // Prevent background scroll
    const originalOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.documentElement.style.overflow = originalOverflow;
      if (previouslyFocused) previouslyFocused.focus();
    };
  }, [router, closeHref]);

  const handleBackdropClick = () => {
    if (closeHref) router.push(closeHref);
    else router.back();
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={handleBackdropClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBackdropClick();
          }
        }}
        aria-label="Close side peek"
      />

      {/* Panel */}
      <dialog
        open
        className={cn(
          'fixed top-0 right-0 left-auto inset-y-0 h-full m-0 bg-white shadow-2xl border-l border-gray-200 flex flex-col',
          'transition-none transform-none',
          widthClassName,
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidepeek-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-white">
          <div className="min-w-0">
            {title && (
              <h2 id="sidepeek-title" className="truncate text-base font-semibold text-gray-900">
                {title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-1">
            {fullHref && (
              <button
                type="button"
                aria-label="Open full page"
                onClick={() => router.push(fullHref)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                title="Open full page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M14 3h7v7" />
                  <path d="M10 21H3v-7" />
                  <path d="M21 3l-7 7" />
                  <path d="M3 21l7-7" />
                </svg>
              </button>
            )}
            <button
              type="button"
              aria-label="Close"
              onClick={handleBackdropClick}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </dialog>
    </div>
  );
};

export default SidePeek;
