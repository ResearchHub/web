'use client';

interface ThinkingLineProps {
  readonly label: string;
}

/**
 * The indeterminate beat before a turn starts revealing. Mirrors the notebook's
 * `LiveStatusLine` so the two assistants read as the same product.
 */
export const ThinkingLine = ({ label }: ThinkingLineProps) => (
  <div className="flex items-center gap-2 text-[15px] font-medium text-primary-600">
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-thinking-dot"
          style={{ animationDelay: `${dot * 150}ms` }}
        />
      ))}
    </span>
    <span aria-live="polite">{label}</span>
  </div>
);
