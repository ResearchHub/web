import { cn } from '@/utils/styles';

interface ResearchCoinIconProps {
  /**
   * Size in pixels. Component maintains 1:1 aspect ratio
   */
  size?: number
  /**
   * Primary color of the coin
   * @default '#F3A113' (orange)
   */
  color?: string
  /**
   * Optional CSS class name
   */
  className?: string
  /**
   * Optional click handler
   */
  onClick?: (event: React.MouseEvent) => void
  /**
   * Whether to show the outlined variant
   * @default false
   */
  outlined?: boolean
  /**
   * Whether to show the simplified coin variant without circles
   * @default false
   */
  coin?: boolean
  /**
   * Stroke width of the coin
   * @default 1.0
   */
  strokeWidth?: number
}

export function ResearchCoinIcon({
  size = 24,
  color = '#F97316',
  className,
  onClick,
  outlined = false,
  strokeWidth = 1,
}: ResearchCoinIconProps) {


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
          fill="white"
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
          <rect
            x="4.64062"
            y="2.3689"
            width="1.1"
            height="1.1"
            rx="0.55"
            fill={color}
          />
          <rect
            x="6.5"
            y="2.3689"
            width="1.1"
            height="1.1"
            rx="0.55"
            fill={color}
          />
          <rect
            x="5.70469"
            y="1.2854"
            width="0.85"
            height="0.85"
            rx="0.425"
            fill={color}
          />
        </g>
      </svg>
    );
  }

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
        fill={color}
      />
      <g transform="translate(1, 1)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.76253 6.13023L8.5816 9.00106C8.71656 9.21596 8.74249 9.39999 8.65926 9.55317C8.57612 9.70644 8.40678 9.78308 8.15131 9.78308H3.98532C3.7298 9.78308 3.56043 9.70644 3.47725 9.55317C3.39407 9.39999 3.42 9.21591 3.55497 9.00102L5.37393 6.13019V4.68565L5.37955 4.2511H6.75815L6.76253 4.68564V6.13023ZM5.76572 6.37631L4.90355 7.64457H7.23656L6.37316 6.37631L6.30086 6.26405V6.13013V4.68559H5.83803V6.13013V6.26405L5.76572 6.37631Z"
          fill="white"
        />
        <path
          d="M5.36161 6.42662L4.71875 7.92663L7.71875 8.1409L6.43304 6.21233V4.49805H5.57589V4.92662L5.36161 6.42662Z"
          fill="white"
        />
        <rect
          x="4.89844"
          y="4.19885"
          width="2.33301"
          height="0.530231"
          rx="0.265115"
          fill="white"
        />
        <rect
          x="4.64062"
          y="2.3689"
          width="1.1"
          height="1.1"
          rx="0.55"
          fill="white"
        />
        <rect
          x="6.5"
          y="2.3689"
          width="1.1"
          height="1.1"
          rx="0.55"
          fill="white"
        />
        <rect
          x="5.70469"
          y="1.2854"
          width="0.85"
          height="0.85"
          rx="0.425"
          fill="white"
        />
      </g>
    </svg>
  );
} 
