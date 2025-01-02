import { cn } from '@/utils/styles';
import { ResearchCoinIcon } from './ResearchCoinIcon';

interface FundingIconProps {
  /**
   * Size in pixels. Component maintains 1:1 aspect ratio
   */
  size?: number;
  /**
   * Primary color of the icon
   */
  color?: string;
  /**
   * Optional CSS class name
   */
  className?: string;
  /**
   * Optional click handler
   */
  onClick?: (event: React.MouseEvent) => void;
}

export function FundingIcon({
  size = 24,
  color = 'rgb(79, 70, 229)', // Default to indigo-600
  className,
  onClick,
}: FundingIconProps) {
  const coinSize = size * 0.7;
  const gaugeHeight = Math.max(4, size * 0.15); // Minimum height of 4px
  
  return (
    <div 
      className={cn('relative flex flex-col items-center gap-1', className)} 
      style={{ width: size, height: size }}
    >
      {/* ResearchCoin at the top */}
      <div style={{ height: coinSize }}>
        <ResearchCoinIcon
          size={coinSize}
          color={color}
          contribute
        />
      </div>
      
      {/* Gauge bar */}
      <div 
        className="w-full rounded-lg overflow-hidden bg-indigo-200"
        style={{ height: gaugeHeight }}
      >
        <div 
          className="h-full rounded-lg bg-indigo-600"
          style={{ width: '50%' }}
        />
      </div>
    </div>
  );
} 