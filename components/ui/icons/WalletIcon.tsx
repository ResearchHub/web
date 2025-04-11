import { FC } from 'react';
import Image from 'next/image';

export type WalletVariant = 'wallet1' | 'wallet2' | 'wallet3' | 'wallet5' | 'wallet6' | 'default';

interface WalletIconProps {
  /**
   * The size of the icon in pixels
   * @default 24
   */
  size?: number;

  /**
   * The color of the icon for the default variant
   * @default "#0C0C0C"
   */
  color?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * The wallet variant to display
   * @default "default"
   */
  variant?: WalletVariant;
}

export const WalletIcon: FC<WalletIconProps> = ({
  size = 24,
  color = '#0C0C0C',
  className = '',
  variant = 'default',
}) => {
  // If using an SVG variant from public/icons
  if (variant !== 'default') {
    return (
      <Image
        src={`/icons/${variant}.svg`}
        alt={`${variant} icon`}
        width={size}
        height={size}
        className={className}
      />
    );
  }

  // Default wallet icon as inline SVG
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M22 17V7C22 5.89543 21.1046 5 20 5H4C2.89543 5 2 5.89543 2 7V17C2 18.1046 2.89543 19 4 19H20C21.1046 19 22 18.1046 22 17Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 14C16.5523 14 17 13.5523 17 13C17 12.4477 16.5523 12 16 12C15.4477 12 15 12.4477 15 13C15 13.5523 15.4477 14 16 14Z"
        fill={color}
      />
      <path
        d="M22 9H17C15.8954 9 15 9.89543 15 11V15C15 16.1046 15.8954 17 17 17H22V9Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default WalletIcon;
