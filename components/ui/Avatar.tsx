'use client';

import { FC, useState, useEffect, CSSProperties, MouseEvent } from 'react';
import { cn } from '@/utils/styles';
import { AuthorTooltip } from './AuthorTooltip';
import Link from 'next/link';
import { Avatar as DiceBearAvatar, Style } from '@dicebear/core';
import voxelArt from '@dicebear/styles/voxel-art.json';

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

// Pale cool tints only; warm tones blend into the skin and hair.
const voxelAvatarBackgrounds = [
  '#dbeafe', // blue
  '#e0e7ff', // indigo
  '#ede9fe', // violet
  '#e0f2fe', // sky
  '#cffafe', // cyan
  '#ccfbf1', // teal
  '#d1fae5', // emerald
  '#fce7f3', // pink
  '#f1f5f9', // slate
];

const voxelArtStyle = new Style(voxelArt);

// Every avatar wears a white lab coat and glasses; the seed varies the face, hair, and colors.
const generateVoxelAvatarUri = (seed: string) =>
  new DiceBearAvatar(voxelArtStyle, {
    seed,
    backgroundColor: voxelAvatarBackgrounds,
    outfitVariant: 'coat',
    jacketColor: '#f8f9fa',
    glassesProbability: 100,
    // Visor reads as safety goggles; shades are left out.
    glassesVariant: { round: 3, square: 3, cat: 2, visor: 1 },
    mouthVariant: [
      'smile',
      'bigSmile',
      'flat',
      'ooh',
      'smirk',
      'laugh',
      'wideSmile',
      'frown',
      'grin',
    ],
    // Hair only; no caps, beanies, or animal ears.
    topVariant: [
      'short',
      'spiky',
      'bowl',
      'sideSwept',
      'curly',
      'mohawk',
      'buns',
      'ponytail',
      'bob',
      'shoulderLength',
      'longStraight',
      'longWavy',
      'partedLong',
      'braids',
      'twinTails',
      'afro',
      'halfShaved',
    ],
    animationVariant: 'none',
    // Crops the full-body figure to head and shoulders so the coat still shows.
    scale: 1.12,
  }).toDataUri();

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

  const shouldShowGeneratedAvatar = !src || imageError || isLoading;

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
        'flex items-center justify-center flex-shrink-0 bg-gray-100',
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
      ) : (
        <img
          src={shouldShowGeneratedAvatar ? generateVoxelAvatarUri(alt) : src}
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
