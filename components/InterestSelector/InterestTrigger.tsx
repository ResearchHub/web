import { Button } from '@/Button';
import { Settings } from 'lucide-react';

interface InterestTriggerProps {
  onOpen: () => void;
}

export function InterestTrigger({ onOpen }: InterestTriggerProps) {
  return (
    <Button
      onClick={onOpen}
      variant="ghost"
      size="icon"
      className="text-gray-600 hover:text-gray-900"
    >
      <Settings className="w-4 h-4" />
    </Button>
  );
}