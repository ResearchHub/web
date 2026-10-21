'use client';

import { FC, useState, useEffect, useMemo, CSSProperties, MouseEvent } from 'react';
import { cn } from '@/utils/styles';
import { AuthorTooltip } from './AuthorTooltip';
import Link from 'next/link';
import { Tooltip } from '@/components/ui/Tooltip';
import { ProfileField, PROFILE_FIELD_WEIGHTS } from '@/utils/profileCompletion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircle } from '@fortawesome/pro-light-svg-icons';
import { useVerification } from '@/contexts/VerificationContext';
import { Button } from '@/components/ui/Button';
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
  showProfileCompletion?: boolean;
  profileCompletionPercent?: number;
  showProfileCompletionNumber?: boolean;
  missing?: ProfileField[];
  showTooltip?: boolean;
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

const ProfileFieldLabel: Record<ProfileField, string> = {
  [ProfileField.Name]: 'Name',
  [ProfileField.Photo]: 'Photo',
  [ProfileField.Headline]: 'Headline',
  [ProfileField.Verification]: 'Verification',
  [ProfileField.Education]: 'Education',
  [ProfileField.About]: 'About',
  [ProfileField.Social]: 'Social presence',
};

interface ProfileCompletionCircleProps {
  size: AvatarSize | number;
  showProfileCompletionNumber: boolean;
  progressPercent: number;
  avatarElement: React.ReactNode;
  missing?: ProfileField[];
  showTooltip?: boolean;
}

const ProfileCompletionCircle: FC<ProfileCompletionCircleProps> = ({
  size,
  showProfileCompletionNumber,
  progressPercent,
  avatarElement,
  missing,
  showTooltip = false,
}) => {
  const { openVerificationModal } = useVerification();
  const sizeMap = {
    xxxs: 12,
    xxs: 20,
    xs: 24,
    sm: 32,
    md: 40,
  };
  const basePx = typeof size === 'number' ? size : (sizeMap[size as AvatarSize] ?? sizeMap.md);
  const strokeWidth = basePx <= 40 ? 5 : 10;
  const px = basePx + strokeWidth * 2;

  const radius = px / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(progressPercent, 100));
  const offset = circumference - (progress / 100) * circumference;

  let color = '#f97316';
  if (progress === 100) color = '#22c55e';
  else if (progress >= 60) color = '#eab308';

  const textPercentSizeClasses = (size: AvatarSize | number) => {
    if (typeof size === 'number') {
      if (size > 100) return 'text-md';
      if (size > 60) return 'text-sm';
      return 'text-xs';
    }
    if (size === 'xxxs') return 'text-[6px]';
    if (size === 'xxs') return 'text-[8px]';
    if (size === 'xs') return 'text-[10px]';
    if (size === 'sm') return 'text-xs';
    if (size === 'md') return 'text-xs';
    return 'text-xs';
  };

  // Tooltip content logic here
  const tooltipContent = (
    <div className="text-left">
      <div className="font-semibold mb-1">Complete Your Profile</div>
      <div className="text-xs text-gray-500 mb-3">
        Completing your profile helps you stand out in the community.
      </div>
      <div className="font-semibold mb-2">Profile Progress</div>
      <ul className="space-y-1">
        {Object.entries(PROFILE_FIELD_WEIGHTS).map(([field, weight]) => {
          const isMissing = missing?.includes(field as ProfileField);
          return (
            <li key={field} className="flex items-center gap-2">
              {isMissing ? (
                <FontAwesomeIcon icon={faCircle} className="text-gray-400 w-4 h-4" />
              ) : (
                <FontAwesomeIcon icon={faCircleCheck} className="text-green-500 w-4 h-4" />
              )}
              <span>{ProfileFieldLabel[field as ProfileField] || field}</span>
              {isMissing && field === ProfileField.Verification && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    openVerificationModal();
                  }}
                  variant="link"
                  size="sm"
                  className="text-indigo-600 hover:text-indigo-700 p-0 h-auto whitespace-nowrap"
                >
                  Verify now
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );

  const renderPercentageValue = () => {
    return (
      <div
        className="w-auto z-20 absolute left-1/2 -translate-x-1/2"
        style={{ bottom: `${strokeWidth / 2}px` }}
      >
        <div
          className={cn(
            'rounded-full px-2 shadow text-white font-semibold z-20 flex items-center justify-center border border-solid border-white',
            typeof size === 'number' && size > 100 ? 'h-6' : 'h-4',
            showTooltip && 'cursor-pointer'
          )}
          style={{ backgroundColor: color }}
        >
          <span className={`select-none ${textPercentSizeClasses(size)}`}>{`${progress}%`}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative block">
      <svg
        width={px}
        height={px}
        className="relative z-0"
        style={{
          // top: -strokeWidth,
          // left: -strokeWidth,
          // position: 'absolute',
          transform: 'rotate(90deg)',
        }}
      >
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div
        className="relative z-10"
        style={{
          top: strokeWidth,
          left: strokeWidth,
          position: 'absolute',
        }}
      >
        {avatarElement}
      </div>
      {showProfileCompletionNumber &&
        (showTooltip ? (
          <Tooltip
            content={tooltipContent}
            position="bottom"
            width="w-56"
            wrapperClassName={`h-auto w-full relative`}
          >
            {renderPercentageValue()}
          </Tooltip>
        ) : (
          <div className="inline-flex h-auto w-full relative">{renderPercentageValue()}</div>
        ))}
    </div>
  );
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
  showProfileCompletion = false,
  profileCompletionPercent,
  showProfileCompletionNumber = false,
  missing,
  showTooltip = false,
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
  const generatedAvatarUri = useMemo(
    () => (shouldShowGeneratedAvatar ? generateVoxelAvatarUri(alt) : null),
    [shouldShowGeneratedAvatar, alt]
  );

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
          src={generatedAvatarUri ?? src ?? undefined}
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

  if (
    showProfileCompletion &&
    typeof profileCompletionPercent === 'number' &&
    profileCompletionPercent < 100
  ) {
    return (
      <ProfileCompletionCircle
        size={size}
        showProfileCompletionNumber={showProfileCompletionNumber}
        progressPercent={profileCompletionPercent}
        avatarElement={avatarElement}
        missing={missing}
        showTooltip={showTooltip}
      />
    );
  }

  return avatarElement;
};
