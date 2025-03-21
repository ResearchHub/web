import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';

interface PaperBadgeProps {
  className?: string;
}

export const PaperBadge = ({ className = '' }: PaperBadgeProps) => {
  return <ContentTypeBadge type="paper" className={className} />;
};
