import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

/** Shared editor paper card — provides the left gutter (pl-16) and top padding. */
interface NotePaperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  minHeight?: string;
}

export const NotePaper = ({
  children,
  className,
  minHeight = '800px',
  ...rest
}: NotePaperProps) => {
  return (
    <div
      className={cn('bg-white rounded-lg pt-8 lg:!pt-16 pl-16', className)}
      style={{ minHeight }}
      {...rest}
    >
      {children}
    </div>
  );
};

/** Full-page wrapper for notebook routes. Adds gray background, shadow, and optional banner. */
interface NotePaperWrapperProps {
  children: ReactNode;
  className?: string;
  showBanner?: ReactNode;
  /**
   * When false, render just the white paper card (no gray canvas / centering),
   * letting the surrounding page supply the gray background. Used in the
   * shared page layout where the scroll area is already gray.
   */
  canvas?: boolean;
}

export const NotePaperWrapper = ({
  children,
  className = '',
  showBanner,
  canvas = true,
}: NotePaperWrapperProps) => {
  const content = (
    <>
      {showBanner && (
        <output className="block sticky top-0 z-10" aria-live="polite">
          {showBanner}
        </output>
      )}
      <NotePaper className={cn('shadow-md', className)} data-tour="notebook-editor">
        {children}
      </NotePaper>
    </>
  );

  if (!canvas) {
    return content;
  }

  return (
    <div className="h-full">
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 max-w-4xl mx-auto">{content}</div>
      </div>
    </div>
  );
};
