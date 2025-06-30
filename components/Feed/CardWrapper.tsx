import { cn } from '@/utils/styles';
import { useRouter } from 'next/navigation';
import { KeyboardEvent } from 'react';

interface CardWrapperProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  isClickable?: boolean;
}

const defaultClassName =
  'block w-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden';
const defaultHoverClassName =
  'group hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer';

export const CardWrapper = ({
  href,
  children,
  className,
  isClickable = true,
}: CardWrapperProps) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, [role="button"], input, select, textarea');

    if (isInteractive || !href) return;

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
      e.preventDefault();
      router.push(href);
    }
  };

  const handleAuxClick = (e: React.MouseEvent) => {
    // Handle middle click specifically
    if (e.button === 1 && href) {
      e.preventDefault();
      window.open(href, '_blank');
    }
  };

  const wrapperClassName = cn(
    defaultClassName,
    isClickable && defaultHoverClassName,
    href && 'focus:outline-2 focus:outline-blue-500 focus:outline-offset-2',
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
    >
      {children}
    </div>
  );
};
