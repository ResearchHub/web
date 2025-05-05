import { InterestSelector } from '@/components/InterestSelector/InterestSelector';
import { Button } from '@/components/ui/Button';

interface RecommendationsStepProps {
  onBack: () => void;
}

export function RecommendationsStep({ onBack }: RecommendationsStepProps) {
  return (
    <div>
      <InterestSelector mode="onboarding" showToastOnSuccess={false} />
    </div>
  );
}
