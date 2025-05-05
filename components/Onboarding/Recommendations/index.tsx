import { InterestSelector } from '@/components/InterestSelector/InterestSelector';
import { Button } from '@/components/ui/Button';

interface RecommendationsStepProps {
  onBack: () => void;
  onDone: () => void;
}

export function RecommendationsStep({ onBack, onDone }: RecommendationsStepProps) {
  return (
    <div>
      <InterestSelector mode="onboarding" />
      <div className="flex justify-between mt-8">
        <Button type="button" variant="outlined" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
