import { cn } from '@/utils/styles';

interface DocumentSkeletonProps {
  /**
   * Optional className for the container
   */
  className?: string;
  /**
   * Number of lines to display
   */
  lines?: number;
  /**
   * Height for each line
   */
  lineHeight?: string;
  /**
   * Gap between lines
   */
  gap?: string;
}

export function DocumentSkeleton({
  className,
  lines = 15,
  lineHeight = '0.85rem',
  gap = '0.65rem',
}: DocumentSkeletonProps) {
  return (
    <div className={cn('w-full animate-pulse px-4 py-6', className)}>
      {/* Document Header */}
      <div className="mb-6 space-y-4">
        <div className="h-6 w-3/4 rounded-md bg-gray-200" />
        <div className="h-6 w-1/2 rounded-md bg-gray-200" />
      </div>

      {/* Document Body */}
      <div className="flex flex-col space-y-3">
        {/* Generate the specified number of lines */}
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={{ height: lineHeight }}
            className={cn(
              'rounded-md bg-gray-200',
              // Vary the widths to make it look more realistic
              i % 5 === 0
                ? 'w-[95%]'
                : i % 4 === 0
                  ? 'w-[90%]'
                  : i % 3 === 0
                    ? 'w-[85%]'
                    : i % 2 === 0
                      ? 'w-[97%]'
                      : 'w-full'
            )}
          />
        ))}
      </div>

      {/* Document Footer */}
      <div className="mt-6 space-y-3">
        <div className="h-4 w-1/3 rounded-md bg-gray-200" />
        <div className="h-4 w-1/4 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export default DocumentSkeleton;
