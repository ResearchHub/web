'use client';

import Link from 'next/link';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { cn } from '@/utils/styles';

export function WorkHeaderBountyEyebrow({
  bountyDisplay,
  reviewsUrl,
  className,
}: {
  bountyDisplay: string;
  reviewsUrl: string;
  className?: string;
}) {
  return (
    <Link
      href={reviewsUrl}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium text-xs sm:text-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors',
        className
      )}
    >
      <RadiatingDot color="bg-green-500" size="sm" isRadiating />
      Peer review for <span className="font-mono font-bold">{bountyDisplay}</span>
    </Link>
  );
}
