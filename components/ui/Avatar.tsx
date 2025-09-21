'use client';

import { FC, useState, useEffect, CSSProperties, MouseEvent } from 'react';
import { cn } from '@/utils/styles';
import { AuthorTooltip } from './AuthorTooltip';
import Link from 'next/link';
import { Tooltip } from '@/components/ui/Tooltip';
import { ProfileField, PROFILE_FIELD_WEIGHTS } from '@/utils/profileCompletion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircle } from '@fortawesome/pro-light-svg-icons';
import { faWreathLaurel } from '@fortawesome/pro-duotone-svg-icons';
import { useVerification } from '@/contexts/VerificationContext';
import { Button } from '@/components/ui/Button';

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
  showProfileCompletion?: boolean;
  profileCompletionPercent?: number;
  showProfileCompletionNumber?: boolean;
  missing?: ProfileField[];
  showTooltip?: boolean;
  laurelRank?: 1 | 2 | 3;
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
  showProfileCompletion = false,
  profileCompletionPercent,
  showProfileCompletionNumber = false,
  missing,
  showTooltip = false,
  laurelRank,
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

  const coreAvatarElement = (
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

  // Optionally wrap with a laurel wreath frame for ranks 1-3
  const avatarElement = (() => {
    if (!laurelRank || laurelRank < 1 || laurelRank > 3) return coreAvatarElement;

    const basePx = typeof size === 'number' ? size : (sizeMap[size as AvatarSize] ?? sizeMap.md);
    const laurelScale = 0.9; // Wreath size relative to avatar diameter
    const laurelStretchY = 1.3; // Vertical stretch factor
    const laurelFontSize = `${basePx * laurelScale}px`;
    const palette =
      laurelRank === 1
        ? { primary: '#f6d365', secondary: '#d4af37', primaryOpacity: 1, secondaryOpacity: 1 }
        : laurelRank === 2
          ? { primary: '#eaeaea', secondary: '#b5b5b5', primaryOpacity: 1, secondaryOpacity: 1 }
          : { primary: '#efc08d', secondary: '#cd7f32', primaryOpacity: 1, secondaryOpacity: 1 };

    return (
      <div
        className="relative inline-block"
        style={
          typeof size === 'number' ? { width: `${basePx}px`, height: `${basePx}px` } : undefined
        }
      >
        <FontAwesomeIcon
          icon={faWreathLaurel}
          className={cn('absolute left-1/2 top-1/2 pointer-events-none opacity-70 z-20')}
          style={
            {
              fontSize: laurelFontSize,
              transform: `translate(-50%, -50%) scaleY(${laurelStretchY})`,
              ['--fa-primary-color' as any]: palette.primary,
              ['--fa-secondary-color' as any]: palette.secondary,
              ['--fa-primary-opacity' as any]: palette.primaryOpacity,
              ['--fa-secondary-opacity' as any]: palette.secondaryOpacity,
            } as unknown as CSSProperties
          }
        />
        <div className="relative z-10">{coreAvatarElement}</div>
      </div>
    );
  })();

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
