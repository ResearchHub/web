import { FC } from 'react';
import { Button } from '@/components/ui/Button';
import { formatTimestamp } from '@/utils/date';

interface FeedItemDateProps {
  date: string;
  className?: string;
}

export const FeedItemDate: FC<FeedItemDateProps> = ({ date, className = '' }) => (
  <Button
    variant="ghost"
    size="sm"
    className={`text-gray-500 hover:text-gray-900 hover:bg-transparent -my-2 h-8 px-1 ${className}`}
  >
    {formatTimestamp(date)}
  </Button>
); 