import { cn } from '@/utils/styles';
import { useRouter } from 'next/navigation';
import { KeyboardEvent } from 'react';

interface CardWrapperProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  isClickable?: boolean;
  onClick?: () => void;
  entryId?: string;
}

const defaultClassName =
  'block w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden';
const defaultHoverClassName =
  'group hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer';

// Add styles for programmatic focus
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .programmatic-focus {
      outline: 2px solid rgb(59 130 246) !important;
      outline-offset: 2px !important;
    }
  `;
  if (!document.head.querySelector('style[data-programmatic-focus]')) {
    style.dataset.programmaticFocus = 'true';
    document.head.appendChild(style);
  }
}

export const CardWrapper = ({
  href,
  children,
  className,
  isClickable = true,
  onClick,
  entryId,
}: CardWrapperProps) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, [role="button"], input, select, textarea');

    if (isInteractive || !href) return;

    if (isClickable && onClick) {
      onClick();
    }

    // Handle different click types
    if (e.button === 1) {
      // Middle click - open in new tab
      window.open(href, '_blank');
      return;
    }

    if (e.button === 0) {
      // Left click
      if (e.metaKey || e.ctrlKey) {
        // Command/Ctrl + click - open in new tab
        window.open(href, '_blank');
      } else {
        // Normal click - navigate
        router.push(href);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!href) return;

    if (e.key === 'Enter') {
      if (isClickable && onClick) {
        onClick();
      }
      e.preventDefault();
      router.push(href);
    }
  };

  const handleAuxClick = (e: React.MouseEvent) => {
    // Handle middle click specifically
    if (e.button === 1 && href) {
      if (isClickable && onClick) {
        onClick();
      }
      e.preventDefault();
      window.open(href, '_blank');
    }
  };

  const wrapperClassName = cn(
    defaultClassName,
    isClickable && defaultHoverClassName,
    href &&
      'focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2',
    className
  );

  return (
    <div
      className={wrapperClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onAuxClick={handleAuxClick}
      role="link"
      tabIndex={0}
      aria-label="View details"
      data-entry-id={entryId ?? undefined}
    >
      {children}
    </div>
  );
};
