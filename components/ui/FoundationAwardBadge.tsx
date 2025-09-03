import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';

export const FoundationAwardBadge = () => (
  <Tooltip content="Verified and approved by the ResearchHub Editor Team">
    <Badge 
      variant="primary"
      className="bg-purple-100 text-purple-700 border-purple-300 gap-1.5 py-1"
    >
      <ResearchCoinIcon size={16} outlined color="currentColor" />
      <span>Awarded</span>
    </Badge>
  </Tooltip>
);