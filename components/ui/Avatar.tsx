'use client';

import { FC, useState, useEffect } from 'react';
import { cn } from '@/utils/styles';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md';
  className?: string;
  ring?: boolean;
}

export const Avatar: FC<AvatarProps> = ({ src, alt, size = 'md', className, ring = false }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (src) {
      setImageError(false);
      setIsLoading(true);
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoading(false);
      img.onerror = () => {
        setImageError(true);
        setIsLoading(false);
      };
    } else {
      setIsLoading(false);
    }
  }, [src]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizeClasses = {
    xxs: 'h-[20px] w-[20px] text-[8px]',
    xs: 'h-[24px] w-[24px] text-[10px]',
    sm: 'h-[32px] w-[32px] text-xs',
    md: 'h-[40px] w-[40px] text-sm',
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const shouldShowInitials = !src || imageError || isLoading;

  return (
    <div
      className={cn(
        'relative inline-flex rounded-full bg-gray-100 overflow-hidden',
        'flex items-center justify-center',
        ring && 'ring-2 ring-gray-200',
        sizeClasses[size],
        className
      )}
      style={{ lineHeight: 1 }}
    >
      {shouldShowInitials ? (
        <span className="absolute inset-0 flex items-center justify-center font-medium text-gray-600">
          {getInitials(alt)}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      )}
    </div>
  );
};
