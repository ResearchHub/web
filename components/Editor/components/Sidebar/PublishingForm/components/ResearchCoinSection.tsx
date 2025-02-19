import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SectionHeader } from './SectionHeader';

interface ResearchCoinSectionProps {
  bountyAmount: number | null;
  onBountyClick: () => void;
}

export function ResearchCoinSection({ bountyAmount, onBountyClick }: ResearchCoinSectionProps) {
  return (
    <div className="py-3 px-6">
      <SectionHeader icon={Coins}>ResearchCoin</SectionHeader>
      <div className="mt-2">
        {bountyAmount ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg">
            <Coins className="h-4 w-4" />
            <span className="text-sm font-medium">{bountyAmount} RSC</span>
          </div>
        ) : (
          <Button
            variant="outlined"
            onClick={onBountyClick}
            className="w-full flex items-center gap-2 justify-center"
          >
            <Coins className="h-4 w-4" />
            Add Bounty
          </Button>
        )}
      </div>
    </div>
  );
}
