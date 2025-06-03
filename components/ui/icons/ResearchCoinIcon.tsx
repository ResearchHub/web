import { cn } from '@/utils/styles';
import { PlusIcon } from 'lucide-react';

interface ResearchCoinIconProps {
  /**
   * Size in pixels. Component maintains 1:1 aspect ratio
   */
  size?: number;
  /**
   * Primary color of the coin
   * @default '#F3A113' (orange)
   */
  color?: string;
  /**
   * Fill color for internal elements
   * @default 'white'
   */
  fill?: string;
  /**
   * Optional CSS class name
   */
  className?: string;
  /**
   * Optional click handler
   */
  onClick?: (event: React.MouseEvent) => void;
  /**
   * Whether to show the outlined variant
   * @default false
   */
  outlined?: boolean;
  /**
   * Whether to show the simplified coin variant without circles
   * @default false
   */
  coin?: boolean;
  /**
   * Shows RSC icon with plus icon
   * @default false
   */
  contribute?: boolean;
  /**
   * Stroke width of the coin
   * @default 1.0
   */
  strokeWidth?: number;
  /**
   * Visual variant of the icon (changes the gradient or fill)
   * @default 'orange'
   */
  variant?: 'orange' | 'green' | 'solid';
}

function ContributeVariant({ size, color, fill }: { size: number; color: string; fill: string }) {
  return (
    <div className="relative">
      <ResearchCoinIcon size={size} color={color} fill={fill} outlined coin strokeWidth={1.1} />
      <div
        className="absolute -top-0.5 -right-1 rounded-full bg-white shadow-sm border border-white"
        style={{ width: '11px', height: '12px' }}
      >
        <PlusIcon
          className="absolute -top-px -left-px"
          style={{
            width: '11px',
            height: '12px',
            color: color,
            strokeWidth: 4,
          }}
        />
      </div>
    </div>
  );
}

