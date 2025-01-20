import { Button } from '@/components/ui/Button';
import { Interest } from '@/store/interestStore';

interface InterestSelectorFooterProps {
  selectedInterests: Interest[];
  onCancel: () => void;
  onComplete: (interests: Interest[]) => void;
}

export function InterestSelectorFooter({
  selectedInterests,
  onCancel,
  onComplete,
}: InterestSelectorFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t pt-4 pb-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedInterests.length > 0 ? (
            <span>
              {selectedInterests.length} {selectedInterests.length === 1 ? 'interest' : 'interests'}{' '}
              selected
            </span>
          ) : (
            <span>No interests selected</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => onCancel()}>
            Cancel
          </Button>
          <Button
            onClick={() => onComplete(selectedInterests)}
            disabled={selectedInterests.length === 0}
          >
            Update Feed
          </Button>
        </div>
      </div>
    </div>
  );
}
