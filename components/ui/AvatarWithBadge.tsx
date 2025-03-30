'use client';

import Image from 'next/image';
import { VerifiedBadge } from './VerifiedBadge';
import { cn } from '@/utils/styles';

interface AvatarWithBadgeProps {
  src: string;
  alt: string;
  size?: number;
  isVerified?: boolean;
  isOrganization?: boolean;
  className?: string;
}

export function AvatarWithBadge({
  src,
  alt,
  size = 40,
  isVerified = false,
  isOrganization = false,
  className,
}: AvatarWithBadgeProps) {
  // Determine badge size based on avatar size
  const badgeSize = size <= 24 ? 'xs' : size <= 32 ? 'sm' : size <= 48 ? 'md' : 'lg';

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <Image src={src} alt={alt} width={size} height={size} className="rounded-full object-cover" />

      {isVerified && (
        <div className="absolute" style={{ right: -3, bottom: -3 }}>
          <VerifiedBadge size={badgeSize} isOrganization={isOrganization} />
        </div>
      )}
    </div>
  );
}