export function ResearchCoinIcon({
  size = 24,
  color = '#F97316',
  fill = 'white',
  className,
  onClick,
  outlined = false,
  contribute = false,
  strokeWidth = 1,
  variant = 'orange',
}: ResearchCoinIconProps) {
  if (contribute) {
    return <ContributeVariant size={size} color={color} fill={fill} />;
  }

  if (outlined) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('transition-colors', className)}
        onClick={onClick}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.96539 1.07912C11.2355 1.61221 13.4541 4.6951 12.9209 7.96525C12.3877 11.2355 9.30472 13.454 6.03461 12.9209C2.7645 12.3876 0.545902 9.30493 1.07911 6.03456C1.61231 2.7643 4.69517 0.545903 7.96539 1.07912Z"
          stroke={color}
          strokeWidth={strokeWidth}
          fill={fill}
        />
        <g transform="translate(1, 1)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.76253 6.13023L8.5816 9.00106C8.71656 9.21596 8.74249 9.39999 8.65926 9.55317C8.57612 9.70644 8.40678 9.78308 8.15131 9.78308H3.98532C3.7298 9.78308 3.56043 9.70644 3.47725 9.55317C3.39407 9.39999 3.42 9.21591 3.55497 9.00102L5.37393 6.13019V4.68565L5.37955 4.2511H6.75815L6.76253 4.68564V6.13023ZM5.76572 6.37631L4.90355 7.64457H7.23656L6.37316 6.37631L6.30086 6.26405V6.13013V4.68559H5.83803V6.13013V6.26405L5.76572 6.37631Z"
            fill={color}
          />
          <path
            d="M5.36161 6.42662L4.71875 7.92663L7.71875 8.1409L6.43304 6.21233V4.49805H5.57589V4.92662L5.36161 6.42662Z"
            fill={color}
          />
          <rect
            x="4.89844"
            y="4.19885"
            width="2.33301"
            height="0.530231"
            rx="0.265115"
            fill={color}
          />
          <rect x="4.64062" y="2.3689" width="1.1" height="1.1" rx="0.55" fill={color} />
          <rect x="6.5" y="2.3689" width="1.1" height="1.1" rx="0.55" fill={color} />
          <rect x="5.70469" y="1.2854" width="0.85" height="0.85" rx="0.425" fill={color} />
        </g>
      </svg>
    );
  }

  // Define gradient IDs based on variant
  const gradientId = variant === 'green' ? 'greenCoinGradient' : 'coinGradient';
  // Determine fill based on variant
  const coinFill = variant === 'solid' ? color : `url(#${gradientId})`;

  return (
    <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14">
      <defs>
        <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="greenCoinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.3" />
        </filter>
        <radialGradient id="highlightGradient" cx="30%" cy="30%" r="60%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.96539 1.17912C11.1355 1.69221 13.2541 4.6951 12.7409 7.86525C12.2277 11.0355 9.22472 13.154 6.05461 12.6409C2.8845 12.1276 0.765902 9.12493 1.27911 5.95456C1.79231 2.7843 4.79517 0.665903 7.96539 1.17912Z"
        fill="rgba(0,0,0,0.15)"
        filter="url(#softShadow)"
        transform="translate(0.1, 0.2)"
      />

      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.96539 1.07912C11.2355 1.61221 13.4541 4.6951 12.9209 7.96525C12.3877 11.2355 9.30472 13.454 6.03461 12.9209C2.7645 12.3876 0.545902 9.30493 1.07911 6.03456C1.61231 2.7643 4.69517 0.545903 7.96539 1.07912Z"
        fill={coinFill}
      />

      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.96539 1.07912C11.2355 1.61221 13.4541 4.6951 12.9209 7.96525C12.3877 11.2355 9.30472 13.454 6.03461 12.9209C2.7645 12.3876 0.545902 9.30493 1.07911 6.03456C1.61231 2.7643 4.69517 0.545903 7.96539 1.07912Z"
        fill="url(#highlightGradient)"
      />

      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.96539 1.07912C11.2355 1.61221 13.4541 4.6951 12.9209 7.96525C12.3877 11.2355 9.30472 13.454 6.03461 12.9209C2.7645 12.3876 0.545902 9.30493 1.07911 6.03456C1.61231 2.7643 4.69517 0.545903 7.96539 1.07912Z"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth="0.1"
        fill="none"
      />

      <g transform="translate(1, 1)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.76253 6.13023L8.5816 9.00106C8.71656 9.21596 8.74249 9.39999 8.65926 9.55317C8.57612 9.70644 8.40678 9.78308 8.15131 9.78308H3.98532C3.7298 9.78308 3.56043 9.70644 3.47725 9.55317C3.39407 9.39999 3.42 9.21591 3.55497 9.00102L5.37393 6.13019V4.68565L5.37955 4.2511H6.75815L6.76253 4.68564V6.13023ZM5.76572 6.37631L4.90355 7.64457H7.23656L6.37316 6.37631L6.30086 6.26405V6.13013V4.68559H5.83803V6.13013V6.26405L5.76572 6.37631Z"
          fill={fill}
        />

        <path
          d="M5.37393 6.13019L3.55497 9.00102C3.42 9.21591 3.39407 9.39999 3.47725 9.55317C3.56043 9.70644 3.7298 9.78308 3.98532 9.78308H8.15131C8.40678 9.78308 8.57612 9.70644 8.65926 9.55317C8.74249 9.39999 8.71656 9.21596 8.5816 9.00106L6.76253 6.13023V4.68564L6.75815 4.2511H5.37955L5.37393 4.68565V6.13019Z"
          fill={fill}
          opacity="0.9"
        />

        <rect x="4.89844" y="4.19885" width="2.33301" height="0.530231" rx="0.265115" fill={fill} />

        <rect x="4.64062" y="2.3689" width="1.1" height="1.1" rx="0.55" fill={fill}>
          <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
        </rect>
        <rect x="6.5" y="2.3689" width="1.1" height="1.1" rx="0.55" fill={fill}>
          <animate attributeName="opacity" values="1;0.8;1" dur="3s" repeatCount="indefinite" />
        </rect>
        <rect x="5.70469" y="1.2854" width="0.85" height="0.85" rx="0.425" fill={fill}>
          <animate attributeName="opacity" values="0.9;1;0.9" dur="2.5s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  );
}
