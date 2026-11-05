import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

interface AuthScreenHeaderProps {
  title: string;
  subtitle?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
}

/** Title block shared by the sign-in screens, with an optional back link above it. */
export function AuthScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
}: AuthScreenHeaderProps) {
  return (
    <div className="mb-7">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </button>
      )}
      <h2 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 lg:!text-[28px] lg:!font-extrabold">
        {title}
      </h2>
      {subtitle && <p className="mt-1.5 text-[15px] leading-relaxed text-gray-600">{subtitle}</p>}
    </div>
  );
}
