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
}

export const NotePaperWrapper = ({
  children,
  className = '',
  showBanner,
}: NotePaperWrapperProps) => {
  return (
    <div className="h-full">
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 max-w-4xl mx-auto">
          {showBanner && (
            <output className="block sticky top-0 z-10" aria-live="polite">
              {showBanner}
            </output>
          )}
          <NotePaper className={cn('shadow-md', className)} data-tour="notebook-editor">
            {children}
          </NotePaper>
        </div>
      </div>
    </div>
  );
};
