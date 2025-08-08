'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/pro-solid-svg-icons';
import { cn } from '@/utils/styles';

interface SidePeekProps {
  children: React.ReactNode;
  title?: string;
  closeHref?: string;
  className?: string;
  widthClassName?: string;
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
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
        onClick={handleBackdropClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleBackdropClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close side peek"
        aria-pressed="false"
      />

      {/* Panel */}
      <div
        className={cn(
          'absolute right-0 top-0 h-full bg-white shadow-2xl border-l border-gray-200 flex flex-col',
          'transition-transform duration-300 ease-out translate-x-0',
          widthClassName,
          className
        )}
        role="dialog"
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
      </div>
    </div>
  );
};

export default SidePeek;
