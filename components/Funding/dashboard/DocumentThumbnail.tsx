import Image from 'next/image';
import { FileText } from 'lucide-react';
import { cn } from '@/utils/styles';

interface DocumentThumbnailProps {
  readonly image: string | null;
  readonly size?: 'md' | 'lg';
}

/** A funding document's image, or a file icon when it has none. */
export function DocumentThumbnail({ image, size = 'md' }: DocumentThumbnailProps) {
  const large = size === 'lg';
  return (
    <span className={cn('relative shrink-0', large ? 'h-12 w-12' : 'h-10 w-10')}>
      <span
        className={cn(
          'relative flex h-full w-full items-center justify-center overflow-hidden bg-gray-100 text-gray-600',
          large ? 'rounded-[10px]' : 'rounded-lg'
        )}
      >
        {image ? (
          <Image src={image} alt="" fill className="object-cover" sizes={large ? '48px' : '40px'} />
        ) : (
          <FileText className="h-4 w-4" aria-hidden="true" />
        )}
      </span>
    </span>
  );
}
