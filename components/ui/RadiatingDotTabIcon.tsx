import { type LucideIcon, type LucideProps } from 'lucide-react';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { cn } from '@/utils/styles';

/**
 * Tab icon that renders a radiating dot inheriting the tab's text color.
 * Typed as a LucideIcon so it can be used wherever tab configs expect one.
 */
export const RadiatingDotTabIcon = function RadiatingDotTabIcon({ className }: LucideProps) {
  return (
    <span className={cn('inline-flex items-center justify-center', className)}>
      <RadiatingDot ring color="bg-current" />
    </span>
  );
} as LucideIcon;
