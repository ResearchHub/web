import { type LucideIcon, type LucideProps } from 'lucide-react';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { cn } from '@/utils/styles';

function radiatingDotTabIcon(color: string) {
  return function RadiatingDotTabIcon({ className }: LucideProps) {
    return (
      <span className={cn('inline-flex items-center justify-center', className)}>
        <RadiatingDot ring color={color} />
      </span>
    );
  } as LucideIcon;
}

/** Inactive tab: gray so the dot does not inherit near-black tab text. */
export const RadiatingDotTabIcon = radiatingDotTabIcon('bg-gray-400');

/** Active tab: inherit the tab's current text color. */
export const RadiatingDotTabIconActive = radiatingDotTabIcon('bg-current');
