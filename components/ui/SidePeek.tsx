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
}

export const SidePeek: React.FC<SidePeekProps> = ({
  children,
  title,
  closeHref,
  className,
  widthClassName = 'w-full max-w-[720px]',
}) => {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (closeHref) router.push(closeHref);
        else router.back();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
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
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b bg-white">
          <div className="min-w-0">
            {title && <h2 className="truncate text-base font-semibold text-gray-900">{title}</h2>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={handleBackdropClick}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </dialog>
    </div>
  );
};

export default SidePeek;
