'use client';

import { FC, useState, useEffect, CSSProperties, MouseEvent } from 'react';
import { cn } from '@/utils/styles';
import { AuthorTooltip } from './AuthorTooltip';
import Link from 'next/link';

type AvatarSize = 'xxxs' | 'xxs' | 'xs' | 'sm' | 'md';

export interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: AvatarSize | number;
  className?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  authorId?: number;
  disableTooltip?: boolean;
  label?: string;
  labelClassName?: string;
  labelStyle?: CSSProperties;
}

// Define a set of background colors for avatars without images
const backgroundColors = [
  'bg-indigo-100', // Indigo
  'bg-emerald-100', // Emerald
  'bg-amber-100', // Amber
  'bg-sky-100', // Sky
  'bg-rose-100', // Rose
  'bg-violet-100', // Violet
  'bg-lime-100', // Lime
  'bg-cyan-100', // Cyan
  'bg-fuchsia-100', // Fuchsia
  'bg-orange-100', // Orange
];

// Define a set of text colors corresponding to the background colors
const textColors = [
  'text-indigo-700', // Indigo
  'text-emerald-700', // Emerald
  'text-amber-700', // Amber
  'text-sky-700', // Sky
  'text-rose-700', // Rose
  'text-violet-700', // Violet
  'text-lime-700', // Lime
  'text-cyan-700', // Cyan
  'text-fuchsia-700', // Fuchsia
  'text-orange-700', // Orange
];

// Generate a deterministic color index based on the string
const getColorIndex = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % backgroundColors.length;
  return index;
};

// Map string sizes to pixel values
const sizeMap = {
  xxxs: 12,
  xxs: 20,
  xs: 24,
  sm: 32,
  md: 40,
};

export const Avatar: FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className,
  onClick,
  authorId,
  disableTooltip = false,
  label,
  labelClassName,
  labelStyle,
}) => {
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
    xxxs: 'h-3 w-3',
    xxs: 'h-5 w-5',
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
  };

  const getTextSizeClass = (size: number, length: number) => {
    if (size > 100) return length > 1 ? 'text-5xl' : 'text-6xl';

    const textSize = Math.floor(size / 10);
    const sizes = {
      2: 'text-xs',
      3: 'text-sm',
      4: 'text-base',
      5: 'text-lg',
      6: 'text-xl',
      7: 'text-2xl',
      8: 'text-3xl',
      9: 'text-4xl',
      10: 'text-5xl',
    };

    return sizes[textSize as keyof typeof sizes] || 'text-base';
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const shouldShowInitials = !src || imageError || isLoading;
  const initials = getInitials(alt);

  // Get the color index based on the alt text
  const colorIndex = getColorIndex(alt);
  const backgroundColorClass = backgroundColors[colorIndex];
  const textColorClass = textColors[colorIndex];

  // Handle custom pixel size
  const customStyle: CSSProperties = {};
  if (typeof size === 'number') {
    customStyle.width = `${size}px`;
    customStyle.height = `${size}px`;
  }

  const avatarElement = (
    <div
      className={cn(
        'relative inline-flex rounded-full overflow-hidden',
        'flex items-center justify-center flex-shrink-0',
        shouldShowInitials ? backgroundColorClass : 'bg-gray-100',
        typeof size !== 'number' ? sizeClasses[size as AvatarSize] : '',
        onClick ? 'cursor-pointer' : '',
        authorId ? 'cursor-pointer' : '',
        'focus:outline-none focus-visible:outline-none',
        className
      )}
      style={{
        lineHeight: 1,
        ...customStyle,
      }}
      onClick={onClick}
    >
      {label ? (
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center font-medium',
            'text-gray-600',
            getTextSizeClass(
              typeof size === 'number' ? size : sizeMap[size as AvatarSize],
              label.length
            ),
            labelClassName
          )}
          style={labelStyle}
        >
          {label}
        </span>
      ) : shouldShowInitials ? (
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center font-medium',
            textColorClass,
            getTextSizeClass(
              typeof size === 'number' ? size : sizeMap[size as AvatarSize],
              initials.length
            )
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

  // If authorId is provided, wrap the avatar with AuthorTooltip and/or Link
  if (authorId) {
    const isProduction = process.env.NODE_ENV === 'production';
    const href = isProduction
      ? `https://researchhub.com/author/${authorId}`
      : `/author/${authorId}`;

    // If tooltip is enabled, wrap with AuthorTooltip
    if (!disableTooltip) {
      const linkedAvatar = (
        <Link href={href} prefetch={false}>
          {avatarElement}
        </Link>
      );
      return <AuthorTooltip authorId={authorId}>{linkedAvatar}</AuthorTooltip>;
    }

    // If tooltip is disabled, just wrap with Link
    return (
      <Link href={href} prefetch={false}>
        {avatarElement}
      </Link>
    );
  }

  return avatarElement;
};
