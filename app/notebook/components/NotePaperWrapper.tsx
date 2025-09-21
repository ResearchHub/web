import { ReactNode } from 'react';

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
            <div className="sticky top-0 z-10" role="status" aria-live="polite">
              {showBanner}
            </div>
          )}
          <div
            className={`bg-white rounded-lg shadow-md pt-8 lg:pt-16 pl-16 min-h-[800px] ${className}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
