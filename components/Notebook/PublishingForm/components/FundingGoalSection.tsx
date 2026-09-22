import { DollarSign } from 'lucide-react';
import { cn } from '@/utils/styles';
import { FundingGoalField } from './FundingGoalField';
import { SectionHeader } from './SectionHeader';
import type { SectionProps } from './SectionProps';

/** The proposal's funding goal on its own, headed like the other sections. */
export function FundingGoalSection({ className }: SectionProps) {
  return (
    <div className={cn('py-3 px-6', className)}>
      <SectionHeader icon={DollarSign}>Funding Goal</SectionHeader>
      <FundingGoalField />
    </div>
  );
}
