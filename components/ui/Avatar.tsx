'use client';

import { FC, useState, useEffect, CSSProperties } from 'react';
import { cn } from '@/utils/styles';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xxs' | 'xs' | 'sm' | 'md' | number;
  className?: string;
}

export const Avatar: FC<AvatarProps> = ({ src, alt, size = 'md', className }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (src && src.trim() !== '') {
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
      setImageError(true);
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
    xxs: 'h-5 w-5',
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
  };

  const getTextSizeClass = (initials: string) => {
    const length = initials.length;

    if (typeof size === 'number') {
      // Calculate text size based on pixel size
      if (size <= 20) return length > 1 ? 'text-[6px]' : 'text-[8px]';
      if (size <= 24) return length > 1 ? 'text-[8px]' : 'text-[10px]';
      if (size <= 32) return length > 1 ? 'text-[10px]' : 'text-xs';
      return length > 1 ? 'text-xs' : 'text-sm';
    }

    // Original logic for string-based sizes
    if (size === 'md') {
      return length > 1 ? 'text-xs' : 'text-sm';
    } else if (size === 'sm') {
      return length > 1 ? 'text-[10px]' : 'text-xs';
    } else if (size === 'xs') {
      return length > 1 ? 'text-[8px]' : 'text-[10px]';
    } else {
      return length > 1 ? 'text-[6px]' : 'text-[8px]';
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const shouldShowInitials = !src || imageError || isLoading;
  const initials = getInitials(alt);

  // Handle custom pixel size
  const customStyle: CSSProperties = {};
  if (typeof size === 'number') {
    customStyle.width = `${size}px`;
    customStyle.height = `${size}px`;
  }

  return (
    <div
      className={cn(
        'relative inline-flex rounded-full bg-gray-100 overflow-hidden',
        'flex items-center justify-center flex-shrink-0',
        typeof size !== 'number' ? sizeClasses[size] : '',
        className
      )}
      style={{
        lineHeight: 1,
        ...customStyle,
      }}
    >
      {shouldShowInitials ? (
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center font-medium text-gray-600',
            getTextSizeClass(initials)
          )}
        >
          {initials}
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
